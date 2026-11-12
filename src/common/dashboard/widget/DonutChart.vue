<script setup lang="ts">
    import Chart from "@/common/charts/Chart.vue";
    import { computed } from "vue";

    const props = withDefaults(defineProps<{
        gridstack_id: string;
        options: Record<string, any>;
        value: Record<string, any>;
        displayAs?: 'donut' | 'pie';
    }>(), {
        displayAs: 'donut',
    });

    const { color } = props.options;
    const data = computed(() => {
        const dataset = {
            type: props.displayAs === 'donut' ? 'doughnut' : props.displayAs,
            data: [],
            responsive: true,
            maintainAspectRatio: false,
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
</script>

<template>
    <div class="h-full border rounded p-2" :style="`color: ${color ?? 'inherit'}; border-color: ${color ?? 'inherit'};`">
        <Chart type="doughnut" :options="{
            plugins: {
                title: { text: value.label, font: { size: 14 } },
                legend: { display: false },
                tooltip: { enabled: true },
            },
            scales: {x: {display: false}, y: {display: false}},
        }" :data="data"></Chart>
    </div>
</template>

<style scoped>

</style>