<script setup lang="ts">
    import Card from '@cjdevstudios/bumblevue/card';
    import { useDataHelper } from '@/common/useDataHelper';
    import type { CardOptions, CardValue } from '@/common/dashboard/dashboard';

    const props = defineProps<{
        gridstack_id: string;
        options: CardOptions<'articleList'>;
        value: CardValue<'articleList'> | null;
    }>();

    const { formatDateTime } = useDataHelper();
</script>

<template>
    <div class="h-full border rounded p-2" :style="`border-color: ${options.color ?? 'inherit'};`">
        <div class="flex items-center gap-2 mb-2">
            <i :class="`pi ${value?.icon} text-lg`"></i>
            <div class="font-semibold">{{ value?.label }}</div>
        </div>
        <ul class="flex gap-4 flex-col overflow-y-auto max-h-[calc(100%-2.5rem)]">
            <li v-for="article in value?.articles ?? []" :key="article.label" class="mb-1">
                <Card :pt="{ body: { class: 'p-0 gap-2' } }">
                    <template #header>
                        <span class="font-semibold">{{ article.label }}</span>
                    </template>
                    <template #subtitle>
                        <address class="flex text-sm justify-between">
                            <span>{{ article.author }}</span>
                            <time :datetime="article.date" class="ml-1">{{ formatDateTime(article.date) }}</time>
                        </address>
                    </template>
                    <template #content>
                        <div v-dompurify-html="article.content"></div>
                    </template>
                </Card>
            </li>
        </ul>
    </div>
</template>

<style scoped>

</style>