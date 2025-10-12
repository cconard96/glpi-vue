<script setup>
    import DataTable from 'primevue/datatable';
    import Column from 'primevue/column';
    import InputText from 'primevue/inputtext';
    import SelectButton from 'primevue/selectbutton';
    import { useApi } from '@/composables/useApi';
    import { ComponentSchema } from "@/api/ComponentSchema.js";
    import {computed, ref, watch} from "vue";

    const { component_module, itemtype } = defineProps({
        component_module: {
            type: String,
            required: true
        },
        itemtype: {
            type: String,
            required: true
        }
    });

    const { getComponentSchema, search } = useApi();

    const schema = new ComponentSchema(await getComponentSchema(itemtype));
    const is_deleted = ref(0);

    // Get all columns, which are the properties of the schema.
    // For recursive/nested properties, use dot notation for now

    const flattened_properties = schema.flattenProperties();
    const columns = Object.keys(flattened_properties).map(key => ({
        field: key,
        header: key
    }));
    const filter = computed(() => {
        return `is_deleted==${is_deleted.value ? 1 : 0}`;
    });
    watch(filter, (newVal) => {
        updateResults();
    });

    const results_loading = ref(true);
    const results = ref({
        results: [],
        start: 0,
        end: 0,
        total: 0
    });
    const updateResults = (params) => {
        results_loading.value = true;
        return search(component_module, itemtype, {
            start: params?.start || 0,
            limit: params?.limit || 20,
            filter: `is_deleted==${is_deleted.value ? 1 : 0}`
        }).then(res => {
            results.value = res;
            results.value.results = schema.formatResults(results.value.results);
            results_loading.value = false;
        });
    };
    await updateResults();
    // Flatten the JSON so there is only one level of properties (dot notation) for the DataTable
    // For array properties, join them with a newline
    const flattened_results = computed(() => {
        return results.value.results.map(result => {
            const flattened = {};
            for (const [key, value] of Object.entries(result)) {
                if (Array.isArray(value)) {
                    flattened[key] = value.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join('\n');
                } else if (typeof value === 'object' && value !== null) {
                    for (const [subKey, subValue] of Object.entries(value)) {
                        flattened[`${key}.${subKey}`] = typeof subValue === 'object' ? JSON.stringify(subValue) : subValue;
                    }
                } else {
                    flattened[key] = value;
                }
            }
            return flattened;
        });
    });
</script>

<template>
    <div class="">
        <DataTable
            lazy
            :loading="results_loading"
            :value="flattened_results" scrollable scrollHeight="flex"
            paginator :first="results.start" :rows="20" :totalRecords="results.total"
            :rowsPerPageOptions="[5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]"
            @page="updateResults({
                limit: $event.rows,
                start: $event.first
            })"
        >
            <template #header>
                <div><InputText fluid placeholder="Search"></InputText></div>
                <div>
                    <SelectButton v-model="is_deleted" size="small" :options="[{label: 'Active', value: 0}, {label: 'Deleted', value: 1}]" optionLabel="label" optionValue="value"/>
                </div>
            </template>
            <Column v-for="col of columns" :field="col.field" :header="col.header">
                <template #body="slotProps">
                    <RouterLink v-if="col.field === 'id' || col.field === 'name'" :to="`/${component_module}/${itemtype}/${slotProps.data.id}`">{{ slotProps.data[col.field] }}</RouterLink>
                    <span v-else>{{ slotProps.data[col.field] }}</span>
                </template>
            </Column>
        </DataTable>
    </div>
</template>

<style scoped>

</style>