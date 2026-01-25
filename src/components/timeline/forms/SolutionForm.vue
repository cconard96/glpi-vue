<script setup lang="ts">
    import {Avatar, Card, Button, Select, FloatLabel, ToggleSwitch} from "primevue";
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
                class: `bg-cyan-300/50 dark:bg-cyan-700/25`,
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
                        <RichTextEditor :enable_file_upload="true"></RichTextEditor>
                    </div>
                    <div class="flex flex-col flex-3 gap-2 ps-2">
                        <Button icon="ti ti-search" label="Search KB" fluid severity="secondary"></Button>
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
                <Button icon="ti ti-plus" label="Add"></Button>
            </template>
        </Card>
    </div>
</template>

<style scoped>

</style>