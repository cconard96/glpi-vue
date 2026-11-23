import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { effectScope, nextTick, ref } from 'vue';
import type { KanbanAdapter, KanbanCard, KanbanColumnDef, KanbanColumnState, KanbanRights } from './kanban';

const doApiRequest = vi.fn();
const toastAdd = vi.fn();
vi.mock('@/common/api/useApi', () => ({
    useApi: () => ({ doApiRequest, doGraphQLRequest: vi.fn().mockResolvedValue({ data: {} }) }),
}));
vi.mock('@cjdevstudios/bumblevue/usetoast', () => ({
    useToast: () => ({ add: toastAdd }),
}));
vi.mock('vue-i18n', () => ({
    useI18n: () => ({ t: (_key: string, ...args: any[]) => args.find(a => typeof a === 'string') ?? _key }),
}));

const { useKanban, orderColumns, orderCards, insertCardInOrder, isColumnVisible } = await import('./useKanban');
const { useSessionStore } = await import('@/common/useSessionStore');

const COLUMNS: KanbanColumnDef[] = [
    { id: 0, label: 'No status', color: null, protected: true },
    { id: 1, label: 'New', color: '#ff0000' },
    { id: 2, label: 'Doing', color: null },
    { id: 3, label: 'Done', color: null },
];

function makeCard(id: number, column: number, overrides: Partial<KanbanCard> = {}): KanbanCard {
    return {
        key: `Project-${id}`, itemtype: 'Project', id, column, name: `Card ${id}`, icon: '',
        is_deleted: false, readonly: false, team: [], meta: {}, ...overrides,
    };
}

function makeAdapter(overrides: Partial<KanbanAdapter> = {}, rights: Partial<KanbanRights> = {}): KanbanAdapter {
    return {
        boardItemtype: 'Project',
        teamItemtypes: ['User'],
        filterTags: { title: { description: '' } },
        fetchBoards: vi.fn().mockResolvedValue([{ id: 0, name: 'Global' }]),
        fetchColumns: vi.fn().mockResolvedValue(COLUMNS),
        fetchCards: vi.fn().mockResolvedValue([makeCard(1, 1), makeCard(2, 1), makeCard(3, 2)]),
        getRights: vi.fn().mockResolvedValue({
            canModifyView: true, canOrderCard: true, canCreateItem: true, canCreateColumn: false, canDeleteItem: true, createLimitedColumns: null,
            ...rights,
        }),
        updateCardColumn: vi.fn().mockResolvedValue(undefined),
        creatableItemtypes: () => [],
        createItem: vi.fn().mockResolvedValue(undefined),
        deleteItem: vi.fn().mockResolvedValue(undefined),
        restoreItem: vi.fn().mockResolvedValue(undefined),
        addTeamMember: vi.fn().mockResolvedValue(undefined),
        removeTeamMember: vi.fn().mockResolvedValue(undefined),
        getCardRoute: () => null,
        ...overrides,
    };
}

async function flush() {
    for (let i = 0; i < 5; i++) {
        await new Promise(r => setTimeout(r, 0));
        await nextTick();
    }
}

describe('pure helpers', () => {
    test('orderColumns puts special columns first, then the state order, then the rest', () => {
        const state: KanbanColumnState[] = [
            { column: 3, folded: false, visible: true, cards: [] },
            { column: 0, folded: false, visible: true, cards: [] },
            { column: 1, folded: false, visible: true, cards: [] },
        ];
        expect(orderColumns(COLUMNS, state).map(c => c.id)).toEqual([0, 3, 1, 2]);
        expect(orderColumns(COLUMNS, null).map(c => c.id)).toEqual([0, 1, 2, 3]);
    });

    test('isColumnVisible', () => {
        expect(isColumnVisible(COLUMNS[2], null)).toBe(true);
        const state: KanbanColumnState[] = [{ column: 1, folded: false, visible: false, cards: [] }];
        expect(isColumnVisible(COLUMNS[1], state)).toBe(false);
        // Not in the state
        expect(isColumnVisible(COLUMNS[2], state)).toBe(false);
        // Protected columns are always visible
        expect(isColumnVisible(COLUMNS[0], state)).toBe(true);
    });

    test('orderCards uses the saved order first', () => {
        const cards = [makeCard(1, 1), makeCard(2, 1), makeCard(3, 1)];
        expect(orderCards(cards, ['Project-3', 'Project-1']).map(c => c.id)).toEqual([3, 1, 2]);
        expect(orderCards(cards, undefined).map(c => c.id)).toEqual([1, 2, 3]);
    });

    test('insertCardInOrder accounts for hidden cards', () => {
        const all = ['A', 'B', 'C', 'D'];
        const visible = ['A', 'C', 'D'];
        expect(insertCardInOrder(all, visible, 'X', 0)).toEqual(['X', 'A', 'B', 'C', 'D']);
        // Dropped before C (visible index 1) means after the hidden B
        expect(insertCardInOrder(all, visible, 'X', 1)).toEqual(['A', 'B', 'X', 'C', 'D']);
        expect(insertCardInOrder(all, visible, 'X', 99)).toEqual(['A', 'B', 'C', 'D', 'X']);
        expect(insertCardInOrder([], [], 'X', 0)).toEqual(['X']);
        // Reordering an existing card
        expect(insertCardInOrder(['A', 'B', 'C'], ['A', 'B', 'C'], 'C', 0)).toEqual(['C', 'A', 'B']);
    });
});

