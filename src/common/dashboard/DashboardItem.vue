<script setup lang="ts">
    import Skeleton from "@cjdevstudios/bumblevue/skeleton";
    import { computed, defineAsyncComponent } from "vue";

    const props = defineProps({
        gridstack_id: {
            type: String,
            required: true,
        },
        x: {
            type: Number,
            required: true,
            default: -1,
        },
        y: {
            type: Number,
            required: true,
            default: -1,
        },
        width: {
            type: Number,
            required: true,
            default: 2,
        },
        height: {
            type: Number,
            required: true,
            default: 2,
        },
        card_options: {
            type: Object,
            required: true,
        },
        value: {
            type: Object,
            required: true,
        },
    });

    const widgetType = computed(() => props.card_options?.widgettype);
</script>

<template>
    <div class="grid-stack-item" :gs-id="gridstack_id"
         :gs-w="width" :gs-h="height" :gs-x="x >= 0 ? x : undefined" :gs-y="y >= 0 ? y : undefined"
         :gs-auto-position="!(x >= 0 && y >= 0)">
        <div class="grid-stack-item-content overflow-hidden!">
<!--            <Skeleton height="100%"></Skeleton>-->
            <component v-if="widgetType === 'bigNumber'" :is="defineAsyncComponent(() => import('@/common/dashboard/widget/BigNumber.vue'))" :gridstack_id="gridstack_id" :options="card_options" :value="value"></component>
            <component v-else-if="widgetType === 'donut'" :is="defineAsyncComponent(() => import('@/common/dashboard/widget/DonutChart.vue'))" :gridstack_id="gridstack_id" :options="card_options" :value="value"></component>
            <component v-else-if="widgetType === 'pie'" :is="defineAsyncComponent(() => import('@/common/dashboard/widget/DonutChart.vue'))" :gridstack_id="gridstack_id" :options="card_options" :value="value" displayAs="pie"></component>
        </div>
    </div>
</template>

<style scoped>

</style>