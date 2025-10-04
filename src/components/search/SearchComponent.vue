<script setup>
    import DataTable from 'primevue/datatable';
    import { useApi } from '@/composables/useApi';

    const { itemtype } = defineProps({
        itemtype: {
            type: String,
            required: true
        }
    });

    const { getComponentSchema, search } = useApi();

    const schema = await getComponentSchema(itemtype);

    // Get all columns, which are the properties of the schema.
    // For recursive/nested properties, use dot notation for now

    const getProperties = (obj, prefix = '') => {
        let properties = [];
        for (const key in obj) {
            if (obj.hasOwnProperty(key)) {
                const value = obj[key];
                const fullKey = prefix ? `${prefix}.${key}` : key;
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    properties = properties.concat(getProperties(value, fullKey));
                } else {
                    properties.push(fullKey);
                }
            }
        }
        return properties;
    };
    const columns = getProperties(schema.properties);
    const results = search(itemtype, {});
</script>

<template>
    <DataTable></DataTable>
</template>

<style scoped>

</style>