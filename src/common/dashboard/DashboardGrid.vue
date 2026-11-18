<script setup lang="ts">
    import { useApi } from '@/common/api/useApi';
    import {computed, onMounted, ref, useTemplateRef} from "vue";
    import { GridStack } from 'gridstack';
    import 'gridstack/dist/gridstack.min.css';
    import DashboardItem from "./DashboardItem.vue";
    import { useSessionStore } from "@/common/useSessionStore";
    import DashboardFilters from "@/common/dashboard/DashboardFilters.vue";
    import { useToast } from "@cjdevstudios/bumblevue/usetoast";
    import { useI18n } from "vue-i18n";

    const props = defineProps({
        current: {
            type: String,
            required: true
        },
        embed: {
            type: Boolean,
            default: false
        },
        context: {
            type: String,
            default: 'core'
        },
        cols: {
            type: Number,
            default: 26
        },
        rows: {
            type: Number,
            default: 24
        },
        demo: {
            type: Boolean,
            default: false
        }
    });

    const CELL_MARGIN = 3;
    const { doGraphQLRequest, doApiRequest } = useApi();
    const { getUserID } = useSessionStore();
    const toast = useToast();
    const { t: $t } = useI18n();
    const dashboardInfo = ref<{
        id: string;
        key: string;
        name: string;
        context: string;
        user: { id: string };
        filters: Record<string, any>;
        items: Array<{
            id: string;
            card: string;
            x: number;
            y: number;
            width: number;
            height: number;
            card_options?: Record<string, any>;
            value?: any;
        }>;
    }>({} as any);
    /** Cell height calculated as the px value of the cell width which is calculated by % */
    const cell_height = computed(() => {
        const cell_width_percent = 100 / props.cols;
        return `calc(${cell_width_percent}% - ${CELL_MARGIN}px)`;
    });
    const grid_el = useTemplateRef('ref_dashboardgrid');
    const edit_mode = ref(false);

    async function refreshData(initial: boolean = false) {
        //TODO Use cache-and-network (use @vue/apollo-composable)
        return doGraphQLRequest(`
            query {
                Dashboard(filter: "key==${props.current}", limit: 1) {
                    id key name context
                    user { id }
                    filters { filter }
                    items {
                        id card x y width height card_options
                        value(demo: ${props.demo}) {
                            ...BigNumberFields
                            ...ListFields
                            ...SeriesFields
                            ...ArticleFields
                        }
                    }
                }
            }
            fragment BigNumberFields on DashboardCardNumber { itemtype number label icon }
            fragment ListFields on DashboardCardList { icon label distributed items { label color number} }
            fragment SeriesFields on DashboardCardSeries { icon label labels series { values name} }
            fragment ArticleFields on DashboardCardArticles { icon label number articles { date label content author } }
        `, {}, initial ? 'cache-first' : 'no-cache').then((response) => {
            //FIXME The dashboard flashes when the data is refreshed because the items are replaced with new objects. We need to update the existing items instead of replacing them (based on the item id) when possible
            if (initial) {
                dashboardInfo.value = {
                    id: response.data.Dashboard[0].id,
                    key: response.data.Dashboard[0].key,
                    name: response.data.Dashboard[0].name,
                    context: response.data.Dashboard[0].context,
                    user: response.data.Dashboard[0].user,
                    filters: {},
                    items: [],
                };
            } else {
                dashboardInfo.value.filters = {};
                dashboardInfo.value.items = [];
            }
            response.data.Dashboard[0].items.forEach((item) => {
                const dashboard_item = {
                    id: item.id,
                    card: item.card,
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    card_options: item.card_options ? JSON.parse(item.card_options) : {},
                    value: item.value,
                };
                dashboardInfo.value.items.push(dashboard_item);
            });

            for (const filter of response.data.Dashboard[0].filters) {
                dashboardInfo.value.filters = {...dashboardInfo.value.filters, ...JSON.parse(filter.filter)};
            }
        });
    }

    await refreshData(true);

    onMounted(() => {
        const elem_domRect = grid_el.value.getBoundingClientRect();
        const width_offset = elem_domRect.left + (window.innerWidth - elem_domRect.right) + 0.02;
        const grid = GridStack.init({
            column: props.cols,
            minRow: props.rows + 1, // +1 for a hidden item at bottom (to fix height)
            margin: CELL_MARGIN,
            float: true,
            animate: false,
            draggable: {
                cancel: 'textarea'
            },
            minWidth: 768 - width_offset,// breakpoint of one column mode (based on the dashboard container width), trying to reduce to match the `-md` breakpoint of bootstrap (this last is based on viewport width)
        }, grid_el.value.querySelector('.grid-stack'));
        grid.setStatic(true);
    });

    let saveFiltersTimeoutId: NodeJS.Timeout = null;
    const saveFilters = () => {
        // debounce a REST call to save the new filters and refresh the data to avoid many calls when multiple filters are changed in a short time
        if (saveFiltersTimeoutId) {
            clearTimeout(saveFiltersTimeoutId);
        }
        saveFiltersTimeoutId = setTimeout(() => {
            // No mutation available, so we use a REST call to update filters. Then we can call refreshData to get the new data with the updated filters.
            doApiRequest(`/Dashboards/Dashboard/${dashboardInfo.value.id}/Filter`, {
                method: 'PUT',
                data: dashboardInfo.value.filters
            }).then((res) => {
                // The API returns the updated filters. We can use them to update the dashboardInfo.filters immediately instead of waiting for the refresh in case the saved filters differ from what was sent
                dashboardInfo.value.filters = res.data;
                refreshData();
            }).catch(() => {
                toast.add({
                    severity: 'error',
                    summary: $t('common.error.error', 'Error'),
                    detail: $t('dashboard.failed_to_save_filters', 'Failed to save filters'),
                    life: 3000
                });
            });
        }, 500);
    }

    const updateFilter = (key: string, value: any) => {
        dashboardInfo.value.filters[key] = value;
        saveFilters();
    }

    const clearFilter = (key: string) => {
        delete dashboardInfo.value.filters[key];
        saveFilters();
    }
</script>

<template>
    <div ref="ref_dashboardgrid" class="bg-neutral-100 dark:bg-neutral-900">
        <DashboardFilters :filters="dashboardInfo.filters" @update:filterValue="updateFilter"></DashboardFilters>
        <div :class="`grid-stack grid-stack-${cols} w-full`" :gs-column="cols" :gs-min-row="rows">
            <DashboardItem v-for="item in dashboardInfo.items" :key="item.id" :gridstack_id="item.card" :x="item.x" :y="item.y" :width="item.width" :height="item.height" :card_options="item.card_options" :value="item.value"></DashboardItem>
            <div :class="`grid-guide ${edit_mode ? '' : 'hidden'}`">
                <template v-for="n in cols" :key="`col-${n}`">
                    <template v-for="m in rows" :key="`col-${n}-row-${m}`">
                        <div class="cell-add" :data-x="n" :data-y="m">&nbsp</div>
                    </template>
                </template>
            </div>
        </div>
    </div>
</template>

<style scoped>
</style>