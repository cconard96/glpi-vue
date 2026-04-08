<script setup lang="ts">
    import {Avatar, Card, Button, Select, FloatLabel, ToggleSwitch, useDialog} from "primevue";
    import { Form, FormField, FormInstance, FormSubmitEvent } from '@primevue/forms';
    import {useSessionStore} from "@/composables/useSessionStore";
    import { defineAsyncComponent, ref, useTemplateRef } from "vue";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";
    import { useOpenAPIForm } from "@/composables/useOpenAPIForm";
    import { useApi } from "@/composables/useApi";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";

    const props = defineProps<{
        initialContent?: string
    }>();

    const { getFriendlyName } = useSessionStore();
    const { getComponentSchema } = useApi();
    const { resolveFields } = useOpenAPIForm(getComponentSchema('Solution'));
    defineEmits(['close', 'add']);
    const dialog = useDialog();
    const solution_form = useTemplateRef<FormInstance>('solution_form');

    const solution = ref({
        content: props.initialContent || ''
    });

    function showKBSearch() {
        const dialogInstance = dialog.open(defineAsyncComponent(() => import('@/components/kb/QuickSearchKB.vue')), {
            props: {
                header: 'Search KB Articles',
                modal: true,
                draggable: false,
            },
            data: {
                actions: {
                    use_as_solution: {label: 'Use as solution'},
                }
            },
            emits: {
                onClickAction: ({ action, article }) => {
                    if (action === 'use_as_solution') {
                        solution_form.value.setFieldValue('content', article.content);
                    }
                    dialogInstance.close();
                }
            }
        });
    }

    function onFormSubmit(event: FormSubmitEvent) {
        console.log(event.values);
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <AdvancedForm schemaName="Solution" ref="solution_form" :resolver="resolveFields" :initialValues="solution" @submit="onFormSubmit">
            <Card :pt="{
                body: {
                    class: `bg-cyan-300/50 dark:bg-cyan-700/25`,
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
                        <FloatLabel variant="on">
                            <Select inputId="solution_template" name="solution_template"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    class="min-w-32"
                            ></Select>
                            <label for="solution_template">Template</label>
                        </FloatLabel>
                    </div>
                    <div class="flex">
                        <div class="flex-9">
                            <FormField name="content">
                                <RichTextEditor :enable_file_upload="true"></RichTextEditor>
                            </FormField>
                        </div>
                        <div class="flex flex-col flex-3 gap-2 ps-2">
                            <Button icon="ti ti-search" label="Search KB" fluid severity="secondary" @click="showKBSearch"></Button>
                            <FloatLabel variant="on">
                                <Select inputId="solution_type" name="solution_type"
                                        filterMode="lenient" :options="[]"
                                        optionValue="key" optionLabel="label" show-clear
                                        class="w-full"
                                ></Select>
                                <label for="solution_type">Solution type</label>
                            </FloatLabel>
                            <div class="flex items-center mt-2">
                                <label for="save_to_kb" class="ml-2">Save to KB</label>
                                <ToggleSwitch inputId="save_to_kb" class="ms-2"></ToggleSwitch>
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <Button type="submit" icon="ti ti-plus" label="Add"></Button>
                </template>
            </Card>
        </AdvancedForm>
    </div>
</template>

<style scoped>

</style>