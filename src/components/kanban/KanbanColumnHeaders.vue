<script setup lang="ts">
    import { Button, Tag } from 'primevue';
    import { useDeviceCapabilities } from "@/composables/useDeviceCapabilities.ts";
    import type { KanbanColumns } from "@/components/kanban/kanban";
    import { computed, ref, watch } from "vue";

    const props = defineProps<{
        columns: KanbanColumns;
        items: Array<{[key: string]: any}>;
        columnField: 'state',
    }>();

    const { isMobileScreenSize } = useDeviceCapabilities();
    const mobileCurrentColumn = ref(null);
    const columnCounts = ref(new Map<string, number>());

    const columnsToDisplay = computed(() => {
        if (!isMobileScreenSize.value) {
            return props.columns;
        }
        const result = new Map<string, { label: string; color: string; collapsed: boolean }>();
        if (mobileCurrentColumn.value && props.columns.has(mobileCurrentColumn.value)) {
            result.set(mobileCurrentColumn.value, props.columns.get(mobileCurrentColumn.value)!);
        } else {
            // If no column is selected, show the first one
            const firstKey = props.columns.keys().next().value;
            if (firstKey !== undefined) {
                const c = props.columns.get(firstKey);
                result.set(firstKey, props.columns.get(firstKey)!);
                mobileCurrentColumn.value = firstKey;
            }
        }
        return result;
    });

    watch(() => props.items, (newItems) => {
        const counts = new Map<string, number>();
        newItems.forEach(item => {
            const columnKey = item[props.columnField]?.id ?? item[props.columnField];
            if (columnKey !== null) {
                counts.set(columnKey, (counts.get(columnKey) || 0) + 1);
            }
        });
        columnCounts.value = counts;
    }, { immediate: true });

    const widthClass = computed(() => {
        if (!isMobileScreenSize.value) {
            return 'w-sm max-w-sm';
        }
        return 'w-full max-w-full';
    });

    function collapseColumn(columnKey: string) {
        console.log(`Collapsing column ${columnKey}`);
        const col = props.columns.get(columnKey);
        if (col) {
            col.collapsed = true;
        }
    }

    function expandColumn(columnKey: string) {
        console.log(`Expanding column ${columnKey}`);
        const col = props.columns.get(columnKey);
        if (col) {
            col.collapsed = false;
        }
    }
</script>

<template>
    <div class="flex gap-2">
        <header v-for="[key, col] of columnsToDisplay" :key="key" :class="`flex justify-between flex-1 p-2 ${widthClass} bg-[#f5f7fb] dark:bg-[#121212] ${columns.get(key).collapsed ? 'w-12! max-w-12! px-0' : ''}`"
                :style="`--column-color: ${col.color}`">
            <div class="flex items-center gap-2">
                <slot name="columnHeader-collapseIcon" :columnKey="key" :columnLabel="col.label">
                    <Button size="small" severity="secondary" variant="text"
                            :aria-label="columns.get(key).collapsed ? $t('kanban.column.expand', 'Expand column') : $t('kanban.column.collapse', 'Collapse column')"
                            @click="columns.get(key).collapsed ? expandColumn(key) : collapseColumn(key)">
                        <i :class="`ti ti-caret-${columns.get(key).collapsed ? 'down' : 'right'}`"></i>
                    </Button>
                </slot>
                <slot name="columnHeader-label" :columnKey="key" :columnLabel="col.label">
                    <h2 :class="`text-heading-2 ${columns.get(key).collapsed ? 'sr-only' : ''}`">
                        <i class="ti ti-circle text-base" :class="col.color !== 'default' ? 'text-(--column-color)' : ''"></i>
                        {{ col.label }}
                    </h2>
                </slot>
                <slot name="columnHeader-counter">
                    <Tag :class="columns.get(key).collapsed ? 'sr-only' : ''" v-text="columnCounts.get(key) ?? 0" severity="secondary"></Tag>
                </slot>
            </div>
            <div class="flex items-center">
                <slot name="columnHeader-actions">
                    <Button v-if="!columns.get(key).collapsed" size="small" severity="secondary" variant="text" :aria-label="$t('kanban.column.actions.add', 'Add item')">
                        <i class="ti ti-plus"></i>
                    </Button>
                    <Button v-if="!columns.get(key).collapsed" size="small" severity="secondary" variant="text" :aria-label="$t('kanban.column.actions.more', 'More actions')">
                        <i class="ti ti-dots"></i>
                    </Button>
                </slot>
            </div>
        </header>
    </div>
</template>

<style scoped>

</style>