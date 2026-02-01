<script setup lang="ts">
    import {onMounted, ref} from "vue";
    import {useApi} from "@/composables/useApi";
    import {AbstractModel} from "@/models/AbstractModel";
    import {Form, FormField} from '@primevue/forms';
    import FormFields from "@/components/forms/FormFields.vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import {InputText, DataTable, Column} from "primevue";

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
    const os_info = ref(null);
    const software_info = ref(null);
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
        }`).then((res) => {
            os_info.value = AbstractModel.formatFieldsForForm(res.data.data.OSInstallation[0] || {});
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
            software_info.value = res.data.data.SoftwareInstallation || [];
        });
    });

    function getObjectProp(obj: Object, path: string): any {
        return path.split('.').reduce((o, p) => (o ? o[p] : null), obj);
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
        <DataTable v-if="software_info !== null" :value="software_info" class="mt-6" :rows="software_info.length"
                   sortMode="multiple" removableSort>
            <template #header>
                <h3 class="text-lg font-semibold">Installed Software</h3>
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