<script setup lang="ts">
    import { RouterLink, useRoute } from "vue-router";
    import { Breadcrumb } from "primevue";
    import { computed } from "vue";
    import { useDeviceCapabilities } from "@/composables/useDeviceCapabilities.ts";

    const { isMobileScreenSize } = useDeviceCapabilities();
    const currentRoute = useRoute();
    const breadcrumbs = computed(() => {
        return currentRoute?.meta?.breadcrumbs ? currentRoute.meta.breadcrumbs(currentRoute) : [];
    });

    const itemtype = currentRoute?.params?.itemtype ? (currentRoute.params.itemtype.charAt(0).toUpperCase() + currentRoute.params.itemtype.slice(1)) : null;
    const items_id = parseInt(currentRoute.params.id as string);
    const breadcrumbActionsComponent = computed(() => {
        return currentRoute?.meta?.breadcrumbActionsComponent ? currentRoute.meta.breadcrumbActionsComponent(currentRoute) : null;
    });
</script>

<template>
    <div class="flex gap-4 overflow-x-auto">
        <Breadcrumb :class="`text-nowrap p-4 ${isMobileScreenSize ? 'h-[44px] pt-4 pb-0 overflow-y-clip' : ''}`" :home="{ icon: 'pi pi-home', route: '/', label: 'Home', 'aria-label': 'Test' }" :model="breadcrumbs" aria-label="Breadcrumbs">
            <template #item="{item, props}">
                <RouterLink v-if="item.route" v-slot="{ href, navigate }" :to="item.route" custom>
                    <a :href="href" @click="navigate" v-bind="props">
                        <i v-if="item.icon" :class="item.icon + ' mr-2'"></i>
                        {{ item.label }}
                    </a>
                </RouterLink>
                <a v-else-if="item.url" :href="item.url" v-bind="props">
                    <i v-if="item.icon" :class="item.icon + ' mr-2'"></i>
                    {{ item.label }}
                </a>
                <span v-else v-bind="props">
                    <i v-if="item.icon" :class="item.icon + ' mr-2'"></i>
                    {{ item.label }}
                </span>
            </template>
        </Breadcrumb>
        <div class="content-center">
            <component v-if="breadcrumbActionsComponent" :is="breadcrumbActionsComponent" :itemtype="itemtype" :items_id="items_id"></component>
        </div>
    </div>
</template>

<style scoped>

</style>