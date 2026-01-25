<script setup lang="ts">
    import {PanelMenu, Menubar} from 'primevue';
    import {RouterLink, useRoute} from "vue-router";
    import { useMainMenu } from '@/composables/useMainMenu.ts';
    import {ref, watch} from "vue";
    const { menu } = useMainMenu();
    const items = ref(menu);

    defineProps<{
        mobile: boolean
    }>();

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
    <nav class="light:bg-[#2f3f64] dark:bg-inherit" :class="!mobile ? 'h-screen' : ''" aria-label="Main Navigation">
        <RouterLink v-show="!mobile" to="/" class="flex items-center justify-center h-16 text-white text-4xl font-bold">
            GLPI
        </RouterLink>
        <div>
            <PanelMenu v-if="!mobile" :model="items" v-model:expanded-keys="expanded_keys" class="h-full w-full overflow-y-auto"
                       :pt="{
                            panel: { class: 'bg-inherit border-0' },
                            headerContent: { class: 'light:text-surface-100 hover:bg-[#212c46]' },
                            itemContent: { class: 'light:text-surface-100 hover:bg-[#212c46]' }
                       }">
                <template #item="{ item }" :key="item.key ?? item.label.toLowerCase()">
                    <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom class="w-full">
                        <a class="flex items-center cursor-pointer px-4 py-2" :href="href" @click="navigate">
                            <span :class="item.icon" />
                            <span class="ml-2">{{ item.label }}</span>
                        </a>
                    </RouterLink>
                    <a v-else class="flex items-center cursor-pointer px-4 py-2" :href="item.url" :target="item.target">
                        <span :class="item.icon" />
                        <span class="ml-2">{{ item.label }}</span>
                        <span v-if="item.items" class="pi pi-angle-down text-primary ml-auto" />
                    </a>
                </template>
            </PanelMenu>
            <Menubar v-else :model="items" :pt="{
                rootlist: {
                    'class': 'justify-self-start z-1000 w-auto max-w-screen'
                }
            }"></Menubar>
        </div>
    </nav>
</template>

<style scoped>

</style>