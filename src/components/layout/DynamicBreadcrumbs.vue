<script setup lang="ts">
    import {useRoute, RouterLink} from "vue-router";
    import {Breadcrumb} from "primevue";
    import {computed, ref, watch} from "vue";

    const currentRoute = useRoute();
    const breadcrumbs = computed(() => {
        return currentRoute?.meta?.breadcrumbs ? currentRoute.meta.breadcrumbs(currentRoute) : [];
    });
</script>

<template>
    <Breadcrumb class="p-4" :home="{ icon: 'pi pi-home', route: '/', label: 'Home', 'aria-label': 'Test' }" :model="breadcrumbs" aria-label="Breadcrumbs">
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
</template>

<style scoped>

</style>