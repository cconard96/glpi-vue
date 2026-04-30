import { ComputedRef } from "vue";

export interface KanbanColumn {
    label: string,
    color: string,
    collapsed: boolean,
}
export type KanbanColumns = Map<string, KanbanColumn>

export interface UseKanbanOptions {
    fetchColumns: () => Promise<KanbanColumns>,
    fetchItems: () => Promise<any[]>,
}