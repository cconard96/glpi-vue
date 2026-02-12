<script setup lang="ts">
    import { Avatar, Card, Button, Select, FloatLabel, ToggleSwitch } from "primevue";
    import {Form, FormField, FormSubmitEvent} from '@primevue/forms';
    import {useSessionStore, ITILSubItemRights} from "@/composables/useSessionStore";
    import {useOpenAPIForm} from "@/composables/useOpenAPIForm";
    import {useApi} from "@/composables/useApi";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";

    const { getFriendlyName, hasRight } = useSessionStore();
    const { getComponentSchema } = useApi();
    const { resolveFields } = useOpenAPIForm(getComponentSchema('Followup'));
    defineEmits(['close', 'add']);

    function onSubmit(event: FormSubmitEvent) {
        console.log(event);
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <Form :resolver="resolveFields" @submit="onSubmit">
            <Card :pt="{
                body: {
                    class: `p-4 bg-gray-200/50 dark:bg-gray-800/50`,
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
                        <FloatLabel variant="on">
                            <Select inputId="followup_template" name="followup_template"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    class="min-w-32"
                            ></Select>
                            <label for="followup_template">Template</label>
                        </FloatLabel>
                    </div>
                    <div class="flex">
                        <div class="flex-9">
                            <RichTextEditor :enable_file_upload="true"></RichTextEditor>
                        </div>
                        <div class="flex flex-col flex-3 gap-2 ps-2">
                            <Button icon="ti ti-search" label="Search KB" fluid severity="secondary"></Button>
                            <FloatLabel variant="on">
                                <Select inputId="request_source" name="request_source"
                                        filterMode="lenient" :options="[]"
                                        optionValue="key" optionLabel="label" show-clear
                                        class="w-full"
                                ></Select>
                                <label for="request_source">Request source</label>
                            </FloatLabel>
                            <div v-if="hasRight('followup', ITILSubItemRights.SEEPRIVATE)" class="flex items-center mt-2">
                                <label for="is_private" class="ml-2">Private</label>
                                <ToggleSwitch inputId="is_private" class="ms-2">
                                    <template #handle="slotProps">
                                        <span v-if="slotProps.checked" class="ti ti-lock"></span>
                                        <span v-else class="ti ti-lock-open"></span>
                                    </template>
                                </ToggleSwitch>
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <Button icon="ti ti-plus" label="Add"></Button>
                </template>
            </Card>
        </Form>
    </div>
</template>

<style scoped>

</style>