const SAVED_STATE = COLUMNS.map(c => ({ column: c.id, folded: false, visible: true, cards: [] }));

describe('useKanban', () => {
    let scope: ReturnType<typeof effectScope>;

    beforeEach(() => {
        useSessionStore().$patch({ user_id: 7 });
        // An existing saved view with every column visible by default
        doApiRequest.mockImplementation((_url: string, config?: { method?: string }) => {
            if (!config?.method || config.method === 'GET') {
                return Promise.resolve({ data: SAVED_STATE.map(s => ({ ...s, cards: [] })) });
            }
            return Promise.resolve({ data: null });
        });
        scope = effectScope();
    });

    afterEach(() => {
        scope.stop();
        doApiRequest.mockReset();
        toastAdd.mockReset();
    });

    function setup(adapter: KanbanAdapter, board_id = 0) {
        const kanban = scope.run(() => useKanban(adapter, ref(board_id)))!;
        return kanban;
    }

    test('loads columns, cards and uses a per-user view for the global board', async () => {
        const kanban = setup(makeAdapter());
        await flush();
        expect(kanban.isLoading.value).toBe(false);
        expect(kanban.orderedColumns.value.map(c => c.id)).toEqual([0, 1, 2, 3]);
        expect(kanban.getColumnCount(1)).toBe(2);
        expect(doApiRequest).toHaveBeenCalledWith('Kanban/Project/0/View/7');
    });

    test('uses the shared view for a specific board', async () => {
        setup(makeAdapter(), 5);
        await flush();
        expect(doApiRequest).toHaveBeenCalledWith('Kanban/Project/5/View/0');
    });

    test('applies the saved view state', async () => {
        doApiRequest.mockImplementation(() => Promise.resolve({
            data: [
                { column: 0, folded: false, visible: true, cards: [] },
                { column: 2, folded: true, visible: true, cards: [] },
                { column: 1, folded: false, visible: true, cards: [{ itemtype: 'Project', items_id: 2 }] },
                { column: 3, folded: false, visible: false, cards: [] },
            ],
        }));
        const kanban = setup(makeAdapter());
        await flush();
        expect(kanban.orderedColumns.value.map(c => c.id)).toEqual([0, 2, 1]);
        expect(kanban.hiddenColumns.value.map(c => c.id)).toEqual([3]);
        expect(kanban.isFolded(2)).toBe(true);
        expect(kanban.cardsByColumn.value.get(1)!.map(c => c.id)).toEqual([2, 1]);
    });

    test('counts exclude filtered out cards', async () => {
        const kanban = setup(makeAdapter());
        await flush();
        kanban.filterText.value = 'title:"Card 1"';
        expect(kanban.getColumnCount(1)).toBe(1);
        expect(kanban.cardsByColumn.value.get(2)).toEqual([]);
    });

    test('folding persists the column state', async () => {
        const kanban = setup(makeAdapter());
        await flush();
        await kanban.toggleFold(2);
        expect(kanban.isFolded(2)).toBe(true);
        expect(doApiRequest).toHaveBeenCalledWith('Kanban/Project/0/View/7/Column/2', { method: 'PATCH', data: { folded: true } });
    });

    test('view changes are kept locally when there is no saved state yet', async () => {
        doApiRequest.mockImplementation((_url: string, config?: { method?: string }) => {
            return config?.method ? Promise.resolve({ data: null }) : Promise.reject({ response: { status: 404 } });
        });
        const kanban = setup(makeAdapter());
        await flush();
        expect(kanban.orderedColumns.value.map(c => c.id)).toEqual([0, 1, 2, 3]);
        await kanban.toggleFold(2);
        await kanban.setColumnVisible(3, false);
        await kanban.moveCard('Project-3', 1, 0);
        await kanban.resetView();
        expect(kanban.isFolded(2)).toBe(false);
        expect(doApiRequest).not.toHaveBeenCalledWith(expect.stringContaining('Kanban/'), expect.objectContaining({ method: expect.any(String) }));
    });

    test('view changes are not persisted if the view cannot be read', async () => {
        doApiRequest.mockImplementation((_url: string, config?: { method?: string }) => {
            return config?.method ? Promise.resolve({ data: null }) : Promise.reject({ response: { status: 403 } });
        });
        const kanban = setup(makeAdapter());
        await flush();
        await kanban.toggleFold(2);
        expect(kanban.isFolded(2)).toBe(true);
        expect(doApiRequest).not.toHaveBeenCalledWith(expect.stringContaining('/Column/'), expect.anything());
    });

    test('view changes are not persisted without the modify view right', async () => {
        const kanban = setup(makeAdapter({}, { canModifyView: false, canOrderCard: false }));
        await flush();
        await kanban.toggleFold(2);
        expect(kanban.isFolded(2)).toBe(true);
        expect(doApiRequest).not.toHaveBeenCalledWith(expect.stringContaining('/Column/'), expect.anything());
    });

    test('hiding and moving columns', async () => {
        const kanban = setup(makeAdapter());
        await flush();
        await kanban.setColumnVisible(2, false);
        expect(kanban.orderedColumns.value.map(c => c.id)).toEqual([0, 1, 3]);
        // Protected columns cannot be hidden
        await kanban.setColumnVisible(0, false);
        expect(kanban.orderedColumns.value.map(c => c.id)).toEqual([0, 1, 3]);

        await kanban.moveColumn(3, 0);
        // Cannot be moved before the special column
        expect(kanban.orderedColumns.value.map(c => c.id)).toEqual([0, 3, 1]);
        expect(doApiRequest).toHaveBeenLastCalledWith('Kanban/Project/0/View/7/Column/3', { method: 'PATCH', data: { position: 1 } });
    });

    test('moving a card updates the item and the card order', async () => {
        const adapter = makeAdapter();
        const kanban = setup(adapter);
        await flush();
        expect(await kanban.moveCard('Project-3', 1, 1)).toBe(true);
        expect(adapter.updateCardColumn).toHaveBeenCalledWith(expect.objectContaining({ id: 3 }), 1);
        expect(kanban.cardsByColumn.value.get(1)!.map(c => c.id)).toEqual([1, 3, 2]);
        expect(doApiRequest).toHaveBeenLastCalledWith('Kanban/Project/0/View/7/Column/1/Cards', {
            method: 'PUT',
            data: [
                { itemtype: 'Project', items_id: 1, position: 0 },
                { itemtype: 'Project', items_id: 3, position: 1 },
                { itemtype: 'Project', items_id: 2, position: 2 },
            ],
        });
    });

    test('a failed card move is rolled back', async () => {
        const adapter = makeAdapter({ updateCardColumn: vi.fn().mockRejectedValue(new Error('denied')) });
        const kanban = setup(adapter);
        await flush();
        expect(await kanban.moveCard('Project-3', 1, 0)).toBe(false);
        expect(kanban.findCard('Project-3')!.column).toBe(2);
        expect(kanban.cardsByColumn.value.get(1)!.map(c => c.id)).toEqual([1, 2]);
        expect(toastAdd).toHaveBeenCalledWith(expect.objectContaining({ severity: 'error' }));
    });

    test('without the order right, cards cannot be reordered in a column and go to the end of others', async () => {
        const adapter = makeAdapter({}, { canOrderCard: false });
        const kanban = setup(adapter);
        await flush();
        expect(await kanban.moveCard('Project-2', 1, 0)).toBe(false);
        expect(await kanban.moveCard('Project-3', 1, 0)).toBe(true);
        expect(kanban.cardsByColumn.value.get(1)!.map(c => c.id)).toEqual([1, 2, 3]);
        expect(doApiRequest).not.toHaveBeenCalledWith(expect.stringContaining('/Cards'), expect.anything());
    });

    test('readonly cards cannot be moved', async () => {
        const kanban = setup(makeAdapter({ fetchCards: vi.fn().mockResolvedValue([makeCard(1, 1, { readonly: true })]) }));
        await flush();
        expect(await kanban.moveCard('Project-1', 2, 0)).toBe(false);
    });

    test('delete then purge', async () => {
        const adapter = makeAdapter();
        const kanban = setup(adapter);
        await flush();
        const card = kanban.findCard('Project-1')!;
        await kanban.deleteCard(card);
        expect(adapter.deleteItem).toHaveBeenLastCalledWith(card, false);
        expect(kanban.findCard('Project-1')!.is_deleted).toBe(true);
        await kanban.deleteCard(kanban.findCard('Project-1')!);
        expect(adapter.deleteItem).toHaveBeenLastCalledWith(expect.objectContaining({ id: 1 }), true);
        expect(kanban.findCard('Project-1')).toBeUndefined();
    });

    test('bulk add creates one item per non-empty line', async () => {
        const adapter = makeAdapter();
        const kanban = setup(adapter);
        await flush();
        const added = await kanban.bulkAddItems('Project', ['One', '', '  Two  '], { column: 1 });
        expect(added).toBe(2);
        expect(adapter.createItem).toHaveBeenCalledWith('Project', { column: 1, name: 'One' });
        expect(adapter.createItem).toHaveBeenCalledWith('Project', { column: 1, name: 'Two' });
    });

    test('creation can be limited to some columns', async () => {
        const kanban = setup(makeAdapter({}, { createLimitedColumns: [0] }));
        await flush();
        expect(kanban.canCreateInColumn(0)).toBe(true);
        expect(kanban.canCreateInColumn(1)).toBe(false);
    });
});
