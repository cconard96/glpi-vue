<script setup lang="ts">
    defineProps<{
        item: { [key: string]: any };
    }>();
</script>

<template>
    <div class="kanban-card bg-surface-0 dark:bg-surface-900 rounded shadow p-4 border border-surface-100 dark:border-surface-700 select-none cursor-pointer">
        <slot name="card-content" :item="item">
            {{ item.title }}
        </slot>
    </div>
</template>

<style scoped>

</style>