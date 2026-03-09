<script setup lang="ts">
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import FormFields from "@/components/forms/FormFields.vue";
    import { DatePicker, Fieldset, InputNumber, InputText, Message, Textarea } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import type { useAsset } from "@/composables/assets/useAsset.js";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";
    import ValidatedFormField from "@/components/forms/ValidatedFormField.vue";

    const { doGraphQLRequest } = useApi();
    const infocom_info = ref(null);
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`query {
            Infocom(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                id itemtype items_id comment value
                date_buy date_use date_order date_delivery date_inventory date_warranty date_decommission
                warranty_info warranty_value warranty_duration order_number delivery_number immo_number
                amortization_type amortization_time amortization_coeff
                business_criticity { id name }
                budget { id name }
                supplier { id name }
            }
        }`).then((res) => {
            infocom_info.value = res.data.Infocom[0] || {};
        });
    });
</script>

<template>
    <section v-if="infocom_info">
        <AdvancedForm schemaName="Infocom" :initialValues="infocom_info" class="flex flex-col gap-4 w-full sm-w-56 px-4">
            <Fieldset legend="Asset Lifecycle">
                <FormFields>
                    <ValidatedFormField name="date_order" label="Order Date" :as="DatePicker" :fieldProps="{showIcon: true}"></ValidatedFormField>
                    <ValidatedFormField name="date_purchase" label="Date of Purchase" :as="DatePicker" :fieldProps="{showIcon: true}"></ValidatedFormField>
                    <ValidatedFormField name="date_delivery" label="Delivery Date" :as="DatePicker" :fieldProps="{showIcon: true}"></ValidatedFormField>
                    <ValidatedFormField name="date_use" label="Startup Date" :as="DatePicker" :fieldProps="{showIcon: true}"></ValidatedFormField>
                    <ValidatedFormField name="date_inventory" label="Date of Last Physical Inventory" :as="DatePicker" :fieldProps="{showIcon: true}"></ValidatedFormField>
                    <ValidatedFormField name="date_decommission" label="Decommission Date" :as="DatePicker" :fieldProps="{showIcon: true}"></ValidatedFormField>
                </FormFields>
            </Fieldset>
            <Fieldset legend="Financial and Administrative Information">
                <Message severity="info" class="mb-3">Some fields are not yet implemented</Message>
                <FormFields>
                    <ValidatedFormField name="supplier" label="Supplier" :as="FieldSelect" :fieldProps="{type: 'Supplier'}"></ValidatedFormField>
                    <ValidatedFormField name="budget" label="Budget" :as="FieldSelect" :fieldProps="{type: 'Budget'}"></ValidatedFormField>
                    <ValidatedFormField name="order_number" label="Order Number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                    <ValidatedFormField name="immo_number" label="Immobilization Number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                    <ValidatedFormField name="invoice_number" label="Invoice Number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                    <ValidatedFormField name="delivery_number" label="Delivery Number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                    <ValidatedFormField name="value" label="Purchase Value" :as="InputNumber" :fieldProps="{mode: 'decimal', minFractionDigits: 2}"></ValidatedFormField>
                    <ValidatedFormField name="warranty_value" label="Warranty Value" :as="InputNumber" :fieldProps="{mode: 'decimal', minFractionDigits: 2}"></ValidatedFormField>
                    <ValidatedFormField name="business_criticity" label="Business Criticity" :as="FieldSelect" :fieldProps="{type: 'BusinessCriticity'}"></ValidatedFormField>
                    <ValidatedFormField name="comment" label="Comments" :as="Textarea" :fieldProps="{rows: 3}"></ValidatedFormField>
                </FormFields>
            </Fieldset>
            <Fieldset legend="Warranty Information">
                <Message severity="info" class="mb-3">Some fields are not yet implemented</Message>
                <FormFields>
                    <ValidatedFormField name="date_warranty" label="Start Date of Warranty" :as="DatePicker" :fieldProps="{showIcon: true}"></ValidatedFormField>
                    <ValidatedFormField name="warranty_duration" label="Warranty Duration" :as="FieldSelect"></ValidatedFormField>
                    <ValidatedFormField name="warranty_info" label="Warranty Information" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                </FormFields>
            </Fieldset>
        </AdvancedForm>
    </section>
</template>

<style scoped>

</style>