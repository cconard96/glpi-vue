<script setup lang="ts">
    import ItemAnswerField from "@/modules/assistance/forms/questions/inputs/ItemAnswerField.vue";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    defineProps<{
        question: RenderedQuestion
    }>();
</script>

<template>
    <ItemAnswerField :question="question"></ItemAnswerField>
</template>

<style scoped></style>
