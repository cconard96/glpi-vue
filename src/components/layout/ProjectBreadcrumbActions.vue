<script setup lang="ts">
    import { Button } from "primevue";
    import { projectDefinition } from "@/components/projects/useProject.ts";

    const props = defineProps<{
        itemtype: string;
        items_id: number;
    }>();
</script>

<template>
    <div class="content-center flex gap-2">
        <Button v-if="projectDefinition.canCreate()" size="small" severity="primary" as="router-link" :to="{ name: 'NewProjectForm' }">
            <i class="ti ti-list"></i>
            <span class="p-button-label">Add</span>
        </Button>
        <Button size="small" severity="secondary" as="router-link" :to="{ name: 'GlobalProjectKanban' }">
            <i class="ti ti-layout-columns"></i>
            <span class="p-button-label">Global Kanban</span>
        </Button>
    </div>
</template>

<style scoped>

</style>