<script setup lang="ts">
    import { Message, ProgressSpinner, Tab, TabList, TabPanels, Tabs } from 'primevue';
    import LazyTabPanel from "@/components/core/LazyTabPanel.vue";
    import { ref, useTemplateRef } from "vue";
    import { TabDefinition } from "@/types";

    const props = defineProps<{
        tabs: TabDefinition[],
    }>();
    defineEmits<{
        (e: 'update:value', value: string): void;
    }>();

    const tab_panel_refs = useTemplateRef('tabPanelRefs');

    const main_tab = props.tabs.find(tab => tab.key === 'main') || props.tabs[0];

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
    <Tabs v-if="tabs.length > 1" :value="main_tab.key" @update:value="$emit('update:value', $event as string)" class="grid grid-cols-[200px_1fr] overflow-hidden" orientation="vertical" lazy>
        <TabList :pt="{ tabList: {class: 'flex-col overflow-y-auto max-h-full', 'aria-orientation': 'vertical'} }">
            <Tab v-for="tab in tabs" :key="tab.key" :value="tab.key" class="text-start border-0 px-4 py-2" @keydown="onKeyDown">
                <i v-if="tab.icon" :class="`${tab.icon} me-2`"></i>
                {{ tab.label }}
            </Tab>
        </TabList>
        <TabPanels class="overflow-auto">
            <LazyTabPanel v-for="tab in tabs" :key="tab.key" :value="tab.key" class="p-4 w-full" ref="tabPanelRefs">
                <Suspense v-if="tab.component">
                    <component :is="tab.component"/>
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
    <component v-else :is="main_tab?.component"/>
</template>

<style scoped>

</style>