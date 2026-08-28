<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import CheckboxGroup from "@cjdevstudios/bumblevue/checkboxgroup";
    import Checkbox from "@cjdevstudios/bumblevue/checkbox";
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
            <CheckboxGroup class="flex flex-col gap-2">
                <div v-for="[uuid, label] in options" :key="uuid" class="flex items-center gap-2">
                    <Checkbox :inputId="`${id}-${uuid}`" :value="uuid"></Checkbox>
                    <label :for="`${id}-${uuid}`">{{ label }}</label>
                </div>
            </CheckboxGroup>
        </fieldset>
    </ValidatedFormField>
</template>

<style scoped></style>
