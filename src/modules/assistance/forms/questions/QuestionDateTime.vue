<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import DateTimeAnswerInput from "@/modules/assistance/forms/questions/inputs/DateTimeAnswerInput.vue";
    import { computed } from "vue";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import { isDateEnabled, isTimeEnabled } from "@/modules/assistance/forms/viewer/useFormRenderer";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        question: RenderedQuestion
    }>();

    const fieldProps = computed(() => ({
        isDateEnabled: isDateEnabled(props.question),
        isTimeEnabled: isTimeEnabled(props.question),
    }));
</script>

<template>
    <ValidatedFormField :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory" :as="DateTimeAnswerInput"
                        :fieldProps="fieldProps"></ValidatedFormField>
</template>

<style scoped></style>
