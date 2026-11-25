<script setup lang="ts">
    import QuestionActors from "@/modules/assistance/forms/questions/QuestionActors.vue";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    defineProps<{
        question: RenderedQuestion
    }>();
</script>

<template>
    <QuestionActors :question="question" role="assigned"></QuestionActors>
</template>

<style scoped></style>
