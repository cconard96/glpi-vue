<script setup lang="ts">
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import FormFields from "@/components/forms/FormFields.vue";
    import {InputText, DatePicker, Fieldset, InputNumber, Textarea} from "primevue";
    import {Form, FormField} from "@primevue/forms";
    import {AbstractModel} from "@/models/AbstractModel";
    import {useApi} from "@/composables/useApi";
    import {onMounted, ref} from "vue";

    const props = defineProps({
        main_itemtype_model: {
            type: Function as typeof AbstractModel,
            required: true
        },
        items_id: {
            type: Number,
            required: true
        }
    });

    const { doGraphQLRequest } = useApi();
    const infocom_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`query {
            Infocom(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                id itemtype items_id comment value
                date_buy date_use date_order date_delivery date_inventory date_warranty date_decommission
                warranty_info warranty_value warranty_duration order_number delivery_number immo_number
                amortization_type amortization_time amortization_coeff
                business_criticity { id name }
                budget { id name }
                supplier { id name }
            }
        }`).then((res) => {
            infocom_info.value = AbstractModel.formatFieldsForForm(res.data.data.Infocom[0] || {});
        });
    })
</script>

<template>
    <section v-if="infocom_info">
        <Form v-slot="$form" :initialValues="infocom_info" class="flex flex-col gap-4 w-full sm-w-56 px-4">
            <Fieldset legend="Asset Lifecycle">
                <FormFields>
                    <FormField name="date_order" v-slot="$slot">
                        <label>
                            <span>Order Date</span>
                            <DatePicker showIcon></DatePicker>
                        </label>
                    </FormField>
                    <FormField name="date_purchase" v-slot="$slot">
                        <label>
                            <span>Date of Purchase</span>
                            <DatePicker showIcon></DatePicker>
                        </label>
                    </FormField>
                    <FormField name="date_delivery" v-slot="$slot">
                        <label>
                            <span>Delivery Date</span>
                            <DatePicker showIcon></DatePicker>
                        </label>
                    </FormField>
                    <FormField name="date_use" v-slot="$slot">
                        <label>
                            <span>Startup Date</span>
                            <DatePicker showIcon></DatePicker>
                        </label>
                    </FormField>
                    <FormField name="date_inventory" v-slot="$slot">
                        <label>
                            <span>Date of Last Physical Inventory</span>
                            <DatePicker showIcon></DatePicker>
                        </label>
                    </FormField>
                    <FormField name="date_decommission" v-slot="$slot">
                        <label>
                            <span>Decommission Date</span>
                            <DatePicker showIcon></DatePicker>
                        </label>
                    </FormField>
                </FormFields>
            </Fieldset>
            <Fieldset legend="Financial and Administrative Information">
                <FormFields>
                    <FormField name="supplier" v-slot="$slot">
                        <FieldSelect label="Supplier"></FieldSelect>
                    </FormField>
                    <FormField name="budget" v-slot="$slot">
                        <FieldSelect label="Budget"></FieldSelect>
                    </FormField>
                    <FormField name="order_number">
                        <label>
                            <span>Order Number</span>
                            <InputText type="text"></InputText>
                        </label>
                    </FormField>
                    <FormField name="immo_number">
                        <label>
                            <span>Immobilization Number</span>
                            <InputText type="text"></InputText>
                        </label>
                    </FormField>
                    <FormField name="invoice_number">
                        <label>
                            <span>Invoice Number</span>
                            <InputText type="text"></InputText>
                        </label>
                    </FormField>
                    <FormField name="delivery_number">
                        <label>
                            <span>Delivery Number</span>
                            <InputText type="text"></InputText>
                        </label>
                    </FormField>
                    <FormField name="value">
                        <label>
                            <span>Purchase Value</span>
                            <InputNumber mode="decimal" minFractionDigits="2"></InputNumber>
                        </label>
                    </FormField>
                    <FormField name="warranty_value">
                        <label>
                            <span>Warranty Value</span>
                            <InputNumber mode="decimal" minFractionDigits="2"></InputNumber>
                        </label>
                    </FormField>
                    <FormField name="business_criticity" v-slot="$slot">
                        <FieldSelect label="Business Criticity"></FieldSelect>
                    </FormField>
                    <FormField name="comment">
                        <label>
                            <span>Comments</span>
                            <Textarea rows="3"></Textarea>
                        </label>
                    </FormField>
                </FormFields>
            </Fieldset>
            <Fieldset legend="Warranty Information">
                <FormFields>
                    <FormField name="date_warranty" v-slot="$slot">
                        <label>
                            <span>Start Date of Warranty</span>
                            <DatePicker showIcon></DatePicker>
                        </label>
                    </FormField>
                    <FormField name="warranty_duration" v-slot="$slot">
                        <FieldSelect label="Warranty Duration"></FieldSelect>
                    </FormField>
                    <FormField name="warranty_info">
                        <label>
                            <span>Warranty Information</span>
                            <InputText type="text"></InputText>
                        </label>
                    </FormField>
                </FormFields>
            </Fieldset>
        </Form>
    </section>
</template>

<style scoped>

</style>