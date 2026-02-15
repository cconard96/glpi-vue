<script setup lang="ts">
    import { Avatar, Button, Card, DatePicker, FloatLabel, Fluid, InputMask, ToggleSwitch, useToast } from "primevue";
    import { Form, FormField, FormSubmitEvent } from '@primevue/forms';
    import { ITILSubItemRights, useSessionStore } from "@/composables/useSessionStore";
    import { inject, ref, useTemplateRef } from "vue";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";
    import { useApi } from "@/composables/useApi";
    import { useOpenAPIForm } from "@/composables/useOpenAPIForm";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import { useDataHelper } from "@/composables/useDataHelper";

    const { getFriendlyName, hasRight, getUserID } = useSessionStore();
    const { getComponentSchema, doApiRequest, doGraphQLRequest } = useApi();
    const { resolveFields } = useOpenAPIForm(getComponentSchema('Task'));
    const { formatUsername } = useDataHelper();
    const emits = defineEmits(['close', 'add']);
    const assistanceItemInstance = inject('assistanceItemInstance');
    const toast = useToast();

    const task = ref({
        state: 1
    });
    const task_form = useTemplateRef('task_form');
    const task_state_options = [
        { key: 0, label: 'Information', icon: 'ti ti-info-circle' },
        { key: 1, label: 'To do', icon: 'ti ti-list-details' },
        { key: 2, label: 'Done', icon: 'ti ti-list-check' },
    ];

    function applySelectedTemplate() {
        const template_id = task_form.value.getFieldState('task_template').value;
        if (!template_id) {
            return;
        }
        doGraphQLRequest(`
            query {
                TaskTemplate(id: ${template_id}) {
                    id content is_private category { id } duration state user_tech { id } group_tech { id } use_current_user
                }
            }
        `).then((res) => {
            const template = res.data.FollowupTemplate[0];
            //TODO Need API update to allow getting resolved content as template content may be a Twig template
            task_form.value.setFieldValue('content', template.content);
                if (template.use_current_user) {
                    task_form.value.setFieldValue('user_tech', { id: getUserID, name: getFriendlyName });
                } else {
                    task_form.value.setFieldValue('user_tech', template.user_tech?.id);
                }
                task_form.value.setFieldValue('group_tech', template.group_tech?.id);
                task_form.value.setFieldValue('is_private', template.is_private);
                task_form.value.setFieldValue('category', template.category?.id);
                task_form.value.setFieldValue('duration', template.duration);
                task_form.value.setFieldValue('state', template.state);
        });
    }

    function onFormSubmit(event: FormSubmitEvent) {
        //Optimistic UI
        const duration_mins = (event.values.duration ? parseInt(event.values.duration.split(':')[0]) * 60 + parseInt(event.values.duration.split(':')[1]) : 0) * 60;
        assistanceItemInstance.timelineItems.value.push({
            type: 'Task',
            item: {
                content: event.values.content,
                date: event.values.date || new Date(),
                duration: duration_mins,
                state: event.values.state,
                category: event.values.category ? { id: event.values.category } : null,
                is_private: event.values.is_private,
                user_tech: event.values.user_tech ? { id: event.values.user_tech } : null,
                group_tech: event.values.group_tech ? { id: event.values.group_tech } : null,
            }
        });

        const values = {
            ...event.values,
            duration: duration_mins
        }

        doApiRequest(`Assistance/${assistanceItemInstance.itemtype}/${assistanceItemInstance.item.value.id}/Timeline/Task`, {
            method: 'POST',
            data: values
        }).then(() => {
            emits('add');
        }).catch(() => {
            toast.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to add task. Please try again.',
                life: 5000,
            });
        }).finally(() => {
            assistanceItemInstance.loadTimelineItems();
            emits('close');
        });
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <Form ref="task_form" :initial-values="task" :resolver="resolveFields" @submit="onFormSubmit">
            <Card :pt="{
                body: {
                    class: `bg-yellow-400/50 dark:bg-yellow-500/10`,
                    style: 'border-radius: 0.5rem;'
                }
            }">
                <template #header>
                    <div class="flex flex-row-reverse">
                        <Button icon="ti ti-x" class="p-button-text p-button-plain" title="Close"
                                aria-label="Close" @click="$emit('close')"></Button>
                    </div>
                </template>
                <template #content>
                    <div class="flex mb-2 -mt-2">
                        <FormField name="task_template">
                            <FieldSelect label="Template" type="TaskTemplate" label_type="on" @change="applySelectedTemplate"></FieldSelect>
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
                                <FormField name="date">
                                    <FloatLabel variant="on">
                                        <DatePicker inputId="date" placeholder="Current date and time"
                                                    showTime showIcon
                                                    class="max-w-full"/>
                                        <label for="date">Date</label>
                                    </FloatLabel>
                                </FormField>
                                <FormField name="duration">
                                    <FloatLabel variant="on">
                                        <InputMask inputId="task_duration" mask="99:99"
                                                   placeholder="hh:mm"
                                                   class="w-full"/>
                                        <label for="task_duration">Duration</label>
                                    </FloatLabel>
                                </FormField>
                                <FormField name="state">
                                    <FieldSelect label_type="on" label="Status" optionValue="key" optionLabel="label" :options="task_state_options" :showClear="false">
                                        <template #option="slotProps">
                                            <span :class="slotProps.option.icon" class="me-2"></span>{{ slotProps.option.label }}
                                        </template>
                                        <template #value="slotProps">
                                            <div class="flex items-baseline">
                                                <i v-if="slotProps.value >= 0" :class="task_state_options.find(option => option.key === slotProps.value)?.icon" class="me-2"></i>
                                                <span v-if="slotProps.value >= 0">{{ task_state_options.find(option => option.key === slotProps.value)?.label }}</span>
                                                <span v-else>&nbsp;</span>
                                            </div>
                                        </template>
                                    </FieldSelect>
                                </FormField>
                                <FormField name="category">
                                    <FieldSelect label="Category" type="TaskCategory" label_type="on"></FieldSelect>
                                </FormField>
                                <div v-if="hasRight('task', ITILSubItemRights.SEEPRIVATE)">
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
                                <FormField name="save_to_kb" class="flex items-center">
                                    <label for="save_to_kb" class="ml-2">Save to KB</label>
                                    <ToggleSwitch inputId="save_to_kb" class="ms-2"></ToggleSwitch>
                                </FormField>
                                <FormField name="user_tech">
                                    <FieldSelect label="User" type="User" label_type="on" :fields="['id', 'username', 'realname', 'firstname']" :name_field="(opt) => formatUsername(opt)"></FieldSelect>
                                </FormField>
                                <FormField name="group_tech">
                                    <FieldSelect label="Group" type="Group" label_type="on" condition="maybe_assigned_task==1"></FieldSelect>
                                </FormField>
                            </Fluid>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <Button type="submit" icon="ti ti-plus" label="Add"></Button>
                </template>
            </Card>
        </Form>
    </div>
</template>

<style scoped>

</style>