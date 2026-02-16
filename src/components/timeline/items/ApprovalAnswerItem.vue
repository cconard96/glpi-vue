<script setup lang="ts">
    import { Card, Button } from "primevue";
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

    function scrollToOriginalRequest() {
        const originalRequestElement = document.getElementById(`Validation-${props.item.approval_id}`);
        if (originalRequestElement) {
            originalRequestElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            originalRequestElement.focus();
            originalRequestElement.classList.add('animate-[pulse_0.5s_linear_infinite]');
            setTimeout(() => {
                originalRequestElement.classList.remove('animate-[pulse_0.5s_linear_infinite]');
            }, 1000);
        }
    }
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
            </div>
        </template>
        <template #content>
            <div>
                <Button variant="link" size="small" class="p-0 text-inherit font-bold" @click="scrollToOriginalRequest">Original request</Button>
                <div :class="item.status === 3 ? 'text-green-700' : 'text-red-700'">Approval request answer: {{ item.status === 3 ? 'Approved' : 'Refused' }}</div>
                <div v-dompurify-html="item.comment"></div>
            </div>
        </template>
    </Card>
</template>

<style scoped>

</style>