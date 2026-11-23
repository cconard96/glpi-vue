<script setup lang="ts">
    import { computed, inject, ref, useId } from "vue";
    import { useI18n } from "vue-i18n";
    import InputText from "@cjdevstudios/bumblevue/inputtext";
    import Checkbox from "@cjdevstudios/bumblevue/checkbox";
    import Button from "@cjdevstudios/bumblevue/button";
    import ColorPicker from "@cjdevstudios/bumblevue/colorpicker";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const id = useId();
    const search = ref('');
    const new_column_name = ref('');
    const new_column_color = ref('dedede');
    const creating = ref(false);

    const columns = computed(() => {
        const term = search.value.trim().toLowerCase();
        return [...kanban.columnDefs.value]
            .filter(c => term === '' || c.label.toLowerCase().includes(term))
            .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: 'base' }));
    });

    function isVisible(column_id: number) {
        return kanban.isColumnVisible(column_id);
    }

    async function createColumn() {
        const name = new_column_name.value.trim();
        if (name === '') {
            return;
        }
        creating.value = true;
        try {
            if (await kanban.createColumn(name, { color: `#${new_column_color.value.replace(/^#/, '')}` })) {
                new_column_name.value = '';
            }
        } finally {
            creating.value = false;
        }
    }
</script>

<template>
    <div class="flex flex-col gap-2 w-full sm:w-72">
        <label :for="`${id}-search`" class="sr-only">{{ $t('kanban.columns.search', 'Search columns') }}</label>
        <InputText :id="`${id}-search`" v-model="search" :placeholder="$t('kanban.columns.search', 'Search columns')" fluid size="small"></InputText>
        <ul class="flex flex-col gap-1 max-h-80 overflow-y-auto" :aria-label="$t('kanban.columns.list', 'Columns')">
            <li v-for="column in columns" :key="column.id" class="flex items-center gap-2 px-1">
                <Checkbox :inputId="`${id}-col-${column.id}`" binary :modelValue="isVisible(column.id)" :disabled="column.protected"
                          @update:modelValue="kanban.setColumnVisible(column.id, $event)"></Checkbox>
                <span class="inline-block size-3 rounded-full border border-surface-300 dark:border-surface-600 shrink-0"
                      :style="column.color ? `background-color: ${column.color}` : undefined" aria-hidden="true"></span>
                <label :for="`${id}-col-${column.id}`" class="grow truncate">{{ column.label }}</label>
            </li>
            <li v-if="columns.length === 0" class="text-sm text-muted-color px-1">{{ $t('kanban.columns.none', 'No columns found') }}</li>
        </ul>
        <form v-if="kanban.rights.value.canCreateColumn && kanban.adapter.createColumn" class="flex flex-col gap-2 border-t border-surface-200 dark:border-surface-700 pt-2"
              @submit.prevent="createColumn">
            <span class="font-semibold text-sm">{{ $t('kanban.columns.create', 'Create status') }}</span>
            <div class="flex gap-2 items-center">
                <label :for="`${id}-new-name`" class="sr-only">{{ $t('common.name', 'Name') }}</label>
                <InputText :id="`${id}-new-name`" v-model="new_column_name" :placeholder="$t('common.name', 'Name')" size="small" class="grow"></InputText>
                <ColorPicker v-model="new_column_color" :aria-label="$t('common.color', 'Color')"></ColorPicker>
                <Button type="submit" size="small" icon="ti ti-plus" :loading="creating" :disabled="new_column_name.trim() === ''"
                        :aria-label="$t('kanban.columns.create', 'Create status')"></Button>
            </div>
        </form>
    </div>
</template>
