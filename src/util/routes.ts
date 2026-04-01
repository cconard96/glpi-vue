import { useApi } from '@/composables/useApi.ts';
import { defineAsyncComponent } from "vue";
import { RouteLocationNormalizedGeneric, RouteRecordRaw } from "vue-router";

function normalizeItemtype<T extends string>(itemtype: T): Capitalize<T> {
    return (itemtype.charAt(0).toUpperCase() + itemtype.slice(1)) as Capitalize<T>;
}

function getComponentModuleLabel(component_module: string): string {
    switch (component_module) {
        case 'assets':
            return 'Assets';
        case 'assistance':
            return 'Assistance';
        case 'management':
            return 'Management';
        case 'tools':
            return 'Tools';
        case 'administration':
            return 'Administration';
        case 'setup':
            return 'Setup';
        default:
            return component_module.charAt(0).toUpperCase() + component_module.slice(1);
    }
}

function getComponentModuleBreadcrumbActionsComponent(component_module: string) {
    switch (component_module) {
        case 'assets':
            return defineAsyncComponent(() => import('../components/layout/AssetItemBreadcrumbActions.vue'));
        default:
            return null;
    }
}

const allModulesPattern = 'assets|assistance|management|tools|administration|setup';
const itemtypePattern = '[a-zA-Z_]+';

