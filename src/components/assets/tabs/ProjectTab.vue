<script setup lang="ts">
    import {DataTable, Column, ProgressBar} from "primevue";
    import {AbstractModel} from "@/models/AbstractModel";
    import {useApi} from "@/composables/useApi";
    import {useDataHelper} from "@/composables/useDataHelper";
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
    const { getUrgencyImpactPriorityLabel } = useDataHelper();
    const project_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Item_Project(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id project { id name code priority status { id name } percent_done date_creation }
                }
            }
        `).then((res) => {
            project_info.value = res.data.Item_Project.map(pi => {
                if (pi.project.date_creation) {
                    pi.project.date_creation = new Date(pi.project.date_creation).toLocaleDateString();
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