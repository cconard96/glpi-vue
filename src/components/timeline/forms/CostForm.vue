<script setup lang="ts">
    import { Avatar, Card, Button, FloatLabel, InputText, DatePicker, Fluid, InputMask, InputNumber, Textarea, } from "primevue";
    import { Form, FormField, FormSubmitEvent } from '@primevue/forms';
    import {useSessionStore} from "@/composables/useSessionStore";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import { inject, onMounted, ref, TemplateRef, useTemplateRef } from "vue";
    import { useApi } from "@/composables/useApi";
    import { useOpenAPIForm } from "@/composables/useOpenAPIForm";
    import { useAssistanceTimelineItem } from "@/composables/useAssistanceTimelineItem";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useAssistanceItem } from "@/composables/useAssistanceItem.ts";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";

    const { getFriendlyName } = useSessionStore();
    const { getDurationFromMaskedInput, getMaskedInputFromDuration } = useDataHelper();
    const { getComponentSchema, doApiRequest, doGraphQLRequest } = useApi();
    const emits = defineEmits(['close', 'add']);
    const newTimelineItem: TemplateRef<HTMLDivElement> = useTemplateRef('new_timeline_item');
    const assistanceTimelineItemInstance = inject<ReturnType<typeof useAssistanceTimelineItem>>('assistanceTimelineItemInstance', useAssistanceTimelineItem('Cost', ref({})));
    const assistanceItemInstance = inject<ReturnType<typeof useAssistanceItem>>('assistanceItemInstance');
    const { resolveFields } = useOpenAPIForm(await getComponentSchema(`${assistanceItemInstance.itemtype}Cost`));

    const cost = ref({
        ...assistanceTimelineItemInstance?.item.value,
        duration: assistanceTimelineItemInstance?.item.value.duration ? getMaskedInputFromDuration(assistanceTimelineItemInstance.item.value.duration) : '00:00'
    });
    const cost_form = useTemplateRef('cost_form');

    onMounted(() => {
        newTimelineItem.value.scrollIntoView({ behavior: 'smooth', block: 'center' });
        newTimelineItem.value.focus();
    });

    function onSubmit(event: FormSubmitEvent) {
        const values = event.values;
        values.duration = getDurationFromMaskedInput(event.values.duration);
        emits('close');

        if (cost.value.id) {
            assistanceTimelineItemInstance.updateItem(values, values).then(() => {
                //emits('add');
            });
        } else {
            assistanceTimelineItemInstance.addItem(values, values).then(() => {
                emits('add');
            });
        }
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <AdvancedForm :schemaName="`${assistanceItemInstance.itemtype}Cost`" ref="cost_form" :initialValues="cost" :resolver="resolveFields" @submit="onSubmit">
            <Card :pt="{
                body: {
                    class: `p-4 ${assistanceTimelineItemInstance.itemBackgroundColor}`,
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
                    <Button type="submit" :icon="cost.id ? 'ti ti-device-floppy' : 'ti ti-plus'" :label="cost.id ? 'Save' : 'Add'"></Button>
                </template>
            </Card>
        </AdvancedForm>
    </div>
</template>

<style scoped>

</style>