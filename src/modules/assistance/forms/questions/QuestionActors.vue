<script setup lang="ts">
    /**
     * Shared implementation of the requester, observer and assignee questions.
     * TODO GLPI restricts the users by right (`all` or `own_ticket` for assignees) and all actors by entity.
     * The HL API cannot do that yet, so all active actors of the enabled types are shown.
     */
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import ActorAnswerInput from "@/modules/assistance/forms/questions/inputs/ActorAnswerInput.vue";
    import { computed } from "vue";
    import { questionFieldName } from "@/modules/assistance/forms/viewer/formRendererContext";
    import { getEnabledActorTypes } from "@/modules/assistance/forms/viewer/useFormRenderer";
    import type { ActorRole } from "@/common/actor/useActorSearch";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        question: RenderedQuestion,
        role: ActorRole,
    }>();

    const fieldProps = computed(() => ({
        questionId: props.question.id,
        role: props.role,
        types: getEnabledActorTypes(props.question),
        multiple: !!props.question.extra_data.is_multiple_actors,
    }));
</script>

<template>
    <ValidatedFormField :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory" :as="ActorAnswerInput"
                        :fieldProps="fieldProps"></ValidatedFormField>
</template>

<style scoped></style>
