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
    <div class="home-container grid grid-cols-[250px_1fr] h-screen">
        <NavMenu class="row-span-2"/>
        <div class="px-4 pt-2 h-screen grid grid-cols-1 grid-rows-[50px_auto]">
            <div class="mb-2 flex justify-between">
                <Breadcrumb :home="{ icon: 'pi pi-home', url: '/' }"></Breadcrumb>
                <Menubar class="p-2" :model="top_right_menu" :pt="{
                    submenu: {
                        'class': 'justify-self-end z-1000'
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
        --p-menubar-base-item-padding: 0.5rem 0.75rem;
    }
</style>