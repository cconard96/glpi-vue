<script setup lang="ts">
    import {DataTable, Column} from "primevue";
    import FileUpload from "@/components/forms/FileUpload.vue";
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
    const document_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Document_Item(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id document { id name date_creation filename filepath link category { id name } mime }
                }
            }
        `).then((res) => {
            const documents = res.data.Document_Item;
            document_info.value = documents.map((di) => {
                if (di.document.date_creation) {
                    di.document.date_creation = new Date(di.document.date_creation).toLocaleDateString();
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