<script setup>
    import NavMenu from "@/components/NavMenu.vue";
    import {RouterView, useRouter} from "vue-router";
    import {Breadcrumb, Menubar, ProgressSpinner, DynamicDialog, useDialog } from "primevue";
    import {useSessionStore} from "@/composables/useSessionStore.ts";
    import {computed, defineAsyncComponent, ref} from "vue";
    import {useAuth} from "@/composables/useAuth.ts";
    import {useMainMenu} from "@/composables/useMainMenu.ts";
    import ErrorBoundary from "@/components/core/ErrorBoundary.vue";
    import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.vue";

    const session_store = useSessionStore();
    const { logout } = useAuth();
    const router = useRouter();
    const dialog = useDialog();
    const top_right_menu = ref([
        {
            label: session_store.getFriendlyName,
            icon: 'ti ti-user',
            items: [
                {
                    label: session_store.getActiveProfile.name,
                    icon: 'ti ti-user-check',
                    command: () => {
                        return;
                        dialog.open(
                            defineAsyncComponent(() => import('@/components/usermenu/ProfileSelector.vue')),
                            {
                                props: {
                                    position: 'topright',
                                    modal: true,
                                    draggable: false,
                                    header: 'Select Profile',
                                }
                            }
                        );
                    }
                },
                {
                    label: session_store.getActiveEntity.short_name,
                    icon: 'ti ti-stack',
                    command: () => {
                        //return;
                        dialog.open(
                            defineAsyncComponent(() => import('@/components/usermenu/EntitySelector.vue')),
                            {
                                props: {
                                    position: 'topright',
                                    modal: true,
                                    draggable: false,
                                    header: 'Select Entity',
                                }
                            }
                        );
                    }
                },
                {
                    separator: true
                },
                {
                    label: session_store.isDebugMode ? 'Debug mode enabled' : 'Debug mode disabled',
                    class: session_store.isDebugMode ? 'bg-red-300/50 dark:bg-red-800/50' : '',
                    icon: 'ti ti-bug',
                    command: () => {
                        session_store.setDebugMode(!session_store.isDebugMode);
                        window.location.reload();
                    }
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
        <DynamicDialog />
        <NavMenu class="row-span-2"/>
        <div class="px-4 pt-2 h-screen grid grid-cols-1 grid-rows-[60px_auto]">
            <div class="mb-2 flex justify-between">
                <DynamicBreadcrumbs></DynamicBreadcrumbs>
                <Menubar class="p-2" :model="top_right_menu" :pt="{
                    submenu: {
                        'class': 'justify-self-end z-1000'
                    }
                }"></Menubar>
            </div>
            <RouterView v-slot="{ Component }">
                <ErrorBoundary>
                    <Suspense>
                        <component class="max-h-full" :is="Component" />
                        <template #fallback>
                            <div class="flex justify-content-center align-items-center h-full">
                                <ProgressSpinner />
                            </div>
                        </template>
                    </Suspense>
                </ErrorBoundary>
            </RouterView>
        </div>
    </div>
</template>

<style scoped>
    .home-container {
        --p-menubar-base-item-padding: 0.5rem 0.75rem;
    }
</style>