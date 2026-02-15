<script setup lang="ts">
    import { Card } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { components } from "../../../../data/hlapiv2_schema";

    const props = defineProps<{
        item: components['schemas']['TicketCost'] | components['schemas']['ProblemCost'] | components['schemas']['ChangeCost'],
    }>();

    const { formatDate, formatDuration, formatCost } = useDataHelper();
</script>

<template>
    <Card :pt="{
                body: {
                    class: `p-4 bg-gray-200/50 dark:bg-gray-800/50`,
                    style: 'border-radius: 0.5rem;'
                }
            }">
        <template #content>
            <div class="flex flex-col mb-2 -mt-2">
                <div class="grid lg:grid-cols-4 grid-cols-2 gap-y-2 gap-x-4 mb-2">
                    <div>
                        <div class="text-sm font-semibold">Cost name</div>
                        <div>{{ item.name }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">Budget</div>
                        <div>{{ item.budget?.name || 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">Begin Date</div>
                        <div>{{ item.date_begin ? formatDate(item.date_begin) : 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">End Date</div>
                        <div>{{ item.date_end ? formatDate(item.date_end) : 'N/A' }}</div>
                    </div>
                    <div>
                        <div class="text-sm font-semibold">Duration</div>
                        <div>{{ formatDuration(item.duration, 's') }}</div>
                    </div>
                    <div v-if="item.cost_time">
                        <div class="text-sm font-semibold">Time Cost</div>
                        <div>{{ formatCost(item.cost_time) }}</div>
                    </div>
                    <div v-if="item.cost_fixed">
                        <div class="text-sm font-semibold">Fixed Cost</div>
                        <div>{{ formatCost(item.cost_fixed) }}</div>
                    </div>
                    <div v-if="item.cost_material">
                        <div class="text-sm font-semibold">Material Cost</div>
                        <div>{{ formatCost(item.cost_material) }}</div>
                    </div>
                </div>
            </div>
        </template>
        <template #footer>
            <div class="text-sm font-semibold">Total cost</div>
            <div class="text-lg font-bold">{{ formatCost((item.cost_time || 0) + (item.cost_fixed || 0) + (item.cost_material || 0)) }}</div>
        </template>
    </Card>
</template>

<style scoped>

</style>