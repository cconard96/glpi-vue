<script setup lang="ts">
    import {Tag, ToggleButton} from "primevue";
    import {RouterLink, useRoute} from "vue-router";
    import {useMainMenu} from "@/composables/useMainMenu";
    import {AbstractModel} from "@/models/AbstractModel";

    const props = defineProps({
        item: {
            type: Object,
            required: true
        },
        itemtype_model: {
            type: Function as typeof AbstractModel,
        }
    });

    // if the passed item is a Promise, await it
    const item = props.item instanceof Promise ? await props.item : props.item;
    const itemtype_model = props.itemtype_model ?? useMainMenu().getItemtypeModelForRoute(useRoute().path);
</script>

<template>
    <div class="text-lg flex justify-between p-2 w-full">
        <RouterLink :to="{ name: 'Search', params: $route.params}">
            <i class="ti ti-list-search"></i>
        </RouterLink>
        <header>
            <h1>
                <i :class="`${itemtype_model.getIcon()} mr-2`"></i>
                <span v-if="item.id">{{ item.name }}</span>
                <span v-else class="italic">New {{ itemtype_model.getTypeName() }}</span>
            </h1>
        </header>
        <div v-if="item._entity !== undefined">
            <Tag class="ml-2">
                <div class="text-ellipsis text-nowrap"><span class="float-end">Entity: {{ item._entity.name }}</span></div>
                <ToggleButton v-if="item.is_recursive !== undefined" class="bg-transparent text-inherit text-(length:--p-tag-font-size) font-(--p-tag-font-weight) ps-2 py-0"
                              v-model="item.is_recursive" onLabel="+ Child entities" offLabel="only">
                </ToggleButton>
            </Tag>
        </div>
        <div v-else></div>
    </div>
</template>

<style scoped>

</style>