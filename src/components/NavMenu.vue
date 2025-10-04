<script setup>
    import PanelMenu from 'primevue/panelmenu';
    import { RouterLink } from "vue-router";
    import {ref} from "vue";

    const items = ref([
        {
            label: "Assets",
            icon: "pi pi-fw pi-desktop",
            items: [
                {
                    label: "Computers",
                    icon: "pi pi-fw pi-laptop",
                    route: "/search/computer"
                },
                {
                    label: "Monitors",
                    icon: "pi pi-fw pi-tv",
                    route: "/search/monitor"
                },
            ]
        }
    ]);
</script>

<template>
    <div>
        <RouterLink to="/" class="flex items-center justify-center h-16 bg-primary text-white text-2xl font-bold">
            GLPI
        </RouterLink>
        <PanelMenu :model="items" class="h-full w-full">
            <template #item="{ item }">
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