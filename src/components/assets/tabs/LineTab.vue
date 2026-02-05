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
    const line_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Item_Line(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
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