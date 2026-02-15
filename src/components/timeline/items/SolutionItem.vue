<script setup lang="ts">
    import { Button, Card, Tag } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { components } from "../../../../data/hlapiv2_schema";

    const props = defineProps<{
        item: components['schemas']['Solution'],
    }>();

    const { formatRelativeTime } = useDataHelper();
</script>

<template>
    <Card :pt="{
            body: {
                class: `p-2 bg-cyan-300/50 dark:bg-cyan-700/50`,
                style: `background-color: bg-cyan-300/50 dark:bg-cyan-700/50; border-radius: 0.5rem;`
            }
        }" class="max-w-200'">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm">Created {{ formatRelativeTime(item.date_creation) }}</div>
                <div class="ms-4 flex items-center">
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"></Button>
                </div>
            </div>
        </template>
        <template #content>
            <div>
                <div v-dompurify-html="item.content"></div>
            </div>
        </template>
        <template #footer class="text-sm select-none">
            <Tag v-if="item.status > 1" :severity="item.status === 2 ? 'warn' : (item.status === 3 ? 'success' : 'danger')">
                <i :class="{
                    'ti ti-clock': item.status === 2,
                    'ti ti-check': item.status === 3,
                    'ti ti-x': item.status === 4
                }" aria-label="Solution status"></i>
                {{ item.status === 2 ? 'Solved' : (item.status === 3 ? 'Accepted' : 'Refused') }}
                <time :datetime="item.status === 2 ? item.date_creation : item.date_approval" class="ms-2" aria-label="Status date">
                    {{ formatRelativeTime(item.status === 2 ? item.date_creation : item.date_approval) }}
                </time>
            </Tag>
        </template>
    </Card>
</template>

<style scoped>

</style>