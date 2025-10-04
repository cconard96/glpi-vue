<script setup>
    import NavMenu from "@/components/NavMenu.vue";
    import { RouterView } from "vue-router";
    import { Breadcrumb } from "primevue";
    import { ProgressSpinner} from "primevue";
</script>

<template>
    <div class="home-container grid h-full">
        <NavMenu />
        <div>
            <Breadcrumb :home="{ icon: 'pi-home' }"></Breadcrumb>
            <RouterView class="p-4" v-slot="{ Component }">
                <Suspense>
                    <component :is="Component" />
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
        grid-template-columns: 300px 1fr;
    }
</style>