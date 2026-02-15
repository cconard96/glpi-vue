<script setup lang="ts">
    import {Avatar, Button, Card, FloatLabel, Select, Message} from "primevue";
    import { Form, FormField, FormSubmitEvent } from '@primevue/forms';
    import FileUpload from "primevue/fileupload";
    import { useSessionStore } from "@/composables/useSessionStore";

    const { getFriendlyName } = useSessionStore();
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <Form>
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
                    <Message>Not implemented yet. File uploads not yet properly supported in the new GLPI API.</Message>
                    <div class="flex">
                        <div class="flex-12">
                            <FloatLabel>
                                <Select inputId="heading" name="heading"
                                        filterMode="lenient" :options="[]"
                                        optionValue="key" optionLabel="label" show-clear
                                        class="w-full"
                                ></Select>
                                <label for="heading">Heading</label>
                            </FloatLabel>
                            <FileUpload :pt="{
                                root: {
                                    class: 'mt-2'
                                },
                                header: {
                                    class: 'p-2',
                                },
                            }">
                                <template #empty>
                                    <div class="text-center text-gray-500">
                                        <i class="ti ti-upload text-4xl mb-2"></i>
                                        <div>Drag and drop files here to attach</div>
                                    </div>
                                </template>
                            </FileUpload>
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