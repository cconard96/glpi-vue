<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import FileUpload from "@/components/forms/FileUpload.vue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import type { useAssets } from "@/composables/assets/useAssets";
    import { useDataHelper } from "@/composables/useDataHelper";

    const { doGraphQLRequest } = useApi();
    const { formatDate } = useDataHelper();
    const document_info = ref(null);
    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Document_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id document { id name date_creation filename filepath link category { id name } mime }
                }
            }
        `).then((res) => {
            const documents = res.data.Document_Item;
            document_info.value = documents.map((di) => {
                if (di.document.date_creation) {
                    di.document.date_creation = formatDate(di.document.date_creation);
                }
                return di;
            });
        });
    });
</script>

<template>
    <section v-if="document_info">
        <FileUpload></FileUpload>
        <DataTable :value="document_info" class="mt-6" :rows="document_info.length" sortMode="multiple" removableSort>
            <Column key="document.name" field="document.name" header="Name"></Column>
            <Column key="document.mime" field="document.mime" header="MIME Type"></Column>
            <Column key="document.date_creation" field="document.date_creation" header="Creation Date"></Column>
            <Column key="document.filename" field="document.filename" header="Filename"></Column>
            <Column key="document.link" field="document.link" header="Link"></Column>
            <Column key="document.category.name" field="document.category.name" header="Category"></Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>