<script setup lang="ts">
import {useRoute} from "vue-router";
    import {Breadcrumb} from "primevue";
    import {computed, ref, watch} from "vue";

    const currentRoute = useRoute();
    const breadcrumbs = computed(() => {
        return currentRoute?.meta?.breadcrumbs ? currentRoute.meta.breadcrumbs(currentRoute) : [];
    });
</script>

<template>
    <Breadcrumb class="p-4" :home="{ icon: 'pi pi-home', url: '/', label: 'Home', 'aria-label': 'Test' }" :model="breadcrumbs" aria-label="Breadcrumbs"></Breadcrumb>
</template>

<style scoped>

</style>