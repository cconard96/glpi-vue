<script setup lang="ts">
    import Chart from "@/common/charts/Chart.vue";
    import { computed } from "vue";
    import { type ChartOptions } from "chart.js";
    import type { ListCardValue, PieWidgetType, ResolvedCardOptions } from "@/common/dashboard/dashboard";

    const props = withDefaults(defineProps<{
        gridstack_id: string;
        options: ResolvedCardOptions<PieWidgetType>;
        value: ListCardValue | null;
        displayAs?: 'donut' | 'pie';
    }>(), {
        displayAs: 'donut',
    });

    const { color } = props.options;
    const chartType = computed(() => props.displayAs === 'donut' ? 'doughnut' : props.displayAs);
    const data = computed(() => {
        const dataset = {
            data: [] as number[],
        };
        const labels: Array<string | number> = [];
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
                title: { text: props.value?.label, font: { size: 14 } },
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
    <div class="h-full p-2">
        <Chart :type="chartType" :options="chartOptions" :data="data"></Chart>
    </div>
</template>

<style scoped>

</style>