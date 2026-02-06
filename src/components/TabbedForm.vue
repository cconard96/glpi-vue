<script setup lang="ts">
    import { Tabs, TabList, Tab, TabPanels, TabPanel, Message, ProgressSpinner } from 'primevue';
    import { useRoute } from 'vue-router';
    import ItemFormHeader from "@/components/forms/ItemFormHeader.vue";
    import LazyTabPanel from "@/components/core/LazyTabPanel.vue";
    import {computed, ref, useTemplateRef} from "vue";

    const props = defineProps<{
        component_module: string;
        itemtype: string;
        id?: number | string;
    }>();

    const route = useRoute();
    const {default: itemtype_model} = await import(`@/models/${props.component_module}/${props.itemtype?.charAt(0).toUpperCase() + props.itemtype?.slice(1)}.ts`);
    const tab_panel_refs = useTemplateRef('tabPanelRefs');

    const tabs = itemtype_model.getTabs();
    const is_new_item = props.id === undefined || props.id === null || props.id <= 0;
    const main_item = is_new_item ? await itemtype_model.loadNewItem() : await itemtype_model.loadItem(props.id);
    /** The tab with key 'main' */
    const main_tab = tabs.find(tab => tab.key === 'main');

    function onKeyDown(e: KeyboardEvent) {
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            const prev = (e.target as HTMLElement).previousElementSibling as HTMLElement;
            if (prev && prev.classList.contains('p-tab')) {
                prev.focus();
            } else {
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                    const last = parent.querySelector('.p-tab:last-of-type') as HTMLElement;
                    if (last) {
                        last.focus();
                    }
                }
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            const next = (e.target as HTMLElement).nextElementSibling as HTMLElement;
            if (next && next.classList.contains('p-tab')) {
                next.focus();
            } else {
                const parent = (e.target as HTMLElement).parentElement;
                if (parent) {
                    const first = parent.querySelector('.p-tab:first-of-type') as HTMLElement;
                    if (first) {
                        first.focus();
                    }
                }
            }
        }
    }

    function reloadTab(tabKey: string) {
        const tabPanel = tab_panel_refs.value.find((panel: any) => panel.value === tabKey);
        if (tabPanel) {
            tabPanel.active_once = false;
            tabPanel.active_once = true;
        }
    }
</script>

<template>
    <div class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
        <ItemFormHeader :item="main_item" :itemtype_model="itemtype_model"></ItemFormHeader>
        <Tabs v-if="!is_new_item" value="main" class="grid grid-cols-[200px_1fr] overflow-hidden" orientation="vertical" lazy>
            <TabList :pt="{ tabList: {class: 'flex-col overflow-y-auto', 'aria-orientation': 'vertical'} }">
                <Tab v-for="tab in tabs" :key="tab.key" :value="tab.key" class="text-start border-0 px-4 py-2" @keydown="onKeyDown">
                    <i v-if="tab.icon" :class="`${tab.icon} me-2`"></i>
                    {{ tab.label }}
                </Tab>
            </TabList>
            <TabPanels class="overflow-auto">
                <LazyTabPanel v-for="tab in tabs" :key="tab.key" :value="tab.key" class="p-4 w-full" ref="tabPanelRefs">
                    <Suspense v-if="tab.component">
                        <component :is="tab.component" :itemtype="itemtype" :items_id="id" :main_item="main_item" :main_itemtype_model="itemtype_model"/>
                        <template #fallback>
                            <div class="flex justify-content-center align-items-center h-full w-full">
                                <ProgressSpinner />
                            </div>
                        </template>
                    </Suspense>
                    <div v-else>
                        <Message severity="info">This doesn't seem to be implemented yet</Message>
                    </div>
                </LazyTabPanel>
            </TabPanels>
        </Tabs>
        <component v-else :is="main_tab?.component" :itemtype="itemtype" :items_id="id" :main_item="main_item" :main_itemtype_model="itemtype_model"/>
    </div>
</template>

<style scoped>

</style>