<script setup lang="ts">
    import {DatePicker, FloatLabel, DataTable, Column} from "primevue";
    import {computed} from "vue";
    import {useApi} from "@/composables/useApi";

    const {selected_report, report_data} = defineProps<{
        selected_report: any,
        report_data: any,
    }>();
    const selected_date_range = defineModel('selected_date_range', {
        type: Array as () => Date[],
        required: true
    });

    const { doGraphQLRequest } = useApi();

    const items = computed(() => {
        const result = [];
        if (report_data && report_data.length > 0) {
            for (const row of report_data) {
                result.push({
                    itemtype: row.item.itemtype,
                    id: row.item.id,
                    name: row.item.name,
                    entity: row.item.entity.id,
                    entity_name: row.item.entity.id,
                    is_deleted: row.item.is_deleted,
                    number_open: row.number_open,
                });
            }
        }
        return result;
    });

    // fetch the entity completenames for all items
    await doGraphQLRequest(`
        query {
            Entity(filter: "id=in=(${items.value.map(i => i.entity).join(',')})") {
                id
                completename
            }
        }
    `).then((res) => {
        const entity_map = {};
        for (const entity of res.data.Entity) {
            entity_map[entity.id] = entity.completename;
        }
        for (const item of items.value) {
            item.entity_name = entity_map[item.entity] || 'N/A';
        }
    });
</script>

<template>
    <div class="w-full mx-auto space-y-4">
        <div class="w-full mt-4">
            <FloatLabel variant="on">
                <DatePicker id="date_range" selectionMode="range" v-model="selected_date_range" :manualInput="false"></DatePicker>
                <label for="date_range">Date Range</label>
            </FloatLabel>
        </div>
        <div>
            <DataTable :value="items">
                <Column field="itemtype" header="Itemtype">Itemtype</Column>
                <Column field="name" header="Name">Name</Column>
                <Column field="entity_name" header="Entity">Entity</Column>
                <Column field="number_open" :header="`Number of ${selected_report.assistance_type}`"></Column>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>

</style>