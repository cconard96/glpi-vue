<script setup>
    import NavMenu from "@/components/NavMenu.vue";
    import {RouterView, useRouter} from "vue-router";
    import {Breadcrumb, Menubar, ProgressSpinner, DynamicDialog, useDialog, Toast } from "primevue";
    import {useSessionStore} from "@/composables/useSessionStore.ts";
    import {computed, defineAsyncComponent, ref, useTemplateRef} from "vue";
    import {useAuth} from "@/composables/useAuth.ts";
    import {useMainMenu} from "@/composables/useMainMenu.ts";
    import ErrorBoundary from "@/components/core/ErrorBoundary.vue";
    import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.vue";
    import {useBreakpoints, breakpointsBootstrapV5} from "@vueuse/core";

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
    const mobile_menu_el = useTemplateRef('mobile_menu');

    const breakpoints = useBreakpoints(breakpointsBootstrapV5);
    const is_mobile = breakpoints.smaller('md');
</script>

<template>
    <div class="home-container grid grid-cols-[250px_1fr] h-screen">
        <DynamicDialog />
        <Toast />
        <Teleport class="contents" :disabled="!is_mobile" to="#mobile_menu" defer>
            <NavMenu :mobile="is_mobile" />
        </Teleport>
        <div :class="`px-4 pt-2 h-screen grid grid-cols-1 ${is_mobile ? 'col-span-2' : 'col-span-1'} grid-rows-[60px_auto]`">
            <div class="mb-2 flex justify-between">
                <div class="flex">
                    <div id="mobile_menu" class="me-2"></div>
                    <DynamicBreadcrumbs></DynamicBreadcrumbs>
                </div>
                <Menubar class="p-2" :model="top_right_menu" :pt="{
                    submenu: {
                        'class': 'justify-self-end z-1000'
                    }
                }" breakpoint=""></Menubar>
            </div>
            <RouterView v-slot="{ Component }">
                <KeepAlive>
                    <ErrorBoundary>
                        <Suspense>
                            <component class="max-h-full w-full" :is="Component" />
                            <template #fallback>
                                <div class="flex justify-content-center align-items-center h-full w-full">
                                    <ProgressSpinner />
                                </div>
                            </template>
                        </Suspense>
                    </ErrorBoundary>
                </KeepAlive>
            </RouterView>
        </div>
    </div>
</template>

<style scoped>
    .home-container {
        --p-menubar-base-item-padding: 0.5rem 0.75rem;
    }
</style>