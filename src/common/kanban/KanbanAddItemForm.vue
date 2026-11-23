<script setup lang="ts">
    import { computed, inject, nextTick, onMounted, ref, useTemplateRef } from "vue";
    import { useI18n } from "vue-i18n";
    import InputText from "@cjdevstudios/bumblevue/inputtext";
    import Textarea from "@cjdevstudios/bumblevue/textarea";
    import Select from "@cjdevstudios/bumblevue/select";
    import Button from "@cjdevstudios/bumblevue/button";
    import type { KanbanCreatableItemtype } from "@/common/kanban/kanban";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    const props = defineProps<{
        columnId: number;
        definition: KanbanCreatableItemtype;
        bulk?: boolean;
    }>();
    const emit = defineEmits<{
        (e: 'close'): void;
    }>();

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const form_el = useTemplateRef('form');
    const values = ref<Record<string, any>>({});
    const bulk_text = ref('');
    const saving = ref(false);

    const fields = computed(() => {
        // In bulk mode only the board/project picker is kept (other values come from each line)
        return props.bulk ? props.definition.fields.filter(f => f.type === 'board') : props.definition.fields;
    });
    const board_options = computed(() => kanban.boards.value.filter(b => b.id > 0));
    const is_valid = computed(() => {
        const required_ok = fields.value.filter(f => f.required).every(f => `${values.value[f.name] ?? ''}`.trim() !== '');
        return required_ok && (!props.bulk || bulk_text.value.trim() !== '');
    });
    const field_id = (name: string) => `kanban-add-${props.columnId}-${props.definition.itemtype}-${name}`;

    function focusFirstField() {
        nextTick(() => {
            form_el.value?.querySelector<HTMLElement>('input, textarea, [tabindex="0"]')?.focus();
        });
    }

    onMounted(() => {
        form_el.value?.scrollIntoView({ block: 'nearest' });
        focusFirstField();
    });

    async function submit() {
        if (!is_valid.value || saving.value) {
            return;
        }
        saving.value = true;
        try {
            const input = { ...values.value, column: props.columnId };
            if (props.bulk) {
                const added = await kanban.bulkAddItems(props.definition.itemtype, bulk_text.value.split(/\r?\n/), input);
                if (added > 0) {
                    emit('close');
                }
            } else if (await kanban.addItem(props.definition.itemtype, input)) {
                // Keep the form open for adding more items, but keep the selected project
                const kept: Record<string, any> = {};
                fields.value.filter(f => f.type === 'board').forEach(f => kept[f.name] = values.value[f.name]);
                values.value = kept;
                focusFirstField();
            }
        } finally {
            saving.value = false;
        }
    }
</script>

<template>
    <form ref="form" class="flex flex-col gap-2 p-2 rounded border border-primary bg-surface-0 dark:bg-surface-900"
          @submit.prevent="submit" @keydown.esc.stop="emit('close')">
        <div class="flex items-center gap-2 font-semibold">
            <i :class="definition.icon" aria-hidden="true"></i>
            <span class="grow">
                {{ bulk ? $t('kanban.add.bulk_title', { type: definition.label }, 'Bulk add {type}') : $t('kanban.add.title', { type: definition.label }, 'Add {type}') }}
            </span>
            <Button type="button" size="small" severity="secondary" variant="text" icon="ti ti-x"
                    :aria-label="$t('common.close', 'Close')" @click="emit('close')"></Button>
        </div>
        <template v-for="field in fields" :key="field.name">
            <label :id="`${field_id(field.name)}-label`" :for="field_id(field.name)" class="sr-only">{{ field.label }}</label>
            <Select v-if="field.type === 'board'" v-model="values[field.name]" :inputId="field_id(field.name)" :ariaLabelledby="`${field_id(field.name)}-label`" :options="board_options"
                    optionLabel="name" optionValue="id" filter :placeholder="field.label" fluid></Select>
            <Textarea v-else-if="field.type === 'textarea'" v-model="values[field.name]" :id="field_id(field.name)"
                      :placeholder="field.label" rows="3" autoResize fluid></Textarea>
            <InputText v-else v-model="values[field.name]" :id="field_id(field.name)" :placeholder="field.label"
                       :required="field.required" fluid></InputText>
        </template>
        <template v-if="bulk">
            <label :for="field_id('bulk')" class="sr-only">{{ $t('kanban.add.bulk_list', 'One item per line') }}</label>
            <Textarea v-model="bulk_text" :id="field_id('bulk')" :placeholder="$t('kanban.add.bulk_list', 'One item per line')"
                      rows="5" autoResize fluid></Textarea>
        </template>
        <Button type="submit" size="small" :label="$t('common.add', 'Add')" icon="ti ti-plus" :loading="saving" :disabled="!is_valid"></Button>
    </form>
</template>
