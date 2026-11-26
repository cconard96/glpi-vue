<script setup lang="ts">
    import { inject, useTemplateRef, watch } from "vue";
    import Sortable from "sortablejs";
    import KanbanColumn from "@/common/kanban/KanbanColumn.vue";
    import type { KanbanCard } from "@/common/kanban/kanban";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    const emit = defineEmits<{
        (e: 'open-card', card: KanbanCard): void;
    }>();

    const kanban = inject('kanban') as KanbanInstance;
    const board_el = useTemplateRef<HTMLElement>('board');

    // Column reordering
    watch([board_el, () => kanban.rights.value.canModifyView], ([el, can_modify], _, onCleanup) => {
        if (!el || !can_modify) {
            return;
        }
        let next_sibling: Node | null = null;
        const sortable = new Sortable(el, {
            group: 'kanban-columns',
            animation: 150,
            direction: 'horizontal',
            draggable: '.kanban-column:not(.kanban-protected)',
            handle: '.kanban-column-drag-handle',
            filter: 'button',
            preventOnFilter: false,
            onStart: (evt) => {
                kanban.isDragging.value = true;
                next_sibling = evt.item.nextSibling;
            },
            onEnd: (evt) => {
                kanban.isDragging.value = false;
                const item = evt.item as HTMLElement;
                const index = Array.from(el.querySelectorAll<HTMLElement>(':scope > .kanban-column')).indexOf(item);
                el.insertBefore(item, next_sibling);
                next_sibling = null;
                if (evt.oldIndex !== evt.newIndex) {
                    void kanban.moveColumn(Number(item.dataset.columnId), index);
                }
            },
        });
        onCleanup(() => sortable.destroy());
    }, { immediate: true });
</script>

<template>
    <div ref="board" class="flex gap-2 h-full overflow-x-auto overflow-y-hidden p-2 items-start">
        <KanbanColumn v-for="column in kanban.orderedColumns.value" :key="column.id" :column="column" class="h-full"
                      @open-card="emit('open-card', $event)">
            <template v-for="(_, name) in $slots" #[name]="slotData">
                <slot :name="name" v-bind="slotData || {}" />
            </template>
        </KanbanColumn>
    </div>
</template>
