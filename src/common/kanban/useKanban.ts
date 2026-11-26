import type {
    KanbanAdapter, KanbanBoard, KanbanCard, KanbanColumnDef, KanbanColumnState, KanbanRights, KanbanTeamMember,
} from "@/common/kanban/kanban";
import { computed, ref, shallowRef, watch, type Ref } from "vue";
import { useIntervalFn, useDocumentVisibility } from "@vueuse/core";
import { useApi } from "@/common/api/useApi";
import { useSessionStore } from "@/common/useSessionStore";
import { usePreferencesStore } from "@/common/usePreferencesStore";
import { useActorCache } from "@/common/actor/useActorCache";
import { cardMatchesFilter, InvalidFilterRegexError, tokenizeFilter } from "@/common/kanban/useKanbanFilter";
import { useToast } from "@cjdevstudios/bumblevue/usetoast";
import { useI18n } from "vue-i18n";

export const DEFAULT_RIGHTS: KanbanRights = {
    canModifyView: false,
    canOrderCard: false,
    canCreateItem: false,
    canCreateColumn: false,
    canDeleteItem: false,
    createLimitedColumns: null,
};

export function cardKey(itemtype: string, id: number): string {
    return `${itemtype}-${id}`;
}

function parseCardKey(key: string): { itemtype: string; items_id: number } {
    const [itemtype, id] = key.split('-', 2);
    return { itemtype, items_id: Number(id) };
}

function getErrorStatus(e: unknown): number | undefined {
    return (e as { response?: { status?: number } })?.response?.status;
}

/**
 * Order columns the same way GLPI does: columns with an ID <= 0 (Ex: "No status") first, then the order from the view state, then the rest in their natural order.
 */
export function orderColumns(defs: KanbanColumnDef[], state: KanbanColumnState[] | null): KanbanColumnDef[] {
    const state_index = new Map((state ?? []).map((s, i) => [s.column, i]));
    const def_index = new Map(defs.map((d, i) => [d.id, i]));
    return [...defs].sort((a, b) => {
        const a_special = a.id <= 0 ? 0 : 1;
        const b_special = b.id <= 0 ? 0 : 1;
        if (a_special !== b_special) {
            return a_special - b_special;
        }
        const a_state = state_index.get(a.id) ?? Number.MAX_SAFE_INTEGER;
        const b_state = state_index.get(b.id) ?? Number.MAX_SAFE_INTEGER;
        if (a_state !== b_state) {
            return a_state - b_state;
        }
        return def_index.get(a.id)! - def_index.get(b.id)!;
    });
}

/**
 * Check if a column is visible. When no state exists, all columns are visible (GLPI default).
 * When a state exists, only columns present in the state and not explicitly hidden are visible. Protected columns are always visible.
 */
export function isColumnVisible(def: KanbanColumnDef, state: KanbanColumnState[] | null): boolean {
    if (def.protected || state === null) {
        return true;
    }
    const col_state = state.find(s => s.column === def.id);
    return col_state !== undefined && col_state.visible !== false;
}

/**
 * Order cards in a column: cards saved in the view state first (in that order), then the remaining cards in their natural order.
 */
export function orderCards(cards: KanbanCard[], saved_order: string[] | undefined): KanbanCard[] {
    if (!saved_order?.length) {
        return cards;
    }
    const index = new Map(saved_order.map((k, i) => [k, i]));
    return [...cards].sort((a, b) => (index.get(a.key) ?? Number.MAX_SAFE_INTEGER) - (index.get(b.key) ?? Number.MAX_SAFE_INTEGER));
}

/**
 * Compute the new card order for a column after inserting a card.
 * @param column_order The current order of all cards in the target column (excluding the moved card)
 * @param visible_order The current order of visible (not filtered out) cards in the target column (excluding the moved card)
 * @param card_key The moved card
 * @param visible_index The index the card was dropped at among the visible cards
 */
