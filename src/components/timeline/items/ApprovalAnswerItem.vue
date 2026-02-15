<script setup lang="ts">
    import { Button, Card, Tag } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";

    const props = defineProps<{
        item: {
            approval_id: number,
            date: Date|string,
            comment: string,
            status: 3|4,
            user: {
                id: number,
                name: string
            }
        },
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
                <div class="text-sm">Created {{ formatRelativeTime(item.date) }}</div>
                <div class="ms-4 flex items-center">
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"></Button>
                </div>
            </div>
        </template>
        <template #content>
            <div>
                <div :class="item.status === 3 ? 'text-green-700' : 'text-red-700'">Approval request answer: {{ item.status === 3 ? 'Approved' : 'Refused' }}</div>
                <div v-dompurify-html="item.comment"></div>
            </div>
        </template>
        <template #footer class="text-sm select-none">

        </template>
    </Card>
</template>

<style scoped>

</style>