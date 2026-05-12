import { BaseItemDefinition, useBaseItem } from "@/types";
import { components } from "../../../data/hlapiv2_schema";
import { Ref } from "vue";
import { useSessionStore, BaseRights } from "@/composables/useSessionStore.ts";

export function useEntity(entity: Ref<components['schemas']['Entity']>): useBaseItem<'Entity'> {
    const session = useSessionStore();

    function getDefinition(): BaseItemDefinition {
        return {
            key: 'Entity',
            module: 'administration',
            restEndpoint: 'Administration/Entity',
            getLabel: (count: number) => {
                return count === 1 ? 'Entity' : 'Entities';
            },
            icon: 'ti ti-stack',
            rightname: 'entity',
            main_tab_component: () => import('@/components/admin/entity/EntityForm.vue'),
            canView: () => session.hasRight('entity', BaseRights.READ),
            canCreate: () => session.hasRight('entity', BaseRights.CREATE),
            canUpdate: () => session.hasRight('entity', BaseRights.UPDATE),
            canDelete: () => session.hasRight('entity', BaseRights.DELETE),
            canPurge: () => session.hasRight('entity', BaseRights.PURGE),
            canRestore: () => session.hasRight('entity', BaseRights.PURGE),
        };
    };

    return {
        getDefinition,
        item: entity,
    }
}