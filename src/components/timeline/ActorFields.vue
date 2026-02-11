<script setup lang="ts">
    import { components } from "../../../data/hlapiv2_schema";
    import { MultiSelect, SelectButton, FloatLabel, InputText } from "primevue";
    import { shallowRef, ref } from "vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useApi } from "@/composables/useApi";
    import { useDebounceFn } from "@vueuse/core";

    const props = defineProps<{
        requesters: Array<components['schemas']['TeamMember']>
        observers: Array<components['schemas']['TeamMember']>
        assigned: Array<components['schemas']['TeamMember']>
    }>();

    const { formatUsername } = useDataHelper();
    const { doGraphQLRequest } = useApi();

    const selected_requesters = ref(props.requesters.map(member => `${member.type}-${member.id}`));
    const selected_observers = ref(props.observers.map(member => `${member.type}-${member.id}`));
    const selected_assigned = ref(props.assigned.map(member => `${member.type}-${member.id}`));

    const allowed_actor_itemtypes = {
        'requesters': ['User', 'Group'],
        'observers': ['User', 'Group'],
        'assigned': ['User', 'Group', 'Supplier']
    }

    const actor_type_labels = {
        'requesters': 'Requesters',
        'observers': 'Observers',
        'assigned': 'Assigned'
    }

    const requester_type_filter = shallowRef<Array<'User'|'Group'>>(['User']);
    const observer_type_filter = shallowRef<Array<'User'|'Group'>>(['User']);
    const assigned_type_filter = shallowRef<Array<'User'|'Group'|'Supplier'>>(['User']);

    // TODO actor options should account for the item's entity so it shows users that would actually be able to see the item. It may be better to have an endpoint/graphql query on the server to handle this cleaner

    const rsql_filters = {
        requesters: {
            User: 'is_deleted==0;is_active==1',
            Group: 'maybe_requester==1',
        },
        observers: {
            User: 'is_deleted==0;is_active==1',
            Group: 'maybe_observer==1',
        },
        assigned: {
            User: 'is_deleted==0;is_active==1',
            Group: 'maybe_assigned==1',
            Supplier: 'is_deleted==0;is_active==1',
        }
    };

    /** User filter for requester name */
    const requester_filter = shallowRef('');
    /** User filter for observer name */
    const observer_filter = shallowRef('');
    /** User filter for assigned name */
    const assigned_filter = shallowRef('');

    const requester_options = ref(props.requesters.map(member => ({key: `${member.type}-${member.id}`, member: member})));
    const observer_options = ref(props.observers.map(member => ({key: `${member.type}-${member.id}`, member: member})));
    const assigned_options = ref(props.assigned.map(member => ({key: `${member.type}-${member.id}`, member: member})));

    const isLoading = ref(false);

    const updateActorOptions = useDebounceFn((role: 'requesters' | 'observers' | 'assigned') => {
        if (isLoading.value) {
            return;
        }
        isLoading.value = true;
        const queries = [];
        const actor_type_filter = role === 'requesters' ? requester_type_filter : role === 'observers' ? observer_type_filter : assigned_type_filter;

        for (const type of actor_type_filter.value) {
            const rsql_filter = rsql_filters[role][type];
            const filter_value = role === 'requesters' ? requester_filter.value : role === 'observers' ? observer_filter.value : assigned_filter.value;
            let type_filters = '';
            switch (type) {
                case 'User':
                    type_filters = `;(username=ilike=*${filter_value}*,realname=ilike=*${filter_value}*,firstname=ilike=*${filter_value}*)`;
                    break;
                case 'Group':
                    type_filters = `;(name=ilike=*${filter_value}*)`;
                    break;
                case 'Supplier':
                    type_filters = `;(name=ilike=*${filter_value}*)`;
                    break;
            }
            const search_filter = `${rsql_filter}${type_filters}`;
            queries.push(
                doGraphQLRequest(`
                    query {
                        ${type}(filter: "${search_filter}", limit: 100) {
                            id ${type === 'User' ? 'username realname firstname' : 'name'}
                        }
                    }
                `).then((res) => {
                    if (!res.data[type]) {
                        return [];
                    }
                    return res.data[type].map((member) => ({key: `${type}-${member.id}`, member: member}));
                })
            );
        }

        Promise.all(queries).then((results) => {
            const options = results.flat();
            const original_options = role === 'requesters' ? requester_options.value : role === 'observers' ? observer_options.value : assigned_options.value;
            switch (role) {
                case 'requesters':
                    requester_options.value = options;
                    break;
                case 'observers':
                    observer_options.value = options;
                    break;
                case 'assigned':
                    assigned_options.value = options;
                    break;
            }
            // re-add currently selected options that may have been filtered out by the search
            const selected_options = role === 'requesters' ? selected_requesters.value : role === 'observers' ? selected_observers.value : selected_assigned.value;
            for (const selected_key of selected_options) {
                if (!options.some(option => option.key === selected_key)) {
                    const original_option = original_options.find(option => option.key === selected_key);
                    if (original_option) {
                        options.push(original_option);
                    }
                }
            }
            isLoading.value = false;
        });
    }, 250, { maxWait: 500 });
</script>

<template>
    <div class="flex flex-col space-y-4">
        <FloatLabel variant="on">
            <MultiSelect display="chip" removeTokenIcon="ti ti-circle-x" :showToggleAll="false" fluid optionValue="key" :optionLabel="option => formatUsername(option.member)"
                         :options="requester_options"
                         v-model="selected_requesters"
            >
                <template #header>
                    <SelectButton :options="allowed_actor_itemtypes['requesters']" v-model="requester_type_filter" multiple></SelectButton>
                    <InputText placeholder="Search..." class="p-inputtext-sm w-full mt-2" v-model="requester_filter" @input="updateActorOptions('requesters')"></InputText>
                </template>
            </MultiSelect>
            <label>{{ actor_type_labels['requesters'] }}</label>
        </FloatLabel>
        <FloatLabel variant="on">
            <MultiSelect display="chip" removeTokenIcon="ti ti-circle-x" :showToggleAll="false" fluid optionValue="key" :optionLabel="option => formatUsername(option.member)"
                         :options="observer_options"
                         v-model="selected_observers"
            >
                <template #header>
                    <SelectButton :options="allowed_actor_itemtypes['observers']" v-model="observer_type_filter" multiple></SelectButton>
                    <InputText placeholder="Search..." class="p-inputtext-sm w-full mt-2" v-model="observer_filter" @input="updateActorOptions('observers')"></InputText>
                </template>
            </MultiSelect>
            <label>{{ actor_type_labels['observers'] }}</label>
        </FloatLabel>
        <FloatLabel variant="on">
            <MultiSelect display="chip" removeTokenIcon="ti ti-circle-x" :showToggleAll="false" fluid optionValue="key" :optionLabel="option => formatUsername(option.member)"
                         :options="assigned_options" v-model="selected_assigned"
            >
                <template #header>
                    <SelectButton :options="allowed_actor_itemtypes['assigned']" v-model="assigned_type_filter" multiple></SelectButton>
                    <InputText placeholder="Search..." class="p-inputtext-sm w-full mt-2" v-model="assigned_filter" @input="updateActorOptions('assigned')"></InputText>
                </template>
            </MultiSelect>
            <label>{{ actor_type_labels['assigned'] }}</label>
        </FloatLabel>
    </div>
</template>

<style scoped>

</style>