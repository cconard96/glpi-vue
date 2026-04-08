<script setup lang="ts">
    import { defineAsyncComponent, inject, onMounted, ref } from "vue";
    import { useApi } from "@/composables/useApi";
    import FormFields from "@/components/forms/FormFields.vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import { Button, Column, DataTable, InputText, Message, Tag, useDialog } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { AssetCapabilities, useAsset } from "@/composables/assets/useAsset.js";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";
    import ValidatedFormField from "@/components/forms/ValidatedFormField.vue";

    const { doGraphQLRequest, getComponentSchema } = useApi();
    const { getObjectProp, formatDate } = useDataHelper();
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');
    const hasSoftwareCapability = mainItem.hasCapability(AssetCapabilities.HasSoftware);
    const hasOSCapability = mainItem.hasCapability(AssetCapabilities.HasOS);
    const hasAntivirusCapability = mainItem.hasCapability(AssetCapabilities.HasAntiviruses);
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
        if (hasOSCapability) {
            doGraphQLRequest(`query {
                OSInstallation(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
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
            }`).then((res) => {
                getComponentSchema('OSInstallation').then(osinstallSchema => {
                    os_info.value = res.data.OSInstallation[0] || {};
                });
            });
        }
        if (hasAntivirusCapability) {
            doGraphQLRequest(`query {
                Antivirus(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id name manufacturer { id name } antivirus_version signature_version
                    is_active is_up_to_date date_expiration
                }
            }`).then((res) => {
                antivirus_info.value = res.data.Antivirus || [];
            });
        }
        if (hasSoftwareCapability) {
            doGraphQLRequest(`
                query {
                    SoftwareInstallation(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
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
        }
    });

    function showSoftwareInstallDialog() {
        dialog.open(defineAsyncComponent(() => import('@/components/assets/dialogs/InstallSoftware.vue')), {
            props: {
                header: 'Install Software',
                modal: true,
                draggable: false,
            },
        });
    }
</script>

<template>
    <section v-if="os_info !== null">
        <AdvancedForm schemaName="OSInstallation" :initialValues="os_info" class="flex flex-col gap-4 w-full sm-w-56 px-4">
            <FormFields>
                <ValidatedFormField name="operatingsystem" label="Name" :as="FieldSelect" :fieldProps="{type: 'OperatingSystem'}"></ValidatedFormField>
                <ValidatedFormField name="version" label="Version" :as="FieldSelect" :fieldProps="{type: 'OperatingSystemVersion'}"></ValidatedFormField>
                <ValidatedFormField name="architecture" label="Architecture" :as="FieldSelect" :fieldProps="{type: 'OperatingSystemArchitecture'}"></ValidatedFormField>
                <ValidatedFormField name="servicepack" label="Service Pack" :as="FieldSelect" :fieldProps="{type: 'OperatingSystemServicePack'}"></ValidatedFormField>
                <ValidatedFormField name="kernel_version" label="Kernel" :as="FieldSelect" :fieldProps="{type: 'OperatingSystemKernelVersion'}"></ValidatedFormField>
                <ValidatedFormField name="edition" label="Edition" :as="FieldSelect" :fieldProps="{type: 'OperatingSystemEdition'}"></ValidatedFormField>
                <ValidatedFormField name="licenceid" label="Product ID" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="license_number" label="Serial number" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="company" label="Company" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField name="owner" label="Owner" :as="InputText" :fieldProps="{type: 'text'}"></ValidatedFormField>
                <ValidatedFormField v-if="os_info.date_install" name="date_install">
                    <div class="flex items-baseline">
                        <span class="w-1/3 text-end me-4">Installation date</span>
                        <time class="w-2/3" :datetime="os_info.date_install" v-text="formatDate(os_info.date_install)"></time>
                    </div>
                </ValidatedFormField>
                <ValidatedFormField name="hostid">
                    <label>
                        <span>Host ID</span>
                        <InputText type="text"></InputText>
                    </label>
                </ValidatedFormField>
            </FormFields>
        </AdvancedForm>
        <DataTable v-if="antivirus_info !== null" :value="antivirus_info" class="mt-6" :rows="antivirus_info.length" sortMode="multiple" removableSort>
            <template #empty>
                <Message severity="info">No results found.</Message>
            </template>
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
                        {{ formatDate(slotProps.data.date_expiration) }}
                    </span>
                    <span v-else>
                        N/A
                    </span>
                </template>
            </Column>
        </DataTable>
        <DataTable v-if="software_info !== null" :value="software_info" class="mt-6" :rows="software_info.length" sortMode="multiple" removableSort>
            <template #empty>
                <Message severity="info">No results found.</Message>
            </template>
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