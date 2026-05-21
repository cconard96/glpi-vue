<script setup lang="ts">
    import { FloatLabel, DatePicker } from 'primevue';
    import Chart from "@/common/charts/Chart.vue";

    const {selected_report, report_data} = defineProps<{
        selected_report: any,
        report_data: any,
    }>();

    const selected_date_range = defineModel('selected_date_range', {
        type: Array as () => Date[],
        required: true
    });
</script>

<template>
    <div class="max-2xl:w-full max-2xl:max-w-256 max-2xl:mx-auto">
        <div class="w-full mt-4">
            <FloatLabel variant="on">
                <DatePicker id="date_range" selectionMode="range" v-model="selected_date_range" :manualInput="false"></DatePicker>
                <label for="date_range">Date Range</label>
            </FloatLabel>
        </div>
        <div class="2xl:grid 2xl:grid-cols-2 2xl:gap-4 space-y-4 2xl:space-y-0">
            <Chart class="h-128" type="line" :options="{
                plugins: {
                    title: { text: 'Global Assistance Statistics' },
                }
            }" :data="{
                labels: report_data.sample_dates,
                datasets: [
                    { label: 'Opened', data: Object.values(report_data.number_open) },
                    { label: 'Solved', data: Object.values(report_data.number_solved) },
                    { label: 'Late', data: Object.values(report_data.number_late) },
                    { label: 'Closed', data: Object.values(report_data.number_closed) },
                ]
            }" showSaveAsImage showDownloadData></Chart>
            <Chart class="h-128" type="line" :options="{
                plugins: {
                    title: { text: 'Average Time (hours)' },
                }
            }" :data="{
                labels: report_data.sample_dates,
                datasets: [
                    { label: 'Resolution', data: Object.values(report_data.time_solve_avg) },
                    { label: 'Closure', data: Object.values(report_data.time_close_avg) },
                    { label: 'Real Duration', data: Object.values(report_data.time_treatment_avg) },
                ]
            }"></Chart>
            <Chart class="h-128" type="line" :options="{
                plugins: {
                    title: { text: 'Satisfaction Survey' },
                }
            }" :data="{
                labels: report_data.sample_dates,
                datasets: [
                    { label: 'Opened', data: Object.values(report_data.satisfaction_surveys_open) },
                    { label: 'Answered', data: Object.values(report_data.satisfaction_surveys_answered) },
                ]
            }"></Chart>
            <Chart class="h-128" type="line" :options="{
                plugins: {
                    title: { text: 'Satisfaction Survey Average Rating' },
                }
            }" :data="{
                labels: report_data.sample_dates,
                datasets: [
                    { label: 'Average Rating', data: Object.values(report_data.satisfaction_surveys_avg_rating) },
                ]
            }"></Chart>
        </div>
    </div>
</template>

<style scoped>

</style>