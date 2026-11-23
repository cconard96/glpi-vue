<script setup lang="ts">
    import { computed, inject, ref, useTemplateRef } from "vue";
    import { useI18n } from "vue-i18n";
    import { useConfirm } from "@cjdevstudios/bumblevue/useconfirm";
    import Select from "@cjdevstudios/bumblevue/select";
    import Button from "@cjdevstudios/bumblevue/button";
    import Menu from "@cjdevstudios/bumblevue/menu";
    import Popover from "@cjdevstudios/bumblevue/popover";
    import Drawer from "@cjdevstudios/bumblevue/drawer";
    import KanbanFilterInput from "@/common/kanban/KanbanFilterInput.vue";
    import KanbanColumnPicker from "@/common/kanban/KanbanColumnPicker.vue";
    import { useDeviceCapabilities } from "@/common/useDeviceCapabilities";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    const emit = defineEmits<{
        (e: 'select-board', board_id: number): void;
    }>();

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const confirm = useConfirm();
    const { isMobileScreenSize } = useDeviceCapabilities();
    const actions_menu_el = useTemplateRef('actions_menu');
    const columns_popover_el = useTemplateRef('columns_popover');
    const columns_drawer_visible = ref(false);
    const show_mobile_filter = ref(false);

    const board_options = computed(() => {
        const boards = kanban.boards.value;
        if (!boards.some(b => b.id === kanban.boardId.value)) {
            // Boards not loaded yet or the current one isn't in the list
            return [...boards, { id: kanban.boardId.value, name: kanban.boardId.value <= 0 ? $t('kanban.global.name', 'Global') : `#${kanban.boardId.value}` }];
        }
        return boards;
    });
    const current_board_name = computed(() => board_options.value.find(b => b.id === kanban.boardId.value)?.name ?? '');
    const hidden_count = computed(() => kanban.hiddenColumns.value.length);

    const actions = computed(() => [
        {
            key: 'reset_view',
            label: $t('kanban.toolbar.reset_view', 'Reset view'),
            icon: 'ti ti-restore',
            command: () => confirm.require({
                message: $t('kanban.toolbar.reset_view_confirm', 'Reset the column visibility, order and card positions of this Kanban to the default?'),
                header: $t('kanban.toolbar.reset_view', 'Reset view'),
                icon: 'ti ti-restore',
                rejectProps: { label: $t('common.cancel', 'Cancel'), severity: 'secondary', outlined: true },
                acceptProps: { label: $t('kanban.toolbar.reset', 'Reset'), severity: 'danger' },
                accept: () => kanban.resetView(),
            }),
        },
    ]);

    function toggleColumns(event: MouseEvent) {
        if (isMobileScreenSize.value) {
            columns_drawer_visible.value = true;
        } else {
            columns_popover_el.value?.toggle(event);
        }
    }

    defineExpose({ openColumnPicker: toggleColumns });
</script>

<template>
    <div class="flex flex-col md:flex-row gap-2 md:items-start p-2">
        <h1 class="sr-only">{{ $t('kanban.title', { name: current_board_name }, 'Kanban: {name}') }}</h1>
        <div class="flex gap-2 items-center">
            <label id="kanban-board-select-label" for="kanban-board-select" class="sr-only">{{ $t('kanban.toolbar.board', 'Kanban board') }}</label>
            <Select inputId="kanban-board-select" ariaLabelledby="kanban-board-select-label" class="grow md:w-64" :options="board_options" optionValue="id" optionLabel="name" filter
                    :modelValue="kanban.boardId.value" @update:modelValue="emit('select-board', $event)"></Select>
            <Button v-if="isMobileScreenSize" severity="secondary" variant="text" icon="ti ti-filter"
                    :aria-label="$t('kanban.filter.label', 'Filter items')" :aria-expanded="show_mobile_filter"
                    :badge="kanban.filterText.value ? '•' : undefined"
                    @click="show_mobile_filter = !show_mobile_filter"></Button>
        </div>
        <KanbanFilterInput v-if="!isMobileScreenSize || show_mobile_filter || kanban.filterText.value" class="grow"></KanbanFilterInput>
        <div class="flex gap-2 items-center" :class="isMobileScreenSize ? 'order-first justify-end' : ''">
            <Button v-if="kanban.rights.value.canModifyView || kanban.rights.value.canCreateColumn" severity="secondary" variant="outlined" icon="ti ti-columns"
                    :label="isMobileScreenSize ? undefined : $t('kanban.toolbar.columns', 'Columns')"
                    :aria-label="$t('kanban.toolbar.columns', 'Columns')" aria-haspopup="true"
                    :badge="hidden_count ? `${hidden_count}` : undefined" badgeSeverity="secondary"
                    :title="hidden_count ? $t('kanban.toolbar.hidden_columns', { count: hidden_count }, '{count} hidden columns') : undefined"
                    @click="toggleColumns"></Button>
            <Button severity="secondary" variant="text" icon="ti ti-refresh" :loading="kanban.isRefreshing.value"
                    :aria-label="$t('kanban.toolbar.refresh', 'Refresh')" :title="$t('kanban.toolbar.refresh', 'Refresh')"
                    @click="kanban.refresh()"></Button>
            <template v-if="kanban.rights.value.canModifyView">
                <Button severity="secondary" variant="text" icon="ti ti-dots-vertical" aria-haspopup="true"
                        :aria-label="$t('kanban.toolbar.other_actions', 'Other actions')" :title="$t('kanban.toolbar.other_actions', 'Other actions')"
                        @click="actions_menu_el?.toggle($event)"></Button>
                <Menu ref="actions_menu" :popup="true" :model="actions"></Menu>
            </template>
        </div>
        <Popover ref="columns_popover">
            <KanbanColumnPicker></KanbanColumnPicker>
        </Popover>
        <Drawer v-model:visible="columns_drawer_visible" position="bottom" :header="$t('kanban.toolbar.columns', 'Columns')" class="h-auto! max-h-[80vh]">
            <KanbanColumnPicker></KanbanColumnPicker>
        </Drawer>
    </div>
</template>
