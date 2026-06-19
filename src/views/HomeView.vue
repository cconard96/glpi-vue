<script setup lang="ts">
    import NavMenu from "@/common/NavMenu.vue";
    import { RouterView, useRouter } from "vue-router";
    import { ConfirmDialog, DynamicDialog, Menubar, ProgressSpinner, Toast, useDialog, Select, Button } from "primevue";
    import { useSessionStore } from "@/common/useSessionStore.ts";
    import { defineAsyncComponent, ref, useTemplateRef } from "vue";
    import { useAuth } from "@/common/api/useAuth.ts";
    import ErrorBoundary from "@/common/ErrorBoundary.vue";
    import DynamicBreadcrumbs from "@/common/layout/DynamicBreadcrumbs.vue";
    import NetworkStatusArea from "@/common/layout/NetworkStatusArea.vue";
    import { useDeviceCapabilities } from "@/common/useDeviceCapabilities.ts";
    import { supportedAppLocales, userLang } from "@/common/util/i18n.ts";

    const session_store = useSessionStore();
    const { logout } = useAuth();
    const router = useRouter();
    const dialog = useDialog();

    const top_right_menu = ref([
        {
            key: 'root',
            label: `${session_store.getActiveProfile.name}\n${session_store.getActiveEntity.short_name}`,
            icon: 'ti ti-user',
            items: [
                {
                    label: session_store.getActiveProfile.name,
                    icon: 'ti ti-user-check',
                    command: () => {
                        dialog.open(
                            defineAsyncComponent(() => import('@/common/usermenu/ProfileSelector.vue')),
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
                            defineAsyncComponent(() => import('@/common/usermenu/EntitySelector.vue')),
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
                    key: 'language',
                    label: 'Language',
                    icon: 'ti ti-language',
                    command: () => {
                        return false;
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
    const supportedLocales = Object.entries(supportedAppLocales).map(([key, label]) => ({
        key: key,
        label: label
    }));
</script>

<template>
    <div class="home-container grid grid-cols-[250px_1fr] h-screen">
        <DynamicDialog />
        <Toast />
        <ConfirmDialog />
        <Teleport class="contents" :disabled="!isMobileScreenSize" to="#mobile_menu" defer>
            <NavMenu :mobile="isMobileScreenSize" />
        </Teleport>
        <div :class="`px-4 pt-2 not-print:h-screen grid grid-cols-1 ${isMobileScreenSize ? 'col-span-2' : 'col-span-1'} grid-rows-[60px_auto]`">
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
                        <template #item="{item}">
                            <div v-if="item.key === 'root'" class="flex items-center">
                                <Button class="gap-2 flex" variant="text" severity="secondary" size="small">
                                    <i class="p-menubar-item-icon" :class="item.icon" aria-hidden="true"></i>
                                    <span v-if="!isMobileScreenSize" class="text-left whitespace-pre-wrap">
                                        {{ item.label }}
                                    </span>
                                    <span>
                                        <i class="p-menubar-item-icon ti ti-chevron-down" aria-hidden="true"></i>
                                    </span>
                                </Button>
                            </div>
                            <template v-else-if="item.key === 'language'">
                                <div class="p-menubar-item-content" @click.stop>
                                    <div class="p-menubar-item-link flex gap-2 cursor-default">
                                        <i :class="item.icon" aria-hidden="true"></i>
                                        <Select :options="supportedLocales" optionLabel="label" optionValue="key" v-model="userLang" fluid></Select>
                                    </div>
                                </div>
                            </template>
                            <template v-else>
                                <div class="p-menubar-item-content">
                                    <Button class="p-menubar-item-link flex gap-2 text-base justify-start" variant="text" severity="secondary" size="small" fluid>
                                        <i :class="item.icon" aria-hidden="true"></i>
                                        <span v-text="item.label"></span>
                                    </Button>
                                </div>
                            </template>
                        </template>
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