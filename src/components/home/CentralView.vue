<script setup lang="ts">
    import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue';
    import DashboardView from "@/components/dashboard/DashboardView.vue";
    import { usePreferencesStore } from "@/composables/usePreferencesStore.ts";
    import PersonalTab from "@/components/home/tabs/PersonalTab.vue";

    const tab_classes = "px-4 py-3";
    const { preferences } = usePreferencesStore();
    const active_tab = {
        0: 'dashboard',
        1: 'personal',
        2: 'group',
        3: 'global',
        4: 'rss',
    }[preferences.default_homepage_tab || 'dashboard'] || 'dashboard';
</script>

<template>
    <div class="flex flex-col w-full h-full overflow-hidden">
        <Tabs :value="active_tab" class="overflow-hidden grid grid-rows-[4rem_1fr]">
            <TabList>
                <Tab :class="tab_classes" value="dashboard">{{ $t('home.tab.dashboard', 'Dashboard') }}</Tab>
                <Tab :class="tab_classes" value="personal">{{ $t('home.tab.personal', 'Personal') }}</Tab>
                <Tab :class="tab_classes" value="group">{{ $t('home.tab.group', 'Group') }}</Tab>
                <Tab :class="tab_classes" value="global">{{ $t('home.tab.global', 'Global') }}</Tab>
                <Tab :class="tab_classes" value="rss">{{ $t('home.tab.rss', 'RSS Feeds') }}</Tab>
            </TabList>
            <TabPanels class="grow shrink-0 basis-auto overflow-y-auto">
                <TabPanel value="dashboard">
                    <DashboardView current="central"></DashboardView>
                </TabPanel>
                <TabPanel value="personal">
                    <PersonalTab></PersonalTab>
                </TabPanel>
                <TabPanel value="group">
                    <div>Group Content</div>
                </TabPanel>
                <TabPanel value="global">
                    <div>Global Content</div>
                </TabPanel>
                <TabPanel value="rss">
                    <div>RSS Feeds Content</div>
                </TabPanel>
            </TabPanels>
        </Tabs>
    </div>
</template>

<style scoped>

</style>