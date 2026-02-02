<script setup lang="ts">
import {defineAsyncComponent, onMounted, ref} from "vue";
    import {useApi} from "@/composables/useApi";
    import {AbstractModel} from "@/models/AbstractModel";
    import {Form, FormField} from '@primevue/forms';
    import FormFields from "@/components/forms/FormFields.vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import {InputText, DataTable, Column, Tag, useDialog, Button} from "primevue";
    import {useDataHelper} from "@/composables/useDataHelper";

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
    const { getObjectProp } = useDataHelper();
    const dialog = useDialog();
    const os_info = ref(null);
    const software_info = ref(null);
    const antivirus_info = ref(null);
    const software_columns = [
        { field: 'softwareversion.software.name', header: 'Software Name' },
        { field: 'softwareversion.name', header: 'Version' },
        { field: 'softwareversion.arch', header: 'Architecture' },
        { field: 'softwareversion.software.manufacturer.name', header: 'Publisher' },
        { field: 'softwareversion.software.category.name', header: 'Category' },
    ];

    onMounted(async () => {
        await doGraphQLRequest(`query {
            OSInstallation(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                id itemtype items_id
                operatingsystem { id name }
                version { id name }
                edition { id name }
                servicepack { id name }
                architecture { id name }
                kernel_version { id name kernel { id name } }
                license_number
                licenseid
                company
                owner
                hostid
                date_install
            }
            Antivirus(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                id itemtype items_id name manufacturer { id name } antivirus_version signature_version
                is_active is_up_to_date date_expiration
            }
        }`).then((res) => {
            os_info.value = AbstractModel.formatFieldsForForm(res.data.OSInstallation[0] || {});
            antivirus_info.value = res.data.Antivirus || [];
        });
        doGraphQLRequest(`
            query {
                SoftwareInstallation(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id
                    softwareversion {
                        id name arch
                        software {
                            id name
                            category { id name }
                            manufacturer { id name }
                        }
                    }
                }
            }
        `).then((res) => {
            software_info.value = res.data.SoftwareInstallation || [];
        });
    });

    function showSoftwareInstallDialog() {
        dialog.open(defineAsyncComponent(() => import('@/components/assets/dialogs/InstallSoftware.vue')), {
            props: {
                header: 'Install Software',
                pt: {
                    root: {
                        class: 'w-5/10 h-8/10'
                    }
                },
                modal: true,
                draggable: false,
            },
            data: {
                main_itemtype_model: props.main_itemtype_model,
                items_id: props.items_id
            }
        });
    }
</script>

<template>
    <section v-if="os_info !== null">
        <Form v-slot="$form" :initialValues="os_info" class="flex flex-col gap-4 w-full sm-w-56 px-4">
            <FormFields>
                <FormField name="operatingsystem" v-slot="$slot">
                    <FieldSelect label="Name"></FieldSelect>
                </FormField>
                <FormField name="version" v-slot="$slot">
                    <FieldSelect label="Version"></FieldSelect>
                </FormField>
                <FormField name="architecture" v-slot="$slot">
                    <FieldSelect label="Architecture"></FieldSelect>
                </FormField>
                <FormField name="servicepack" v-slot="$slot">
                    <FieldSelect label="Service pack"></FieldSelect>
                </FormField>
                <FormField name="kernel_version" v-slot="$slot">
                    <FieldSelect label="Kernel"></FieldSelect>
                </FormField>
                <FormField name="edition" v-slot="$slot">
                    <FieldSelect label="Edition"></FieldSelect>
                </FormField>
                <FormField name="licenceid">
                    <label>
                        <span>Product ID</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="license_number">
                    <label>
                        <span>Serial number</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="company">
                    <label>
                        <span>Company</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="owner">
                    <label>
                        <span>Owner</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
                <FormField name="date_install">
                    <div class="flex items-baseline">
                        <span class="w-1/3 text-end me-4">Installation date</span>
                        <time class="w-2/3" :datetime="os_info.date_install" v-text="new Date(os_info.date_install).toLocaleDateString()"></time>
                    </div>
                </FormField>
                <FormField name="hostid">
                    <label>
                        <span>Host ID</span>
                        <InputText type="text"></InputText>
                    </label>
                </FormField>
            </FormFields>
        </Form>
        <DataTable v-if="antivirus_info !== null" :value="antivirus_info" class="mt-6" :rows="antivirus_info.length"
                   sortMode="multiple" removableSort>
            <template #header>
                <h3 class="text-lg font-semibold">Installed Antivirus</h3>
            </template>
            <Column field="name" header="Antivirus Name" :sortable="true">
                <template #body="slotProps">
                    <span>{{ getObjectProp(slotProps.data, 'name') }}</span>
                </template>
            </Column>
            <Column field="manufacturer.name" header="Manufacturer" :sortable="true">
                <template #body="slotProps">
                    <span>{{ getObjectProp(slotProps.data, 'manufacturer.name') }}</span>
                </template>
            </Column>
            <Column field="antivirus_version" header="Antivirus Version" :sortable="true">
                <template #body="slotProps">
                    <span>{{ getObjectProp(slotProps.data, 'antivirus_version') }}</span>
                </template>
            </Column>
            <Column field="signature_version" header="Signature Version" :sortable="true">
                <template #body="slotProps">
                    <span>{{ getObjectProp(slotProps.data, 'signature_version') }}</span>
                </template>
            </Column>
            <Column field="is_active" header="Active" :sortable="true">
                <template #body="slotProps">
                    <Tag :severity="slotProps.data.is_active ? 'success' : 'danger'">
                        {{ slotProps.data.is_active ? 'Yes' : 'No' }}
                    </Tag>
                </template>
            </Column>
            <Column field="is_up_to_date" header="Up to date" :sortable="true">
                <template #body="slotProps">
                    <Tag :severity="slotProps.data.is_up_to_date ? 'success' : 'danger'">
                        {{ slotProps.data.is_up_to_date ? 'Yes' : 'No' }}
                    </Tag>
                </template>
            </Column>
            <Column field="date_expiration" header="Expiration Date" :sortable="true">
                <template #body="slotProps">
                    <span v-if="slotProps.data.date_expiration">
                        {{ new Date(slotProps.data.date_expiration).toLocaleDateString() }}
                    </span>
                    <span v-else>
                        N/A
                    </span>
                </template>
            </Column>
        </DataTable>
        <DataTable v-if="software_info !== null" :value="software_info" class="mt-6" :rows="software_info.length"
                   sortMode="multiple" removableSort>
            <template #header>
                <div class="flex items-center gap-4">
                    <h3 class="text-lg font-semibold">Installed Software</h3>
                    <Button icon="ti ti-plus" label="Add Software" @click="showSoftwareInstallDialog" size="small"></Button>
                </div>
            </template>
            <Column v-for="(col, index) of software_columns" :key="index" :field="col.field" :header="col.header"
                    :sortable="true">
                <template #body="slotProps">
                    <span>{{ getObjectProp(slotProps.data, col.field) }}</span>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>