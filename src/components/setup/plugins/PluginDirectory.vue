<script setup lang="ts">
    import { DataView, Menubar, SelectButton, Message, Avatar } from "primevue";
    import { onMounted, ref } from "vue";
    import { useApi } from "@/composables/useApi.ts";

    const PluginState = {
        [-1]: 'Unknown',
        0: 'New',
        1: 'Enabled',
        2: 'Not installed',
        3: 'Needs configured',
        4: 'Disabled',
        5: 'Missing (Needs cleaned up)',
        6: 'To update',
        7: 'Replaced',
    };

    const pluginTabs = [
        {label: 'Installed', value: 'installed'},
        {label: 'Popular', value: 'popular'},
        {label: 'Recommended', value: 'recommended'},
    ];

    const { doGraphQLRequest } = useApi();
    const layout = ref('grid');

    const installedPlugins = ref([]);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Plugin {
                    internal_name name version state author homepage license
                }
            }
        `).then((res) => {
            installedPlugins.value = res.data.Plugin;
        });
    });

    function getPluginInitials(plugin) {
        if (plugin.name) {
            return plugin.name.split(' ').map(word => word[0]).join('').toUpperCase().slice(0, 2);
        }
        return plugin.internal_name.slice(0, 2).toUpperCase();
    }
</script>

<template>
    <section class="overflow-hidden">
        <DataView :value="installedPlugins" :rows="installedPlugins.length" :layout="layout" class="h-full flex flex-col" :pt:content="{'class': 'h-full overflow-y-auto'}">
            <template #header>
                <div class="flex flex-row justify-between">
                    <Menubar :model="pluginTabs" class="p-0" modelValue="installed"></Menubar>
                    <SelectButton v-model="layout" :options="['list', 'grid']">
                        <template #option="slotProps">
                            <i
                                :title="slotProps.option === 'list' ? 'List' : 'Grid'"
                                :aria-label="slotProps.option === 'list' ? 'List' : 'Grid'"
                                :class="slotProps.option === 'list' ? 'ti ti-layout-list' : 'ti ti-layout-grid'"
                            ></i>
                        </template>
                    </SelectButton>
                </div>
            </template>
            <template #list>
                <div class="p-2">
                    <div v-for="plugin in installedPlugins" :key="plugin.internal_name" class="flex p-2 mb-2 border border-(--p-dataview-border-color) rounded-lg">
                        <Avatar :label="getPluginInitials(plugin)" class="me-4 basis-auto" size="large"></Avatar>
                        <div class="grow shrink basis-0">
                            <div class="text-lg font-semibold mb-1">{{ plugin.name }} <span class="text-sm text-muted-color">v{{ plugin.version }}</span></div>
                            <div class="mb-1"><strong>State:</strong> {{ PluginState[plugin.state] }}</div>
                            <div class="mb-1" v-if="plugin.author">
                                <i class="ti ti-users me-2"></i>
                                <strong>Author: </strong><span v-dompurify-html="plugin.author"></span>
                            </div>
                            <div class="mb-1" v-if="plugin.homepage">
                                <i class="ti ti-world me-2"></i>
                                <strong>Homepage: </strong><a :href="plugin.homepage" target="_blank">{{ plugin.homepage }}</a>
                            </div>
                            <div v-if="plugin.license">
                                <i class="ti ti-license me-2"></i>
                                <strong>License: </strong><span v-dompurify-html="plugin.license"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #grid>
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
                    <div v-for="plugin in installedPlugins" :key="plugin.internal_name" class="flex p-4 border border-(--p-dataview-border-color) rounded-lg shadow-sm">
                        <Avatar :label="getPluginInitials(plugin)" class="me-4 basis-auto" size="xlarge"></Avatar>
                        <div class="grow shrink basis-0">
                            <div class="text-xl font-semibold mb-2">{{ plugin.name }} <span class="text-sm text-muted-color">v{{ plugin.version }}</span></div>
                            <div class="mb-2"><strong>State:</strong> {{ PluginState[plugin.state] }}</div>
                            <div class="mb-2" v-if="plugin.author">
                                <i class="ti ti-users me-2"></i>
                                <strong>Author: </strong><span v-dompurify-html="plugin.author"></span>
                            </div>
                            <div class="mb-2" v-if="plugin.homepage">
                                <i class="ti ti-world me-2"></i>
                                <strong>Homepage: </strong><a :href="plugin.homepage" target="_blank">{{ plugin.homepage }}</a>
                            </div>
                            <div v-if="plugin.license">
                                <i class="ti ti-license me-2"></i>
                                <strong>License: </strong><span v-dompurify-html="plugin.license"></span>
                            </div>
                        </div>
                    </div>
                </div>
            </template>
            <template #empty>
                <Message severity="info" class="m-4">No plugins found.</Message>
            </template>
        </DataView>
    </section>
</template>

<style scoped>

</style>