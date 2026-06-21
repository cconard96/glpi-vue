<script setup lang="ts">
    import { Message, ProgressSpinner, Tab, TabList, TabPanels, Tabs } from 'primevue';
    import LazyTabPanel from "@/common/LazyTabPanel.vue";
    import { computed, useTemplateRef } from "vue";
    import { TabDefinition } from "@/types";
    import { useDeviceCapabilities } from "@/common/useDeviceCapabilities.ts";

    const props = defineProps<{
        tabs: TabDefinition[],
    }>();
    defineEmits<{
        (e: 'update:value', value: string): void;
    }>();

    const tab_panel_refs = useTemplateRef('tabPanelRefs');
    const { isMobileScreenSize } = useDeviceCapabilities();
    const tab_orientation = computed(() => isMobileScreenSize.value ? 'horizontal' : 'vertical');
    const tablist_pt = computed(() => ({
        tabList: {
            class: tab_orientation.value === 'vertical' ? 'flex-col overflow-y-auto max-h-full' : '',
            'aria-orientation': tab_orientation.value
        }
    }));

    const main_tab = props.tabs.find(tab => tab.key === 'main') || props.tabs[0];

    function onKeyDown(e: KeyboardEvent) {
        if (isMobileScreenSize.value) {
            return;
        }
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
    <Tabs v-if="tabs.length > 1" :value="main_tab.key" @update:value="$emit('update:value', $event as string)"
          :class="tab_orientation === 'vertical' ? 'grid grid-cols-[200px_1fr] overflow-hidden' : 'min-w-[0]'" :orientation="tab_orientation"
          :lazy="tab_orientation === 'vertical'"
          :scrollable="tab_orientation === 'horizontal'"
    >
        <TabList :pt="tablist_pt">
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
                    <Message severity="info">{{ $t('common.error.not_implemented', "Not implemented") }}</Message>
                </div>
            </LazyTabPanel>
        </TabPanels>
    </Tabs>
    <component v-else :is="main_tab?.component"/>
</template>

<style scoped>

</style>