<script setup lang="ts">
    /**
     * Item selection used by the "Item" and "Item dropdown" questions.
     * The form field holds the selected item ID; the itemtype comes from the question configuration.
     */
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import FieldSelect from "@/common/forms/FieldSelect.vue";
    import Message from "@cjdevstudios/bumblevue/message";
    import { computed, ref, watch } from "vue";
    import { useSessionStore } from "@/common/useSessionStore";
    import { questionFieldName, useFormRendererContext } from "@/modules/assistance/forms/viewer/formRendererContext";
    import { getItemDisplayName, getItemQuestionDropdownConfig, type ItemQuestionDropdownConfig } from "@/modules/assistance/forms/itemQuestionRestrictions";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        question: RenderedQuestion
    }>();

    const session = useSessionStore();
    const context = useFormRendererContext();

    const selectedItemId = computed(() => {
        const answer = context?.answers.value[props.question.id] as { items_id?: unknown } | undefined;
        const items_id = Number(answer?.items_id ?? 0);
        return items_id > 0 ? items_id : null;
    });

    const config = ref<ItemQuestionDropdownConfig | null>(null);
    /** Options known before the dropdown is opened, so the default value is displayed with its name rather than its ID */
    const initialOptions = ref<Array<{ id: number, name: string }>>([]);
    getItemQuestionDropdownConfig(props.question, session.getActiveProfile?.interface === 'helpdesk').then(async (result) => {
        const items_id = selectedItemId.value;
        if (result.schema_name && items_id !== null) {
            const name = await getItemDisplayName(result.schema_name, items_id, false);
            if (name !== null) {
                initialOptions.value = [{ id: items_id, name }];
            }
        }
        config.value = result;
    });

    // Register the name of the selected item so conditions based on the item name can be evaluated
    watch([selectedItemId, config], ([items_id, current_config]) => {
        if (!context || items_id === null || !current_config?.schema_name) {
            return;
        }
        getItemDisplayName(current_config.schema_name, items_id, current_config.is_tree).then((name) => {
            if (name !== null) {
                context.registerLabels(props.question.id, [[String(items_id), name]]);
            }
        });
    }, { immediate: true });
</script>

<template>
    <ValidatedFormField v-if="config?.schema_name" :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory"
                        :as="FieldSelect" :fieldProps="{
                            type: config.schema_name,
                            condition: config.condition,
                            treeMode: config.is_tree,
                            options: initialOptions,
                        }"></ValidatedFormField>
    <Message v-else-if="config" severity="warn" size="small">
        {{ question.name }}: {{ $t('form.questions.item.unsupported_itemtype', { itemtype: question.extra_data.itemtype ?? '' }, 'Items of type {itemtype} cannot be selected') }}
    </Message>
</template>
