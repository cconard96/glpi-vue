import type { UseKanbanOptions, KanbanColumns } from "@/components/kanban/kanban";
import { onMounted, ref } from "vue";


export async function useKanban(options: UseKanbanOptions) {
    const columns = ref<KanbanColumns>();

    onMounted(async () => {
        columns.value = await options.fetchColumns();
    });

    return {};
}