<script setup lang="ts">
    import { Button, Card, Fluid, ToggleSwitch, useDialog } from "primevue";
    import { FormField, FormSubmitEvent } from '@primevue/forms';
    import { ITILSubItemRights, useSessionStore } from "@/composables/useSessionStore";
    import { useOpenAPIForm } from "@/composables/useOpenAPIForm";
    import { useApi } from "@/composables/useApi";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import { defineAsyncComponent, inject, onMounted, TemplateRef, ref, useTemplateRef } from "vue";
    import { useAssistanceTimelineItem } from "@/composables/useAssistanceTimelineItem";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";

    const { getFriendlyName, hasRight, getUserID } = useSessionStore();
    const { getComponentSchema, doGraphQLRequest } = useApi();
    const { resolveFields } = useOpenAPIForm(await getComponentSchema('Followup'));
    const emits = defineEmits(['close', 'add']);
    const newTimelineItem: TemplateRef<HTMLDivElement> = useTemplateRef('new_timeline_item');
    const assistanceTimelineItemInstance = inject<ReturnType<typeof useAssistanceTimelineItem>>('assistanceTimelineItemInstance', useAssistanceTimelineItem('Followup', ref({})));
    const followup = ref(assistanceTimelineItemInstance?.item.value);

    const dialog = useDialog();
    const followup_form = useTemplateRef('followup_form');

    onMounted(() => {
        newTimelineItem.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newTimelineItem.value.focus();
    });

    function showKBSearch() {
        const dialogInstance = dialog.open(defineAsyncComponent(() => import('@/components/kb/QuickSearchKB.vue')), {
            props: {
                header: 'Search KB Articles',
                pt: {
                    root: {
                        class: 'w-5/10 h-8/10'
                    }
                },
                modal: true,
                draggable: false,
            },
            data: {
                actions: {
                    use_as_content: {label: 'Use as followup content'},
                }
            },
            emits: {
                onClickAction: ({ action, article }) => {
                    if (action === 'use_as_content') {
                        followup_form.value.setFieldValue('content', article.content);
                    }
                    dialogInstance.close();
                }
            }
        });
    }

    function applySelectedTemplate() {
        const template_id = followup_form.value.getFieldState('followup_template').value;
        if (!template_id) {
            return;
        }
        doGraphQLRequest(`
            query {
                FollowupTemplate(id: ${template_id}) {
                    id content request_type { id } is_private
                }
            }
        `).then((res) => {
            const template = res.data.FollowupTemplate[0];
            //TODO Need API update to allow getting resolved content as template content may be a Twig template
            followup_form.value.setFieldValue('content', template.content);
            followup_form.value.setFieldValue('request_type', template.request_type.id);
            followup_form.value.setFieldValue('is_private', template.is_private);
        });
    }

    function onSubmit(event: FormSubmitEvent) {
        const now = new Date();
        emits('close');

        const optimisticItemData = {
            date_creation: now,
            date: now,
            content: event.values.content,
            is_private: event.values.is_private,
            user: {id: getUserID, name: getFriendlyName},
            request_type: {id: event.values.request_type}
        }

        if (followup.value.id) {
            assistanceTimelineItemInstance.updateItem(event.values, optimisticItemData).then(() => {
                //emits('add');
            });
        } else {
            assistanceTimelineItemInstance.addItem(event.values, optimisticItemData).then(() => {
                emits('add');
            });
        }
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <AdvancedForm schemaName="Followup" ref="followup_form" :initialValues="followup" :resolver="resolveFields" @submit="onSubmit">
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
                    <div class="flex mb-2 -mt-2">
                        <FormField name="followup_template">
                            <FieldSelect label="Template" type="FollowupTemplate" label_type="on" @change="applySelectedTemplate"></FieldSelect>
                        </FormField>
                    </div>
                    <div class="flex">
                        <div class="flex-9">
                            <FormField name="content">
                                <RichTextEditor :enable_file_upload="true"></RichTextEditor>
                            </FormField>
                        </div>
                        <div class="flex-3 ps-2">
                            <Fluid class="flex flex-col gap-2">
                                <Button icon="ti ti-search" label="Search KB" fluid severity="secondary" @click="showKBSearch"></Button>
                                <FormField name="request_type">
                                    <FieldSelect label="Request source" type="RequestType" label_type="on" show-clear></FieldSelect>
                                </FormField>
                                <div v-if="hasRight('followup', ITILSubItemRights.SEEPRIVATE)">
                                    <FormField name="is_private" class="flex items-center">
                                        <label for="is_private" class="ml-2">Private</label>
                                        <ToggleSwitch inputId="is_private" class="ms-2">
                                            <template #handle="slotProps">
                                                <span v-if="slotProps.checked" class="ti ti-lock"></span>
                                                <span v-else class="ti ti-lock-open"></span>
                                            </template>
                                        </ToggleSwitch>
                                    </FormField>
                                </div>
                            </Fluid>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <Button type="submit" :icon="followup.id ? 'ti ti-device-floppy' : 'ti ti-plus'" :label="followup.id ? 'Save' : 'Add'"></Button>
                </template>
            </Card>
        </AdvancedForm>
    </div>
</template>

<style scoped>

</style>