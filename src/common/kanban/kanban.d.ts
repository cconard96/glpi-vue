export type KanbanTeamItemtype = 'User' | 'Group' | 'Supplier' | 'Contact';

export interface KanbanTeamMember {
    /** ID of the team relation itself (needed to remove the member) */
    id?: number;
    itemtype: KanbanTeamItemtype;
    items_id: number;
    /** Optional role label (Manager, Member, Assignee, etc.) */
    role?: string;
}

export interface KanbanColumnDef {
    id: number;
    label: string;
    /** CSS color or null for the default color */
    color: string | null;
    /** Columns which can never be hidden or moved (Ex: "No status") */
    protected?: boolean;
    /** Columns which can receive cards but whose cards are not loaded */
    dropOnly?: boolean;
}

export interface KanbanCardMeta {
    is_milestone?: boolean;
    percent_done?: number | null;
    due_date?: string | null;
    tasks_done?: number;
    tasks_total?: number;
    type_name?: string | null;
}

export interface KanbanCard {
    /** Unique key in the form `${itemtype}-${id}` (same format GLPI uses in Kanban states) */
    key: string;
    itemtype: string;
    id: number;
    column: number;
    name: string;
    icon: string;
    content?: string;
    is_deleted: boolean;
    readonly: boolean;
    parent?: { itemtype: string; id: number; name: string } | null;
    team: KanbanTeamMember[];
    meta: KanbanCardMeta;
}

export interface KanbanColumnState {
    column: number;
    folded: boolean;
    visible: boolean;
    /** Card keys in display order */
    cards: string[];
}

export interface KanbanBoard {
    id: number;
    name: string;
}

export interface KanbanRights {
    /** Can fold/hide/show/reorder columns and have the changes persisted */
    canModifyView: boolean;
    /** Can choose the position of cards within a column */
    canOrderCard: boolean;
    canCreateItem: boolean;
    canCreateColumn: boolean;
    canDeleteItem: boolean;
    /** If set, items may only be created in these columns */
    createLimitedColumns?: number[] | null;
}

export interface KanbanFilterTag {
    description: string;
    /** Supported prefixes. `!` for exclusion and `#` for regex */
    supported_prefixes?: Array<'!' | '#'>;
    /** Suggested values for autocomplete */
    autocomplete_values?: string[] | (() => string[]);
}

export interface KanbanItemField {
    name: string;
    label: string;
    type: 'text' | 'textarea' | 'board';
    required?: boolean;
}

export interface KanbanCreatableItemtype {
    itemtype: string;
    label: string;
    icon: string;
    fields: KanbanItemField[];
    allowBulk: boolean;
}

export interface KanbanAdapter {
    /** The itemtype of the board (Project, Ticket, etc.) */
    boardItemtype: 'Project' | 'Ticket' | 'Change' | 'Problem';
    fetchBoards(currentBoardId: number): Promise<KanbanBoard[]>;
    fetchColumns(): Promise<KanbanColumnDef[]>;
    fetchCards(boardId: number): Promise<KanbanCard[]>;
    /** Get the rights for the board. Called after cards are loaded. */
    getRights(boardId: number): Promise<KanbanRights>;
    updateCardColumn(card: KanbanCard, column: number): Promise<void>;
    creatableItemtypes(boardId: number): KanbanCreatableItemtype[];
    createItem(itemtype: string, input: Record<string, any>): Promise<void>;
    deleteItem(card: KanbanCard, force: boolean): Promise<void>;
    restoreItem(card: KanbanCard): Promise<void>;
    createColumn?(name: string, extra: Record<string, any>): Promise<number>;
    addTeamMember(card: KanbanCard, member: KanbanTeamMember): Promise<void>;
    removeTeamMember(card: KanbanCard, member: KanbanTeamMember): Promise<void>;
    /** Team member itemtypes which can be added to cards */
    teamItemtypes: KanbanTeamItemtype[];
    filterTags: Record<string, KanbanFilterTag>;
    /** Route location to open the full form of a card */
    getCardRoute(card: KanbanCard): string | null;
}

