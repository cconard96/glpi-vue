<script setup lang="ts">
import {Card, Select, FloatLabel, Message, ProgressSpinner} from 'primevue';
    import { useApi } from "@/composables/useApi";
    import {watchEffect, ref, defineAsyncComponent, markRaw} from "vue";

    const { doApiRequest } = useApi();
    const available_reports = [
        {
            label: 'Tickets',
            items: [
                { assistance_type: 'Ticket', report_type: 'Global', label: 'Global', component: markRaw(defineAsyncComponent(() => import('./GlobalStatReport.vue'))) },
                // { assistance_type: 'Ticket', report_type: 'Characteristics', label: 'By ticket' },
                // { assistance_type: 'Ticket', report_type: 'AssetCharacteristics', label: 'By hardware characteristics' },
                { assistance_type: 'Ticket', report_type: 'Asset', label: 'By hardware', component: markRaw(defineAsyncComponent(() => import('./AssetStateReport.vue'))) },
            ]
        },
        {
            label: 'Problem',
            items: [
                { assistance_type: 'Problem', report_type: 'Global', label: 'Global', component: markRaw(defineAsyncComponent(() => import('./GlobalStatReport.vue'))) },
                // { assistance_type: 'Problem', report_type: 'Characteristics', label: 'By problem' },
                // { assistance_type: 'Problem', report_type: 'AssetCharacteristics', label: 'By hardware characteristics' },
                { assistance_type: 'Problem', report_type: 'Asset', label: 'By hardware', component: markRaw(defineAsyncComponent(() => import('./AssetStateReport.vue'))) },
            ]
        },
        {
            label: 'Change',
            items: [
                { assistance_type: 'Change', report_type: 'Global', label: 'Global', component: markRaw(defineAsyncComponent(() => import('./GlobalStatReport.vue'))) },
                // { assistance_type: 'Change', report_type: 'Characteristics', label: 'By change' },
                // { assistance_type: 'Change', report_type: 'AssetCharacteristics', label: 'By hardware characteristics' },
                { assistance_type: 'Change', report_type: 'Asset', label: 'By hardware', component: markRaw(defineAsyncComponent(() => import('./AssetStateReport.vue'))) },
            ]
        },
    ];
    const selected_report = ref(null);
    const report_data = ref(null);
    const error = ref(false);
    const selected_date_range = ref([
        new Date(new Date().setFullYear(new Date().getFullYear() - 1)),
        new Date()
    ]);

    watchEffect(() => {
        const selected = selected_report.value;
        const start = selected_date_range.value[0].toISOString().split('T')[0];
        const end = selected_date_range.value[1] ? selected_date_range.value[1].toISOString().split('T')[0] : start;

        if (selected && start && end && (start != end)) {
            error.value = false;
            report_data.value = null;

            doApiRequest(`/Assistance/Stat/${selected.assistance_type}/${selected.report_type}`, {
                method: 'GET',
                params: {
                    date_start: start,
                    date_end: end,
                }
            }).then((res) => {
                report_data.value = res.data;
            }).catch(() => {
                error.value = true;
            });
        }
    });
</script>

<template>
    <Card class="overflow-y-auto">
        <template #content>
            <div>
                <FloatLabel variant="on">
                    <Select inputId="stat_report_type" class="min-w-64" :loading="!available_reports.length"
                            optionGroupChildren="items" optionGroupLabel="label" optionLabel="label"
                            :options="available_reports" v-model="selected_report"></Select>
                    <label for="stat_report_type">Report</label>
                </FloatLabel>
            </div>
            <div class="mt-2">
                <Message v-if="error" severity="error">
                    An error occurred while loading the report
                </Message>
                <Suspense v-else-if="report_data">
                    <component :is="selected_report?.component" :selected_report="selected_report" :report_data="report_data" v-model:selected_date_range="selected_date_range"></component>
                    <template #fallback>
                        <div class="flex justify-content-center align-items-center h-full">
                            <ProgressSpinner />
                        </div>
                    </template>
                </Suspense>
            </div>
        </template>
    </Card>
</template>

<style scoped>

</style>