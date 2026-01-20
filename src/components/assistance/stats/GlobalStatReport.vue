<script setup lang="ts">
    import * as echarts from 'echarts';
    import { LinesChart } from 'echarts/charts';
    import VChart from 'vue-echarts';
    import {onMounted, ref} from "vue";

    const {selected_report, report_data} = defineProps<{
        selected_report: any,
        report_data: any
    }>();

    echarts.use([LinesChart]);

    const option = ref(null);

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
        option.value = {
            title: {
                text: 'Global Assistance Statistics'
            },
            tooltip: {
                trigger: 'axis'
            },
            grid: {
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
                show: true
            },
            xAxis: {
                type: 'category',
                boundaryGap: false,
                data: report_data.sample_dates
            },
            yAxis: {
                type: 'value'
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
    })
</script>

<template>
    <div class="w-full h-128">
        <VChart autoresize :option="option"></VChart>
    </div>
</template>

<style scoped>

</style>