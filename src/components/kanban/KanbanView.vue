<script setup lang="ts">
    import KanbanToolbar from "@/components/kanban/KanbanToolbar.vue";
    import KanbanColumnHeaders from "@/components/kanban/KanbanColumnHeaders.vue";
    import KanbanSwimlane from "@/components/kanban/KanbanSwimlane.vue";
    import { onMounted, ref } from "vue";
    import { Message } from "primevue";
    import { components } from "../../../data/hlapiv2_schema";
    import type { KanbanColumns } from "@/components/kanban/kanban";

    const props = withDefaults(defineProps<{
        showGlobal: boolean;
        itemtype: keyof components['schemas'];
        columnField: string;
        columns: KanbanColumns;
        fetchItems: (itemtype: keyof components['schemas'], boardID: string | number) => Promise<Array<{[key: string]: any}>>;
    }>(), {
        showGlobal: false,
        columnField: 'state',
    });
    const selectedBoardID = defineModel<string | number>('selectedBoardID', {
        required: true
    });
    const error = ref<boolean>(false);
    const items = ref<Array<{[key: string]: any}>>([]);

    //TODO Support existing Kanban Views (no API suport yet) which preserve column states and card orders (for prioritization)

    onMounted(async () => {
        try {
            items.value = await props.fetchItems(props.itemtype, selectedBoardID.value);
        } catch (e) {
            items.value = [];
            error.value = true;
            console.error('Error fetching Kanban items:', e);
        }
    })
</script>

<template>
    <div class="flex flex-col h-full bg-(--p-content-background)">
        <KanbanToolbar class="basis-auto" :selectedBoardID="selectedBoardID"></KanbanToolbar>
        <div class="basis-full grid grid-rows-[auto_1fr] overflow-x-auto">
            <KanbanColumnHeaders class="basis-auto" :columns="columns" :items="items" :columnField="columnField">
                <template v-for="(_, name) in $slots" #[name]="slotData">
                    <slot :name="name" v-bind="slotData || {}" />
                </template>
            </KanbanColumnHeaders>
            <KanbanSwimlane v-if="!error" class="basis-full w-full overflow-y-hidden" :columns="columns" :items="items" :columnField="columnField">
                <template v-for="(_, name) in $slots" #[name]="slotData">
                    <slot :name="name" v-bind="slotData || {}" />
                </template>
            </KanbanSwimlane>
            <Message v-else severity="error" icon="ti ti-exclamation-circle">{{ $t('kanban.error.loading', 'An error occured while loading the items in this Kanban.') }}</Message>
        </div>
    </div>
</template>

<style scoped>

</style>