<script setup lang="ts">
    import { Select, Button, Menu } from 'primevue';
    import KanbanFilterInput from "@/components/kanban/KanbanFilterInput.vue";
    import { computed, onMounted, useTemplateRef } from "vue";
    import { useApi } from "@/composables/useApi.ts";
    import { useI18n } from "vue-i18n";
    import { components } from "../../../data/hlapiv2_schema";

    const props = defineProps<{}>();
    const selectedBoardID = defineModel<string | number>('selectedBoardID', {
        required: true
    });
    defineEmits<{
        (e: 'reset_view'): void;
    }>();

    const actions_menu_el = useTemplateRef('actions_menu');
    const { doGraphQLRequest } = useApi();
    const { t: $t } = useI18n();
    const allAvailableKanbanBoards = [
        { id: 0, name: $t('kanban.global.name', 'Global') }
    ];

    const currentKanbanBoard = computed(() => {
        return allAvailableKanbanBoards.find(board => board.id === selectedBoardID.value) || allAvailableKanbanBoards[0];
    });

    onMounted(() => {
        doGraphQLRequest<{
            Project: Required<Pick<components['schemas']['Project'], 'id' | 'name'>>[];
        }>(`
            query {
                Project(filter: "is_deleted==false;state.is_finished==false") {
                    id
                    name
                }
            }
        `).then((response) => {
            allAvailableKanbanBoards.push(...response.data.Project);
        });
    });

    function toggleActionsMenu(event: MouseEvent) {
        actions_menu_el.value?.toggle(event);
    }
</script>

<template>
    <div class="flex">
        <h1 class="sr-only">{{ currentKanbanBoard['name'] }}</h1>
        <Select class="min-w-64 flex-none" :options="allAvailableKanbanBoards" optionValue="id" optionLabel="name" v-model="selectedBoardID"></Select>
        <KanbanFilterInput class="grow"></KanbanFilterInput>
        <Button class="flex-none" severity="secondary" label="Add Column"></Button>
        <Button class="flex-none" severity="secondary" title="Other actions" aria-label="Other actions" icon="ti ti-dots-vertical"
                @click="toggleActionsMenu"></Button>
        <Menu ref="actions_menu" :popup="true" :model="[
            { key: 'reset_view', label: 'Reset view', icon: 'ti ti-trash', command: () => $emit('reset_view') },
        ]"></Menu>
    </div>
</template>

<style scoped>

</style>