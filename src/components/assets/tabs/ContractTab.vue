<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import type { useAsset } from "@/composables/assets/useAsset.js";
    import { useDataHelper } from "@/composables/useDataHelper";

    const { doGraphQLRequest } = useApi();
    const { formatDate } = useDataHelper();
    const contract_info = ref(null);
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Contract_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id contract { id name type { id name } date_begin duration }
                }
            }
        `).then((res) => {
            const contracts = res.data.Contract_Item;
            // add date_end field to each contract
            contract_info.value = contracts.map((ci) => {
                if (ci.contract.date_begin) {
                    ci.contract.date_begin = formatDate(ci.contract.date_begin);
                }
                if (ci.contract.date_begin && ci.contract.duration) {
                    //TODO This calculation should be done in the data helper composable. The Temporal API would probably provide a more accurate result too.
                    const endDate = new Date(new Date(ci.contract.date_begin).setMonth(new Date(ci.contract.date_begin).getMonth() + ci.contract.duration));
                    ci.contract.date_end = endDate.toLocaleDateString();
                } else {
                    ci.contract.date_end = 'N/A';
                }
                return ci;
            });
        });
    });
</script>

<template>
    <section v-if="contract_info">
        <DataTable :value="contract_info" class="mt-6" :rows="contract_info.length"
                   sortMode="multiple" removableSort>
            <Column key="contract.name" field="contract.name" header="Name"></Column>
            <Column key="contract.type.name" field="contract.type.name" header="Type"></Column>
            <Column key="contract.date_begin" field="contract.date_begin" header="Start Date"></Column>
            <Column key="contract.duration" field="contract.duration" header="Duration">
                <template #body="slotProps">
                    <span v-if="slotProps.data.contract.duration">{{ slotProps.data.contract.duration }} months</span>
                    <span v-else>N/A</span>
                </template>
            </Column>
            <Column key="contract.date_end" field="contract.date_end" header="End Date"></Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>