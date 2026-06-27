<script setup lang="ts">
    import { useSessionStore } from "@/common/useSessionStore.ts";
    import { computed, defineAsyncComponent } from "vue";

    const { active_profile } = useSessionStore();

    const homepageComponent = computed(() => {
        return active_profile.interface === 'central' ? defineAsyncComponent(() => import('@/modules/home/CentralView.vue')) : defineAsyncComponent(() => import('@/modules/home/ServiceCatalogView.vue'));
    });
</script>

<template>
    <component :is="homepageComponent" />
</template>

<style scoped>

</style>