<script setup lang="ts">
    import {DatePicker, FloatLabel, DataTable, Column} from "primevue";
    import {computed} from "vue";
    import {useApi} from "@/common/api/useApi";
    import { useI18n } from "vue-i18n";

    const {selected_report, report_data} = defineProps<{
        selected_report: any,
        report_data: any,
    }>();
    const selected_date_range = defineModel('selected_date_range', {
        type: Array as () => Date[],
        required: true
    });

    const { t: $t } = useI18n();
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
            item.entity_name = entity_map[item.entity] || $t('common.not_applicable.short', 'N/A');
        }
    });

    function getAssistanceTypeLabel(assistanceType: string) {
        switch (assistanceType.toLowerCase()) {
            case 'ticket':
                return $t('assistance.ticket.label', 99);
            case 'change':
                return $t('assistance.change.label', 99);
            case 'problem':
                return $t('assistance.problem.label', 99);
            default:
                return assistanceType;
        }
    }
</script>

<template>
    <div class="w-full mx-auto space-y-4">
        <div class="w-full mt-4">
            <FloatLabel variant="on">
                <DatePicker id="date_range" selectionMode="range" v-model="selected_date_range" :manualInput="false"></DatePicker>
                <label for="date_range">{{ $t('common.date_range', 'Date range') }}</label>
            </FloatLabel>
        </div>
        <div>
            <DataTable :value="items">
                <Column field="itemtype" :header="$t('item.type', 1, {
                    default: 'Type | Types',
                })"></Column>
                <Column field="name" :header="$t('item.fields.name')"></Column>
                <Column field="entity_name" :header="$t('administration.entity.label', 1)"></Column>
                <Column field="number_open" :header="$t('assistance.statistics.number_of_label', {
                    assistanceType: getAssistanceTypeLabel(selected_report.assistance_type)
                }, 'Number of {assistanceType}')"></Column>
            </DataTable>
        </div>
    </div>
</template>

<style scoped>

</style>