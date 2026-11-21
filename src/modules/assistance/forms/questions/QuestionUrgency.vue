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

    //TODO Account for GLPI's CFG_GLPI['urgency_mask'] once it is exposed to users without Config READ right
    const options = [
        { value: 1, label: $t('assistance.urgency.very_low', 'Very low') },
        { value: 2, label: $t('assistance.urgency.low', 'Low') },
        { value: 3, label: $t('assistance.urgency.medium', 'Medium') },
        { value: 4, label: $t('assistance.urgency.high', 'High') },
        { value: 5, label: $t('assistance.urgency.very_high', 'Very high') },
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
