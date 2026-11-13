<script setup lang="ts" generic="T extends WidgetTypes">
    import { computed, defineAsyncComponent } from "vue";
    import type { WidgetTypes, BaseCardOptions, CardValue, CardOptions, ResolvedCard } from "@/common/dashboard/dashboard";
    import { isBarWidgetType, isPieCard, isSeriesCard, resolveCard } from "@/common/dashboard/cardOptions";

    const props = withDefaults(defineProps<{
        gridstack_id: string;
        x?: number;
        y?: number;
        width?: number;
        height?: number;
        /** `CardOptions<T>` alone is an indexed access type which TS cannot infer `T` from, so `BaseCardOptions<T>` is intersected to infer it from `widgettype` */
        card_options: BaseCardOptions<T> & CardOptions<T>;
        value: CardValue<T> | null;
    }>(), {
        x: -1,
        y: -1,
        width: 2,
        height: 2,
    });

    // Defined once here rather than inline in the template, otherwise a new component is created on every render
    const BigNumber = defineAsyncComponent(() => import('@/common/dashboard/widget/BigNumber.vue'));
    const DonutChart = defineAsyncComponent(() => import('@/common/dashboard/widget/DonutChart.vue'));
    const SeriesChart = defineAsyncComponent(() => import('@/common/dashboard/widget/SeriesChart.vue'));
    const Markdown = defineAsyncComponent(() => import('@/common/dashboard/widget/Markdown.vue'));
    const ArticlesList = defineAsyncComponent(() => import('@/common/dashboard/widget/ArticlesList.vue'));
    const UnsupportedWidget = defineAsyncComponent(() => import('@/common/dashboard/widget/UnsupportedWidget.vue'));

    /**
     * Widened from `ResolvedCard<T>` because TS does not narrow unions that depend on an unresolved generic.
     * As a plain discriminated union, the `widgettype` checks in the template narrow the options and value for each widget.
     */
    const card = computed<ResolvedCard>(() => resolveCard<T>(props.card_options, props.value));
</script>

<template>
    <div class="grid-stack-item" :gs-id="gridstack_id"
         :gs-w="width" :gs-h="height" :gs-x="x >= 0 ? x : undefined" :gs-y="y >= 0 ? y : undefined"
         :gs-auto-position="!(x >= 0 && y >= 0)">
        <div class="grid-stack-item-content overflow-hidden!">
            <BigNumber v-if="card.widgettype === 'bigNumber'" :gridstack_id="gridstack_id" :options="card.options" :value="card.value"/>
            <DonutChart v-else-if="isPieCard(card)" :gridstack_id="gridstack_id" :options="card.options" :value="card.value"
                        :displayAs="card.widgettype === 'pie' || card.widgettype === 'halfpie' ? 'pie' : 'donut'"/>
            <SeriesChart v-else-if="isSeriesCard(card)" :gridstack_id="gridstack_id" :options="card.options" :value="card.value"
                         :displayAs="isBarWidgetType(card.widgettype) ? 'bar' : 'line'"/>
            <Markdown v-else-if="card.widgettype === 'markdown'" :gridstack_id="gridstack_id" :options="card.options"/>
            <ArticlesList v-else-if="card.widgettype === 'articleList'" :gridstack_id="gridstack_id" :options="card.options" :value="card.value"/>
            <UnsupportedWidget v-else/>
        </div>
    </div>
</template>

<style scoped>

</style>