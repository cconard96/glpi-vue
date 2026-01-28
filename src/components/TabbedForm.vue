<script setup lang="ts">
    import { Tabs, TabList, Tab, TabPanels, TabPanel, Message, ProgressSpinner } from 'primevue';
    import { useRoute } from 'vue-router';
    import ItemFormHeader from "@/components/forms/ItemFormHeader.vue";

    const route = useRoute();
    const component_module = route.params.component_module as string;
    const itemtype = route.params.itemtype as string;
    const items_id = parseInt(route.params.id as string);
    const {default: itemtype_model} = await import(`@/models/${component_module}/${itemtype?.charAt(0).toUpperCase() + itemtype?.slice(1)}.ts`);

    const tabs = itemtype_model.getTabs();
    const main_item = await itemtype_model.loadItem(items_id);

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
</script>

<template>
    <div>
        <ItemFormHeader :item="main_item"></ItemFormHeader>
        <Tabs value="main" class="grid grid-cols-[200px_1fr] h-full" orientation="vertical" lazy>
            <TabList :pt="{ tabList: {class: 'flex-col', 'aria-orientation': 'vertical'} }">
                <Tab v-for="tab in tabs" :key="tab.key" :value="tab.key" class="text-start border-0 px-4 py-2" @keydown="onKeyDown">{{ tab.label }}</Tab>
            </TabList>
            <TabPanels class="overflow-auto">
                <TabPanel v-for="tab in tabs" :key="tab.key" :value="tab.key" class="p-4 w-full">
                    <KeepAlive>
                        <Suspense v-if="tab.component">
                            <component :is="tab.component" :itemtype="itemtype" :items_id="items_id" :main_item="main_item" :main_itemtype_model="itemtype_model"/>
                            <template #fallback>
                                <div class="flex justify-content-center align-items-center h-full w-full">
                                    <ProgressSpinner />
                                </div>
                            </template>
                        </Suspense>
                        <div v-else>
                            <Message severity="error">There doesn't seem to be anything here</Message>
                        </div>
                    </KeepAlive>
                </TabPanel>
            </TabPanels>
        </Tabs>
        <div>

        </div>
    </div>
</template>

<style scoped>

</style>