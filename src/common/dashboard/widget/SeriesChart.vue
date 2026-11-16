<script setup lang="ts">
    import Chart from "@/common/charts/Chart.vue";
    import { computed } from "vue";
    import type { ChartData, ChartDataset, ChartOptions } from "chart.js";
    import type { ListCardValue, ResolvedCardOptions, SeriesCardValue, SeriesWidgetType } from "@/common/dashboard/dashboard";

    const props = withDefaults(defineProps<{
        gridstack_id: string;
        options: ResolvedCardOptions<SeriesWidgetType>;
        value: ListCardValue | SeriesCardValue | null;
        displayAs?: 'bar' | 'line';
    }>(), {
        displayAs: 'bar',
    });

    type SeriesDataset = ChartDataset<'bar' | 'line', number[]>;

    const color = computed(() => props.options?.color);
    const isLine = computed(() => props.displayAs === 'line');
    const isHorizontal = computed(() => !isLine.value && props.options?.orientation === 'horizontal');
    const isStacked = computed(() => !!props.options?.stacked);
    const isArea = computed(() => isLine.value && !!props.options?.fill);

    const listValue = computed(() => props.value && 'items' in props.value && Array.isArray(props.value.items) ? props.value : null);
    const seriesValue = computed(() => props.value && 'series' in props.value && Array.isArray(props.value.series) ? props.value : null);
    const listItems = computed(() => listValue.value?.items ?? null);
    const seriesItems = computed(() => seriesValue.value?.series ?? null);

    /**
     * Add transparency to a hex color so filled areas don't hide each other.
     * Non-hex colors are returned unchanged.
     */
    function withAlpha(hex: string, alpha: number): string {
        const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(hex);
        if (!match) {
            return hex;
        }
        const full = match[1].length === 3 ? match[1].split('').map((c) => c + c).join('') : match[1];
        return `#${full}${Math.round(alpha * 255).toString(16).padStart(2, '0')}`;
    }

    function applyTypeOptions(dataset: SeriesDataset, index: number, datasetColor?: string | string[] | null): SeriesDataset {
        if (datasetColor) {
            dataset.borderColor = datasetColor;
            dataset.backgroundColor = isArea.value && typeof datasetColor === 'string' ? withAlpha(datasetColor, 0.4) : datasetColor;
        }
        if (isLine.value) {
            // Stacked areas fill down to the previous dataset, otherwise down to the axis
            (dataset as ChartDataset<'line', number[]>).fill = isArea.value ? (isStacked.value && index > 0 ? '-1' : 'origin') : false;
        }
        return dataset;
    }

    const data = computed<ChartData<'bar' | 'line', number[], string>>(() => {
        // Multiple datasets
        if (seriesItems.value !== null) {
            const labels: string[] = Array.isArray(seriesValue.value?.labels) ? seriesValue.value.labels.map((l: unknown) => String(l ?? '')) : [];
            const datasets = seriesItems.value.map((serie, index) => applyTypeOptions({
                label: serie.name ?? '',
                data: (serie.values ?? []).map((v) => v ?? 0),
            }, index, serie.color));
            return { labels, datasets };
        }

        // Single dataset
        const items = listItems.value ?? [];
        // Use per-item colors only when GLPI provides a color for every item (bars only, a line has a single color)
        const itemColors = !isLine.value && items.length > 0 && items.every((item) => !!item.color)
            ? items.map((item) => item.color as string)
            : null;
        const dataset = applyTypeOptions({
            label: props.value?.label ?? '',
            data: items.map((item) => item.number ?? 0),
        }, 0, itemColors);
        return {
            labels: items.map((item) => String(item.label || item.number || '')),
            datasets: items.length > 0 ? [dataset] : [],
        };
    });

    const isDataAvailable = computed(() => data.value.datasets.some((dataset) => dataset.data.length > 0));
    const isMultiDataset = computed(() => data.value.datasets.length > 1);

    const chartOptions = computed<ChartOptions<'bar' | 'line'>>(() => {
        const indexAxis = isHorizontal.value ? 'y' : 'x';
        const valueAxis = isHorizontal.value ? 'x' : 'y';

        const opts: ChartOptions<'bar' | 'line'> = {
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
    <div class="h-full p-2">
        <Chart :type="displayAs" :options="chartOptions" :data="data"></Chart>
    </div>
</template>

<style scoped>

</style>
