<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import InputText from "@cjdevstudios/bumblevue/inputtext";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    defineProps<{
        question: RenderedQuestion
    }>();
</script>

<template>
    <ValidatedFormField :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory" :as="InputText"
                        :fieldProps="{ type: 'email', autocomplete: 'email' }"></ValidatedFormField>
</template>

<style scoped></style>
