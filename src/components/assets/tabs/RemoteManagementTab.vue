<script setup lang="ts">
    import {DataTable, Column, Button} from "primevue";
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
    const remote_mgmt_info = ref(null);

    function getRemoteLinks(type: string, remoteid: string): Array<{uri: string, label: string}> {
        switch (type.toLowerCase()) {
            case 'anydesk':
                return [
                    {uri: `anydesk://${remoteid}`, label: 'Connect'},
                ];
            case 'teamviewer':
                return [
                    {uri: `https://start.teamviewer.com/${remoteid}`, label: 'Connect'},
                ];
            case 'supremo':
                return [
                    {uri: `supremo://${remoteid}`, label: 'Connect'},
                ];
            case 'rustdesk':
                return [
                    {uri: `rustdesk://${remoteid}`, label: 'Connect'},
                    {uri: `rustdesk://${remoteid}/r`, label: 'Connect (Force relay)'},
                ];
            default:
                return [];
        }
    }

    function getRemoteTypeLabel(type: string): string {
        switch (type.toLowerCase()) {
            case 'anydesk':
                return 'AnyDesk';
            case 'teamviewer':
                return 'TeamViewer';
            case 'supremo':
                return 'Supremo';
            case 'rustdesk':
                return 'RustDesk';
            case 'litemanager':
                return 'LiteManager';
            case 'meshcentral':
                return 'MeshCentral';
            default:
                return type;
        }
    }

    onMounted(() => {
        doGraphQLRequest(`
                query {
                    RemoteManagement(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                        id itemtype items_id type remoteid
                    }
                }
            `).then((res) => {
            remote_mgmt_info.value = res.data.RemoteManagement;
        });
    });
</script>

<template>
    <section v-if="remote_mgmt_info">
        <DataTable :value="remote_mgmt_info" class="mt-6" :rows="remote_mgmt_info.length"
                   sortMode="multiple" removableSort>
            <Column key="type" field="type" header="Type">
                <template #body="slotProps">{{ getRemoteTypeLabel(slotProps.data.type) }}</template>
            </Column>
            <Column key="remoteid" field="remoteid" header="Remote ID">
                <template #body="slotProps">{{ slotProps.data.remoteid }}</template>
            </Column>
            <Column key="actions" header="Actions">
                <template #body="slotProps">
                    <div v-for="link in getRemoteLinks(slotProps.data.type, slotProps.data.remoteid)" :key="link.uri" class="mb-2">
                        <Button as="a" :href="link.uri" target="_blank" rel="noopener noreferrer">
                            <span class="p-button-label">{{ link.label }}</span>
                        </Button>
                    </div>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>