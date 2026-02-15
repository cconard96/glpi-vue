<script setup lang="ts">
    import { Button, Card } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { components } from "../../../../data/hlapiv2_schema";

    const props = defineProps<{
        item: components['schemas']['Document_Item'],
    }>();

    const { formatRelativeTime } = useDataHelper();
</script>

<template>
    <Card :pt="{
            body: {
                class: `p-2 bg-gray-200/50 dark:bg-gray-800/50`,
                style: `background-color: bg-gray-200/50 dark:bg-gray-800/50; border-radius: 0.5rem;`
            }
        }">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm">Uploaded {{ formatRelativeTime(item.date_creation) }}</div>
                <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"></Button>
            </div>
        </template>
        <template #content>
            <div>
                <img v-if="(item.mime || '').startsWith('image/')" :src="item.filepath" :alt="item.document.name"/>
                <div v-else class="p-2 bg-gray-300 dark:bg-gray-700 rounded">
                    <i class="ti ti-file" aria-label="File icon"></i>
                    <a :href="item.filepath" target="_blank" class="ms-2 text-blue-600 dark:text-blue-400 underline">{{ item.document.name }}</a>
                </div>
            </div>
        </template>
    </Card>
</template>

<style scoped>

</style>