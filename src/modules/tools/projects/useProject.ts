import type { BaseItemDefinition, GLPICreateResponseBody, TabDefinition, useBaseItem } from "@/types";
import type { components } from "../../../../data/hlapiv2_schema";
import { Component, defineAsyncComponent, ref, type Ref } from "vue";
import { BaseRights, useSessionStore } from "@/common/useSessionStore.ts";
import { useApi } from "@/common/api/useApi.ts";
import type { ToastServiceMethods } from "@cjdevstudios/bumblevue";
import type { AxiosResponse } from "axios";
import { useRouter } from "vue-router";

const { hasRight } = useSessionStore();
const { getComponentSchema, doGraphQLRequest, getCompleteFieldsRequestForSchema, doApiRequest } = useApi();
const router = useRouter();

export const projectDefinition: BaseItemDefinition<'Project'> & {
    main_tab_component: Component,
} = {
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
    canViewItem: () => hasRight('project', BaseRights.READ),
    canCreateItem: () => hasRight('project', BaseRights.CREATE),
    canUpdateItem: () => hasRight('project', BaseRights.UPDATE),
    canDeleteItem: () => hasRight('project', BaseRights.DELETE),
    canPurgeItem: () => hasRight('project', BaseRights.PURGE),
    canRestoreItem: () => hasRight('project', BaseRights.PURGE),
};

export function createProject(fields: components['schemas']['Project']): Promise<AxiosResponse<GLPICreateResponseBody>> {
    return doApiRequest(projectDefinition.restEndpoint, {
        method: 'POST',
        data: fields,
    });
}

export function loadItem(id: number, fields: string[] = []): Promise<Ref<components['schemas']['Project']>> {
    return getComponentSchema('Project').then(schema => {
        const fields_to_query = fields.length > 0 ? fields.join(' ') : getCompleteFieldsRequestForSchema(schema.properties);
        return doGraphQLRequest(`
            query {
                Project(id: ${id}) {
                    ${fields_to_query}
                }
            }
        `).then((response) => {
            // @ts-ignore
            return ref(response.data.Project[0] satisfies components['schemas']['Project']);
        });
    });
}

export function getEmptyItem(): Promise<Ref<components['schemas']['Project']>> {
    return getComponentSchema('Project').then(schema => {
        const props = {};
        if (schema && schema.properties) {
            for (const [key, prop] of Object.entries(schema.properties)) {
                // If name ends with '.id' and only contains a single '.', it's likely an item dropdown
                const is_item_dropdown = key.endsWith('.id') && (key.match(/\./g) || []).length === 1;
                const field_name = is_item_dropdown ? key.slice(0, -3) : key;
                if (!is_item_dropdown && key.includes('.')) {
                    // Ignore other nested properties for now
                    continue;
                }
                props[field_name] = prop;
            }
        }
        return props;
    }).then((props: Record<string, object>) => {
        const new_item = {};
        for (const [key, prop] of Object.entries(props)) {
            if ('default' in prop) {
                new_item[key] = prop.default;
            } else {
                new_item[key] = null;
            }
        }
        return ref(new_item) as Ref<components['schemas']['Project']>;
    });
}

export function useProject(item: Ref<components['schemas']['Project']>): useBaseItem<'Project'> & {
    getTabs: () => TabDefinition[],
    createOrUpdateItem: (fields: components['schemas']['Project'], toastService?: ToastServiceMethods, redirectToNewItem?: boolean) => Promise<void | AxiosResponse>,
} {
    function updateItem(fields: components['schemas']['Project']): Promise<AxiosResponse> {
        if (!('id' in item.value) || !item.value.id) {
            throw new Error('Cannot update item');
        }
        return doApiRequest(`${projectDefinition.restEndpoint}/${item.value.id}`, {
            method: 'PATCH',
            data: fields,
        });
    }

    function getTabs(): TabDefinition[] {
        const tabs: TabDefinition[] = [
            { key: 'main', label: projectDefinition.getLabel(1), icon: projectDefinition.icon, component: projectDefinition.main_tab_component },
        ];
        return tabs;
    }

    function createOrUpdateItem(fields: components['schemas'][T], toastService: ToastServiceMethods = null, redirectToNewItem: boolean = true): Promise<void | AxiosResponse> {
        const handleFailure = (err) => {
            if (err.response && err.response.data && err.response.data.message) {
                toastService.add({severity: 'error', summary: 'Error', detail: err.response.data.message, life: 5000});
            } else {
                toastService.add({severity: 'error', summary: 'Error', detail: 'An unknown error occurred.', life: 5000});
            }
        }
        if ('id' in item.value && item.value.id) {
            return updateItem(fields).then(response => {
                if (toastService !== null) {
                    toastService.add({severity: 'success', summary: 'Success', detail: 'Item updated successfully.', life: 5000});
                }
                return response;
            }).catch(handleFailure);
        } else {
            return createProject(fields).then(response => {
                if (toastService !== null) {
                    toastService.add({severity: 'success', summary: 'Success', detail: 'Item created successfully.', life: 5000});
                }
                if (redirectToNewItem) {
                    const new_id = response.data.id;
                    // Redirect to the new item page
                    router.push({
                        name: 'ProjectItemView',
                        params: {
                            itemtype: 'Project',
                            id: new_id,
                        }
                    });
                }
                return response;
            }).catch(handleFailure);
        }
    }

    return {
        getDefinition(): BaseItemDefinition<'Project'> {
            return projectDefinition;
        },
        getTabs,
        item,
        createOrUpdateItem,
    };
}