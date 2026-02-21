<script setup lang="ts">
    import { Form, FormField, FormSubmitEvent } from '@primevue/forms';
    import { Button, InputText, Message, Textarea, useToast } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, ref } from "vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import FormFields from "@/components/forms/FormFields.vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useOpenAPIForm } from "@/composables/useOpenAPIForm";
    import { useRouter } from "vue-router";
    import { createItem, type useAssets } from "@/composables/assets/useAssets";

    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');
    const { doGraphQLRequest, doApiRequest } = useApi();
    const { formatUsername, formatDateTime } = useDataHelper();
    const { resolveFields, formatFieldsForForm } = useOpenAPIForm(mainItem.getSchema());
    const initialValues = formatFieldsForForm(mainItem.item.value);
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
                name: 'ItemForm',
                params: {
                    component_module: mainItem.getDefinition().module,
                    itemtype: 'Computer',
                    id: parseInt(new_id)
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
        <Form v-slot="$form" :initialValues="initialValues" class="flex flex-col gap-4 w-full sm-w-56 px-4" @submit="onFormSubmit" :resolver="resolveFields">
            <FormFields>
                <FormField name="name" v-slot="$slot">
                    <label>
                        <span>Name</span>
                        <InputText type="text"></InputText>
                    </label>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="status" v-slot="$slot">
                    <FieldSelect label="Status" type="State"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="location" v-slot="$slot">
                    <FieldSelect label="Location" type="Location"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="type" v-slot="$slot">
                    <FieldSelect label="Type" type="ComputerType"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="user_tech" v-slot="$slot">
                    <FieldSelect label="Technician in charge" type="User" :fields="['id', 'username', 'realname', 'firstname']" :name_field="(opt) => formatUsername(opt)"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="manufacturer" v-slot="$slot">
                    <FieldSelect label="Manufacturer" type="Manufacturer"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="group_tech" v-slot="$slot">
                    <FieldSelect label="Group in charge" type="Group" multiple></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="model" v-slot="$slot">
                    <FieldSelect label="Model" type="ComputerModel"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="contact_num" v-slot="$slot">
                    <label>
                        <span>Alternate username number</span>
                        <InputText type="text"></InputText>
                    </label>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="serial" v-slot="$slot">
                    <label>
                        <span>Serial number</span>
                        <InputText type="text"></InputText>
                    </label>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="contact" v-slot="$slot">
                    <label>
                        <span>Alternate username</span>
                        <InputText type="text"></InputText>
                    </label>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="otherserial" v-slot="$slot">
                    <label>
                        <span>Inventory number</span>
                        <InputText type="text"></InputText>
                    </label>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="user" v-slot="$slot">
                    <FieldSelect label="User" type="User" :fields="['id', 'username', 'realname', 'firstname']" :name_field="(opt) => formatUsername(opt)"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="network" v-slot="$slot">
                    <FieldSelect label="Network" type="Network"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="group" v-slot="$slot">
                    <FieldSelect label="Group" type="Group" multiple></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="uuid" v-slot="$slot">
                    <label>
                        <span>UUID</span>
                        <InputText type="text"></InputText>
                    </label>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="comment" v-slot="$slot">
                    <label>
                        <span>Comments</span>
                        <Textarea rows="3"></Textarea>
                    </label>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
                <FormField name="autoupdatesystem" v-slot="$slot">
                    <FieldSelect label="Update source"></FieldSelect>
                    <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
                </FormField>
            </FormFields>
            <div class="flex flex-row-reverse gap-x-2">
                <Button v-if="mainItem.item.value.id && mainItem.canUpdateItem()" type="submit" label="Save" icon="ti ti-device-floppy" class="me-2"></Button>
                <Button v-if="mainItem.item.value.id && mainItem.canDeleteItem()" type="submit" severity="warn" variant="outlined" label="Put in trashbin" icon="ti ti-trash"></Button>
                <Button v-if="!mainItem.item.value.id && mainItem.getDefinition().canCreate()" type="submit" label="Add" icon="ti ti-plus"></Button>
            </div>
        </Form>
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