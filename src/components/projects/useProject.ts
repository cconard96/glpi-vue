import type { BaseItemDefinition, useBaseItem } from "@/types";
import type { components } from "../../../data/hlapiv2_schema";
import { defineAsyncComponent, type Ref } from "vue";
import { BaseRights, useSessionStore } from "@/composables/useSessionStore.ts";

const { hasRight } = useSessionStore();

export const projectDefinition: BaseItemDefinition = {
    key: 'Project',
    module: 'tools',
    restEndpoint: '/Project',
    getLabel: (count: number) => count === 1 ? 'Project' : 'Projects',
    icon: 'ti ti-layout-kanban',
    rightname: 'project',
    main_tab_component: defineAsyncComponent(() => import('./ProjectForm.vue')),
    canView: () => hasRight('project', BaseRights.READ),
    canCreate: () => hasRight('project', BaseRights.CREATE),
    canUpdate: () => hasRight('project', BaseRights.UPDATE),
    canDelete: () => hasRight('project', BaseRights.DELETE),
    canPurge: () => hasRight('project', BaseRights.PURGE),
    canRestore: () => hasRight('project', BaseRights.PURGE),
};

export function useProject(item: Ref<components['schemas']['Project']>): useBaseItem<'Project'> {
    return {
        getDefinition(): BaseItemDefinition {
            return projectDefinition;
        }, item: undefined
    };
}