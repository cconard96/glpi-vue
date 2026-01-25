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
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), url: `/${route.params.component_module}/${route.params.itemtype}` }
                        ];
                    }
                }
            },
            {
                name: 'ITILTimeline',
                path: 'assistance/:itemtype(ticket|change|problem)/:id',
                component: () => import('../components/timeline/TimelineView.vue'),
                props: true,
                meta: {
                    breadcrumbs: (route) => {
                        return [
                            { label: 'Assistance', disabled: true },
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), url: `/assistance/${route.params.itemtype}` },
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
                    breadcrumbs: (route) => {
                        return [
                            { label: 'Assistance', disabled: true },
                            { label: 'Statistics', url: `/assistance/statistics` },
                        ];
                    }
                }
            },
            {
                name: 'ItemForm',
                path: ':component_module(assets|assistance|management|tools|administration|setup)/:itemtype/:id(\\d+)',
                component: () => import('../components/TabbedForm.vue'),
                props: async (router) => {
                    const itemtype_model = (await import(`@/models/${router.params.component_module}/${router.params.itemtype.charAt(0).toUpperCase() + router.params.itemtype.slice(1)}.ts`)).default;
                    return {
                        component_module: router.params.component_module,
                        itemtype: router.params.itemtype,
                        id: parseInt(router.params.id),
                        itemtype_model: itemtype_model,
                        tabs: itemtype_model.getTabs()
                    };
                },
                meta: {
                    breadcrumbs: (route) => {
                        return [
                            ...route.params.component_module ? [
                                { label: route.params.component_module.charAt(0).toUpperCase() + route.params.component_module.slice(1), disabled: true }
                            ] : [],
                            { label: route.params.itemtype.charAt(0).toUpperCase() + route.params.itemtype.slice(1), url: `/${route.params.component_module}/${route.params.itemtype}` },
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
                    breadcrumbs: (route) => {
                        return [
                            { label: 'Tools', disabled: true },
                            { label: 'Knowledge Base', url: `/tools/knowbase` },
                        ];
                    }
                }
            },
            { name: 'NotFound', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
        ],
    },
    { name: 'NotFoundAnonymous', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
];