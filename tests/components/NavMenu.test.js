import { expect, test, vi, beforeAll } from 'vitest';
import { render } from 'vitest-browser-vue';
import NavMenu from '@/components/NavMenu.vue';
import {createRouter, createWebHistory} from 'vue-router';
import {routes} from '@/util/routes.js';

test('renders NavMenu component', async () => {
    const router = createRouter({
        history: createWebHistory(),
        routes: routes,
    });
    const { getByText, getByRole } = render(NavMenu, {
        global: {
            plugins: [router],
        },
    });
    await expect.element(getByRole('link', { name: 'GLPI' })).toHaveAttribute('href', '/');
    // Expect top-level menu items to be present
    const top_level_items = ['Assets', 'Assistance', 'Management', 'Tools', 'Administration', 'Setup'];
    for (const item of top_level_items) {
        await expect.element(getByRole('button', { name: item })).toBeDefined();
    }
});