<script setup lang="ts">
    import { useApi } from '@/composables/useApi';
    import {computed, onMounted, ref, useTemplateRef} from "vue";
    import { Message } from 'primevue';
    import { GridStack } from 'gridstack';
    import 'gridstack/dist/gridstack.min.css';
    import DashboardItem from "@/components/dashboard/DashboardItem.vue";
    import { useSessionStore } from "@/composables/useSessionStore";

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
    });

    const CELL_MARGIN = 3;
    const { doGraphQLRequest } = useApi();
    const { getUserID } = useSessionStore();
    const items = ref([]);
    const filters = ref({});
    /** Cell height calculated as the px value of the cell width which is calculated by % */
    const cell_height = computed(() => {
        const cell_width_percent = 100 / props.cols;
        return `calc(${cell_width_percent}% - ${CELL_MARGIN}px)`;
    });
    const grid_el = useTemplateRef('ref_dashboardgrid');
    const edit_mode = ref(false);

    async function refreshData() {
        return doGraphQLRequest(`
            query {
                Dashboard(filter: "key==${props.current}", limit: 1) {
                    id key name context
                    user { id }
                    filters {
                        id
                        user { id }
                        filter
                    }
                    items {
                        id card x y width height card_options
                    }
                }
            }
        `, {}, 'cache-first').then((response) => {
            items.value = [];
            response.data.Dashboard[0].items.forEach((item) => {
                const dashboard_item = {
                    id: item.id,
                    card: item.card,
                    x: item.x,
                    y: item.y,
                    width: item.width,
                    height: item.height,
                    card_options: item.card_options ? JSON.parse(item.card_options) : {},
                };
                items.value.push(dashboard_item);
            });

            // set filters to the filter matching the current user ID or an empty object
            const user_filter = response.data.Dashboard[0].filters.find((f) => f.user.id === getUserID);
            try {
                filters.value = user_filter ? JSON.parse(user_filter.filter) : {};
            } catch {
                filters.value = {};
            }
        });
    }

    await refreshData();

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
</script>

<template>
    <div ref="ref_dashboardgrid">
        <Message severity="warn">Card rendering not implemented. Only skeleton loaders will be shown.</Message>
        <div :class="`grid-stack grid-stack-${cols} w-full`" :gs-column="cols" :gs-min-row="rows">
            <DashboardItem v-for="item in items" :key="item.id" :gridstack_id="item.card" :x="item.x" :y="item.y" :width="item.width" :height="item.height" :card_options="item.card_options"></DashboardItem>
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