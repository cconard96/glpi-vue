<script setup>
    import NavMenu from "@/components/NavMenu.vue";
    import { RouterView } from "vue-router";
    import { Breadcrumb } from "primevue";
    import { ProgressSpinner} from "primevue";
    import { Menubar } from "primevue";
    import { useSessionStore } from "@/composables/useSessionStore.js";
    import { ref } from "vue";
    import { useAuth } from "@/composables/useAuth.js";

    const session_store = useSessionStore();
    const { logout } = useAuth();
    const top_right_menu = ref([
        {
            label: session_store.getFriendlyName,
            icon: 'ti ti-user',
            items: [
                {
                    label: session_store.getActiveProfile.name,
                    icon: 'ti ti-user-check',
                },
                {
                    label: session_store.getActiveEntity.short_name,
                    icon: 'ti ti-stack',
                },
                {
                    separator: true
                },
                {
                    label: session_store.isDebugMode ? 'Debug mode enabled' : 'Debug mode disabled',
                    icon: 'ti ti-bug',
                },
                {
                    separator: true
                },
                {
                    label: 'Logout',
                    icon: 'ti ti-logout',
                    command: () => {
                        logout();
                    }
                }
            ]
        }
    ]);
</script>

<template>
    <div class="home-container grid h-screen">
        <NavMenu />
        <div class="px-4 py-2 flex flex-col h-screen overflow-auto">
            <div class="mb-2 flex justify-between">
                <Breadcrumb :home="{ icon: 'pi pi-home' }"></Breadcrumb>
                <Menubar class="p-2" :model="top_right_menu" :pt="{
                    submenu: {
                        'class': 'justify-self-end'
                    }
                }"></Menubar>
            </div>
            <RouterView v-slot="{ Component }">
                <Suspense>
                    <component class="max-h-full grow-1" :is="Component" />
                    <template #fallback>
                        <div class="flex justify-content-center align-items-center h-full">
                            <ProgressSpinner />
                        </div>
                    </template>
                </Suspense>
            </RouterView>
        </div>
    </div>
</template>

<style scoped>
    .home-container {
        grid-template-columns: 250px minmax(0, 1fr);
        --p-menubar-base-item-padding: 0.5rem 0.75rem;
    }
</style>