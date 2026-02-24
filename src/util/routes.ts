import { useApi } from '@/composables/useApi.ts';

export const routes = [
    { name: 'Login', path: '/login', component: () => import('../views/LoginView.vue'), meta: {requiresAuth: false} },
    {
        name: 'Home',
        path: '/',
        component: () => import('../views/HomeView.vue'),
        children: [
            {
                name: 'Central',
                path: '/',
                component: () => import('../components/home/CentralView.vue'),
                props: true,
            },
            {
                name: 'Search',
                path: ':component_module(assets|assistance|management|tools|administration|setup)/:itemtype',
                component: () => import('../components/search/SearchComponent.vue'),
                props: true,
                meta: {
                    title: (route) => `Search ${route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1)}`,
                    breadcrumbs: (route) => {
                        return [
                            ...route.params.component_module ? [
                                { label: route.params.component_module.charAt(0).toUpperCase() + route.params.component_module.slice(1), disabled: true }
                            ] : [],
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), route: `/${route.params.component_module}/${route.params.itemtype}` }
                        ];
                    }
                }
            },
            {
                name: 'ITILTimeline',
                path: 'assistance/:itemtype(ticket|change|problem)/:id(\\d+)',
                component: () => import('../components/timeline/TimelineView.vue'),
                props: (route) => {
                    const id = parseInt(route.params.id);
                    return {
                        itemtype: route.params.itemtype,
                        id: isNaN(id) ? null : id,
                    };
                },
                meta: {
                    breadcrumbs: (route) => {
                        return [
                            { label: 'Assistance', disabled: true },
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), route: `/assistance/${route.params.itemtype}` },
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
                path: ':component_module(assets)/:itemtype/:id(\\d+)',
                component: () => import('../components/assets/AssetItemView.vue'),
                props: (route) => {
                    return {
                        component_module: 'assets',
                        itemtype: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1),
                        id: parseInt(route.params.id),
                    };
                },
                meta: {
                    breadcrumbs: (route) => {
                        return [
                            ...route.params.component_module ? [
                                { label: route.params.component_module.charAt(0).toUpperCase() + route.params.component_module.slice(1), disabled: true }
                            ] : [],
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), route: `/${route.params.component_module}/${route.params.itemtype}` },
                        ];
                    },
                }
            },
            {
                name: 'AssetItemFormByUniqueField',
                path: ':component_module(assets)/:itemtype/:unique_field(uuid|name|serial|otherserial)/:unique_value',
                component: () => import('../components/assets/AssetItemView.vue'),
                beforeEnter: async (to) => {
                    const { doGraphQLRequest } = useApi();
                    const itemtype = to.params.itemtype.charAt(0).toUpperCase() + to.params.itemtype.slice(1);
                    const unique_field = to.params.unique_field;
                    const unique_value = to.params.unique_value;
                    return await doGraphQLRequest(`query { ${itemtype}(filter: "${unique_field}=='${unique_value}'") { id } }`).then(response => {
                        const items = response.data[itemtype];
                        if (items.length === 1) {
                            return {path: `/${to.params.component_module}/${to.params.itemtype}/${items[0].id}`};
                        } else if (items.length > 1) {
                            // multiple results, redirect to search page with filter
                            return { path: `/${to.params.component_module}/${to.params.itemtype}`, query: { filter: `${unique_field}=='${unique_value}'` } };
                        } else {
                            return { name: 'NotFound' };
                        }
                    });
                }
            },
            {
                name: 'ItemForm',
                path: ':component_module(assistance|management|tools|administration|setup)/:itemtype/:id(\\d+)',
                component: () => import('../components/TabbedForm.vue'),
                props: (route) => {
                    const id = parseInt(route.params.id);
                    return {
                        component_module: route.params.component_module,
                        itemtype: route.params.itemtype,
                        id: isNaN(id) ? null : id,
                    };
                },
                meta: {
                    breadcrumbs: (route) => {
                        return [
                            ...route.params.component_module ? [
                                { label: route.params.component_module.charAt(0).toUpperCase() + route.params.component_module.slice(1), disabled: true }
                            ] : [],
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), route: `/${route.params.component_module}/${route.params.itemtype}` },
                        ];
                    }
                }
            },
            {
                name: 'NewItemForm',
                path: ':component_module(assets|assistance|management|tools|administration|setup)/:itemtype/new',
                component: () => import('../components/TabbedForm.vue'),
                props: true,
                meta: {
                    breadcrumbs: (route) => {
                        return [
                            ...route.params.component_module ? [
                                { label: route.params.component_module.charAt(0).toUpperCase() + route.params.component_module.slice(1), disabled: true }
                            ] : [],
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), route: `/${route.params.component_module}/${route.params.itemtype}` },
                        ];
                    }
                }
            },
            {
                name: 'ProjectKanban',
                path: 'tools/project/:id/kanban',
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
            { name: 'NotFound', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
        ],
    },
    { name: 'NotFoundAnonymous', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
];