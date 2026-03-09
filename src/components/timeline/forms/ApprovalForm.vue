<script setup lang="ts">
    import { Avatar, Card, Button, Select, FloatLabel, useToast, Fluid, Message } from "primevue";
    import { FormSubmitEvent } from '@primevue/forms';
    import {useSessionStore} from "@/composables/useSessionStore";
    import { inject, onMounted, ref, TemplateRef, useTemplateRef } from "vue";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";
    import { useApi } from "@/composables/useApi";
    import { useOpenAPIForm } from "@/composables/useOpenAPIForm";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import { useAssistanceTimelineItem } from "@/composables/useAssistanceTimelineItem";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";
    import ValidatedFormField from "@/components/forms/ValidatedFormField.vue";

    const { getFriendlyName, getUserID } = useSessionStore();
    const { getComponentSchema, doApiRequest, doGraphQLRequest } = useApi();
    const emits = defineEmits(['close', 'add']);
    const newTimelineItem: TemplateRef<HTMLDivElement> = useTemplateRef('new_timeline_item');
    const assistanceItemInstance = inject('assistanceItemInstance');
    const { resolveFields } = useOpenAPIForm(getComponentSchema(`${assistanceItemInstance.itemtype as 'Ticket' | 'Change'}Validation`));
    const assistanceTimelineItemInstance = inject<ReturnType<typeof useAssistanceTimelineItem>>('assistanceTimelineItemInstance', useAssistanceTimelineItem('Validation', ref({
        requester: getUserID
    })));
    const approval = ref(assistanceTimelineItemInstance?.item.value);
    const toast = useToast();

    const approval_form = useTemplateRef('approval_form');

    onMounted(() => {
        newTimelineItem.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newTimelineItem.value.focus();
    });

    function applySelectedTemplate() {
        const template_id = approval_form.value.getFieldState('approval_template').value;
        if (!template_id) {
            return;
        }
        doGraphQLRequest(`
            query {
                ValidationTemplate(id: ${template_id}) {
                    id content approval_step { id }
                }
            }
        `).then((res) => {
            const template = res.data.ValidationTemplate[0];
            //TODO Need API update to allow getting resolved content as template content may be a Twig template
            approval_form.value.setFieldValue('content', template.content);
            approval_form.value.setFieldValue('approval_step', template.approval_step.id);
        });
    }

    function onSubmit(event: FormSubmitEvent) {
        const now = new Date();
        assistanceItemInstance.timelineItems.value.push({
            type: 'Approval',
            item: {
                date_creation: now,
                date: now,
                content: event.values.content,
                is_private: event.values.is_private,
                user: {id: getUserID, name: getFriendlyName},
                request_type: {id: event.values.request_type}
            }
        });
        emits('close');

        doApiRequest(`Assistance/${assistanceItemInstance.itemtype}/${assistanceItemInstance.item.value.id}/Timeline/Approval`, {
            method: 'POST',
            data: event.values
        }).then(() => {
            emits('add');
        }).catch(() => {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to add followup. Please try again.',
                life: 5000,
            });
        }).finally(() => {
            assistanceItemInstance.loadTimelineItems();
        });
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <AdvancedForm :schemaName="`${assistanceItemInstance.itemtype as 'Ticket' | 'Change'}Validation`" ref="approval_form" :initialValues="approval" :resolver="resolveFields" @submit="onSubmit">
            <Card :pt="{
                body: {
                    class: `p-4 ${assistanceTimelineItemInstance.itemBackgroundColor.value}`,
                    style: 'border-radius: 0.5rem;'
                }
            }">
                <template #header>
                    <div class="flex flex-row-reverse">
                        <Button icon="ti ti-x" class="p-button-text p-button-plain" title="Close" aria-label="Close" @click="$emit('close')"></Button>
                    </div>
                </template>
                <template #content>
                    <Message>Not implemented yet</Message>
                    <div class="flex flex-col mb-2 -mt-2">
                        <Fluid class="grid grid-cols-2 gap-2 mb-2">
                            <ValidatedFormField name="approval_template" label="Approval template" :as="FieldSelect"
                                                :fieldProps="{type: 'ValidationTemplate', label_type: 'on'}"
                                                @change="applySelectedTemplate"></ValidatedFormField>
                            <ValidatedFormField name="approval_step" label="Approval step" :as="FieldSelect" :fieldProps="{type: 'ApprovalStep', label_type: 'on'}"></ValidatedFormField>
                            <ValidatedFormField name="requester" label="Requester" :as="FieldSelect"
                                                :fieldProps="{
                                                    options: [{key: getUserID, label: getFriendlyName}],
                                                    optionValue: 'key',
                                                    optionLabel: 'label',
                                                    label_type: 'on'
                                                }">
                            </ValidatedFormField>
                            <FloatLabel variant="on">
                                <Select inputId="approver" name="approver"
                                        filterMode="lenient" :options="[]"
                                        optionValue="key" optionLabel="label"
                                        fluid
                                ></Select>
                                <label for="approver">Approver</label>
                            </FloatLabel>
                        </Fluid>
                        <ValidatedFormField name="submission_comment" :as="RichTextEditor" :fieldProps="{
                            enable_file_upload: true,
                            editorProps: {
                                'aria-label': 'Submission comment'
                            }
                        }"></ValidatedFormField>
                    </div>
                </template>
                <template #footer>
                    <Button icon="ti ti-plus" label="Add"></Button>
                </template>
            </Card>
        </AdvancedForm>
    </div>
</template>

<style scoped>

</style>