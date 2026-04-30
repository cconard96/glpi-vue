<script setup lang="ts">
    import KanbanColumn from "@/components/kanban/KanbanColumn.vue";
    import type { KanbanColumns } from "@/components/kanban/kanban";
    import { reactive, ref, watch } from "vue";

    const props = defineProps<{
        columns: KanbanColumns,
        items: unknown,
        columnField: string,
    }>();

    const itemsByColumn = ref<Map<string, unknown[]>>(new Map());

    watch(() => props.items, (newItems) => {
        const map = new Map<string, unknown[]>();
        (newItems as Array<{ [key: string]: any }>).forEach(item => {
            const columnKey = item[props.columnField]?.id ?? item[props.columnField];
            if (columnKey !== null) {
                if (!map.has(columnKey)) {
                    map.set(columnKey, []);
                }
                map.get(columnKey)?.push(item);
            }
        });
        itemsByColumn.value = map;
    }, { immediate: true, deep: true });

    // function getItemsForColumn(columnKey: string): unknown[] {
    //     const r = (props.items as Array<{ [key: string]: any }>).filter(item => item[props.columnField]?.id == columnKey);
    //     console.log(`Items for column ${columnKey}:`, r);
    //     return r;
    // }
</script>

<template>
    <div class="flex gap-2">
        <KanbanColumn v-for="[index, column] of columns" :columnKey="index" :column="column" :items="itemsByColumn.get(index) || []">
            <template v-for="(_, name) in $slots" #[name]="slotData">
                <slot :name="name" v-bind="slotData || {}" />
            </template>
        </KanbanColumn>
    </div>
</template>

<style scoped>

</style>