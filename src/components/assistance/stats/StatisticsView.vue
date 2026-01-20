<script setup lang="ts">
    import { Card, Select, FloatLabel, Message } from 'primevue';
    import { useApi } from "@/composables/useApi";
    import {watchEffect, ref, defineAsyncComponent, markRaw} from "vue";

    const { doApiRequest } = useApi();
    const available_reports = [
        {
            label: 'Tickets',
            items: [
                { assistance_type: 'Ticket', report_type: 'Global', label: 'Global', component: markRaw(defineAsyncComponent(() => import('./GlobalStatReport.vue'))) },
                { assistance_type: 'Ticket', report_type: 'Characteristics', label: 'By ticket' },
                { assistance_type: 'Ticket', report_type: 'AssetCharacteristics', label: 'By hardware characteristics' },
                { assistance_type: 'Ticket', report_type: 'Asset', label: 'By hardware' },
            ]
        },
        {
            label: 'Problem',
            items: [
                { assistance_type: 'Problem', report_type: 'Global', label: 'Global', component: markRaw(defineAsyncComponent(() => import('./GlobalStatReport.vue'))) },
                { assistance_type: 'Problem', report_type: 'Characteristics', label: 'By problem' },
                { assistance_type: 'Problem', report_type: 'AssetCharacteristics', label: 'By hardware characteristics' },
                { assistance_type: 'Problem', report_type: 'Asset', label: 'By hardware' },
            ]
        },
        {
            label: 'Change',
            items: [
                { assistance_type: 'Change', report_type: 'Global', label: 'Global', component: markRaw(defineAsyncComponent(() => import('./GlobalStatReport.vue'))) },
                { assistance_type: 'Change', report_type: 'Characteristics', label: 'By change' },
                { assistance_type: 'Change', report_type: 'AssetCharacteristics', label: 'By hardware characteristics' },
                { assistance_type: 'Change', report_type: 'Asset', label: 'By hardware' },
            ]
        },
    ];
    const selected_report = ref(null);
    const report_data = ref(null);
    const error = ref(false);

    watchEffect(() => {
        error.value = false;
        report_data.value = null;
        const selected = selected_report.value;
        if (selected) {
            doApiRequest(`/Assistance/Stat/${selected.assistance_type}/${selected.report_type}`, {
                method: 'GET'
            }).then((res) => {
                report_data.value = res.data;
            }).catch(() => {
                error.value = true;
            });
        }
    });
</script>

<template>
    <Card>
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
                <component v-else-if="report_data" :is="selected_report?.component" :selected_report="selected_report" :report_data="report_data"></component>
            </div>
        </template>
    </Card>
</template>

<style scoped>

</style>