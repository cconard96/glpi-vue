<script setup lang="ts">
    import { Button, Card, Tag } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { components } from "../../../../data/hlapiv2_schema";

    const props = defineProps<{
        item: components['schemas']['Followup'],
    }>();

    const { formatRelativeTime } = useDataHelper();
</script>

<template>
    <Card :pt="{
            body: {
                class: `p-2 bg-gray-200/50 dark:bg-gray-800/50`,
                style: `background-color: bg-gray-200/50 dark:bg-gray-800/50; border-radius: 0.5rem;`
            }
        }" class="max-w-200'">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm">Created {{ formatRelativeTime(item.date_creation || item.date) }}</div>
                <div class="ms-4 flex items-center">
                    <i v-if="item.is_private" class="ti ti-eye-off" title="Private follow-up" aria-label="Private follow-up"></i>
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
            <Tag v-if="item.request_type" severity="secondary">
                <i class="ti ti-inbox me-2" aria-label="Request source"></i>
                {{ item.request_type.name }}
            </Tag>
        </template>
    </Card>
</template>

<style scoped>

</style>