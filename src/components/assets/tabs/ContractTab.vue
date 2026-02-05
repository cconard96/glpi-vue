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
    const contract_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Contract_Item(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id contract { id name type { id name } date_begin duration }
                }
            }
        `).then((res) => {
            const contracts = res.data.Contract_Item;
            // add date_end field to each contract
            contract_info.value = contracts.map((ci) => {
                if (ci.contract.date_begin) {
                    ci.contract.date_begin = new Date(ci.contract.date_begin).toLocaleDateString();
                }
                if (ci.contract.date_begin && ci.contract.duration) {
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