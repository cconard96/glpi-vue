<script setup lang="ts">
    import { useProject } from "@/modules/tools/projects/useProject.ts";
    import { inject } from "vue";
    import AdvancedForm from "@/common/forms/AdvancedForm.vue";
    import { useDataHelper } from "@/common/useDataHelper.ts";
    import { useToast } from "@cjdevstudios/bumblevue/usetoast";
    import type { FormSubmitEvent } from "@cjdevstudios/bumblevue-forms";
    import FormFields from "@/common/forms/FormFields.vue";
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import DatePicker from "@cjdevstudios/bumblevue/datepicker";
    import InputText from "@cjdevstudios/bumblevue/inputtext";
    import FieldSelect from "@/common/forms/FieldSelect.vue";

    const project: ReturnType<typeof useProject> = inject('mainItem');
    const { formatUsername, formatDateTime } = useDataHelper();
    const toast = useToast();
    const initialValues = project.item.value;

    const priorityOptions = [
        { key: 6, label: 'Major', color: '#ff5555' },
        { key: 5, label: 'Very High', color: '#ffadad' },
        { key: 4, label: 'High', color: '#ffbfbf' },
        { key: 3, label: 'Medium', color: '#ffcece' },
        { key: 2, label: 'Low', color: '#ffe0e0' },
        { key: 1, label: 'Very Low', color: '#fff2f2' }
    ];

    function onFormSubmit(event: FormSubmitEvent) {
        if (!event.valid) {
            return;
        }
        project.createOrUpdateItem(event.values, toast);
    }
</script>

<template>
    <section class="h-full overflow-y-auto">
        <AdvancedForm schema-name="Project" :initial-values="initialValues" class="flex flex-col gap-4 w-full sm-w-56 px-4" @submit="onFormSubmit">
            <FormFields>
                <ValidatedFormField name="date" label="Creation date" :as="DatePicker" :fieldProps="{ showIcon: true, showTime: true }"></ValidatedFormField>
                <ValidatedFormField name="date_mod" label="Last update" :as="DatePicker" :fieldProps="{ showTime: true, disabled: true }"></ValidatedFormField>
                <ValidatedFormField name="name" label="Name" :as="InputText"></ValidatedFormField>
                <ValidatedFormField name="code" label="Code" :as="InputText"></ValidatedFormField>
                <ValidatedFormField name="priority" label="Priority" :as="FieldSelect" :fieldProps="{
                    optionValue: 'key',
                    optionLabel: 'label',
                    options: priorityOptions,
                    showClear: false,
                }">
                    <template #value="slotProps">
                        <div class="flex items-baseline">
                            <i class="ti ti-circle-filled me-2" :style="`color: ${priorityOptions.find(opt => opt['key'] === slotProps.value)?.['color']}`"></i>
                            <div>{{ priorityOptions.find(opt => opt['key'] === slotProps.value)?.['label'] || slotProps.value }}</div>
                        </div>
                    </template>
                    <template #option="slotProps">
                        <div class="flex items-baseline">
                            <i class="ti ti-circle-filled me-2" :style="`color: ${slotProps.option['color']}`"></i>
                            <div>{{ slotProps.option['label'] }}</div>
                        </div>
                    </template>
                </ValidatedFormField>
            </FormFields>
        </AdvancedForm>
    </section>
</template>

<style scoped></style>
