<script setup lang="ts">
    import Chart from "@/common/charts/Chart.vue";
    import { computed } from "vue";
    import type { ChartData, ChartDataset, ChartOptions } from "chart.js";

    const props = withDefaults(defineProps<{
        gridstack_id: string;
        options: Record<string, any>;
        value: Record<string, any>;
    }>(), {});

    const color = computed(() => props.options?.color);
    const isHorizontal = computed(() => props.options?.orientation === 'horizontal');
    const isStacked = computed(() => !!props.options?.stacked);

    const listItems = computed(() => Array.isArray(props.value?.items) ? props.value.items : null);
    const seriesItems = computed(() => Array.isArray(props.value?.series) ? props.value.series : null);

    const data = computed<ChartData<'bar', number[], string>>(() => {
        // Multiple datasets
        if (seriesItems.value !== null) {
            const labels: string[] = Array.isArray(props.value?.labels) ? props.value.labels.map((l: unknown) => String(l ?? '')) : [];
            const datasets: ChartDataset<'bar', number[]>[] = seriesItems.value.map((serie) => {
                const dataset: ChartDataset<'bar', number[]> = {
                    label: serie.name ?? '',
                    data: (serie.values ?? []).map((v) => v ?? 0),
                };
                if (serie.color) {
                    dataset.backgroundColor = serie.color;
                    dataset.borderColor = serie.color;
                }
                return dataset;
            });
            return { labels, datasets };
        }

        // Single dataset
        const items = listItems.value ?? [];
        const dataset: ChartDataset<'bar', number[]> = {
            label: props.value?.label ?? '',
            data: items.map((item) => item.number ?? 0),
        };
        // Use per-bar colors only when GLPI provides a color for every item, otherwise keep the default palette
        if (items.length > 0 && items.every((item) => !!item.color)) {
            dataset.backgroundColor = items.map((item) => item.color as string);
            dataset.borderColor = dataset.backgroundColor;
        }
        return {
            labels: items.map((item) => String(item.label || item.number || '')),
            datasets: items.length > 0 ? [dataset] : [],
        };
    });

    const isDataAvailable = computed(() => data.value.datasets.some((dataset) => dataset.data.length > 0));
    const isMultiDataset = computed(() => seriesItems.value !== null);

    const chartOptions = computed<ChartOptions<'bar'>>(() => {
        const indexAxis = isHorizontal.value ? 'y' : 'x';
        const valueAxis = isHorizontal.value ? 'x' : 'y';

        const opts: ChartOptions<'bar'> = {
            indexAxis,
            // Group tooltips by category along the index axis (works for both orientations)
            interaction: { mode: 'index', axis: indexAxis, intersect: false },
            plugins: {
                title: { text: props.value?.label, font: { size: 14 } },
                tooltip: { enabled: true },
                // A single dataset legend would only repeat the title
                legend: { display: isDataAvailable.value && isMultiDataset.value },
            },
            scales: {
                [indexAxis]: { stacked: isStacked.value },
                [valueAxis]: { stacked: isStacked.value, beginAtZero: true, min: 0, ticks: { precision: 0 } },
            },
        };
        if (!isDataAvailable.value) {
            opts.scales = { x: { display: false }, y: { display: false } };
        }
        return opts;
    });
</script>

<template>
    <div class="h-full border rounded p-2" :style="`color: ${color ?? 'inherit'}; border-color: ${color ?? 'inherit'};`">
        <Chart type="bar" :options="chartOptions" :data="data"></Chart>
    </div>
</template>

<style scoped>

</style>