export function insertCardInOrder(column_order: string[], visible_order: string[], card_key: string, visible_index: number): string[] {
    const result = column_order.filter(k => k !== card_key);
    const visible = visible_order.filter(k => k !== card_key);
    if (visible_index >= visible.length) {
        // Insert after the last visible card (or at the end)
        const last_visible = visible[visible.length - 1];
        const pos = last_visible !== undefined ? result.indexOf(last_visible) + 1 : result.length;
        result.splice(pos, 0, card_key);
    } else {
        const before = visible[Math.max(0, visible_index)];
        result.splice(result.indexOf(before), 0, card_key);
    }
    return result;
}

export function useKanban(adapter: KanbanAdapter, boardId: Ref<number>) {
    const { doApiRequest } = useApi();
    const session = useSessionStore();
    const preferences = usePreferencesStore();
    const { loadActors, getActorName } = useActorCache();
    const toast = useToast();
    const { t: $t } = useI18n();

    const boards = ref<KanbanBoard[]>([]);
    const columnDefs = ref<KanbanColumnDef[]>([]);
    const cards = ref<KanbanCard[]>([]);
    /** The view state or null if there is no saved state */
    const viewState = ref<KanbanColumnState[] | null>(null);
    const rights = shallowRef<KanbanRights>({ ...DEFAULT_RIGHTS });
    /** True if an existing, valid view state was loaded from the server so changes can be sent to it */
    const canPersistView = ref(false);
    const isLoading = ref(true);
    const isRefreshing = ref(false);
    const error = ref<unknown>(null);
    const filterText = ref('');
    const isDragging = ref(false);
    const mobileColumnId = ref<number | null>(null);
    let view_save_error_shown = false;

    const viewUsersId = computed(() => boardId.value <= 0 ? (session.user_id ?? 0) : 0);
    const viewEndpoint = computed(() => `Kanban/${adapter.boardItemtype}/${boardId.value}/View/${viewUsersId.value}`);
    const shouldPersistView = computed(() => rights.value.canModifyView && canPersistView.value);

    // region Derived state
    const allOrderedColumns = computed(() => orderColumns(columnDefs.value, viewState.value));
    const orderedColumns = computed(() => allOrderedColumns.value.filter(c => isColumnVisible(c, viewState.value)));
    const hiddenColumns = computed(() => allOrderedColumns.value.filter(c => !isColumnVisible(c, viewState.value)));

    function getColumnState(column_id: number): KanbanColumnState | undefined {
        return viewState.value?.find(s => s.column === column_id);
    }

    function isFolded(column_id: number): boolean {
        return getColumnState(column_id)?.folded ?? false;
    }

    function getMemberName(m: KanbanTeamMember): string {
        return getActorName(m.itemtype, m.items_id);
    }

    const filterTokens = computed(() => tokenizeFilter(filterText.value, adapter.filterTags));
    /** Keys of cards which match the current filter (null if there is no active filter) and the filter error, if any */
    const filterResult = computed<{ keys: Set<string> | null; error: string | null }>(() => {
        const tokens = filterTokens.value;
        if (tokens.length === 0) {
            return { keys: null, error: null };
        }
        try {
            return { keys: new Set(cards.value.filter(c => cardMatchesFilter(c, tokens, getMemberName)).map(c => c.key)), error: null };
        } catch (e) {
            if (e instanceof InvalidFilterRegexError) {
                return {
                    keys: null,
                    error: $t('kanban.filter.invalid_regex', 'The regular expression you entered is invalid. Please check it and try again.'),
                };
            }
            throw e;
        }
    });
    const filterError = computed(() => filterResult.value.error);

    function isCardVisible(card: KanbanCard): boolean {
        const keys = filterResult.value.keys;
        return keys === null || keys.has(card.key);
    }

    /** All cards per column in display order, including cards which don't match the filter */
    const allCardsByColumn = computed(() => {
        const map = new Map<number, KanbanCard[]>();
        for (const card of cards.value) {
            if (!map.has(card.column)) {
                map.set(card.column, []);
            }
            map.get(card.column)!.push(card);
        }
        for (const [column_id, column_cards] of map) {
            map.set(column_id, orderCards(column_cards, getColumnState(column_id)?.cards));
        }
        return map;
    });

    /** Visible cards per column in display order */
    const cardsByColumn = computed(() => {
        const map = new Map<number, KanbanCard[]>();
        for (const [column_id, column_cards] of allCardsByColumn.value) {
            map.set(column_id, column_cards.filter(isCardVisible));
        }
        return map;
    });

    function getColumnCount(column_id: number): number {
        return cardsByColumn.value.get(column_id)?.length ?? 0;
    }

    const mobileColumn = computed(() => {
        return orderedColumns.value.find(c => c.id === mobileColumnId.value) ?? orderedColumns.value[0] ?? null;
    });

    function canCreateInColumn(column_id: number): boolean {
        const limited = rights.value.createLimitedColumns;
        return rights.value.canCreateItem && (!limited || limited.includes(column_id));
    }
    // endregion

    // region Loading
    async function loadViewState(): Promise<void> {
        try {
            const response = await doApiRequest(viewEndpoint.value);
            const data = (response.data ?? []) as Array<{ column: number; folded?: boolean; visible?: boolean; cards?: Array<{ itemtype: string; items_id: number }> }>;
            viewState.value = Array.isArray(data) ? data.map(s => ({
                column: Number(s.column),
                folded: !!s.folded,
                visible: s.visible !== false,
                cards: (s.cards ?? []).map(c => cardKey(c.itemtype, c.items_id)),
            })) : null;
            // Only update an existing, valid state.
            canPersistView.value = Array.isArray(data);
        } catch (e) {
            viewState.value = null;
            const status = getErrorStatus(e);
            // A 404 means there is no saved state yet. The HL API cannot correctly create a new state yet:
            // - PATCH .../Column/{id} saves a single column object instead of a list, which corrupts the state.
            // - Columns which are not already in a state cannot be added to it.
            // Changes are kept locally until a state exists (Ex: created by the GLPI UI).
            canPersistView.value = false;
            if (status !== 404 && status !== 403) {
                console.warn('Failed to load the Kanban view state', e);
            }
        }
    }

    async function loadCards(): Promise<void> {
        const new_cards = await adapter.fetchCards(boardId.value);
        cards.value = new_cards;
        void loadActors(new_cards.flatMap(c => c.team));
    }

    async function load(): Promise<void> {
        isLoading.value = true;
        error.value = null;
        try {
            const [defs] = await Promise.all([
                columnDefs.value.length ? Promise.resolve(columnDefs.value) : adapter.fetchColumns(),
                loadCards(),
                loadViewState(),
                adapter.getRights(boardId.value).then(r => rights.value = r),
                adapter.fetchBoards(boardId.value).then(b => boards.value = b).catch((e) => {
                    console.warn('Failed to load Kanban boards', e);
                }),
            ]);
            columnDefs.value = defs;
        } catch (e) {
            error.value = e;
            console.error('Failed to load Kanban', e);
        } finally {
            isLoading.value = false;
        }
    }

    /** Reload the columns, cards and view state without showing the loading state. */
    async function refresh(): Promise<void> {
        if (isRefreshing.value) {
            return;
        }
        isRefreshing.value = true;
        try {
            const [defs] = await Promise.all([adapter.fetchColumns(), loadCards(), loadViewState()]);
            columnDefs.value = defs;
            error.value = null;
        } catch (e) {
            console.error('Failed to refresh Kanban', e);
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('kanban.error.refresh', 'Failed to refresh the Kanban.'),
                life: 5000,
            });
        } finally {
            isRefreshing.value = false;
        }
    }

    watch(boardId, () => {
        viewState.value = null;
        cards.value = [];
        mobileColumnId.value = null;
        void load();
    }, { immediate: true });

    // Background refresh using the user's "refresh views" preference (minutes)
    const visibility = useDocumentVisibility();
    const refreshIntervalMinutes = computed(() => Number(preferences.preferences?.refresh_view_interval ?? 0));
    const backgroundRefresh = useIntervalFn(() => {
        if (!isDragging.value && visibility.value === 'visible' && !isLoading.value) {
            void refresh();
        }
    }, () => Math.max(1, refreshIntervalMinutes.value) * 60 * 1000, { immediate: false });
    watch(refreshIntervalMinutes, (minutes) => {
        if (minutes > 0) {
            backgroundRefresh.resume();
        } else {
            backgroundRefresh.pause();
        }
    }, { immediate: true });
    // endregion

    // region View state
    function notifyViewSaveError(e: unknown) {
        console.warn('Failed to save the Kanban view state', e);
        if (!view_save_error_shown) {
            view_save_error_shown = true;
            toast.add({
                severity: 'warn',
                summary: $t('kanban.error.view_save_title', 'Kanban view not saved'),
                detail: $t('kanban.error.view_save', 'Your changes to the Kanban view could not be saved.'),
                life: 5000,
            });
        }
    }

    /** Ensure a state exists locally, creating one from the current display if needed */
    function ensureViewState(): KanbanColumnState[] {
        if (viewState.value === null) {
            viewState.value = allOrderedColumns.value.map(c => ({
                column: c.id,
                folded: false,
                visible: true,
                cards: [],
            }));
        }
        return viewState.value;
    }

    function ensureColumnState(column_id: number): KanbanColumnState {
        const state = ensureViewState();
        let col_state = state.find(s => s.column === column_id);
        if (!col_state) {
            col_state = { column: column_id, folded: false, visible: true, cards: [] };
            state.push(col_state);
        }
        return col_state;
    }

    async function patchColumn(column_id: number, body: { folded?: boolean; visible?: boolean; position?: number }) {
        if (!shouldPersistView.value) {
            return;
        }
        try {
            await doApiRequest(`${viewEndpoint.value}/Column/${column_id}`, { method: 'PATCH', data: body });
        } catch (e) {
            notifyViewSaveError(e);
        }
    }

    async function setFolded(column_id: number, folded: boolean) {
        ensureColumnState(column_id).folded = folded;
        await patchColumn(column_id, { folded });
    }

    function toggleFold(column_id: number) {
        return setFolded(column_id, !isFolded(column_id));
    }

    async function setColumnVisible(column_id: number, visible: boolean) {
        const def = columnDefs.value.find(c => c.id === column_id);
        if (def?.protected && !visible) {
            return;
        }
        ensureColumnState(column_id).visible = visible;
        await patchColumn(column_id, { visible });
    }

    /**
     * Move a visible column to a new position among the visible columns.
     */
    async function moveColumn(column_id: number, visible_index: number) {
        const def = columnDefs.value.find(c => c.id === column_id);
        if (!def || def.protected || def.id <= 0) {
            return;
        }
        const visible_ids = orderedColumns.value.map(c => c.id).filter(id => id !== column_id);
        // Never move before special columns
        const min_index = visible_ids.filter(id => id <= 0).length;
        visible_ids.splice(Math.max(min_index, visible_index), 0, column_id);

        const state = ensureViewState();
        ensureColumnState(column_id);
        const by_id = new Map(state.map(s => [s.column, s]));
        const new_state = [
            ...visible_ids.map(id => by_id.get(id) ?? { column: id, folded: false, visible: true, cards: [] }),
            ...state.filter(s => !visible_ids.includes(s.column)),
        ];
        viewState.value = new_state;
        await patchColumn(column_id, { position: new_state.findIndex(s => s.column === column_id) });
    }

    async function resetView() {
        if (shouldPersistView.value) {
            try {
                await doApiRequest(viewEndpoint.value, { method: 'DELETE' });
            } catch (e) {
                if (getErrorStatus(e) !== 404) {
                    notifyViewSaveError(e);
                }
            }
        }
        viewState.value = null;
        await refresh();
    }
    // endregion

    // region Cards
    function findCard(key: string): KanbanCard | undefined {
        return cards.value.find(c => c.key === key);
    }

    /**
     * Check if a card can be dropped in the specified column/position.
     * Without the "order card" right, cards cannot be reordered within a column and are always added at the end of another column.
     */
    function canDropCard(card: KanbanCard, to_column: number): boolean {
        if (card.readonly) {
            return false;
        }
        if (!rights.value.canOrderCard && card.column === to_column) {
            return false;
        }
        const def = columnDefs.value.find(c => c.id === to_column);
        return def !== undefined;
    }

    async function moveCard(key: string, to_column: number, visible_index: number): Promise<boolean> {
        const card = findCard(key);
        if (!card || !canDropCard(card, to_column)) {
            return false;
        }
        const from_column = card.column;
        const previous_state = viewState.value ? JSON.parse(JSON.stringify(viewState.value)) as KanbanColumnState[] : null;

        const column_order = (allCardsByColumn.value.get(to_column) ?? []).map(c => c.key).filter(k => k !== key);
        const visible_order = (cardsByColumn.value.get(to_column) ?? []).map(c => c.key).filter(k => k !== key);
        const new_order = rights.value.canOrderCard
            ? insertCardInOrder(column_order, visible_order, key, visible_index)
            : [...column_order, key];

        // Optimistic update
        card.column = to_column;
        if (rights.value.canOrderCard) {
            for (const s of ensureViewState()) {
                s.cards = s.cards.filter(k => k !== key);
            }
            ensureColumnState(to_column).cards = new_order;
        } else if (viewState.value) {
            for (const s of viewState.value) {
                s.cards = s.cards.filter(k => k !== key);
            }
        }

        if (from_column !== to_column) {
            try {
                await adapter.updateCardColumn(card, to_column);
            } catch (e) {
                card.column = from_column;
                viewState.value = previous_state;
                console.error('Failed to move card', e);
                toast.add({
                    severity: 'error',
                    summary: $t('common.error.error', 'Error'),
                    detail: $t('kanban.error.move_card', 'Failed to move the item. You may not have permission to update it.'),
                    life: 5000,
                });
                return false;
            }
        }

        if (rights.value.canOrderCard && shouldPersistView.value) {
            try {
                await doApiRequest(`${viewEndpoint.value}/Column/${to_column}/Cards`, {
                    method: 'PUT',
                    data: new_order.map((k, position) => ({ ...parseCardKey(k), position })),
                });
            } catch (e) {
                notifyViewSaveError(e);
            }
        }
        return true;
    }

    async function addItem(itemtype: string, input: Record<string, any>): Promise<boolean> {
        try {
            await adapter.createItem(itemtype, input);
            await refresh();
            return true;
        } catch (e) {
            console.error('Failed to add item', e);
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('kanban.error.add_item', 'Failed to add the item.'),
                life: 5000,
            });
            return false;
        }
    }

    /**
     * Add one item per non-empty line. Inputs other than the name are shared by all items.
     * @returns The number of items successfully added
     */
    async function bulkAddItems(itemtype: string, lines: string[], input: Record<string, any>): Promise<number> {
        const names = lines.map(l => l.trim()).filter(l => l !== '');
        let added = 0;
        for (const name of names) {
            try {
                await adapter.createItem(itemtype, { ...input, name });
                added++;
            } catch (e) {
                console.error(`Failed to add item "${name}"`, e);
            }
        }
        if (added < names.length) {
            toast.add({
                severity: 'warn',
                summary: $t('kanban.bulk_add.title', 'Bulk add'),
                detail: $t('kanban.bulk_add.partial', { added, total: names.length }, '{added} of {total} items were added.'),
                life: 5000,
            });
        } else if (added > 0) {
            toast.add({
                severity: 'success',
                summary: $t('kanban.bulk_add.title', 'Bulk add'),
                detail: $t('kanban.bulk_add.success', { added }, '{added} items were added.'),
                life: 3000,
            });
        }
        await refresh();
        return added;
    }

    /** Delete the card's item, or purge it if it is already deleted */
    async function deleteCard(card: KanbanCard): Promise<void> {
        const force = card.is_deleted;
        try {
            await adapter.deleteItem(card, force);
            if (force) {
                cards.value = cards.value.filter(c => c.key !== card.key);
            } else {
                card.is_deleted = true;
            }
        } catch (e) {
            console.error('Failed to delete item', e);
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('kanban.error.delete_item', 'Failed to delete the item.'),
                life: 5000,
            });
        }
    }

    async function restoreCard(card: KanbanCard): Promise<void> {
        try {
            await adapter.restoreItem(card);
            card.is_deleted = false;
        } catch (e) {
            console.error('Failed to restore item', e);
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('kanban.error.restore_item', 'Failed to restore the item.'),
                life: 5000,
            });
        }
    }

    async function addTeamMembers(card: KanbanCard, members: KanbanTeamMember[]): Promise<void> {
        let failed = 0;
        for (const member of members) {
            try {
                await adapter.addTeamMember(card, member);
            } catch (e) {
                failed++;
                console.error('Failed to add team member', e);
            }
        }
        if (failed > 0) {
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('kanban.error.add_team_member', 'Failed to add one or more team members.'),
                life: 5000,
            });
        }
        await refresh();
    }

    async function removeTeamMember(card: KanbanCard, member: KanbanTeamMember): Promise<void> {
        const previous_team = [...card.team];
        card.team = card.team.filter(m => m !== member);
        try {
            await adapter.removeTeamMember(card, member);
        } catch (e) {
            card.team = previous_team;
            console.error('Failed to remove team member', e);
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('kanban.error.remove_team_member', 'Failed to remove the team member.'),
                life: 5000,
            });
        }
    }
    // endregion

    // region Columns
    async function createColumn(name: string, extra: Record<string, any> = {}): Promise<boolean> {
        if (!adapter.createColumn || !rights.value.canCreateColumn) {
            return false;
        }
        try {
            const new_id = await adapter.createColumn(name, extra);
            columnDefs.value = await adapter.fetchColumns();
            if (viewState.value !== null) {
                await setColumnVisible(new_id, true);
            }
            return true;
        } catch (e) {
            console.error('Failed to create column', e);
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('kanban.error.create_column', 'Failed to create the column.'),
                life: 5000,
            });
            return false;
        }
    }
    // endregion

    return {
        adapter,
        boardId,
        boards,
        columnDefs,
        cards,
        viewState,
        rights,
        isLoading,
        isRefreshing,
        error,
        filterText,
        filterTokens,
        filterError,
        isDragging,
        mobileColumnId,
        mobileColumn,
        orderedColumns,
        hiddenColumns,
        allOrderedColumns,
        cardsByColumn,
        allCardsByColumn,
        isFolded,
        isColumnVisible: (column_id: number) => orderedColumns.value.some(c => c.id === column_id),
        getColumnCount,
        getMemberName,
        canCreateInColumn,
        canDropCard,
        findCard,
        load,
        refresh,
        toggleFold,
        setFolded,
        setColumnVisible,
        moveColumn,
        resetView,
        moveCard,
        addItem,
        bulkAddItems,
        deleteCard,
        restoreCard,
        addTeamMembers,
        removeTeamMember,
        createColumn,
    };
}

export type KanbanInstance = ReturnType<typeof useKanban>;
