<script setup lang="ts">
    import {DataTable, Column} from "primevue";
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
    const certificate_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Certificate_Item(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id certificate { id name dns_name dns_suffix date_creation date_expiration status { id name } }
                }
            }
        `).then((res) => {
            certificate_info.value = res.data.Certificate_Item.map(ci => {
                if (ci.certificate.date_creation) {
                    ci.certificate.date_creation = new Date(ci.certificate.date_creation).toLocaleDateString();
                }
                if (ci.certificate.date_expiration) {
                    ci.certificate.date_expiration = new Date(ci.certificate.date_expiration).toLocaleDateString();
                }
                return ci;
            });
        });
    });
</script>

<template>
    <section v-if="certificate_info">
        <DataTable :value="certificate_info" class="mt-6" :rows="certificate_info.length"
                   sortMode="multiple" removableSort>
            <Column key="certificate.name" field="certificate.name" header="Name"></Column>
            <Column key="certificate.type.name" field="certificate.type.name" header="Type"></Column>
            <Column key="certificate.dns_name" field="certificate.dns_name" header="DNS Name"></Column>
            <Column key="certificate.dns_suffix" field="certificate.dns_suffix" header="DNS Suffix"></Column>
            <Column key="certificate.date_creation" field="certificate.date_creation" header="Creation Date"></Column>
            <Column key="certificate.date_expiration" field="certificate.date_expiration" header="Expiration Date"></Column>
            <Column key="certificate.status.name" field="certificate.status.name" header="Status"></Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>