<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import InputNumber from "@cjdevstudios/bumblevue/inputnumber";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    defineProps<{
        question: RenderedQuestion
    }>();
</script>

<template>
    <!-- GLPI uses step="any" without any min/max -->
    <ValidatedFormField :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory" :as="InputNumber"
                        :fieldProps="{ mode: 'decimal', useGrouping: false, maxFractionDigits: 10 }"></ValidatedFormField>
</template>

<style scoped></style>
