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
    const kb_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                KBArticle_Item(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id kbarticle { id name date_creation date_mod }
                }
            }
        `).then((res) => {
            kb_info.value = res.data.KBArticle_Item.map(kb => {
                if (kb.kbarticle.date_creation) {
                    kb.kbarticle.date_creation = new Date(kb.kbarticle.date_creation).toLocaleDateString();
                }
                if (kb.kbarticle.date_mod) {
                    kb.kbarticle.date_mod = new Date(kb.kbarticle.date_mod).toLocaleDateString();
                }
                return kb;
            });
        });
    });
</script>

<template>
    <section v-if="kb_info">
        <DataTable :value="kb_info" class="mt-6" :rows="kb_info.length" sortMode="multiple" removableSort>
            <Column key="kbarticle.name" field="kbarticle.name" header="Name"></Column>
            <Column key="kbarticle.date_creation" field="kbarticle.date_creation" header="Creation Date"></Column>
            <Column key="kbarticle.date_mod" field="kbarticle.date_mod" header="Modification Date"></Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>