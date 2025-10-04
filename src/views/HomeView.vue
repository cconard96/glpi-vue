<script setup>
    import NavMenu from "@/components/NavMenu.vue";
    import { RouterView } from "vue-router";
    import { Breadcrumb } from "primevue";
    import { ProgressSpinner} from "primevue";
</script>

<template>
    <div class="home-container grid h-screen">
        <NavMenu />
        <div class="px-4 py-2 flex flex-col h-screen overflow-auto">
            <div class="mb-2">
                <Breadcrumb :home="{ icon: 'pi pi-home' }"></Breadcrumb>
            </div>
            <RouterView v-slot="{ Component }">
                <Suspense>
                    <component class="max-h-full grow-1" :is="Component" />
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
        grid-template-columns: 300px minmax(0, 1fr);
    }
</style>