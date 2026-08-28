<script setup lang="ts">
    import { computed } from "vue";
    import { questionTypeComponentMap } from "@/modules/assistance/forms/useFormQuestion";
    import { useFormRendererContext } from "@/modules/assistance/forms/viewer/formRendererContext";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        question: RenderedQuestion
    }>();

    const context = useFormRendererContext();
    const component = computed(() => questionTypeComponentMap[props.question.type as keyof typeof questionTypeComponentMap]);
    // Hidden questions are kept in the DOM so their value is preserved, like the official renderer
    const visible = computed(() => context?.visibility.value.questions[props.question.id] !== false);
</script>

<template>
    <div v-if="component" v-show="visible" class="form-question flex flex-col gap-1" :data-question-id="question.id">
        <component :is="component" :question="question"></component>
        <div v-if="question.description" class="form-question-description text-sm opacity-75" v-dompurify-html="question.description"></div>
    </div>
</template>

<style scoped></style>
