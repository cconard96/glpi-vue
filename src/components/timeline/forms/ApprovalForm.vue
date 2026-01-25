<script setup lang="ts">
    import {Avatar, Card, Button, Select, FloatLabel} from "primevue";
    import {useSessionStore} from "@/composables/useSessionStore";
    import {ref, useTemplateRef} from "vue";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";

    const { getFriendlyName, getName } = useSessionStore();
    defineEmits(['close', 'add']);
    const new_timeline_item_el = useTemplateRef('new_timeline_item')
    const selected_requester = ref(getName);
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="mr-2" :title="getFriendlyName"></Avatar>
        <Card :pt="{
            body: {
                class: `bg-gray-200/50 dark:bg-gray-800/50`,
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
                <div class="flex flex-col mb-2 -mt-2">
                    <div class="grid grid-cols-2 gap-2 mb-2">
                        <FloatLabel variant="on">
                            <Select inputId="approval_template" name="approval_template"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    fluid
                            ></Select>
                            <label for="approval_template">Template</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <Select inputId="approval_step" name="approval_step"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    fluid
                            ></Select>
                            <label for="approval_step">Approval step</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <Select inputId="requester" name="requester"
                                    filterMode="lenient" :options="[
                                        { key: getName, label: getFriendlyName }
                                    ]"
                                    optionValue="key" optionLabel="label"
                                    fluid v-model="selected_requester"
                            ></Select>
                            <label for="requester">Requester</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <Select inputId="approver" name="approver"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    fluid
                            ></Select>
                            <label for="approver">Approver</label>
                        </FloatLabel>
                    </div>
                    <RichTextEditor :enable_file_upload="true"></RichTextEditor>
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