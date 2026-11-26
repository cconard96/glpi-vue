<script setup lang="ts">
    import { computed, provide } from "vue";
    import { useRoute, useRouter } from "vue-router";
    import KanbanView from "@/common/kanban/KanbanView.vue";
    import { useKanban } from "@/common/kanban/useKanban";
    import { useProjectKanbanAdapter } from "@/modules/tools/projects/useProjectKanbanAdapter";

    const route = useRoute();
    const router = useRouter();

    const boardId = computed(() => {
        const id = Number(route.params.id ?? 0);
        return Number.isInteger(id) && id > 0 ? id : 0;
    });

    const kanban = useKanban(useProjectKanbanAdapter(), boardId);
    provide('kanban', kanban);

    function selectBoard(board_id: number) {
        if (board_id > 0) {
            void router.push({ name: 'ProjectKanban', params: { id: board_id } });
        } else {
            void router.push({ name: 'GlobalProjectKanban' });
        }
    }
</script>

<template>
    <KanbanView @select-board="selectBoard"></KanbanView>
</template>
