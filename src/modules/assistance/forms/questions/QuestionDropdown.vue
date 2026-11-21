<script setup lang="ts">
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import FieldSelect from "@/common/forms/FieldSelect.vue";
    import { computed } from "vue";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import { getSelectableOptions } from "@/modules/assistance/forms/conditions/handlers";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        question: RenderedQuestion
    }>();

    const options = computed(() => Object.entries(getSelectableOptions(props.question)).map(([uuid, label]) => ({ uuid, label })));
</script>

<template>
    <ValidatedFormField :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory" :as="FieldSelect" :fieldProps="{
        optionValue: 'uuid',
        optionLabel: 'label',
        options: options,
        multiple: !!question.extra_data.is_multiple_dropdown,
    }"></ValidatedFormField>
</template>

<style scoped></style>
