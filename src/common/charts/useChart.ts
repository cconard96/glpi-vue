import type {
    ChartItem, ChartConfiguration, ChartData, ChartType,
    ChartDatasetCustomTypesPerDataset, ChartOptions, ChartDataCustomTypesPerDataset,
    DefaultDataPoint,
} from "chart.js";
import { computed, MaybeRef, onMounted, onUnmounted, ref, type Ref, watch } from "vue";
import Chart from "chart.js/auto";
import { deepMerge } from "@/core/util/objectUtils";
import { usePreferredColorScheme } from "@vueuse/core";

export function useChart<TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown>(
    item: Ref<ChartItem>,
    type: MaybeRef<TType>,
    options: MaybeRef<ChartOptions<TType>>,
    data: MaybeRef<ChartData<TType, TData, TLabel> | ChartDataCustomTypesPerDataset<TType, TData,  TLabel>>
) {

    const defaultDatasetOptions: Partial<{
        [K in ChartType]: Partial<ChartDatasetCustomTypesPerDataset<K, TData>>
    }> = {
        line: {
            tension: 0.4, // smooth curves
            fill: false, // no area fill
            pointRadius: 5,
            pointHoverRadius: 7,
        }
    };

    const preferredColorScheme = usePreferredColorScheme();
    let chart = null;

    const chartStyles = computed(() => {
        const fgColor = preferredColorScheme.value === 'dark' ? '#fff' : '#000';
        const fgMutedColor = preferredColorScheme.value === 'dark'
            ? getComputedStyle(document.documentElement).getPropertyValue('--p-surface-700')
            : getComputedStyle(document.documentElement).getPropertyValue('--p-surface-200');

        return {
            fgColor: fgColor,
            fgMutedColor: fgMutedColor,
        };
    });

    const chartType = ref(type);
    const chartOptions = ref(options);
    const computedOptions = computed(() => {
        const defaultOptions: ChartOptions = {
            responsive: true,
            interaction: {
                mode: 'x', // Show all tooltips for the same horizontal position even if they don't share the same point (e.g. for multiple lines)
            },
            scales: {
                y: {
                    min: 0, // Prevent negative values showing when all values are 0
                    grid: { color: chartStyles.value.fgMutedColor },
                    ticks: { color: chartStyles.value.fgColor }
                },
                x: {
                    grid: { color: chartStyles.value.fgMutedColor },
                    ticks: { color: chartStyles.value.fgColor }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,
                        color: chartStyles.value.fgColor,
                    }
                },
                title: {
                    display: true,
                    color: chartStyles.value.fgColor,
                    font: {
                        size: 21, // 1.5em / var(--text-2xl)
                        weight: 'normal',
                    },
                }
            }
        };

        return deepMerge(defaultOptions, chartOptions.value);
    });
    const chartData = ref(data);
    const computedData = computed(() => {
        const defaultDatasetOptionsForType = defaultDatasetOptions[chartType.value] || {};

        return {
            labels: chartData.value.labels,
            datasets: chartData.value.datasets.map((dataset: any) => ({
                ...defaultDatasetOptionsForType,
                ...dataset,
            })),
        };
    });

    watch(computedOptions, (newValue, oldValue) => {
        if (chart !== null && newValue !== oldValue) {
            chart.options = newValue;
            chart.update();
        }
    });

    watch(chartType, (newType, oldType) => {
        if (chart !== null && newType !== oldType) {
            chart.config.type = newType;
            chart.update();
        }
    });

    watch(computedData, (newValue) => {
        if (chart !== null) {
            chart.data = newValue;
            chart.update();
        }
    }, {deep: true});

    onMounted(() => {
        chart = new Chart(item.value, {
            type: chartType.value,
            data: chartData.value,
            options: computedOptions.value,
        } as ChartConfiguration<TType, TData, TLabel>);
    });

    onUnmounted(() => {
        if (chart !== null) {
            chart.destroy();
        }
    });

    function saveAsImage() {
        if (chart !== null) {
            const title = chart.options.plugins?.title?.text || 'chart';
            const image = chart.toBase64Image();
            const link = document.createElement('a');
            link.href = image;
            link.download = `${title}.png`;
            link.click();
        }
    }

    function saveAsCSV() {
        if (chart !== null) {
            const title = chart.options.plugins?.title?.text || 'chart';
            const labels = chart.data.labels || [];
            const datasets = chart.data.datasets || [];

            let csvContent = "data:text/csv;charset=utf-8,";
            csvContent += `Label,${datasets.map(ds => ds.label).join(',')}\n`;

            labels.forEach((label: string, index: number) => {
                const row = [label, ...datasets.map(ds => ds.data[index])].join(',');
                csvContent += row + "\n";
            });

            const encodedUri = encodeURI(csvContent);
            const link = document.createElement('a');
            link.href = encodedUri;
            link.download = `${title}.csv`;
            link.click();
        }
    }

    return {
        chartType,
        chartOptions,
        chartData,
        saveAsImage,
        saveAsCSV,
    };
}