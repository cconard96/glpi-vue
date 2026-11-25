<script setup lang="ts">
    import { computed } from "vue";
    import Fluid from "@cjdevstudios/bumblevue/fluid";
    import FormQuestion from "@/modules/assistance/forms/viewer/FormQuestion.vue";
    import { getQuestionRows } from "@/modules/assistance/forms/viewer/useFormRenderer";
    import type { RenderedSection } from "@/modules/assistance/forms/types";

    const props = withDefaults(defineProps<{
        section: RenderedSection,
        /** Whether to display the section title. The title of the only section of a form is not displayed. */
        showTitle?: boolean,
    }>(), {
        showTitle: true,
    });

    const rows = computed(() => getQuestionRows(props.section));
</script>

<template>
    <section class="form-section flex flex-col gap-4" :data-section-id="section.id">
        <header v-if="showTitle && (section.name || section.description)">
            <h2 v-if="section.name" class="text-heading-2">{{ section.name }}</h2>
            <div v-if="section.description" class="opacity-75" v-dompurify-html="section.description"></div>
        </header>
        <Fluid>
            <div v-for="(row, i) in rows" :key="i" class="grid gap-4" :style="{ gridTemplateColumns: `repeat(${row.length}, minmax(0, 1fr))` }">
                <FormQuestion v-for="question in row" :key="question.id" :question="question"></FormQuestion>
            </div>
        </Fluid>
    </section>
</template>

<style scoped>
    :deep(.p-formfield) {
        justify-self: flex-start;
    }

    /* Stack the FieldSelect inline label above the input */
    :deep(.p-formfield > .flex.items-baseline) {
        display: block;
    }

    :deep(.p-formfield > label) {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
    }

    :deep(.p-formfield .w-1\/3),
    :deep(.p-formfield .w-2\/3) {
        width: 100%;
        text-align: start;
    }
</style>
