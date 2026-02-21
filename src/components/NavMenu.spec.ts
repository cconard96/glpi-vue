import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import NavMenu from '@/components/NavMenu.vue';
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/util/routes.ts';
import { defaultOptions } from "primevue/config";
import { page } from 'vitest/browser';

test('renders NavMenu component (desktop)', async () => {
    const router = createRouter({
        history: createWebHistory(),
        routes: routes,
    });

    const { getByRole } = render(NavMenu, {
        global: {
            plugins: [router],
            mocks: {
                $primevue: {
                    config: defaultOptions
                }
            },
        },
        props: {
            mobile: false,
        }
    });

    const nav = getByRole('navigation');
    await expect.element(nav).not.toHaveStyle({height: '1080px'});

    await expect.element(getByRole('link', { name: 'GLPI' })).toHaveAttribute('href', '/');
    // Expect top-level menu items to be present
    const top_level_items = ['Assets', 'Assistance', 'Management', 'Tools', 'Administration', 'Setup'];
    for (const item of top_level_items) {
        await expect.element(getByRole('button', { name: item })).toBeDefined();
    }
});

test('renders NavMenu component (mobile)', async () => {
    const router = createRouter({
        history: createWebHistory(),
        routes: routes,
    });

    await page.viewport(360, 800);

    const { getByRole, getByLabelText } = render(NavMenu, {
        global: {
            plugins: [router],
            mocks: {
                $primevue: {
                    config: defaultOptions
                }
            },
        },
        props: {
            mobile: true,
        }
    });

    const nav = getByRole('navigation');
    await expect.element(nav).not.toHaveStyle({height: '1080px'});

    await expect.element(getByRole('link', { name: 'GLPI' })).not.toBeInTheDocument();
    // Expect top-level menu items to be present
    const top_level_items = ['Assets', 'Assistance', 'Management', 'Tools', 'Administration', 'Setup'];
    for (const item of top_level_items) {
        await expect.element(getByRole('button', { name: item })).not.toBeInTheDocument();
    }

    await getByLabelText('Navigation', { exact: true }).click();
    for (const item of top_level_items) {
        await getByRole('menuitem', { name: item }).click();
        // a sibling menu should be opened and contain at least one menuitem
        expect(getByRole('menu', { name: item }).getByRole('menuitem').length).toBeGreaterThan(1);
    }
});