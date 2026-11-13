<script setup lang="ts">
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

    // GLPI widget types: ["bigNumber","summaryNumbers","multipleNumber","pie","donut","halfpie","halfdonut","bar","hbar","searchShowList","line","area","lines","areas","bars","stackedbars","hBars","stackedHBars","articleList","markdown"]

    const barWidgetTypes = ['bar', 'hbar', 'hBars', 'stackedbars', 'stackedHBars'];
    const widgetType = computed(() => {
        if (props.card_options?.widgettype === 'halfdonut') {
            return 'donut';
        } else if (props.card_options?.widgettype === 'halfpie') {
            return 'pie';
        } else if (barWidgetTypes.includes(props.card_options?.widgettype)) {
            return 'bar';
        }
        return props.card_options?.widgettype;
    });

    const cardOptions = computed(() => {
        // Copy to avoid mutating the prop
        const opts: Record<string, any> = { ...props.card_options };
        const type = props.card_options?.widgettype;
        if (type === 'halfdonut' || type === 'halfpie') {
            opts.displayMode = 'half';
        } else if (barWidgetTypes.includes(type)) {
            opts.orientation = ['hbar', 'hBars', 'stackedHBars'].includes(type) ? 'horizontal' : 'vertical';
            opts.stacked = ['stackedbars', 'stackedHBars'].includes(type);
        }
        return opts;
    });
</script>

<template>
    <div class="grid-stack-item" :gs-id="gridstack_id"
         :gs-w="width" :gs-h="height" :gs-x="x >= 0 ? x : undefined" :gs-y="y >= 0 ? y : undefined"
         :gs-auto-position="!(x >= 0 && y >= 0)">
        <div class="grid-stack-item-content overflow-hidden!">
            <component v-if="widgetType === 'bigNumber'" :is="defineAsyncComponent(() => import('@/common/dashboard/widget/BigNumber.vue'))" :gridstack_id="gridstack_id" :options="cardOptions" :value="value"></component>
            <component v-else-if="widgetType === 'donut'" :is="defineAsyncComponent(() => import('@/common/dashboard/widget/DonutChart.vue'))" :gridstack_id="gridstack_id" :options="cardOptions" :value="value"></component>
            <component v-else-if="widgetType === 'pie'" :is="defineAsyncComponent(() => import('@/common/dashboard/widget/DonutChart.vue'))" :gridstack_id="gridstack_id" :options="cardOptions" :value="value" displayAs="pie"></component>
            <component v-else-if="widgetType === 'bar'" :is="defineAsyncComponent(() => import('@/common/dashboard/widget/BarChart.vue'))" :gridstack_id="gridstack_id" :options="cardOptions" :value="value"></component>
        </div>
    </div>
</template>

<style scoped>

</style>