<script setup lang="ts">
    import Form, { type FormSubmitEvent } from "@cjdevstudios/bumblevue-forms/form";
    import Button from "@cjdevstudios/bumblevue/button";
    import Message from "@cjdevstudios/bumblevue/message";
    import { useToast } from "@cjdevstudios/bumblevue/usetoast";
    import { computed, nextTick, provide, ref, useTemplateRef } from "vue";
    import { useI18n } from "vue-i18n";
    import FormSection from "@/modules/assistance/forms/viewer/FormSection.vue";
    import {
        buildAnswersPayload, FormSubmissionNotSupportedError, getAnswersFromValues, getInitialValues, loadForm, submitFormAnswers,
    } from "@/modules/assistance/forms/viewer/useFormRenderer";
    import {
        createLabelRegistry, FormRendererContextKey, questionFieldName,
    } from "@/modules/assistance/forms/viewer/formRendererContext";
    import { validateAnswers, type Translate } from "@/modules/assistance/forms/viewer/formValidation";
    import { computeVisibility } from "@/modules/assistance/forms/conditions/engine";
    import type { FormAnswers, RenderedSection } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        form_id: number
    }>();

    const { t } = useI18n();
    const $t = t as unknown as Translate;
    const toast = useToast();

    const form = await loadForm(props.form_id);

    const initialValues = form ? getInitialValues(form) : {};

    const formRef = useTemplateRef<any>('rendererForm');
    const labels = createLabelRegistry();

    /** Current answers keyed by question ID */
    const answers = computed<FormAnswers>(() => {
        if (!form) {
            return {};
        }
        const values: Record<string, unknown> = { ...initialValues };
        for (const [name, state] of Object.entries<any>(formRef.value?.states ?? {})) {
            values[name] = state?.value;
        }
        return getAnswersFromValues(form, values);
    });

    const visibility = computed(() => form
        ? computeVisibility({ form, answers: answers.value, resolveLabel: labels.resolve })
        : { form: true, sections: {}, questions: {} });

    provide(FormRendererContextKey, {
        answers,
        visibility,
        registerLabels: labels.register,
    });

    const resolver = ({ values }: { values: Record<string, unknown> }) => {
        if (!form) {
            return { values, errors: {} };
        }
        return {
            values,
            errors: validateAnswers(form, getAnswersFromValues(form, values), $t, { resolveLabel: labels.resolve }),
        };
    };

    const isStepByStep = computed(() => form?.render_layout === 'step_by_step' && form.sections.length > 1);
    const currentSectionIndex = ref(0);
    const visibleSectionIndexes = computed(() => (form?.sections ?? [])
        .map((section, index) => ({ section, index }))
        .filter(({ section }) => visibility.value.sections[section.id] !== false)
        .map(({ index }) => index));
    const nextSectionIndex = computed(() => visibleSectionIndexes.value.find((index) => index > currentSectionIndex.value));
    const previousSectionIndex = computed(() => [...visibleSectionIndexes.value].reverse().find((index) => index < currentSectionIndex.value));

    const canSubmit = computed(() => visibility.value.form && (!isStepByStep.value || nextSectionIndex.value === undefined));
    const isSubmitting = ref(false);

    function isSectionDisplayed(index: number) {
        if (isStepByStep.value) {
            return index === currentSectionIndex.value;
        }
        return visibleSectionIndexes.value.includes(index);
    }

    function getSectionFields(section: RenderedSection) {
        return section.questions.map(questionFieldName);
    }

    async function scrollToFirstError() {
        await nextTick();
        const error = document.querySelector('.form-viewer .form-question .p-message');
        error?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    async function goToNextSection() {
        if (!form || nextSectionIndex.value === undefined) {
            return;
        }
        const fields = getSectionFields(form.sections[currentSectionIndex.value]);
        const result = await formRef.value?.validate(fields);
        const hasErrors = fields.some((field) => (result?.errors?.[field] ?? []).length > 0);
        if (hasErrors) {
            await scrollToFirstError();
            return;
        }
        currentSectionIndex.value = nextSectionIndex.value;
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function goToPreviousSection() {
        if (previousSectionIndex.value !== undefined) {
            currentSectionIndex.value = previousSectionIndex.value;
        }
    }

    async function onSubmit(event: FormSubmitEvent) {
        if (!form || !canSubmit.value) {
            return;
        }
        if (!event.valid) {
            if (isStepByStep.value) {
                // Go back to the first section containing an error
                const index = visibleSectionIndexes.value.find((index) => getSectionFields(form.sections[index])
                    .some((field) => event.states[field]?.invalid));
                if (index !== undefined) {
                    currentSectionIndex.value = index;
                }
            }
            await scrollToFirstError();
            return;
        }

        isSubmitting.value = true;
        try {
            await submitFormAnswers(buildAnswersPayload(form, answers.value, visibility.value.questions));
        } catch (error) {
            if (error instanceof FormSubmissionNotSupportedError) {
                toast.add({
                    severity: 'warn',
                    summary: $t('form.submit.not_supported.title', 'Not available'),
                    detail: $t('form.submit.not_supported.detail', 'Submitting forms is not supported yet.'),
                    life: 5000,
                });
            } else {
                toast.add({ severity: 'error', summary: $t('form.submit.error', 'An error occurred while submitting the form'), life: 5000 });
            }
        } finally {
            isSubmitting.value = false;
        }
    }
</script>

<template>
    <section class="form-viewer flex justify-center">
        <div v-if="form" class="mt-4 w-full max-w-4xl flex flex-col gap-4">
            <header>
                <h1 class="text-heading-1">{{ form.name }}</h1>
                <div v-if="form.form_description" class="form-description" v-dompurify-html="form.form_description"></div>
            </header>
            <Form ref="rendererForm" :initialValues="initialValues" :resolver="resolver" :validateOnValueUpdate="true" @submit="onSubmit" class="flex flex-col gap-6">
                <div v-if="isStepByStep" class="text-sm opacity-75">
                    {{ $t('form.step_progress', { current: visibleSectionIndexes.indexOf(currentSectionIndex) + 1, total: visibleSectionIndexes.length }, 'Step {current} of {total}') }}
                </div>
                <!-- All sections are rendered so that hidden fields keep their value -->
                <FormSection v-for="(section, index) in form.sections" :key="section.id" v-show="isSectionDisplayed(index)"
                             :section="section" :showTitle="form.sections.length > 1"></FormSection>
                <div class="flex justify-end gap-2">
                    <Button v-if="isStepByStep && previousSectionIndex !== undefined" type="button" severity="secondary" icon="ti ti-arrow-left"
                            :label="$t('common.back', 'Back')" @click="goToPreviousSection"></Button>
                    <Button v-if="isStepByStep && nextSectionIndex !== undefined" type="button" icon="ti ti-arrow-right" iconPos="right"
                            :label="$t('common.continue', 'Continue')" @click="goToNextSection"></Button>
                    <Button v-if="canSubmit" type="submit" icon="ti ti-send" :loading="isSubmitting"
                            :label="$t('common.submit', 'Submit')"></Button>
                </div>
            </Form>
        </div>
        <Message v-else severity="error" class="mt-4">{{ $t('form.not_found', 'The requested form was not found or you do not have access to it.') }}</Message>
    </section>
</template>

<style scoped></style>
