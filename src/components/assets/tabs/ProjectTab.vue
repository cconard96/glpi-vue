<script setup lang="ts">
    import { Column, DataTable, ProgressBar } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { inject, onMounted, ref } from "vue";
    import type { useAsset } from "@/composables/assets/useAsset.js";

    const { doGraphQLRequest } = useApi();
    const { getUrgencyImpactPriorityLabel, formatDate } = useDataHelper();
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');
    const project_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Item_Project(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id project { id name code priority status { id name } percent_done date_creation }
                }
            }
        `).then((res) => {
            project_info.value = res.data.Item_Project.map(pi => {
                if (pi.project.date_creation) {
                    pi.project.date_creation = formatDate(pi.project.date_creation);
                }
                return pi;
            });
        });
    });
</script>

<template>
    <section v-if="project_info">
        <DataTable :value="project_info" class="mt-6" :rows="project_info.length" sortMode="multiple" removableSort>
            <Column key="project.name" field="project.name" header="Name"></Column>
            <Column key="project.code" field="project.code" header="Code"></Column>
            <Column key="project.priority" field="project.priority" header="Priority">
                <template #body="slotProps">
                    <span>{{ getUrgencyImpactPriorityLabel(slotProps.data.project.priority) }}</span>
                </template>
            </Column>
            <Column key="project.status.name" field="project.status.name" header="Status"></Column>
            <Column key="project.percent_done" field="project.percent_done" header="Percent Done">
                <template #body="slotProps">
                    <ProgressBar :value="slotProps.data.project.percent_done" :showValue="true" />
                </template>
            </Column>
            <Column key="project.date_creation" field="project.date_creation" header="Creation Date"></Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>