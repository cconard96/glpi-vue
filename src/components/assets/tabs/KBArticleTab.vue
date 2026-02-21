<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import type { useAssets } from "@/composables/assets/useAssets";
    import { useDataHelper } from "@/composables/useDataHelper";

    const { doGraphQLRequest } = useApi();
    const { formatDate } = useDataHelper();
    const kb_info = ref(null);
    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                KBArticle_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id kbarticle { id name date_creation date_mod }
                }
            }
        `).then((res) => {
            kb_info.value = res.data.KBArticle_Item.map(kb => {
                if (kb.kbarticle.date_creation) {
                    kb.kbarticle.date_creation = formatDate(kb.kbarticle.date_creation);
                }
                if (kb.kbarticle.date_mod) {
                    kb.kbarticle.date_mod = formatDate(kb.kbarticle.date_mod);
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