<script setup lang="ts">
    import Button from "@cjdevstudios/bumblevue/button";
    import { useRoute } from "vue-router";
    import { projectDefinition } from "@/modules/tools/projects/useProject.ts";

    const props = defineProps<{
        itemtype: string;
        items_id: number;
    }>();
    const route = useRoute();
</script>

<template>
    <div class="content-center flex gap-2">
        <Button v-if="projectDefinition.canCreate()" size="small" severity="primary" as="router-link" :to="{ name: 'NewProjectForm' }">
            <i class="ti ti-list"></i>
            <span class="p-button-label">Add</span>
        </Button>
        <Button v-if="items_id > 0 && route.name !== 'ProjectKanban'" size="small" severity="secondary" as="router-link"
                :to="{ name: 'ProjectKanban', params: { id: items_id } }">
            <i class="ti ti-layout-columns"></i>
            <span class="p-button-label">{{ $t('kanban.project.kanban', 'Kanban') }}</span>
        </Button>
        <Button size="small" severity="secondary" as="router-link" :to="{ name: 'GlobalProjectKanban' }">
            <i class="ti ti-layout-columns"></i>
            <span class="p-button-label">Global Kanban</span>
        </Button>
    </div>
</template>

<style scoped>

</style>