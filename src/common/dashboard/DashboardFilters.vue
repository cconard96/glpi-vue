<script setup lang="ts">
    import DashboardFilter from "@/common/dashboard/DashboardFilter.vue";

    const props = defineProps<{
        filters: Record<string, any>;
    }>();
</script>

<template>
    <DashboardFilter v-for="(filter, index) in props.filters" :key="index" :filterKey="index" :filterValue="filter" />
</template>

<style scoped>

</style>