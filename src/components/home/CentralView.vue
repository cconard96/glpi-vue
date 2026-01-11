<script setup lang="ts">
    import { Tabs, TabList, Tab, TabPanels, TabPanel } from 'primevue';
    import DashboardView from "@/components/dashboard/DashboardView.vue";
</script>

<template>
    <div class="flex flex-col w-full">
        <Tabs value="dashboard" class="overflow-hidden h-full">
            <TabList>
                <Tab value="dashboard">Dashboard</Tab>
                <Tab value="personal">Personal</Tab>
                <Tab value="group">Group</Tab>
                <Tab value="global">Global</Tab>
                <Tab value="rss">RSS feeds</Tab>
            </TabList>
            <TabPanels class="grow shrink-0 basis-auto">
                <TabPanel value="dashboard">
                    <DashboardView current="central"></DashboardView>
                </TabPanel>
                <TabPanel value="personal">
                    <div>Personal Content</div>
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