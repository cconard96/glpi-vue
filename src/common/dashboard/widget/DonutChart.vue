<script setup lang="ts">
    import Chart from "@/common/charts/Chart.vue";
    import { computed } from "vue";
    import { type ChartOptions } from "chart.js";

    const props = withDefaults(defineProps<{
        gridstack_id: string;
        options: Record<string, any>;
        value: Record<string, any>;
        displayAs?: 'donut' | 'pie';
    }>(), {
        displayAs: 'donut',
    });

    const { color } = props.options;
    const chartType = computed(() => props.displayAs === 'donut' ? 'doughnut' : props.displayAs);
    const data = computed(() => {
        const dataset = {
            data: [],
        };
        const labels = [];
        if (Array.isArray(props.value?.items)) {
            for (const item of props.value?.items ?? []) {
                dataset.data.push(item.number ?? 0);
                labels.push(item.label || item.number);
            }
        }
        return {
            datasets: [dataset],
            labels: labels,
        };
    });

    const chartOptions = computed<ChartOptions<'doughnut' | 'pie'>>(() => {
        const opts: ChartOptions<'doughnut' | 'pie'> = {
            plugins: {
                title: { text: props.value.label, font: { size: 14 } },
                legend: { display: false },
                tooltip: { enabled: true },
            },
            scales: { x: {display: false}, y: {display: false} },
        };

        if (props.options.displayMode === 'half') {
            opts.circumference = 180;
            opts.rotation = -90;
        }
        return opts;
    });
</script>

<template>
    <div class="h-full border rounded p-2" :style="`color: ${color ?? 'inherit'}; border-color: ${color ?? 'inherit'};`">
        <Chart :type="chartType" :options="chartOptions" :data="data"></Chart>
    </div>
</template>

<style scoped>

</style>