<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import type { useAsset } from "@/composables/assets/useAsset.js";
    import { useDataHelper } from "@/composables/useDataHelper";

    const { doGraphQLRequest } = useApi();
    const { formatDate } = useDataHelper();
    const database_info = ref(null);
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                DatabaseInstance(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id name version is_onbackup is_active status: state { id name } date_lastboot date_lastbackup
                    database { id name }
                }
            }
        `).then((res) => {
            const databases = res.data.DatabaseInstance;
            // format dates
            database_info.value = databases.map(db => {
                if (db.date_lastboot) {
                    db.date_lastboot = formatDate(db.date_lastboot);
                }
                if (db.date_lastbackup) {
                    db.date_lastbackup = formatDate(db.date_lastbackup);
                }
                return db;
            });
        });
    });
</script>

<template>
    <section v-if="database_info">
        <DataTable :value="database_info" class="mt-6" :rows="database_info.length" sortMode="multiple" removableSort>
            <Column key="name" field="name" header="Name"></Column>
            <Column key="version" field="version" header="Version"></Column>
            <Column key="is_onbackup" field="is_onbackup" header="On Backup">
                <template #body="slotProps">
                    <span>{{ slotProps.data.is_onbackup ? 'Yes' : 'No' }}</span>
                </template>
            </Column>
            <Column key="is_active" field="is_active" header="Active">
                <template #body="slotProps">
                    <span>{{ slotProps.data.is_active ? 'Yes' : 'No' }}</span>
                </template>
            </Column>
            <Column key="status.name" field="status.name" header="Status"></Column>
            <Column key="date_lastboot" field="date_lastboot" header="Last Boot Date"></Column>
            <Column key="date_lastbackup" field="date_lastbackup" header="Last Backup Date"></Column>
            <Column key="databases" header="Databases">
                <template #body="slotProps">
                    <div v-if="slotProps.data.database.length > 0">
                        <div v-for="db in slotProps.data.database" :key="db.id">
                            {{ db.name }}
                        </div>
                    </div>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>