<script setup lang="ts">
    import DashboardFilter from "@/common/dashboard/DashboardFilter.vue";

    const props = defineProps<{
        filters: Record<string, any>;
    }>();

    const emit = defineEmits<{
        (e: 'update:filterValue', key: string, value: any): void;
        (e: 'clear:filterValue', key: string): void;
    }>();
</script>

<template>
    <DashboardFilter v-for="(filter, index) in props.filters" :key="index" :filterKey="index" :filterValue="filter"
                     @update:filterValue="(key, value) => emit('update:filterValue', key, value)"
                     @clear:filterValue="(key) => emit('clear:filterValue', key)"
    />
</template>

<style scoped>

</style>