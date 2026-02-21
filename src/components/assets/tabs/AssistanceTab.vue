<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import type { useAssets } from "@/composables/assets/useAssets";

    const { doGraphQLRequest } = useApi();
    const { getUrgencyImpactPriorityLabel, formatDateTime } = useDataHelper();
    const assistance_info = ref(null);
    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Change_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id change { id name date begin_waiting_date resolution_date date_solve date_close priority urgency impact category { id name } }
                }
                Ticket_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id ticket { id name date begin_waiting_date resolution_date date_solve date_close priority urgency impact category { id name } }
                }
                Problem_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id problem { id name date begin_waiting_date resolution_date date_solve date_close priority urgency impact category { id name } }
                }
            }
        `).then((res) => {
            const changes = res.data.Change_Item.map(ci => ({...ci.change, itemtype: 'Change'}));
            const tickets =  res.data.Ticket_Item.map(ti => ({...ti.ticket, itemtype: 'Ticket'}));
            const problems = res.data.Problem_Item.map(pi => ({...pi.problem, itemtype: 'Problem'}));
            assistance_info.value = [...changes, ...tickets, ...problems].map(ai => {
                if (ai.date) {
                    ai.date = formatDateTime(ai.date);
                }
                if (ai.begin_waiting_date) {
                    ai.begin_waiting_date = formatDateTime(ai.begin_waiting_date);
                }
                if (ai.resolution_date) {
                    ai.resolution_date = formatDateTime(ai.resolution_date);
                }
                if (ai.date_solve) {
                    ai.date_solve = formatDateTime(ai.date_solve);
                }
                if (ai.date_close) {
                    ai.date_close = formatDateTime(ai.date_close);
                }
                return ai;
            });
        });
    });
</script>

<template>
    <section v-if="assistance_info">
        <DataTable :value="assistance_info" class="mt-6" :rows="assistance_info.length" sortMode="multiple" removableSort>
            <Column key="itemtype" field="itemtype" header="Type"></Column>
            <Column key="name" field="name" header="Name"></Column>
            <Column key="date" field="date" header="Date"></Column>
            <Column key="begin_waiting_date" field="begin_waiting_date" header="Begin Waiting Date"></Column>
            <Column key="resolution_date" field="resolution_date" header="Resolution Date"></Column>
            <Column key="date_solve" field="date_solve" header="Solve Date"></Column>
            <Column key="date_close" field="date_close" header="Close Date"></Column>
            <Column key="priority" field="priority" header="Priority">
                <template #body="slotProps">
                    <span>{{ getUrgencyImpactPriorityLabel(slotProps.data.priority) }}</span>
                </template>
            </Column>
            <Column key="urgency" field="urgency" header="Urgency">
                <template #body="slotProps">
                    <span>{{ getUrgencyImpactPriorityLabel(slotProps.data.urgency) }}</span>
                </template>
            </Column>
            <Column key="impact" field="impact" header="Impact">
                <template #body="slotProps">
                    <span>{{ getUrgencyImpactPriorityLabel(slotProps.data.impact) }}</span>
                </template>
            </Column>
            <Column key="category.name" field="category.name" header="Category"></Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>