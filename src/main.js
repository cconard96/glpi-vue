import { createApp } from 'vue'
import App from './App.vue'
import { routes } from './util/routes.js';
import PrimeVue from 'primevue/config';
import Lara from '@primeuix/themes/lara';
import '@/main.css';
import '@tabler/icons-webfont/dist/fonts/tabler-icons.woff2';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import FocusTrap from 'primevue/focustrap';
import {createRouter, createWebHistory} from "vue-router";
import {useAuth} from "@/composables/useAuth.ts";
import VueDOMPurifyHTML from 'vue-dompurify-html';
import {DialogService} from "primevue";

const router = createRouter({
    history: createWebHistory(),
    routes,
});

const { isAuthenticated } = useAuth();

router.beforeEach((to, from) => {
    console.log(`Navigating to ${to.fullPath} from ${from.fullPath}`);
    if (to?.meta?.title) {
        document.title = typeof to.meta.title === 'function' ? to.meta.title(to) : to.meta.title;
    }
    if (to.name === 'Login') {
        return;
    }
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
    .use(VueDOMPurifyHTML)
    .use(DialogService)
    .directive('focustrap', FocusTrap)
    .mount('#app')
