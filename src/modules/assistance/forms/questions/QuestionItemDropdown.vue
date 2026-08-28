<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import { TreeSelect } from "@cjdevstudios/bumblevue";
    import ItemAnswerField from "@/modules/assistance/forms/questions/inputs/ItemAnswerField.vue";
    import { getItemQuestionOptions } from "@/modules/assistance/forms/useFormQuestion";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    withDefaults(defineProps<{
        question: RenderedQuestion,
        editMode?: boolean
    }>(), {
        editMode: false
    });
</script>

<template>
    <ItemAnswerField v-if="!editMode" :question="question"></ItemAnswerField>
    <ValidatedFormField v-else :name="questionFieldName(question)" :label="question.name" :as="TreeSelect" :fieldProps="{
        options: getItemQuestionOptions(),
    }"></ValidatedFormField>
</template>

<style scoped></style>
