<script setup lang="ts">
    import { computed, inject, nextTick, ref, useTemplateRef, watch } from "vue";
    import { useI18n } from "vue-i18n";
    import { useSwipe } from "@vueuse/core";
    import Message from "@cjdevstudios/bumblevue/message";
    import Button from "@cjdevstudios/bumblevue/button";
    import ProgressSpinner from "@cjdevstudios/bumblevue/progressspinner";
    import Badge from "@cjdevstudios/bumblevue/badge";
    import KanbanToolbar from "@/common/kanban/KanbanToolbar.vue";
    import KanbanBoard from "@/common/kanban/KanbanBoard.vue";
    import KanbanColumn from "@/common/kanban/KanbanColumn.vue";
    import KanbanCardDrawer from "@/common/kanban/KanbanCardDrawer.vue";
    import { useDeviceCapabilities } from "@/common/useDeviceCapabilities";
    import type { KanbanCard } from "@/common/kanban/kanban";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    const emit = defineEmits<{
        (e: 'select-board', board_id: number): void;
    }>();

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const { isMobileScreenSize } = useDeviceCapabilities();
    const toolbar_el = useTemplateRef('toolbar');
    const mobile_body_el = useTemplateRef<HTMLElement>('mobile_body');
    const column_tabs_el = useTemplateRef<HTMLElement>('column_tabs');

    const drawer_card_key = ref<string | null>(null);
    const drawer_visible = ref(false);

    function openCard(card: KanbanCard) {
        drawer_card_key.value = card.key;
        drawer_visible.value = true;
    }

    // region Mobile column switching
    const mobile_index = computed(() => kanban.orderedColumns.value.findIndex(c => c.id === kanban.mobileColumn.value?.id));

    function selectMobileColumn(index: number) {
        const column = kanban.orderedColumns.value[index];
        if (column) {
            kanban.mobileColumnId.value = column.id;
        }
    }

    function onTabKeydown(e: KeyboardEvent) {
        const count = kanban.orderedColumns.value.length;
        let index = mobile_index.value;
        if (e.key === 'ArrowRight') {
            index = (index + 1) % count;
        } else if (e.key === 'ArrowLeft') {
            index = (index - 1 + count) % count;
        } else if (e.key === 'Home') {
            index = 0;
        } else if (e.key === 'End') {
            index = count - 1;
        } else {
            return;
        }
        e.preventDefault();
        selectMobileColumn(index);
        nextTick(() => column_tabs_el.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.focus());
    }

    // Keep the selected tab visible
    watch(() => kanban.mobileColumn.value?.id, () => {
        nextTick(() => column_tabs_el.value?.querySelector<HTMLElement>('[aria-selected="true"]')?.scrollIntoView({ block: 'nearest', inline: 'center' }));
    });

    const { direction } = useSwipe(mobile_body_el, {
        threshold: 80,
        onSwipeEnd: () => {
            if (kanban.isDragging.value) {
                return;
            }
            // RTL layouts swap the meaning of left and right
            const rtl = document.documentElement.dir === 'rtl';
            if (direction.value === 'left') {
                selectMobileColumn(mobile_index.value + (rtl ? -1 : 1));
            } else if (direction.value === 'right') {
                selectMobileColumn(mobile_index.value + (rtl ? 1 : -1));
            }
        },
    });
    // endregion
</script>

<template>
    <div class="flex flex-col h-full min-h-0 bg-(--p-content-background)">
        <KanbanToolbar ref="toolbar" class="shrink-0" @select-board="emit('select-board', $event)"></KanbanToolbar>

        <div v-if="kanban.isLoading.value" class="flex justify-center items-center grow" role="status">
            <ProgressSpinner :aria-label="$t('common.loading', 'Loading')" />
        </div>
        <Message v-else-if="kanban.error.value" severity="error" icon="ti ti-exclamation-circle" class="m-2">
            <div class="flex items-center gap-2">
                <span class="grow">{{ $t('kanban.error.loading', 'An error occurred while loading the items in this Kanban.') }}</span>
                <Button size="small" severity="secondary" :label="$t('common.retry', 'Retry')" @click="kanban.load()"></Button>
            </div>
        </Message>
        <div v-else-if="kanban.orderedColumns.value.length === 0" class="flex flex-col items-center justify-center gap-2 grow p-4 text-center">
            <p>{{ $t('kanban.empty', 'There are no columns added to this Kanban yet.') }}</p>
            <Button v-if="kanban.rights.value.canModifyView" :label="$t('kanban.toolbar.columns', 'Columns')" icon="ti ti-columns"
                    @click="toolbar_el?.openColumnPicker($event)"></Button>
        </div>

        <!-- Mobile: one column at a time -->
        <div v-else-if="isMobileScreenSize" class="flex flex-col grow min-h-0">
            <div ref="column_tabs" role="tablist" :aria-label="$t('kanban.columns.list', 'Columns')"
                 class="flex gap-2 overflow-x-auto px-2 pb-2 shrink-0" @keydown="onTabKeydown">
                <button v-for="(column, index) in kanban.orderedColumns.value" :key="column.id" type="button" role="tab"
                        :id="`kanban-tab-${column.id}`" :aria-selected="index === mobile_index" :aria-controls="`kanban-tabpanel`"
                        :tabindex="index === mobile_index ? 0 : -1"
                        class="flex items-center gap-2 shrink-0 rounded-full border px-3 py-1 text-sm"
                        :class="index === mobile_index
                            ? 'border-primary bg-highlight font-semibold'
                            : 'border-surface-200 dark:border-surface-700'"
                        @click="selectMobileColumn(index)">
                    <span class="inline-block size-2 rounded-full bg-surface-400" :style="column.color ? `background-color: ${column.color}` : undefined" aria-hidden="true"></span>
                    {{ column.label }}
                    <Badge :value="kanban.getColumnCount(column.id)" severity="secondary" size="small"></Badge>
                </button>
            </div>
            <div ref="mobile_body" id="kanban-tabpanel" role="tabpanel" :aria-labelledby="kanban.mobileColumn.value ? `kanban-tab-${kanban.mobileColumn.value.id}` : undefined"
                 class="grow min-h-0 px-2 pb-2 flex">
                <KanbanColumn v-if="kanban.mobileColumn.value" :key="kanban.mobileColumn.value.id" :column="kanban.mobileColumn.value" mobile
                              class="h-full" @open-card="openCard">
                    <template v-for="(_, name) in $slots" #[name]="slotData">
                        <slot :name="name" v-bind="slotData || {}" />
                    </template>
                </KanbanColumn>
            </div>
        </div>

        <!-- Desktop -->
        <KanbanBoard v-else class="grow min-h-0" @open-card="openCard">
            <template v-for="(_, name) in $slots" #[name]="slotData">
                <slot :name="name" v-bind="slotData || {}" />
            </template>
        </KanbanBoard>

        <KanbanCardDrawer v-model:visible="drawer_visible" :cardKey="drawer_card_key"></KanbanCardDrawer>
    </div>
</template>
