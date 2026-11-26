<script setup lang="ts">
    import { computed, inject, ref, useTemplateRef, watch } from "vue";
    import { useI18n } from "vue-i18n";
    import Sortable from "sortablejs";
    import Button from "@cjdevstudios/bumblevue/button";
    import Menu from "@cjdevstudios/bumblevue/menu";
    import Badge from "@cjdevstudios/bumblevue/badge";
    import KanbanCard from "@/common/kanban/KanbanCard.vue";
    import KanbanAddItemForm from "@/common/kanban/KanbanAddItemForm.vue";
    import type { KanbanCard as KanbanCardData, KanbanColumnDef, KanbanCreatableItemtype } from "@/common/kanban/kanban";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    const props = withDefaults(defineProps<{
        column: KanbanColumnDef;
        /** Mobile mode. Full width, no folding or dragging. */
        mobile?: boolean;
    }>(), {
        mobile: false,
    });
    const emit = defineEmits<{
        (e: 'open-card', card: KanbanCardData): void;
    }>();

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const cards_container_el = useTemplateRef<HTMLElement>('cards_container');
    const folded_strip_el = useTemplateRef<HTMLElement>('folded_strip');
    const add_menu_el = useTemplateRef('add_menu');
    const more_menu_el = useTemplateRef('more_menu');
    const add_form = ref<{ definition: KanbanCreatableItemtype; bulk: boolean } | null>(null);

    const folded = computed(() => !props.mobile && kanban.isFolded(props.column.id));
    const cards = computed(() => kanban.cardsByColumn.value.get(props.column.id) ?? []);
    const count = computed(() => kanban.getColumnCount(props.column.id));
    const can_modify_view = computed(() => kanban.rights.value.canModifyView);
    const can_drag_column = computed(() => !props.mobile && can_modify_view.value && !props.column.protected && props.column.id > 0);
    const creatable = computed(() => kanban.canCreateInColumn(props.column.id) ? kanban.adapter.creatableItemtypes(kanban.boardId.value) : []);
    const header_id = computed(() => `kanban-column-${props.column.id}-label`);

    const add_menu_items = computed(() => creatable.value.map(def => ({
        key: def.itemtype,
        label: def.label,
        icon: def.icon,
        command: () => add_form.value = { definition: def, bulk: false },
    })));
    const more_menu_items = computed(() => {
        const items: Array<Record<string, any>> = [];
        const bulk_types = creatable.value.filter(def => def.allowBulk);
        if (bulk_types.length) {
            items.push({
                label: $t('kanban.column.bulk_add', 'Bulk add'),
                items: bulk_types.map(def => ({
                    key: `bulk-${def.itemtype}`,
                    label: def.label,
                    icon: def.icon,
                    command: () => add_form.value = { definition: def, bulk: true },
                })),
            });
        }
        if (can_modify_view.value && !props.column.protected) {
            items.push({
                key: 'hide',
                label: $t('kanban.column.hide', 'Hide column'),
                icon: 'ti ti-eye-off',
                command: () => kanban.setColumnVisible(props.column.id, false),
            });
        }
        return items;
    });

    // region Drag and drop
    function getCardIndex(container: HTMLElement, item: HTMLElement): number {
        return Array.from(container.querySelectorAll<HTMLElement>(':scope > .kanban-card')).indexOf(item);
    }

    let drag_next_sibling: Node | null = null;
    function createCardSortable(el: HTMLElement, put_only: boolean): Sortable {
        return new Sortable(el, {
            group: { name: 'kanban-cards', pull: !put_only, put: true },
            sort: !put_only,
            animation: 150,
            draggable: '.kanban-card:not(.readonly)',
            filter: 'button, a, input, textarea, [role="button"]',
            preventOnFilter: false,
            delay: 150,
            delayOnTouchOnly: true,
            ghostClass: 'kanban-card-ghost',
            onStart: (evt) => {
                kanban.isDragging.value = true;
                drag_next_sibling = evt.item.nextSibling;
            },
            onMove: (evt) => {
                const card = kanban.findCard(evt.dragged.dataset.cardKey ?? '');
                const to_column = Number((evt.to as HTMLElement).dataset.columnId);
                return card !== undefined && kanban.canDropCard(card, to_column);
            },
            onEnd: (evt) => {
                kanban.isDragging.value = false;
                const item = evt.item as HTMLElement;
                const to = evt.to as HTMLElement;
                const key = item.dataset.cardKey ?? '';
                const to_column = Number(to.dataset.columnId);
                const index = to.dataset.foldedColumn ? Number.MAX_SAFE_INTEGER : getCardIndex(to, item);
                const moved = evt.from !== evt.to || evt.oldIndex !== evt.newIndex;
                // Revert the DOM change made by Sortable and let Vue render the new state
                evt.from.insertBefore(item, drag_next_sibling);
                drag_next_sibling = null;
                if (moved) {
                    void kanban.moveCard(key, to_column, index);
                }
            },
        });
    }

    watch([cards_container_el, () => props.mobile], ([el, mobile], _, onCleanup) => {
        if (!el || mobile) {
            return;
        }
        const sortable = createCardSortable(el, false);
        onCleanup(() => sortable.destroy());
    }, { immediate: true });

    watch(folded_strip_el, (el, _, onCleanup) => {
        if (!el) {
            return;
        }
        const sortable = createCardSortable(el, true);
        onCleanup(() => sortable.destroy());
    }, { immediate: true });
    // endregion
