<script setup lang="ts">
    import { InputText, Select, Listbox, Chip, Button } from "primevue";
    import { useI18n } from "vue-i18n";
    import { useApi } from "@/composables/useApi.ts";
    import { inject, type Ref, ref, watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";
    import { type DynamicDialogInstance } from "primevue/dynamicdialogoptions";
    import { FormSubmitEvent } from "@primevue/forms";

    defineEmits<{
        (e: 'save', selectedRelations: Record<string, { id: string, name: string }[]>): void;
    }>();

    const dialogRef = inject<Ref<DynamicDialogInstance>>('dialogRef');
    const { t: $t } = useI18n();
    const { doGraphQLRequest } = useApi();
    const searchTerm = ref('');
    const selectedRelationType = ref(null);
    const results = ref([]);
    const selectedRelations = ref(dialogRef.value.data.usedRelations);
    const RESULT_LIMIT = 100;

    const relationTypes = [
        {
            key: 'environment',
            label: $t('dropdowns.appliance_environment', 'Environment'),
            type: 'ApplianceEnvironment',
            icon: 'ti ti-versions',
            defaultFilter: '',
        },
        {
            key: 'domain',
            label: $t('management.domain', 'Domain'),
            type: 'Domain',
            icon: 'ti ti-world-www',
            defaultFilter: 'is_deleted==false;is_template==false',
        },
        {
            key: 'location',
            label: $t('dropdowns.location', 'Location'),
            type: 'Location',
            icon: 'ti ti-map-pin',
            defaultFilter: '',
        },
        {
            key: 'network',
            label: $t('dropdowns.network', 'Network'),
            type: 'Network',
            icon: 'ti ti-network',
            defaultFilter: '',
        },
    ];

    const loadResults = useDebounceFn(() => {
        if (!selectedRelationType.value) {
            results.value = [];
            return;
        }
        const selectedType = relationTypes.find(type => type.key === selectedRelationType.value);
        const usedIDs = (dialogRef.value.data.usedRelations[selectedRelationType.value] || []).map(r => r.id);
        const notUsedFilter = usedIDs.length > 0 ? `;id=out=(${usedIDs.join(',')})` : '';
        const filter = selectedType.defaultFilter + (searchTerm.value ? `;name=ilike='*${searchTerm.value}*'` : '') + notUsedFilter;

        doGraphQLRequest<{
            [key: string]: { id: string, name: string, is_deleted: boolean }[]
        }>(`
            query { ${selectedType.type}(filter: "${filter}", limit: ${RESULT_LIMIT}, sort: "name") { id name } }
        `, {} , searchTerm.value ? 'network-only' : 'cache-first').then(res => {
            results.value = res.data[selectedType.type];
        });
    }, 200, { maxWait: 1000 });

    watch(selectedRelationType, () => {
        searchTerm.value = '';
        loadResults();
    });
</script>

<template>
    <div class="grid grid-rows-[1fr_auto] gap-3 h-full">
        <div>
            <Select v-model="selectedRelationType" :options="relationTypes" optionLabel="label" optionValue="key"
                    :placeholder="$t('management.appliance.selectRelationType', 'Select relation type')" fluid></Select>
            <InputText v-if="selectedRelationType"  v-model="searchTerm" placeholder="Search" class="mb-3 w-full" @input="loadResults"></InputText>
            <Listbox v-if="selectedRelationType" :options="results" optionLabel="name" optionValue="id" class="w-full"></Listbox>
        </div>
        <div class="flex flex-wrap gap-2">
            <template v-for="(relations, relationType) in selectedRelations" :key="relationType">
                <Chip v-for="relation in relations"
                      :key="relation.id" :label="relation.name" :icon="relationTypes.find(type => type.key === relationType)?.icon"
                      removable @remove="selectedRelations[relationType] = selectedRelations[relationType].filter(r => r.id !== relation.id)"
                      removeIcon="ti ti-circle-x">
                </Chip>
            </template>
        </div>
        <div class="flex justify-end">
            <Button :label="$t('button.save', 'Save')" class="mt-2" @click="$emit('save', selectedRelations)"></Button>
        </div>
    </div>
</template>

<style scoped>

</style>