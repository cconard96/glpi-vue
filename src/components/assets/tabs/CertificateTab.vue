<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import type { useAsset } from "@/composables/assets/useAsset.js";

    const { doGraphQLRequest } = useApi();
    const { formatDate } = useDataHelper();
    const certificate_info = ref(null);
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Certificate_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id certificate { id name dns_name dns_suffix date_creation date_expiration status { id name } }
                }
            }
        `).then((res) => {
            certificate_info.value = res.data.Certificate_Item.map(ci => {
                if (ci.certificate.date_creation) {
                    ci.certificate.date_creation = formatDate(ci.certificate.date_creation);
                }
                if (ci.certificate.date_expiration) {
                    ci.certificate.date_expiration = formatDate(ci.certificate.date_expiration);
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