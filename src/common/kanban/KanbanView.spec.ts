import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import { defineComponent, h, provide, ref } from 'vue';
import { createMemoryHistory, createRouter } from 'vue-router';
import ConfirmationService from '@cjdevstudios/bumblevue/confirmationservice';
import ToastService from '@cjdevstudios/bumblevue/toastservice';
import { render } from '@tests/utils';
import type { KanbanAdapter, KanbanCard } from './kanban';

const doApiRequest = vi.fn();
vi.mock('@/common/api/useApi', () => ({
    useApi: () => ({ doApiRequest, doGraphQLRequest: vi.fn().mockResolvedValue({ data: {} }) }),
}));

const { useKanban } = await import('./useKanban');
const { default: KanbanView } = await import('./KanbanView.vue');

function makeCard(id: number, column: number, overrides: Partial<KanbanCard> = {}): KanbanCard {
    return {
        key: `Project-${id}`, itemtype: 'Project', id, column, name: `Card ${id}`, icon: 'ti ti-layout-kanban',
        is_deleted: false, readonly: false, team: [], meta: { percent_done: 50, tasks_done: 1, tasks_total: 2 }, ...overrides,
    };
}

function makeAdapter(): KanbanAdapter {
    return {
        boardItemtype: 'Project',
        teamItemtypes: ['User'],
        filterTags: { title: { description: 'Filter by title', supported_prefixes: ['!'] } },
        fetchBoards: vi.fn().mockResolvedValue([{ id: 0, name: 'Global' }, { id: 5, name: 'Big project' }]),
        fetchColumns: vi.fn().mockResolvedValue([
            { id: 0, label: 'No status', color: null, protected: true },
            { id: 1, label: 'New', color: '#ff0000' },
            { id: 2, label: 'Doing', color: null },
        ]),
        fetchCards: vi.fn().mockResolvedValue([makeCard(1, 1), makeCard(2, 1), makeCard(3, 2)]),
        getRights: vi.fn().mockResolvedValue({
            canModifyView: true, canOrderCard: true, canCreateItem: true, canCreateColumn: false, canDeleteItem: true, createLimitedColumns: null,
        }),
        updateCardColumn: vi.fn().mockResolvedValue(undefined),
        creatableItemtypes: () => [{
            itemtype: 'Project', label: 'Project', icon: 'ti ti-layout-kanban', allowBulk: true,
            fields: [{ name: 'name', label: 'Name', type: 'text', required: true }],
        }],
        createItem: vi.fn().mockResolvedValue(undefined),
        deleteItem: vi.fn().mockResolvedValue(undefined),
        restoreItem: vi.fn().mockResolvedValue(undefined),
        addTeamMember: vi.fn().mockResolvedValue(undefined),
        removeTeamMember: vi.fn().mockResolvedValue(undefined),
        getCardRoute: (card) => `/tools/project/${card.id}`,
    };
}

let adapter: KanbanAdapter;

async function renderKanban() {
    const Host = defineComponent({
        setup() {
            provide('kanban', useKanban(adapter, ref(0)));
            return () => h(KanbanView);
        },
    });
    const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] });
    return render(Host, { global: { plugins: [router, ToastService, ConfirmationService] } });
}

beforeEach(() => {
    adapter = makeAdapter();
    doApiRequest.mockImplementation((_url: string, config?: { method?: string }) => {
        if (!config?.method) {
            return Promise.resolve({ data: [0, 1, 2].map(column => ({ column, folded: false, visible: true, cards: [] })) });
        }
        return Promise.resolve({ data: null });
    });
});

afterEach(async () => {
    doApiRequest.mockReset();
    await page.viewport(1920, 1080);
});

test('renders columns and cards', async () => {
    const screen = await renderKanban();
    await expect.element(screen.getByRole('heading', { name: 'New' })).toBeVisible();
    await expect.element(screen.getByRole('heading', { name: 'Doing' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Card 1' })).toBeVisible();
    await expect.element(screen.getByText('1 / 2 tasks complete').first()).toBeVisible();
});

test('folding a column shows the collapsed strip with the count', async () => {
    const screen = await renderKanban();
    await screen.getByRole('button', { name: 'Collapse column New' }).click();
    await expect.element(screen.getByRole('button', { name: 'Expand column New' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Card 1' }).query()).toBeNull();
    expect(doApiRequest).toHaveBeenCalledWith('Kanban/Project/0/View/0/Column/1', { method: 'PATCH', data: { folded: true } });
});

test('hiding a column removes it', async () => {
    const screen = await renderKanban();
    await expect.element(screen.getByRole('heading', { name: 'Doing' })).toBeVisible();
    await screen.getByRole('button', { name: 'More actions' }).nth(2).click();
    await screen.getByRole('menuitem', { name: 'Hide column' }).click();
    expect(screen.getByRole('heading', { name: 'Doing' }).query()).toBeNull();
});

test('filtering hides cards and updates counts', async () => {
    const screen = await renderKanban();
    await expect.element(screen.getByRole('button', { name: 'Card 1' })).toBeVisible();
    await userEvent.fill(screen.getByRole('combobox', { name: 'Filter items' }), 'title:"Card 2"');
    expect(screen.getByRole('button', { name: 'Card 1' }).query()).toBeNull();
    await expect.element(screen.getByRole('button', { name: 'Card 2' })).toBeVisible();
});

test('opening a card shows the details drawer', async () => {
    const screen = await renderKanban();
    await screen.getByRole('button', { name: 'Card 3' }).click();
    await expect.element(page.getByRole('link', { name: 'Open full form' })).toBeVisible();
    await expect.element(page.getByRole('combobox', { name: 'Status' })).toBeVisible();
});

test('mobile shows one column at a time with a switcher', async () => {
    await page.viewport(400, 800);
    const screen = await renderKanban();
    await expect.element(screen.getByRole('tab', { name: /New/ })).toBeVisible();
    await expect.element(screen.getByRole('heading', { name: 'No status' })).toBeVisible();
    expect(screen.getByRole('heading', { name: 'New' }).query()).toBeNull();
    await screen.getByRole('tab', { name: /New/ }).click();
    await expect.element(screen.getByRole('heading', { name: 'New' })).toBeVisible();
    await expect.element(screen.getByRole('button', { name: 'Card 1' })).toBeVisible();
});
