<script setup lang="ts">
    import NavMenu from "@/components/NavMenu.vue";
    import { RouterView, useRouter } from "vue-router";
    import { ConfirmDialog, DynamicDialog, Menubar, ProgressSpinner, Toast, useDialog } from "primevue";
    import { useSessionStore } from "@/composables/useSessionStore.ts";
    import { defineAsyncComponent, ref, useTemplateRef } from "vue";
    import { useAuth } from "@/composables/useAuth.ts";
    import ErrorBoundary from "@/components/core/ErrorBoundary.vue";
    import DynamicBreadcrumbs from "@/components/layout/DynamicBreadcrumbs.vue";
    import NetworkStatusArea from "@/components/layout/NetworkStatusArea.vue";
    import { useDeviceCapabilities } from "@/composables/useDeviceCapabilities.ts";

    const session_store = useSessionStore();
    const { logout } = useAuth();
    const router = useRouter();
    const dialog = useDialog();

    const top_right_menu = ref([
        {
            label: `${session_store.getActiveProfile.name}\n${session_store.getActiveEntity.short_name}`,
            icon: 'ti ti-user',
            items: [
                {
                    label: session_store.getActiveProfile.name,
                    icon: 'ti ti-user-check',
                    command: () => {
                        dialog.open(
                            defineAsyncComponent(() => import('@/components/usermenu/ProfileSelector.vue')),
                            {
                                props: {
                                    position: 'topright',
                                    pt: {
                                        root: {
                                            class: 'w-auto h-auto',
                                        },
                                    },
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
                                    pt: {
                                        root: {
                                            class: 'w-auto h-auto',
                                        },
                                    },
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
    const { isMobileScreenSize } = useDeviceCapabilities();
</script>

<template>
    <div class="home-container grid grid-cols-[250px_1fr] h-screen">
        <DynamicDialog />
        <Toast />
        <ConfirmDialog />
        <Teleport class="contents" :disabled="!isMobileScreenSize" to="#mobile_menu" defer>
            <NavMenu :mobile="isMobileScreenSize" />
        </Teleport>
        <div :class="`px-4 pt-2 h-screen grid grid-cols-1 ${isMobileScreenSize ? 'col-span-2' : 'col-span-1'} grid-rows-[60px_auto]`">
            <div class="mb-2 flex justify-between max-w-full overflow-x-hidden bg-(--p-content-background)">
                <div class="flex overflow-x-hidden">
                    <div id="mobile_menu" class="me-2"></div>
                    <DynamicBreadcrumbs></DynamicBreadcrumbs>
                </div>
                <div class="flex gap-4">
                    <NetworkStatusArea></NetworkStatusArea>
                    <Menubar :class="`p-2 ${isMobileScreenSize ? 'w-[44px] h-[44px]' : ''} bg-transparent`" :model="top_right_menu" :pt="{
                            rootList: {
                                class: `whitespace-pre-wrap max-w-96 ${isMobileScreenSize ? 'mx-auto' : ''}`,
                            },
                            itemLabel: ({ props }) => {
                                if (props.root) {
                                    return { 'class': isMobileScreenSize ? 'hidden' : 'text-sm' };
                                }
                            },
                            itemLink: ({ props }) => {
                                if (props.root) {
                                    return { 'class': isMobileScreenSize ? 'p-0' : '' };
                                }
                            },
                            submenu: {
                                'class': 'justify-self-end z-1000'
                            },
                            submenuIcon: {
                                class: isMobileScreenSize ? 'hidden!' : '',
                            }
                        }" breakpoint="">
                    </Menubar>
                </div>
            </div>
            <RouterView v-slot="{ Component }">
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
            </RouterView>
        </div>
    </div>
</template>

<style scoped>
    .home-container {
        --p-menubar-base-item-padding: 0.5rem 0.75rem;
    }
</style>