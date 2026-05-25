<script setup lang="ts">
    import { Tag, ToggleButton } from "primevue";
    import { RouterLink } from "vue-router";
    import { useBaseItem } from "@/types";
    import { inject } from "vue";

    const mainItem: useBaseItem<any> = inject('mainItem');
    const itemDefinition = mainItem.getDefinition();
</script>

<template>
    <div class="text-lg flex justify-between p-2 w-full">
        <RouterLink :to="{ name: 'Search', params: $route.params}"
                    :title="$t('item_form.back_to_search', 'Back to search results')"
                    :aria-label="$t('item_form.back_to_search', 'Back to search results')">
            <i class="ti ti-list-search"></i>
        </RouterLink>
        <header>
            <h1>
                <i :class="`${itemDefinition.icon} mr-2`"></i>
                <span v-if="mainItem.item.value.id">{{ mainItem.item.value.name }}</span>
                <span v-else class="italic">{{ $t('item.new_item', { itemLabel: itemDefinition.getLabel(1) }, 'New {itemLabel}') }}</span>
            </h1>
        </header>
        <div v-if="mainItem.item.value.entity !== undefined && mainItem.item.value.entity !== null">
            <Tag class="ml-2">
                <div class="text-ellipsis text-nowrap"><span class="float-end">{{ mainItem.item.value.entity.name }}</span></div>
                <ToggleButton v-if="mainItem.item.value.is_recursive !== undefined" class="bg-transparent text-inherit text-(length:--p-tag-font-size) font-(--p-tag-font-weight) ps-2 py-0"
                              v-model="mainItem.item.value.is_recursive"
                              :onLabel="$t('item_form.include_child_entities', '+ Child entities')"
                              :offLabel="$t('item_form.exclude_child_entities', 'only')"
                              :title="$t('item_form.toggle_child_entities', 'Toggle including child entities')"
                              :aria-label="$t('item_form.toggle_child_entities', 'Toggle including child entities')">
                </ToggleButton>
            </Tag>
        </div>
        <div v-else></div>
    </div>
</template>

<style scoped>

</style>