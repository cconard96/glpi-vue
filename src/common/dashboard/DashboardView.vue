<script setup lang="ts">
    import DashboardGrid from "./DashboardGrid.vue";
    import { ProgressSpinner } from "primevue";
</script>

<template>
    <Suspense>
        <template #default>
            <DashboardGrid v-bind="$attrs" />
        </template>
        <template #fallback>
            <div class="flex justify-content-center align-items-center h-full">
                <ProgressSpinner />
            </div>
        </template>
    </Suspense>
</template>

<style scoped>

</style>