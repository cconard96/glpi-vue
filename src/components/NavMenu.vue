<script setup>
    import PanelMenu from 'primevue/panelmenu';
    import {RouterLink, useRoute} from "vue-router";
    import { useMainMenu } from '@/composables/useMainMenu.js';
    import {ref, watch} from "vue";
    const { menu } = useMainMenu();
    const items = ref(menu);

    // Expanded keys for the PanelMenu based on the current route
    const expanded_keys = ref({});
    const route = useRoute();
    const updateExpandedKeys = () => {
        const pathSegments = route.path.split('/').filter(segment => segment);
        if (pathSegments.length > 0) {
            expanded_keys.value = { [pathSegments[0]]: true };
        } else {
            expanded_keys.value = {};
        }
    };
    updateExpandedKeys();
    watch(() => route.path, () => {
        updateExpandedKeys();
    });
</script>

<template>
    <div class="h-screen">
        <RouterLink to="/" class="flex items-center justify-center h-16 bg-primary text-white text-2xl font-bold">
            GLPI
        </RouterLink>
        <PanelMenu :model="items" v-model:expanded-keys="expanded_keys" class="h-full w-full overflow-y-auto">
            <template #item="{ item }" :key="item.key ?? item.label.toLowerCase()">
                <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom class="w-full">
                    <a class="flex items-center cursor-pointer text-surface-700 dark:text-surface-0 px-4 py-2" :href="href" @click="navigate">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                    </a>
                </RouterLink>
                <a v-else class="flex items-center cursor-pointer text-surface-700 dark:text-surface-0 px-4 py-2" :href="item.url" :target="item.target">
                    <span :class="item.icon" />
                    <span class="ml-2">{{ item.label }}</span>
                    <span v-if="item.items" class="pi pi-angle-down text-primary ml-auto" />
                </a>
            </template>
        </PanelMenu>
    </div>
</template>

<style scoped>

</style>