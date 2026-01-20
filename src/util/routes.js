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
                name: 'ItemForm',
                path: ':component_module(assets|assistance|management|tools|administration|setup)/:itemtype/:id(\\d+)',
                component: () => import('../components/ItemForm.vue'),
                props: true,
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
            { name: 'NotFound', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
        ],
    },
    { name: 'NotFoundAnonymous', path: '/:pathMatch(.*)*', component: () => import('../views/NotFoundView.vue') }
];