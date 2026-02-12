<script setup lang="ts">
    import {Avatar, Card, Button, FloatLabel, InputText, DatePicker, Fluid, InputMask, InputNumber, Textarea} from "primevue";
    import {Form, FormField} from '@primevue/forms';
    import {useSessionStore} from "@/composables/useSessionStore";
    import FieldSelect from "@/components/forms/FieldSelect.vue";

    const { getFriendlyName } = useSessionStore();
    defineEmits(['close', 'add']);

    const cost_item = {};
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <Form :initialValues="cost_item" fluid>
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
                    <Fluid>
                        <div class="grid grid-cols-2 gap-2">
                            <FormField name="name">
                                <FloatLabel variant="on">
                                    <InputText id="cost_name" type="text"></InputText>
                                    <label for="cost_name">Name</label>
                                </FloatLabel>
                            </FormField>
                            <FormField name="budget">
                                <FieldSelect label="Budget" type="Budget" label_type="on"></FieldSelect>
                            </FormField>
                            <FormField name="date_begin">
                                <FloatLabel variant="on">
                                    <DatePicker inputId="cost_date_begin" showClear showIcon></DatePicker>
                                    <label for="cost_date_begin">Begin Date</label>
                                </FloatLabel>
                            </FormField>
                            <FormField name="date_end">
                                <FloatLabel variant="on">
                                    <DatePicker inputId="cost_date_end" showClear showIcon></DatePicker>
                                    <label for="cost_date_end">End Date</label>
                                </FloatLabel>
                            </FormField>
                            <FormField name="duration">
                                <FloatLabel variant="on">
                                    <InputMask inputId="cost_duration" mask="99:99"
                                               placeholder="hh:mm"/>
                                    <label for="task_duration">Duration</label>
                                </FloatLabel>
                            </FormField>
                            <div class="grid grid-cols-3 col-span-2 gap-2">
                                <FormField>
                                    <FormField name="cost_time">
                                        <FloatLabel variant="on">
                                            <InputNumber inputId="cost_time" mode="decimal" :minFractionDigits="2"></InputNumber>
                                            <label for="cost_time">Time Cost</label>
                                        </FloatLabel>
                                    </FormField>
                                </FormField>
                                <FormField>
                                    <FormField name="cost_fixed">
                                        <FloatLabel variant="on">
                                            <InputNumber inputId="cost_fixed" mode="decimal" :minFractionDigits="2"></InputNumber>
                                            <label for="cost_fixed">Fixed Cost</label>
                                        </FloatLabel>
                                    </FormField>
                                </FormField>
                                <FormField>
                                    <FormField name="cost_material">
                                        <FloatLabel variant="on">
                                            <InputNumber inputId="cost_material" mode="decimal" :minFractionDigits="2"></InputNumber>
                                            <label for="cost_material">Material Cost</label>
                                        </FloatLabel>
                                    </FormField>
                                </FormField>
                            </div>
                            <FormField name="comment" class="col-span-2">
                                <FloatLabel variant="on">
                                    <Textarea id="comment" rows="3"></Textarea>
                                    <label for="comment">Comment</label>
                                </FloatLabel>
                            </FormField>
                        </div>
                    </Fluid>
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