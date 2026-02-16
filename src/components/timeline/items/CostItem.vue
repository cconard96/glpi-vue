<script setup lang="ts">
    import { Button, Card, Menu } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { components } from "../../../../data/hlapiv2_schema";
    import { inject, Ref, useTemplateRef } from "vue";
    import { useAssistanceTimelineItem } from "@/composables/useAssistanceTimelineItem";

    const props = defineProps<{
        item: components['schemas']['TicketCost'] | components['schemas']['ProblemCost'] | components['schemas']['ChangeCost'],
    }>();

    const { formatDate, formatDuration, formatCost } = useDataHelper();
    const actions_menu_el = useTemplateRef('actions_menu');
    const { item, itemBackgroundColor, actionsMenuOptions } = inject<ReturnType<typeof useAssistanceTimelineItem>>('assistanceTimelineItemInstance');
    const cost = item as Ref<components['schemas']['TicketCost'] | components['schemas']['ProblemCost'] | components['schemas']['ChangeCost']>;

    function toggleActionsMenu(e) {
        actions_menu_el.value.toggle(e);
    }
</script>

<template>
    <Card :pt:body="{
            class: `p-4 ${itemBackgroundColor}`,
            style: 'border-radius: 0.5rem;'
        }">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm"></div>
                <div class="ms-4 flex items-center">
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"
                            @click="toggleActionsMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                    <Menu ref="actions_menu" :popup="true" :model="actionsMenuOptions"></Menu>
                </div>
            </div>
        </template>
        <template #content>
            <div class="flex flex-col mb-2 -mt-2">
                <div class="grid lg:grid-cols-4 grid-cols-2 gap-y-2 gap-x-4 mb-2">
                    <div>
                        <div class="text-sm font-semibold">Cost name</div>
                        <div>{{ cost.name }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">Budget</div>
                        <div>{{ cost.budget?.name || 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">Begin Date</div>
                        <div>{{ cost.date_begin ? formatDate(cost.date_begin) : 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">End Date</div>
                        <div>{{ cost.date_end ? formatDate(cost.date_end) : 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">Duration</div>
                        <div>{{ formatDuration(cost.duration, 's') }}</div>
                    </div>
                    <div v-if="cost.cost_time">
                        <div class="text-sm font-semibold">Time Cost</div>
                        <div>{{ formatCost(cost.cost_time) }}</div>
                    </div>
                    <div v-if="cost.cost_fixed">
                        <div class="text-sm font-semibold">Fixed Cost</div>
                        <div>{{ formatCost(cost.cost_fixed) }}</div>
                    </div>
                    <div v-if="cost.cost_material">
                        <div class="text-sm font-semibold">Material Cost</div>
                        <div>{{ formatCost(cost.cost_material) }}</div>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="text-sm font-semibold">Total cost</div>
            <div class="text-lg font-bold">{{ formatCost((cost.cost_time || 0) + (cost.cost_fixed || 0) + (cost.cost_material || 0)) }}</div>
        </template>
    </Card>
</template>

<style scoped>

</style>