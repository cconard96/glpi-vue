import { createApp } from 'vue'
import App from './App.vue'
import {createMemoryHistory, createRouter, createWebHistory} from "vue-router";
import { useAuth } from "@/composables/useAuth.js";
import PrimeVue from 'primevue/config';
import Lara from '@primeuix/themes/lara';
import '@/main.css';
import '@tabler/icons-webfont/dist/fonts/tabler-icons.woff2';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import FocusTrap from 'primevue/focustrap';

const routes = [
    { name: 'Login', path: '/login', component: () => import('./views/LoginView.vue'), meta: {requiresAuth: false} },
    {
        name: 'Home',
        path: '/',
        component: () => import('./views/HomeView.vue'),
        children: [
            {
                name: 'Search',
                path: ':component_module(assets|assistance|management|tools|administration|setup)/:itemtype',
                component: () => import('./components/search/SearchComponent.vue'),
                props: true
            }
        ]
    },
];
const router = createRouter({
    history: createWebHistory(),
    routes,
});

const { isAuthenticated } = useAuth();

router.beforeEach((to, from) => {
    console.log(`Navigating to ${to.fullPath} from ${from.fullPath}`);
    const requires_auth = to.meta.requiresAuth !== undefined ? to.meta.requiresAuth : true;
    if ((requires_auth ?? true) && !isAuthenticated()) {
        return {
            path: '/login',
            // save the location we were at to come back later
            query: { redirect: to.fullPath },
        }
    } else if (isAuthenticated() && to.path === '/login') {
        return { path: '/' };
    }
});

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)

createApp(App)
    .use(router)
    .use(pinia)
    .use(PrimeVue, {
        theme: {
            preset: Lara,
            options: {
                prefix: 'p',
                darkModeSelector: 'system',
                cssLayer: {
                    name: 'primevue',
                    order: 'theme, base, primevue'
                },
            }
        }
    })
    .directive('focustrap', FocusTrap)
    .mount('#app')
