<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import RadioButtonGroup from "@cjdevstudios/bumblevue/radiobuttongroup";
    import RadioButton from "@cjdevstudios/bumblevue/radiobutton";
    import { computed, useId } from "vue";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import { getSelectableOptions } from "@/modules/assistance/forms/conditions/handlers";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        question: RenderedQuestion
    }>();

    const id = useId();
    const options = computed(() => Object.entries(getSelectableOptions(props.question)));
</script>

<template>
    <ValidatedFormField :name="questionFieldName(question)">
        <fieldset>
            <legend class="mb-1">
                {{ question.name }}
                <span v-if="question.is_mandatory" class="text-red-500" aria-hidden="true">*</span>
            </legend>
            <RadioButtonGroup class="flex flex-col gap-2">
                <div v-for="[uuid, label] in options" :key="uuid" class="flex items-center gap-2">
                    <RadioButton :inputId="`${id}-${uuid}`" :value="uuid"></RadioButton>
                    <label :for="`${id}-${uuid}`">{{ label }}</label>
                </div>
            </RadioButtonGroup>
        </fieldset>
    </ValidatedFormField>
</template>

<style scoped></style>
