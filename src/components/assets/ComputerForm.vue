<script setup lang="ts">
    import { FormSubmitEvent } from '@primevue/forms';
    import { Button, InputText, Textarea, useToast } from "primevue";
    import { inject, ref } from "vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import FormFields from "@/components/forms/FormFields.vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useRouter } from "vue-router";
    import { createItem, type useAsset } from "@/composables/assets/useAsset.js";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";
    import ValidatedFormField from "@/components/forms/ValidatedFormField.vue";

    const mainItem: ReturnType<typeof useAsset<'Computer'>> = inject('mainItem');
    const { formatUsername, formatDateTime } = useDataHelper();
    const initialValues = mainItem.item.value;
    const is_submitting = ref(false);
    const toast = useToast();
    const router = useRouter();

    function onFormSubmit(event: FormSubmitEvent) {
        if (!event.valid) {
            return;
        }
        is_submitting.value = true;
        createItem('Computer', event.values).then((res) => {
            is_submitting.value = false;
            toast.add({severity: 'success', summary: 'Success', detail: 'Item created successfully.', life: 5000});
            const new_id = res.data.id;
            // Redirect to the new item page
            router.push({
                name: 'AssetItemForm',
                params: {
                    itemtype: 'Computer',
                    id: new_id,
                }
            });
        }).catch((err) => {
            if (err.response && err.response.data && err.response.data.message) {
                toast.add({severity: 'error', summary: 'Error', detail: err.response.data.message, life: 5000});
            } else {
                toast.add({severity: 'error', summary: 'Error', detail: 'An unknown error occurred.', life: 5000});
            }
        }).finally(() => {
            is_submitting.value = false;
        })
    }
</script>

<template>
    <section class="h-full overflow-y-auto">
        <AdvancedForm schemaName="Computer" :initialValues="initialValues" class="flex flex-col gap-4 w-full sm-w-56 px-4" @submit="onFormSubmit">
            <FormFields>
                <ValidatedFormField name="name" label="Name" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="status" label="Status" :as="FieldSelect" :fieldProps="{type: 'State'}"></ValidatedFormField>
                <ValidatedFormField name="location" label="Location" :as="FieldSelect" :fieldProps="{type: 'Location'}"></ValidatedFormField>
                <ValidatedFormField name="type" label="Type" :as="FieldSelect" :fieldProps="{type: 'ComputerType'}"></ValidatedFormField>
                <ValidatedFormField name="user_tech" label="Technician in charge" :as="FieldSelect"
                                    :fieldProps="{type: 'User', fields: ['id', 'username', 'realname', 'firstname'], name_field: (opt) => formatUsername(opt)}">
                </ValidatedFormField>
                <ValidatedFormField name="manufacturer" label="Manufacturer" :as="FieldSelect" :fieldProps="{type: 'Manufacturer'}"></ValidatedFormField>
                <ValidatedFormField name="group_tech" label="Technician group in charge" :as="FieldSelect" :fieldProps="{type: 'Group', multiple: true}"></ValidatedFormField>
                <ValidatedFormField name="model" label="Model" :as="FieldSelect" :fieldProps="{type: 'ComputerModel'}"></ValidatedFormField>
                <ValidatedFormField name="contact_num" label="Alternate username number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="serial" label="Serial number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="contact" label="Alternate username" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="otherserial" label="Inventory number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="user" label="User" :as="FieldSelect"
                                    :fieldProps="{type: 'User', fields: ['id', 'username', 'realname', 'firstname'], name_field: (opt) => formatUsername(opt)}">
                </ValidatedFormField>
                <ValidatedFormField name="network" label="Network" :as="FieldSelect" :fieldProps="{type: 'Network'}"></ValidatedFormField>
                <ValidatedFormField name="group" label="Group" :as="FieldSelect" :fieldProps="{type: 'Group', multiple: true}"></ValidatedFormField>
                <ValidatedFormField name="uuid" label="UUID" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="comment" label="Comments" :as="Textarea" :fieldProps="{rows: 3}"></ValidatedFormField>
                <ValidatedFormField name="autoupdatesystem" label="Update source" :as="FieldSelect" :fieldProps="{type: 'AutoUpdateSystem'}"></ValidatedFormField>
            </FormFields>
            <div class="flex flex-row-reverse gap-x-2">
                <Button v-if="mainItem.item.value.id && mainItem.canUpdateItem()" type="submit" label="Save" icon="ti ti-device-floppy" class="me-2"></Button>
                <Button v-if="mainItem.item.value.id && mainItem.canDeleteItem()" type="submit" severity="warn" variant="outlined" label="Put in trashbin" icon="ti ti-trash"></Button>
                <Button v-if="!mainItem.item.value.id && mainItem.getDefinition().canCreate()" type="submit" label="Add" icon="ti ti-plus"></Button>
            </div>
        </AdvancedForm>
        <footer class="flex">
            <div class="flex flex-col">
                <span v-if="mainItem.item.value.date_creation" class="me-4 text-sm text-surface-500">Created on {{ formatDateTime(mainItem.item.value.date_creation) }}</span>
                <span v-if="mainItem.item.value.date_mod" class="text-sm text-surface-500">Last modified on {{ formatDateTime(mainItem.item.value.date_mod) }}</span>
            </div>
        </footer>
    </section>
</template>

<style scoped>

</style>