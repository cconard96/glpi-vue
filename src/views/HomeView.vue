<script setup>
    import NavMenu from "@/components/NavMenu.vue";
    import {RouterView, useRouter} from "vue-router";
    import {Breadcrumb, Menubar, ProgressSpinner} from "primevue";
    import {useSessionStore} from "@/composables/useSessionStore.js";
    import {computed, ref} from "vue";
    import {useAuth} from "@/composables/useAuth.js";
    import {useMainMenu} from "@/composables/useMainMenu.js";

    const session_store = useSessionStore();
    const { logout } = useAuth();
    const router = useRouter();
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
                        router.push({ name: 'Login' });
                    }
                }
            ]
        }
    ]);
</script>

<template>
    <div class="home-container grid h-screen">
        <NavMenu />
        <div class="px-4 pt-2 flex flex-col h-screen overflow-auto">
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
                    <component class="max-h-full" :is="Component" />
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