</script>

<template>
    <section class="kanban-column flex flex-col shrink-0 rounded bg-surface-100 dark:bg-surface-950 max-h-full"
             :class="{
                 'w-12': folded,
                 'w-80': !folded && !mobile,
                 'w-full': mobile,
                 'kanban-protected': column.protected || column.id <= 0,
             }"
             :style="column.color ? `--column-color: ${column.color}` : undefined"
             :data-column-id="column.id" :aria-labelledby="header_id">
        <!-- Folded -->
        <div v-if="folded" ref="folded_strip" :data-column-id="column.id" data-folded-column="1"
             class="flex flex-col items-center gap-2 py-2 h-full min-h-48 border-t-4 rounded"
             :class="column.color ? 'border-t-(--column-color)' : 'border-t-surface-300 dark:border-t-surface-600'">
            <Button size="small" severity="secondary" variant="text" icon="ti ti-chevron-right"
                    :aria-label="$t('kanban.column.expand', { name: column.label }, 'Expand column {name}')"
                    :aria-expanded="false" @click="kanban.toggleFold(column.id)"></Button>
            <Badge :value="count" severity="secondary"></Badge>
            <h2 :id="header_id" class="[writing-mode:vertical-rl] font-semibold whitespace-nowrap cursor-pointer"
                @click="kanban.toggleFold(column.id)">
                {{ column.label }}
            </h2>
        </div>

        <!-- Expanded -->
        <template v-else>
            <header class="kanban-column-header flex items-center gap-2 p-2 border-t-4 rounded-t"
                    :class="[
                        column.color ? 'border-t-(--column-color)' : 'border-t-surface-300 dark:border-t-surface-600',
                        can_drag_column ? 'kanban-column-drag-handle cursor-move' : '',
                    ]">
                <Button v-if="!mobile" size="small" severity="secondary" variant="text" icon="ti ti-chevron-down"
                        :aria-label="$t('kanban.column.collapse', { name: column.label }, 'Collapse column {name}')"
                        :aria-expanded="true" @click="kanban.toggleFold(column.id)"></Button>
                <h2 :id="header_id" class="grow font-semibold truncate" :title="column.label">{{ column.label }}</h2>
                <Badge :value="count" severity="secondary" :aria-label="$t('kanban.column.count', { count }, '{count} items')"></Badge>
                <template v-if="add_menu_items.length">
                    <Button size="small" severity="secondary" variant="text" icon="ti ti-plus" aria-haspopup="true"
                            :aria-label="$t('kanban.column.add', 'Add item')" @click="add_menu_el?.toggle($event)"></Button>
                    <Menu ref="add_menu" :model="add_menu_items" popup></Menu>
                </template>
                <template v-if="more_menu_items.length">
                    <Button size="small" severity="secondary" variant="text" icon="ti ti-dots" aria-haspopup="true"
                            :aria-label="$t('kanban.column.more', 'More actions')" @click="more_menu_el?.toggle($event)"></Button>
                    <Menu ref="more_menu" :model="more_menu_items" popup></Menu>
                </template>
            </header>
            <div class="flex flex-col gap-2 p-2 pt-0 overflow-y-auto grow min-h-0">
                <p v-if="cards.length === 0 && !add_form" class="text-sm text-muted-color text-center py-2" aria-hidden="true">
                    {{ column.dropOnly ? $t('kanban.column.drop_only', 'Drop items here') : $t('kanban.column.empty', 'No items') }}
                </p>
                <div ref="cards_container" :data-column-id="column.id" class="flex flex-col gap-2 min-h-16" role="list">
                    <KanbanCard v-for="card in cards" :key="card.key" :card="card" role="listitem" @open="emit('open-card', $event)">
                        <template v-for="(_, name) in $slots" #[name]="slotData">
                            <slot :name="name" v-bind="slotData || {}" />
                        </template>
                    </KanbanCard>
                </div>
                <KanbanAddItemForm v-if="add_form" :key="`${add_form.definition.itemtype}-${add_form.bulk}`" :columnId="column.id"
                                   :definition="add_form.definition" :bulk="add_form.bulk" @close="add_form = null"></KanbanAddItemForm>
            </div>
        </template>
    </section>
</template>

<style scoped>
    :deep(.kanban-card-ghost) {
        opacity: 0.4;
    }
</style>
