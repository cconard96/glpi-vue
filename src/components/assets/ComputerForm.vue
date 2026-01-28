<script setup lang="ts">
    import { Form, FormField } from '@primevue/forms';
    import { Button, InputText, Textarea } from "primevue";
    import { useApi } from "@/composables/useApi";
    import {onMounted, ref} from "vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import FormFields from "@/components/forms/FormFields.vue";
    import {AbstractModel} from "@/models/AbstractModel";

    const props = defineProps({
        itemtype: {
            type: String,
            required: true
        },
        items_id: {
            type: Number,
            required: true
        },
        main_item: {
            type: Object,
            required: true
        },
        main_itemtype_model: {
            type: Function as typeof AbstractModel,
            required: true
        },
    });

    const { doGraphQLRequest } = useApi();

    const status_options = ref([]);
    const location_options = ref([]);
    const type_options = ref([]);
    const manufacturer_options = ref([]);
    const model_options = ref([]);
    const user_options = ref([]);
    const user_tech_options = ref([]);
    const group_options = ref([]);
    const group_tech_options = ref([]);
    const network_options = ref([]);
    const autoupdatesystem_options = ref([]);
</script>

<template>
    <section class="h-full overflow-y-auto">
        <Form v-slot="$form" :initialValues="main_item" class="flex flex-col gap-4 w-full sm-w-56 px-4">
            <FormFields>
                <FormField name="name">
                    <label>
                        <span>Name</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="status" v-slot="$slot">
                    <FieldSelect label="Status"></FieldSelect>
                </FormField>
                <FormField name="location" v-slot="$slot">
                    <FieldSelect label="Location"></FieldSelect>
                </FormField>
                <FormField name="type" v-slot="$slot">
                    <FieldSelect label="Type"></FieldSelect>
                </FormField>
                <FormField name="user_tech" v-slot="$slot">
                    <FieldSelect label="Technician in charge"></FieldSelect>
                </FormField>
                <FormField name="manufacturer" v-slot="$slot">
                    <FieldSelect label="Manufacturer"></FieldSelect>
                </FormField>
                <FormField name="group_tech" v-slot="$slot">
                    <FieldSelect label="Group in charge" multiple></FieldSelect>
                </FormField>
                <FormField name="model" v-slot="$slot">
                    <FieldSelect label="Model"></FieldSelect>
                </FormField>
                <FormField name="contact_num">
                    <label>
                        <span>Alternate username number</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="serial">
                    <label>
                        <span>Serial number</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="contact">
                    <label>
                        <span>Alternate username</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="otherserial">
                    <label>
                        <span>Inventory number</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="user" v-slot="$slot">
                    <FieldSelect label="User"></FieldSelect>
                </FormField>
                <FormField name="network" v-slot="$slot">
                    <FieldSelect label="Network"></FieldSelect>
                </FormField>
                <FormField name="group" v-slot="$slot">
                    <FieldSelect label="Group" multiple></FieldSelect>
                </FormField>
                <FormField name="uuid">
                    <label>
                        <span>UUID</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="comment">
                    <label>
                        <span>Comments</span>
                        <Textarea rows="3"></Textarea>
                    </label>
                </FormField>
                <FormField name="autoupdatesystem" v-slot="$slot">
                    <FieldSelect label="Update source"></FieldSelect>
                </FormField>
            </FormFields>
            <div class="flex flex-row-reverse gap-x-2">
                <Button label="Save" icon="ti ti-device-floppy" class="me-2"></Button>
                <Button severity="warn" variant="outlined" label="Put in trashbin" icon="ti ti-trash"></Button>
            </div>
        </Form>
        <footer class="flex">
            <div class="flex flex-col">
                <span v-if="main_item.date_creation" class="me-4 text-sm text-surface-500">Created on {{ new Date(main_item.date_creation).toLocaleString() }}</span>
                <span v-if="main_item.date_mod" class="text-sm text-surface-500">Last modified on {{ new Date(main_item.date_mod).toLocaleString() }}</span>
            </div>
        </footer>
    </section>
</template>

<style scoped>

</style>