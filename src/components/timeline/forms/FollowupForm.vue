<script setup lang="ts">
import {Avatar, Card, Button, Select, FloatLabel} from "primevue";
    import {useSessionStore} from "@/composables/useSessionStore";
    import {useTemplateRef} from "vue";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";

    const { getFriendlyName } = useSessionStore();
    defineEmits(['close', 'add']);
    const new_timeline_item_el = useTemplateRef('new_timeline_item')
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="mr-2" :title="getFriendlyName"></Avatar>
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
                <div class="flex">
                    <div class="flex-9">
                        <RichTextEditor :enable_file_upload="true"></RichTextEditor>
                    </div>
                    <div class="flex flex-col flex-3 gap-2 ps-2">
                        <Button icon="ti ti-search" label="Search KB" fluid severity="secondary"></Button>
                        <FloatLabel variant="on">
                            <Select inputId="followup_template" name="followup_template"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    class="w-full"
                            ></Select>
                            <label for="followup_template">Template</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <Select inputId="request_source" name="request_source"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label" show-clear
                                    class="w-full"
                            ></Select>
                            <label for="request_source">Request source</label>
                        </FloatLabel>
                    </div>
                </div>
            </template>
            <template #footer>
                <Button icon="ti ti-plus" label="Add"></Button>
            </template>
        </Card>
    </div>
</template>

<style scoped>

</style>