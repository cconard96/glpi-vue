<script setup lang="ts">
    import KanbanCard from "@/components/kanban/KanbanCard.vue";
    import type { KanbanColumn } from "@/components/kanban/kanban";
    import { Tag } from "primevue";
    import Sortable from "sortablejs";
    import { computed, onMounted, onUnmounted, useTemplateRef } from "vue";
    import { useDeviceCapabilities } from "@/composables/useDeviceCapabilities.ts";

    defineProps<{
        columnKey: string | number,
        column: KanbanColumn,
        items: unknown,
    }>();

    const { isMobileScreenSize } = useDeviceCapabilities();
    const kanban_cards_container = useTemplateRef('kanban_cards_container');
    let sortable = null;

    const widthClass = computed(() => {
        if (!isMobileScreenSize.value) {
            return 'min-w-sm w-sm max-w-sm';
        }
        return 'min-w-full w-full max-w-full';
    });

    onMounted(() => {
        sortable = new Sortable(kanban_cards_container.value, {
            multiDrag: true,
            group: 'columns',
            animation: 150,
            draggable: '.kanban-card',
        });
    });

    onUnmounted(() => {
        if (sortable) {
            sortable.destroy();
        }
    })
</script>

<template>
    <div class="bg-[#f5f7fb] dark:bg-[#121212] p-2 overflow-y-auto" :style="`--column-color: ${column.color}`"
         :class="column.collapsed ? 'w-12' : widthClass">
        <div ref="kanban_cards_container" v-if="!column.collapsed" class="flex flex-col w-full gap-2 min-h-full">
            <KanbanCard v-for="item in items" :key="item._type + item.id" :item="item">
                <template v-for="(_, name) in $slots" #[name]="slotData">
                    <slot :name="name" v-bind="slotData || {}" />
                </template>
            </KanbanCard>
        </div>
        <div v-else class="[writing-mode:vertical-rl] text-center py-2 ps-2">
            <h2 class="text-heading-2" aria-hidden="true">
                <i class="ti ti-circle text-base" :class="column.color !== 'default' ? 'text-(--column-color)' : ''"></i>
                {{ column.label }}
                <Tag v-text="0" severity="secondary" class="px-2 py-1"></Tag>
            </h2>
        </div>
    </div>
</template>

<style scoped>

</style>