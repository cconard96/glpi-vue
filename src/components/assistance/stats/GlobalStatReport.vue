<script setup lang="ts">
    import { use as echarts_use } from 'echarts/core';
    import { SVGRenderer } from 'echarts/renderers';
    import { LineChart, LinesChart } from 'echarts/charts';
    import {
        TooltipComponent, GridComponent, ToolboxComponent, LegendComponent, TitleComponent,
    } from 'echarts/components';
    import VChart from 'vue-echarts';
    import {onMounted, ref} from "vue";
    import { FloatLabel, DatePicker } from 'primevue';
    import {LegacyGridContainLabel} from "echarts/features";

    const {selected_report, report_data} = defineProps<{
        selected_report: any,
        report_data: any,
    }>();

    const selected_date_range = defineModel('selected_date_range', {
        type: Array as () => Date[],
        required: true
    });

    echarts_use([
        SVGRenderer, LinesChart, LineChart, TooltipComponent, GridComponent, ToolboxComponent, LegendComponent,
        TitleComponent, LegacyGridContainLabel
    ]);

    const state_count_option = ref(null);
    const time_avg_option = ref(null);
    const satisfaction_count_option = ref(null);
    const satisfaction_rating_option = ref(null);

    onMounted(() => {
        const base_series = {
            type: 'line',
            areaStyle: {
                opacity: 0.3
            },
            smooth: 0.4,
            lineStyle: {
                width: 4
            },
            symbolSize: 8,
            legendHoverLink: true
        };
        const base_lines_options = {
            tooltip: {
                trigger: 'axis'
            },
            grid: {
                top: 80,
                left: '3%',
                right: '4%',
                bottom: '3%',
                containLabel: true
            },
            toolbox: {
                show: true,
                feature: []
            },
            legend: {
                show: true,
                top: 40
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: report_data.sample_dates,
            },
            yAxis: {
                type: 'value'
            },
        };

        state_count_option.value = {
            ...base_lines_options,
            title: {
                text: 'Global Assistance Statistics'
            },
            series: [
                {
                    ...base_series,
                    name: 'Opened',
                    data: Object.values(report_data.number_open),
                },
                {
                    ...base_series,
                    name: 'Solved',
                    data: Object.values(report_data.number_solved),
                },
                {
                    ...base_series,
                    name: 'Late',
                    data: Object.values(report_data.number_late),
                },
                {
                    ...base_series,
                    name: 'Closed',
                    data: Object.values(report_data.number_closed),
                }
            ]
        };

        time_avg_option.value = {
            ...base_lines_options,
            title: {
                text: 'Average Time (hours)'
            },
            series: [
                {
                    ...base_series,
                    name: 'Resolution',
                    data: Object.values(report_data.time_solve_avg),
                },
                {
                    ...base_series,
                    name: 'Closure',
                    data: Object.values(report_data.time_close_avg),
                },
                {
                    ...base_series,
                    name: 'Real Duration',
                    data: Object.values(report_data.time_treatment_avg),
                },
            ]
        };

        satisfaction_count_option.value = {
            ...base_lines_options,
            title: {
                text: 'Satisfaction Survey'
            },
            series: [
                {
                    ...base_series,
                    name: 'Opened',
                    data: Object.values(report_data.satisfaction_surveys_open),
                },
                {
                    ...base_series,
                    name: 'Answered',
                    data: Object.values(report_data.satisfaction_surveys_answered),
                },
            ]
        };

        satisfaction_rating_option.value = {
            ...base_lines_options,
            title: {
                text: 'Satisfaction Survey Average Rating'
            },
            series: [
                {
                    ...base_series,
                    name: 'Average Rating',
                    data: Object.values(report_data.satisfaction_surveys_avg_rating),
                },
            ]
        };
    })
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
            <div class="h-128">
                <VChart autoresize :option="state_count_option"></VChart>
            </div>
            <div class="h-128">
                <VChart autoresize :option="time_avg_option"></VChart>
            </div>
            <div class="h-128">
                <VChart autoresize :option="satisfaction_count_option"></VChart>
            </div>
            <div class="h-128">
                <VChart autoresize :option="satisfaction_rating_option"></VChart>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>