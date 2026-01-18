<script setup lang="ts">
    import {
        Avatar, Card, Button, Select, FloatLabel, DatePicker, ToggleSwitch, InputMask
    } from "primevue";
    import {useSessionStore} from "@/composables/useSessionStore";
    import {ref, useTemplateRef} from "vue";
    import RichTextEditor from "@/components/formfields/RichTextEditor.vue";

    const { getFriendlyName } = useSessionStore();
    defineEmits(['close', 'add']);
    const new_timeline_item_el = useTemplateRef('new_timeline_item')
    const selected_state = ref(1);
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="mr-2" :title="getFriendlyName"></Avatar>
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
                    <FloatLabel variant="on">
                        <Select inputId="task_template" name="task_template"
                                filterMode="lenient" :options="[]"
                                optionValue="key" optionLabel="label" show-clear
                                class="min-w-32"
                        ></Select>
                        <label for="task_template">Template</label>
                    </FloatLabel>
                </div>
                <div class="flex">
                    <div class="flex-9">
                        <RichTextEditor :enable_file_upload="true"></RichTextEditor>
                    </div>
                    <div class="flex flex-col flex-3 gap-2 ps-2">
                        <FloatLabel variant="on">
                            <DatePicker inputId="date" name="date" placeholder="Current date and time"
                                        showTime showIcon
                                        class="max-w-full"/>
                            <label for="date">Date</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <InputMask inputId="task_duration" name="task_duration" mask="99:99"
                                       placeholder="hh:mm"
                                       class="w-full"/>
                            <label for="task_duration">Duration</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <Select inputId="task_state" name="task_state"
                                    filterMode="lenient" :options="[
                                        { key: 0, label: 'Information', icon: 'ti ti-info-circle' },
                                        { key: 1, label: 'To do', icon: 'ti ti-list-details' },
                                        { key: 2, label: 'Done', icon: 'ti ti-list-check' },
                                    ]"
                                    optionValue="key" optionLabel="label"
                                    v-model="selected_state"
                                    class="w-full"
                            >
                            </Select>
                            <label for="task_state">Status</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <Select inputId="task_category" name="task_category"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label" show-clear
                                    class="w-full"
                            ></Select>
                            <label for="task_category">Category</label>
                        </FloatLabel>
                        <div class="flex items-center mt-2">
                            <label for="is_private" class="ml-2">Private</label>
                            <ToggleSwitch inputId="is_private" class="ms-2">
                                <template #handle="slotProps">
                                    <span v-if="slotProps.checked" class="ti ti-lock"></span>
                                    <span v-else class="ti ti-lock-open"></span>
                                </template>
                            </ToggleSwitch>
                        </div>
                        <div class="flex items-center mt-2">
                            <label for="save_to_kb" class="ml-2">Save to KB</label>
                            <ToggleSwitch inputId="save_to_kb" class="ms-2"></ToggleSwitch>
                        </div>
                        <FloatLabel variant="on">
                            <Select inputId="user" name="user"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    class="w-full"
                            >
                            </Select>
                            <label for="user">User</label>
                        </FloatLabel>
                        <FloatLabel variant="on">
                            <Select inputId="group" name="group"
                                    filterMode="lenient" :options="[]"
                                    optionValue="key" optionLabel="label"
                                    class="w-full"
                            >
                            </Select>
                            <label for="group">Group</label>
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