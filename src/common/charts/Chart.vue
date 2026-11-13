<script setup lang="ts" generic="TType extends ChartType = ChartType, TData = DefaultDataPoint<TType>, TLabel = unknown">
    import type {
        ChartData,
        ChartDataCustomTypesPerDataset,
        ChartOptions,
        ChartType,
        DefaultDataPoint
    } from "chart.js";
    import Button from "@cjdevstudios/bumblevue/button";
    import { useChart } from "@/common/charts/useChart.ts";
    import { toRef, useTemplateRef } from "vue";
    import { useI18n } from "vue-i18n";

    const props = defineProps<{
        type: TType,
        options: ChartOptions<TType>,
        data: ChartData<TType, TData, TLabel> | ChartDataCustomTypesPerDataset<TType, TData, TLabel>,
        showSaveAsImage?: boolean,
        showDownloadData?: boolean,
    }>();

    const { t: $t } = useI18n();

    const noDataPlugin = {
        id: 'noDataPlugin',
        beforeDraw: (chart: any) => {
            if (chart.data.datasets.length === 0 || chart.data.datasets.every((dataset: any) => dataset.data.length === 0)) {
                const ctx = chart.ctx;
                const width = chart.width;
                const height = chart.height;
                ctx.save();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = '16px sans-serif';
                ctx.fillStyle = '#666';
                ctx.fillText($t('dashboard.no_data_available', 'No data available'), width / 2, height / 2);
                ctx.restore();
            }
        }
    };

    const {chartOptions, chartData, saveAsImage, saveAsCSV} = useChart(
        useTemplateRef('chart'),
        // Pass refs (not snapshots) so the chart updates when the parent's options/data change
        toRef(() => props.type),
        toRef(() => props.options),
        toRef(() => props.data),
        [noDataPlugin],
    );
</script>

<template>
    <div class="w-full h-full relative justify-items-center">
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