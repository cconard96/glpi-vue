<script setup lang="ts">
    import KanbanView from "@/components/kanban/KanbanView.vue";
    import { onMounted, ref } from "vue";
    import { useApi } from "@/composables/useApi.ts";
    import { components } from "../../../data/hlapiv2_schema";
    import type { KanbanColumns } from "@/components/kanban/kanban";
    import { useI18n } from "vue-i18n";

    const { doGraphQLRequest } = useApi();
    const { t: $t } = useI18n();
    const columns = ref<KanbanColumns>(new Map());

    onMounted(() => {
        doGraphQLRequest<{ProjectState: Array<Pick<components['schemas']['ProjectState'], 'id' | 'name' | 'color'>>}>(`
            query { ProjectState { id name color } }
        `).then((response) => {
            const t = new Map() satisfies KanbanColumns;
            t.set(0, { label: $t('kanban.project.nostatus', 'No status'), color: 'default', collapsed: false });
            response.data.ProjectState.forEach(state => {
                t.set(state.id, { label: state.name, color: state.color, collapsed: false });
            });
            columns.value = t;
        });
    });

    function fetchItems(itemtype: keyof components['schemas'], boardID: string | number): Promise<Array<{[key: string]: any}>> {
        let projectFilter = '';
        if (boardID !== 0) {
            projectFilter= `project.id==${boardID};`;
        }
        return doGraphQLRequest<{
            Project: Array<{[key: string]: any}>;
            ProjectTask: Array<{[key: string]: any}>;
        }>(`
            query {
                Project(filter: "${projectFilter}is_deleted==false;is_template==false") { id name status { id } is_template }
                ProjectTask(filter: "${projectFilter}is_deleted==false") { id name status { id } project { id is_deleted is_template } }
            }
        `).then(response => {
            const items = response.data.Project.map(project => {
                return {
                    _type: 'Project',
                    id: project.id,
                    icon: 'ti ti-layout-kanban',
                    name: project.name,
                    state: project.status?.id ?? 0
                };
            });
            // FIXME filtering tasks in GraphQL to exclude deleted or template projects creates broken SQL on server side, so we have to filter them client-side for now
            items.push(...response.data.ProjectTask
                .filter(task => task.project && !task.project.is_deleted && !task.project.is_template)
                .map(task => {
                    return {
                        _type: 'ProjectTask',
                        id: task.id,
                        icon: 'ti ti-list-check',
                        name: task.name,
                        state: task.status?.id ?? 0
                    };
                })
            );
            return items;
        });
    }
</script>

<template>
    <KanbanView showGlobal itemtype="Project" columnField="state" :columns="columns" :selectedBoardID="0" :fetchItems="fetchItems">
        <template #card-content="{ item }">
            <h3 class="text-heading-3 mb-2">
                <i :class="item.icon"></i>
                {{ item.name }}
            </h3>
            <p class="text-body mb-4">This is a description of the card. It can contain details about the task or item represented by this card.</p>
            <div class="flex gap-2">
                <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">Tag 1</span>
                <span class="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded">Tag 2</span>
            </div>
        </template>
    </KanbanView>
</template>

<style scoped>

</style>