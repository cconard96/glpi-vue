export const routes = [
    { name: 'Login', path: '/login', component: () => import('../views/LoginView.vue'), meta: {requiresAuth: false} },
    {
        name: 'Home',
        path: '/',
        component: () => import('../views/HomeView.vue'),
        children: [
            {
                name: 'Search',
                path: ':component_module(assets|assistance|management|tools|administration|setup)/:itemtype',
                component: () => import('../components/search/SearchComponent.vue'),
                props: true
            },
            {
                name: 'ITILTimeline',
                path: 'assistance/:itemtype(ticket|change|problem)/:id',
                component: () => import('../components/timeline/TimelineView.vue'),
                props: true
            }
        ]
    },
];