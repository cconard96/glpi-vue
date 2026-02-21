<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import type { useAssets } from "@/composables/assets/useAssets";

    const { doGraphQLRequest } = useApi();
    const line_info = ref(null);
    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Item_Line(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id line { id name type { id name } caller_name caller_num operator { id name } }
                }
            }
        `).then((res) => {
            line_info.value = res.data.Item_Line;
        });
    });
</script>

<template>
    <section v-if="line_info">
        <DataTable :value="line_info" class="mt-6" :rows="line_info.length" sortMode="multiple" removableSort>
            <Column key="line.name" field="line.name" header="Name"></Column>
            <Column key="line.type.name" field="line.type.name" header="Type"></Column>
            <Column key="line.caller_name" field="line.caller_name" header="Caller Name"></Column>
            <Column key="line.caller_num" field="line.caller_num" header="Caller Number"></Column>
            <Column key="line.operator.name" field="line.operator.name" header="Operator"></Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>