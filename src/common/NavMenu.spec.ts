import { expect, test } from 'vitest';
import { render } from "@tests/utils.ts";
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from '@/core/util/routes.ts';
import { page } from 'vitest/browser';
import { createPinia, setActivePinia } from "pinia";

beforeEach(() => {
    setActivePinia(createPinia())
})
test('renders NavMenu component (desktop)', async () => {
    const router = createRouter({
        history: createWebHistory(),
        routes: routes,
    });

    const { default: NavMenu } = await import('@/common/NavMenu.vue');
    const { getByRole } = await render(NavMenu, {
        global: {
            plugins: [router],
        },
        props: {
            mobile: false,
        }
    });

    const nav = getByRole('navigation');
    await expect.element(nav).toHaveStyle({height: '1080px'});

    await expect.element(getByRole('link', { name: 'GLPI' })).toHaveAttribute('href', '/');
    // Expect top-level menu items to be present
    const top_level_items = ['Assistance', 'Management', 'Tools', 'Administration', 'Setup'];
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

    const { default: NavMenu } = await import('@/common/NavMenu.vue');
    const { getByRole, getByLabelText } = await render(NavMenu, {
        global: {
            plugins: [router],
        },
        props: {
            mobile: true,
        }
    });

    const nav = getByRole('navigation');
    await expect.element(nav).not.toHaveStyle({height: '1080px'});

    await expect.element(getByRole('link', { name: 'GLPI' })).not.toBeInTheDocument();
    // Expect top-level menu items to be present
    const top_level_items = ['Assistance', 'Management', 'Tools', 'Administration', 'Setup'];
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