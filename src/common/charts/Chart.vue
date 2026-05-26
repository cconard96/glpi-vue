<script setup lang="ts" generic="TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown">
    import type {
        ChartData,
        ChartDataCustomTypesPerDataset,
        ChartOptions,
        ChartType,
        DefaultDataPoint
    } from "chart.js";
    import { Button } from "primevue";
    import { useChart } from "@/common/charts/useChart.ts";
    import { useTemplateRef } from "vue";

    const props = defineProps<{
        type: TType,
        options: ChartOptions<TType>,
        data: ChartData<TType, TData, TLabel> | ChartDataCustomTypesPerDataset<TType, TData, TLabel>,
        showSaveAsImage?: boolean,
        showDownloadData?: boolean,
    }>();

    const {chartOptions, chartData, saveAsImage, saveAsCSV} = useChart(useTemplateRef('chart'), props.type, props.options, props.data);
</script>

<template>
    <div>
        <div class="w-full flex flex-row-reverse relative top-10">
            <Button v-if="showSaveAsImage" @click="saveAsImage" variant="text" severity="secondary" size="small"
                    :title="$t('charts.save_as_image', 'Save as image')" :aria-label="$t('charts.save_as_image', 'Save as image')">
                <i class="ti ti-photo" aria-hidden="true"></i>
            </Button>
            <Button v-if="showDownloadData" @click="saveAsCSV" variant="text" severity="secondary" size="small"
                    :title="$t('charts.download_data', 'Download data')" :aria-label="$t('charts.download_data', 'Download data')">
                <i class="ti ti-download" aria-hidden="true"></i>
            </Button>
        </div>
        <canvas ref="chart" aria-hidden="true"></canvas>
        <table class="sr-only">
            <caption>{{ chartOptions.plugins?.title?.text || $t('charts.default_a11y_caption', 'Chart data') }}</caption>
            <thead>
                <tr>
                    <th scope="col">{{ $t('charts.default_a11y_y_axis_label', 'Label') }}</th>
                    <th v-for="dataset in chartData.datasets" :key="dataset.label" scope="col">{{ dataset.label }}</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="(label, index) in chartData.labels" :key="index">
                    <th scope="row">{{ label }}</th>
                    <td v-for="dataset in chartData.datasets" :key="dataset.label">{{ dataset.data[index] }}</td>
                </tr>
            </tbody>
        </table>
    </div>
</template>

<style scoped>

</style>