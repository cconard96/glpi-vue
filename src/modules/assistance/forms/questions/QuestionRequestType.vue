<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import FieldSelect from "@/common/forms/FieldSelect.vue";
    import { useI18n } from "vue-i18n";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    defineProps<{
        question: RenderedQuestion
    }>();

    const { t: $t } = useI18n();

    // Same values as Ticket::getTypes()
    const options = [
        { value: 1, label: $t('assistance.ticket_type.incident', 'Incident') },
        { value: 2, label: $t('assistance.ticket_type.request', 'Request') },
    ];
</script>

<template>
    <ValidatedFormField :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory" :as="FieldSelect" :fieldProps="{
        optionValue: 'value',
        optionLabel: 'label',
        options: options,
    }"></ValidatedFormField>
</template>

<style scoped></style>
