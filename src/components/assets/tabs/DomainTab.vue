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
    const domain_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Domain_Item(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id is_dynamic domain { id name type { id name } date_domain_creation date_expiration } relation { id name }
                }
            }
        `).then((res) => {
            const domains = res.data.Domain_Item;
            domain_info.value = domains.map((di) => {
                if (di.domain.date_domain_creation) {
                    di.domain.date_domain_creation = new Date(di.domain.date_domain_creation).toLocaleDateString();
                }
                if (di.domain.date_expiration) {
                    di.domain.date_expiration = new Date(di.domain.date_expiration).toLocaleDateString();
                }
                return di;
            });
        });
    });
</script>

<template>
    <section v-if="domain_info">
        <DataTable :value="domain_info" class="mt-6" :rows="domain_info.length" sortMode="multiple" removableSort>
            <Column key="domain.name" field="domain.name" header="Name"></Column>
            <Column key="domain.type.name" field="domain.type.name" header="Type"></Column>
            <Column key="relation.name" field="relation.name" header="Relation"></Column>
            <Column key="domain.date_domain_creation" field="domain.date_domain_creation" header="Domain Creation Date"></Column>
            <Column key="domain.date_expiration" field="domain.date_expiration" header="Expiration Date"></Column>
            <Column key="is_dynamic" field="is_dynamic" header="Is Dynamic">
                <template #body="slotProps">
                    <span>{{ slotProps.data.is_dynamic ? 'Yes' : 'No' }}</span>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>