export const routes: RouteRecordRaw[] = [
    {
        name: 'auth_callback',
        path: '/auth-callback',
        props: (route) => {
            return {
                code: route.query.code,
            };
        },
        component: () => import('../views/AuthCallbackView.vue'),
        meta: {requiresAuth: false}
    },
    { name: 'Login', path: '/login', component: () => import('../views/LoginView.vue'), meta: {requiresAuth: false} },
    {
        name: 'Home',
        path: '/',
        component: () => import('../views/HomeView.vue'),
        children: [
            { name: 'Central', path: '/', component: () => import('../components/home/CentralView.vue'), props: true },
            {
                name: 'Search',
                path: `:component_module(${allModulesPattern})/:itemtype(${itemtypePattern})`,
                component: () => import('../components/search/SearchComponent.vue'),
                props: (route) => {
                    return {
                        component_module: route.params.component_module as string,
                        itemtype: normalizeItemtype(route.params.itemtype as string),
                    };
                },
                meta: {
                    title: (route: RouteLocationNormalizedGeneric) => `Search ${normalizeItemtype(route.params.itemtype as string)}`,
                    breadcrumbs: (route: RouteLocationNormalizedGeneric) => {
                        return [
                            ...route.params.component_module ? [
                                { label: getComponentModuleLabel(route.params.component_module as string), disabled: true }
                            ] : [],
                            { label: normalizeItemtype(route.params.itemtype as string), route: `/${route.params.component_module}/${route.params.itemtype}` }
                        ];
                    },
                    breadcrumbActionsComponent: (route: RouteLocationNormalizedGeneric) => {
                        return getComponentModuleBreadcrumbActionsComponent(route.params.component_module as string);
                    }
                }
            },
            {
                name: 'ITILTimeline',
                path: 'assistance/:itemtype(ticket|change|problem)/:id(\\d+)',
                component: () => import('../components/timeline/TimelineView.vue'),
                props: (route: RouteLocationNormalizedGeneric) => {
                    const id = parseInt(route.params.id as string);
                    return {
                        itemtype: route.params.itemtype,
                        id: isNaN(id) ? null : id,
                    };
                },
                meta: {
                    breadcrumbs: (route: RouteLocationNormalizedGeneric) => {
                        return [
                            { label: getComponentModuleLabel('assistance'), disabled: true },
                            { label: normalizeItemtype(route.params.itemtype as string), route: `/assistance/${route.params.itemtype}` },
                        ];
                    }
                }
            },
            {
                name: 'AssistanceStats',
                path: '/assistance/statistics',
                alias: ['/assistance/stat', '/assistance/stats'],
                component: () => import('../components/assistance/stats/StatisticsView.vue'),
                meta: {
                    breadcrumbs: () => {
                        return [
                            { label: 'Assistance', disabled: true },
                            { label: 'Statistics', route: `/assistance/statistics` },
                        ];
                    }
                }
            },
            {
                name: 'AssetItemForm',
                path: `:component_module(assets)/:itemtype(${itemtypePattern})/:id(\\d+)`,
                component: () => import('../components/assets/AssetItemView.vue'),
                props: (route: RouteLocationNormalizedGeneric) => {
                    return {
                        component_module: 'assets',
                        itemtype: normalizeItemtype(route.params.itemtype as string),
                        id: parseInt(route.params.id as string),
                    };
                },
                meta: {
                    breadcrumbs: (route: RouteLocationNormalizedGeneric) => {
                        return [
                            { label: getComponentModuleLabel('assets'), disabled: true },
                            { label: normalizeItemtype(route.params.itemtype as string), route: `/assets/${route.params.itemtype}` },
                        ];
                    },
                    breadcrumbActionsComponent: () => getComponentModuleBreadcrumbActionsComponent('assets'),
                }
            },
            {
                name: 'AssetItemFormByUniqueField',
                path: `:component_module(assets)/:itemtype(${itemtypePattern})/:unique_field(uuid|name|serial|otherserial)/:unique_value`,
                component: () => import('../components/assets/AssetItemView.vue'),
                beforeEnter: async (to: RouteLocationNormalizedGeneric) => {
                    const { doGraphQLRequest } = useApi();
                    const itemtype = normalizeItemtype(to.params.itemtype as string);
                    const unique_field = to.params.unique_field;
                    const unique_value = to.params.unique_value;
                    return await doGraphQLRequest(`query { ${itemtype}(filter: "${unique_field}=='${unique_value}'") { id } }`).then(response => {
                        const items = response.data[itemtype];
                        if (items.length === 1) {
                            return {path: `/assets/${to.params.itemtype}/${items[0].id}`};
                        } else if (items.length > 1) {
                            // multiple results, redirect to search page with filter
                            return { path: `/assets/${to.params.itemtype}`, query: { filter: `${unique_field}=='${unique_value}'` } };
                        } else {
                            return { name: 'NotFound' };
                        }
                    });
                }
            },
            {
                name: 'NewAssetItemForm',
                path: `:component_module(assets)/:itemtype(${itemtypePattern})/new`,
                component: () => import('../components/assets/AssetItemView.vue'),
                props: (route: RouteLocationNormalizedGeneric) => {
                    return {
                        component_module: 'assets',
                        itemtype: normalizeItemtype(route.params.itemtype as string),
                        id: 0,
                    };
                },
                meta: {
                    breadcrumbs: (route: RouteLocationNormalizedGeneric) => {
                        return [
                            { label: getComponentModuleLabel('assets'), disabled: true },
                            { label: normalizeItemtype(route.params.itemtype as string), route: `/assets/${route.params.itemtype}` },
                        ];
                    },
                    breadcrumbActionsComponent: () => getComponentModuleBreadcrumbActionsComponent('assets'),
                }
            },
            {
                name: 'ItemForm',
                path: ':component_module(assistance|management|tools|administration|setup)/:itemtype/:id(\\d+)',
                component: () => import('../components/TabbedForm.vue'),
                props: (route: RouteLocationNormalizedGeneric) => {
                    const id = parseInt(route.params.id as string);
                    return {
                        component_module: route.params.component_module,
                        itemtype: route.params.itemtype,
                        id: isNaN(id) ? null : id,
                    };
                },
                meta: {
                    breadcrumbs: (route: RouteLocationNormalizedGeneric) => {
                        return [
                            ...route.params.component_module ? [
                                { label: getComponentModuleLabel(route.params.component_module as string), disabled: true }
                            ] : [],
                            { label: normalizeItemtype(route.params.itemtype as string), route: `/${route.params.component_module}/${route.params.itemtype}` },
                        ];
                    }
                }
            },
            {
                name: 'NewItemForm',
                path: ':component_module(assistance|management|tools|administration|setup)/:itemtype/new',
                component: () => import('../components/TabbedForm.vue'),
                props: true,
                meta: {
                    breadcrumbs: (route: RouteLocationNormalizedGeneric) => {
                        return [
                            ...route.params.component_module ? [
                                { label: getComponentModuleLabel(route.params.component_module as string), disabled: true }
                            ] : [],
                            { label: normalizeItemtype(route.params.itemtype as string), route: `/${route.params.component_module}/${route.params.itemtype}` },
                        ];
                    }
                }
            },
            {
                name: 'Knowbase',
                path: 'tools/knowbase/:article_id(\\d+)?',
                alias: ['tools/knowbase/:article_id(\\d+)?', '/tools/knowledgebase/:article_id(\\d+)?', '/tools/kb/:article_id(\\d+)?'],
                component: () => import('../components/kb/KBSearchView.vue'),
                meta: {
                    title: 'Knowledge Base',
                    breadcrumbs: () => {
                        return [
                            { label: 'Tools', disabled: true },
                            { label: 'Knowledge Base', route: `/tools/knowbase` },
                        ];
                    }
                }
            },
            {
                name: 'Planning',
                path: 'assistance/planning',
                component: () => import('../components/assistance/planning/PlanningView.vue'),
            },
            {
                name: 'PluginDirectory',
                path: 'setup/plugin',
                component: () => import('../components/setup/plugins/PluginDirectory.vue'),
            },
            {
                name: 'Settings',
                path: 'setup/settings',
                component: () => import('../components/setup/settings/SettingsView.vue'),
                meta: {
                    title: 'Settings',
                    breadcrumbs: () => {
                        return [
                            { label: 'Setup', disabled: true },
                            { label: 'Settings', route: `/setup/settings` },
                        ];
                    }
                }
            },
            { name: 'NotFound', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
        ],
    },
    { name: 'NotFoundAnonymous', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
];