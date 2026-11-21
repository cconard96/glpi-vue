<script setup lang="ts">
    import { components } from "../../../../data/hlapiv2_schema";
    import MultiSelect from '@cjdevstudios/bumblevue/multiselect';
    import SelectButton from '@cjdevstudios/bumblevue/selectbutton';
    import FloatLabel from '@cjdevstudios/bumblevue/floatlabel';
    import InputText from '@cjdevstudios/bumblevue/inputtext';
    import { shallowRef, ref, useTemplateRef } from "vue";
    import { useDataHelper } from "@/common/useDataHelper";
    import { useI18n } from "vue-i18n";
    import { ALLOWED_ACTOR_TYPES, getActorKey, useActorSearch, type ActorRole, type ActorType } from "@/common/actor/useActorSearch";

    const props = defineProps<{
        requesters: Array<components['schemas']['TeamMember']>
        observers: Array<components['schemas']['TeamMember']>
        assigned: Array<components['schemas']['TeamMember']>
    }>();

    const { formatUsername } = useDataHelper();
    const { t: $t } = useI18n();

    const selected_requesters = ref(props.requesters.map(member => getActorKey(member.type as ActorType, member.id)));
    const selected_observers = ref(props.observers.map(member => getActorKey(member.type as ActorType, member.id)));
    const selected_assigned = ref(props.assigned.map(member => getActorKey(member.type as ActorType, member.id)));

    const allowed_actor_itemtypes = ALLOWED_ACTOR_TYPES;

    const actor_type_labels = {
        'requesters': $t('assistance.fields.requester', 'Requesters'),
        'observers': $t('assistance.fields.observer', 'Observers'),
        'assigned': $t('assistance.fields.assigned', 'Assigned')
    }

    const requester_type_filter = shallowRef<Array<'User'|'Group'>>(['User']);
    const observer_type_filter = shallowRef<Array<'User'|'Group'>>(['User']);
    const assigned_type_filter = shallowRef<Array<'User'|'Group'|'Supplier'>>(['User']);

    // TODO actor options should account for the item's entity so it shows users that would actually be able to see the item. It may be better to have an endpoint/graphql query on the server to handle this cleaner

    /** User filter for requester name */
    const requester_filter = shallowRef('');
    /** User filter for observer name */
    const observer_filter = shallowRef('');
    /** User filter for assigned name */
    const assigned_filter = shallowRef('');

    const toOptions = (members: Array<components['schemas']['TeamMember']>) => members.map(member => ({
        key: getActorKey(member.type as ActorType, member.id),
        type: member.type as ActorType,
        member: member as any,
    }));
    const requesterSearch = useActorSearch('requesters', toOptions(props.requesters));
    const observerSearch = useActorSearch('observers', toOptions(props.observers));
    const assignedSearch = useActorSearch('assigned', toOptions(props.assigned));

    const requester_options = requesterSearch.options;
    const observer_options = observerSearch.options;
    const assigned_options = assignedSearch.options;

    function updateActorOptions(role: ActorRole) {
        switch (role) {
            case 'requesters':
                return requesterSearch.search(requester_type_filter.value, requester_filter.value, selected_requesters.value);
            case 'observers':
                return observerSearch.search(observer_type_filter.value, observer_filter.value, selected_observers.value);
            case 'assigned':
                return assignedSearch.search(assigned_type_filter.value, assigned_filter.value, selected_assigned.value);
        }
    }

    const requesterSearchEl = useTemplateRef('requester-search');
    const observerSearchEl = useTemplateRef('observer-search');
    const assignedSearchEl = useTemplateRef('assigned-search');
</script>

<template>
    <div class="flex flex-col space-y-4">
        <FloatLabel variant="on">
            <MultiSelect display="chip" removeTokenIcon="ti ti-circle-x" :showToggleAll="false" fluid optionValue="key" :optionLabel="option => formatUsername(option.member)"
                         :options="requester_options"
                         v-model="selected_requesters" @show="requesterSearchEl.$el.focus()"
            >
                <template #header>
                    <SelectButton :options="allowed_actor_itemtypes['requesters']" v-model="requester_type_filter" multiple></SelectButton>
                    <InputText ref="requester-search" :placeholder="$t('search.placeholder')" class="p-inputtext-sm w-full mt-2" v-model="requester_filter" @input="updateActorOptions('requesters')"></InputText>
                </template>
            </MultiSelect>
            <label>{{ actor_type_labels['requesters'] }}</label>
        </FloatLabel>
        <FloatLabel variant="on">
            <MultiSelect display="chip" removeTokenIcon="ti ti-circle-x" :showToggleAll="false" fluid optionValue="key" :optionLabel="option => formatUsername(option.member)"
                         :options="observer_options"
                         v-model="selected_observers" @show="observerSearchEl.$el.focus()"
            >
                <template #header>
                    <SelectButton :options="allowed_actor_itemtypes['observers']" v-model="observer_type_filter" multiple></SelectButton>
                    <InputText ref="observer-search" :placeholder="$t('search.placeholder')" class="p-inputtext-sm w-full mt-2" v-model="observer_filter" @input="updateActorOptions('observers')"></InputText>
                </template>
            </MultiSelect>
            <label>{{ actor_type_labels['observers'] }}</label>
        </FloatLabel>
        <FloatLabel variant="on">
            <MultiSelect display="chip" removeTokenIcon="ti ti-circle-x" :showToggleAll="false" fluid optionValue="key" :optionLabel="option => formatUsername(option.member)"
                         :options="assigned_options"
                         v-model="selected_assigned" @show="assignedSearchEl.$el.focus()"
            >
                <template #header>
                    <SelectButton :options="allowed_actor_itemtypes['assigned']" v-model="assigned_type_filter" multiple></SelectButton>
                    <InputText ref="assigned-search" :placeholder="$t('search.placeholder')" class="p-inputtext-sm w-full mt-2" v-model="assigned_filter" @input="updateActorOptions('assigned')"></InputText>
                </template>
            </MultiSelect>
            <label>{{ actor_type_labels['assigned'] }}</label>
        </FloatLabel>
    </div>
</template>

<style scoped>

</style>