<script setup lang="ts">
    import { useDeviceCapabilities } from "@/composables/useDeviceCapabilities.ts";
    import { onMounted, ref, useId, useTemplateRef, watch } from "vue";
    import { Button, AutoComplete, InputGroup, InputGroupAddon } from "primevue";
    import DynamicSettingsForm from "@/components/setup/settings/DynamicSettingsForm.vue";
    import { useSettings, settingCategories, Setting } from "@/composables/setup/useSettings.ts";

    const { isMobileScreenSize } = useDeviceCapabilities();
    //const router = useRouter();
    const { searchQuery, filteredSettings } = useSettings();
    const activeTab = ref(null);
    /** * On Mac, show '⌘' instead of 'Ctrl' for the search shortcut. */
    const searchModifier = navigator.platform.toUpperCase().includes('MAC') ? '⌘' : 'Ctrl';
    const searchInputID = useId();

    onMounted(() => {
        function handleKeyDown(event: KeyboardEvent) {
            if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
                event.preventDefault();
                const searchInput = document.getElementById(searchInputID) as HTMLInputElement;
                console.log(searchInput);
                if (searchInput) {
                    searchInput.focus();
                }
            }
        }
        window.addEventListener('keydown', handleKeyDown);
    });

    function gotoSetting(setting: Setting) {
        // const route = getSettingRoute(setting);
        // if (route) {
        //     router.push(route);
        // }
        activeTab.value = setting.category;
    }
</script>

<template>
    <section class="h-full overflow-hidden">
        <div class="flex flex-col h-full">
            <div class="flex flex-row-reverse mb-2 basis-auto">
                <InputGroup>
                    <AutoComplete :inputId="searchInputID" placeholder="Search all settings"
                                  v-model="searchQuery" :suggestions="filteredSettings" :delay="150" optionLabel="label" @optionSelect="gotoSetting($event.value)">
                        <template #option="{option}">
                            <div v-tooltip.bottom="option.label" class="p-2 hover:bg-primary/10 rounded cursor-pointer">
                                <div class="font-semibold">
                                    {{ settingCategories[option.category].label }} > {{ option.label }}
                                </div>
                                <div class="text-sm text-muted-color">
                                    {{ option?.description }}
                                </div>
                            </div>
                        </template>
                    </AutoComplete>
                    <InputGroupAddon>
                        <kbd>{{ searchModifier }}+K</kbd>
                    </InputGroupAddon>
                </InputGroup>
            </div>
            <div class="flex flex-col h-full p-2">
                <template v-if="activeTab === null">
                    <h1 class="text-heading-1 mb-2">Settings</h1>
                    <div v-if="isMobileScreenSize" class="grid grid-cols-1 gap-2 overflow-auto px-2">
                        <div v-for="(category, categoryKey) in settingCategories" :key="categoryKey" class="p-4 border rounded-lg shadow-sm select-none cursor-pointer" role="button" @click="activeTab = categoryKey">
                            <div class="flex justify-between">
                                <h2 class="text-heading-2">
                                    <i v-if="category.icon" :class="`${category.icon} me-2`"></i>
                                    {{ category.label }}
                                </h2>
                                <Button icon="ti ti-chevron-right" variant="text" size="small" aria-label="Go to settings"
                                        class="p-0" :pt:icon="{class: 'text-2xl'}"></Button>
                            </div>
                            <div v-if="category.description" class="text-muted-color">{{ category.description }}</div>
                        </div>
                    </div>
                    <div v-else class="grid grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 overflow-auto px-2">
                        <div v-for="(category, categoryKey) in settingCategories" :key="categoryKey" class="p-4 border rounded-lg shadow-sm select-none cursor-pointer" role="button" @click="activeTab = categoryKey">
                            <h2 class="text-heading-2">
                                <i v-if="category.icon" :class="`${category.icon} me-2`"></i>
                                {{ category.label }}
                            </h2>
                            <div v-if="category.description" class="text-muted-color">{{ category.description }}</div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <div class="mb-4">
                        <Button icon="ti ti-arrow-left" label="Back to settings" class="mb-2" @click="activeTab = null"></Button>
                        <h1 class="text-heading-1 mb-2">
                            <i v-if="settingCategories[activeTab].icon" :class="`${settingCategories[activeTab].icon} me-2`"></i>
                            {{ settingCategories[activeTab].label }}
                        </h1>
                    </div>
                    <div class="overflow-auto px-2">
                        <DynamicSettingsForm context="core" scope="global" :category="activeTab"></DynamicSettingsForm>
                    </div>
                </template>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>