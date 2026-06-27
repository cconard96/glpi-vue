import { useApi } from '@/common/api/useApi.ts';
import { defineAsyncComponent } from "vue";
import { RouteLocationNormalizedGeneric, RouteRecordRaw } from "vue-router";
import { i18n } from "./i18n.ts"
import { useSessionStore } from "@/common/useSessionStore.ts";

function normalizeItemtype<T extends string>(itemtype: T): Capitalize<T> {
    return (itemtype.charAt(0).toUpperCase() + itemtype.slice(1)) as Capitalize<T>;
}

function getComponentModuleLabel(component_module: string): string {
    switch (component_module) {
        case 'assets':
            return i18n.global.t('assets.menu_label');
        case 'assistance':
            return i18n.global.t('assistance.menu_label');
        case 'management':
            return i18n.global.t('management.menu_label');
        case 'tools':
            return i18n.global.t('tools.menu_label');
        case 'administration':
            return i18n.global.t('administration.menu_label');
        case 'setup':
            return i18n.global.t('setup.menu_label');
        default:
            return component_module.charAt(0).toUpperCase() + component_module.slice(1);
    }
}

function getComponentModuleBreadcrumbActionsComponent(component_module: string) {
    switch (component_module) {
        case 'assets':
            return defineAsyncComponent(() => import('@/common/layout/AssetItemBreadcrumbActions.vue'));
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
        component: () => import('@/views/AuthCallbackView.vue'),
        meta: {requiresAuth: false}
    },
    { name: 'Login', path: '/login', component: () => import('@/views/LoginView.vue'), meta: {requiresAuth: false} },
    {
        name: 'Home',
        path: '/',
        component: () => import('@/views/HomeView.vue'),
        children: [
            { name: 'Homepage', path: '/', component: () => import('@/modules/home/Homepage.vue'), props: true },
            { name: 'ServiceCatalog', path: '/ServiceCatalog', component: () => import('@/modules/home/ServiceCatalogView.vue'), props: true },
            {
                name: 'Search',
                path: `:component_module(${allModulesPattern})/:itemtype(${itemtypePattern})`,
                component: () => import('@/common/search/SearchComponent.vue'),
                props: (route) => {
                    return {
                        component_module: route.params.component_module as string,
                        itemtype: normalizeItemtype(route.params.itemtype as string),
                    };
                },
                meta: {
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
                component: () => import('@/modules/assistance/timeline/TimelineView.vue'),
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
                component: () => import('@/modules/assistance/stats/StatisticsView.vue'),
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
                component: () => import('@/modules/assets/AssetItemView.vue'),
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
                component: () => import('@/modules/assets/AssetItemView.vue'),
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
                component: () => import('@/modules/assets/AssetItemView.vue'),
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
                component: () => import('@/common/TabbedForm.vue'),
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
                component: () => import('@/common/TabbedForm.vue'),
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
                component: () => import('@/modules/tools/kb/KBSearchView.vue'),
                meta: {
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
                component: () => import('@/modules/assistance/planning/PlanningView.vue'),
            },
            {
                name: 'PluginDirectory',
                path: 'setup/plugin',
                component: () => import('@/modules/setup/plugins/PluginDirectory.vue'),
            },
            {
                name: 'Settings',
                path: 'setup/settings',
                component: () => import('@/modules/setup/settings/SettingsView.vue'),
                meta: {
                    breadcrumbs: () => {
                        return [
                            { label: 'Setup', disabled: true },
                            { label: 'Settings', route: `/setup/settings` },
                        ];
                    }
                }
            },
            { name: 'NotFound', path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') }
        ],
    },
    { name: 'NotFoundAnonymous', path: '/:pathMatch(.*)*', component: () => import('@/views/NotFoundView.vue') }
];