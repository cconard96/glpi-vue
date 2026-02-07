<script setup lang="ts">
    import {useRoute, RouterLink} from "vue-router";
    import {Breadcrumb, Button} from "primevue";
    import {computed, ref, watch} from "vue";

    const currentRoute = useRoute();
    const breadcrumbs = computed(() => {
        return currentRoute?.meta?.breadcrumbs ? currentRoute.meta.breadcrumbs(currentRoute) : [];
    });

    const component_module = currentRoute.params.component_module as string;
    const itemtype = currentRoute.params.itemtype as string;
    const items_id = parseInt(currentRoute.params.id as string);

    let itemtype_model = null;
    if (itemtype) {
        try {
            itemtype_model = (await import(`@/models/${component_module}/${itemtype?.charAt(0).toUpperCase() + itemtype?.slice(1)}.ts`)).default;
        } catch (error) {
            itemtype_model = null;
        }
    }
</script>

<template>
    <div class="flex gap-4">
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
        <div v-if="itemtype_model !== null" class="content-center">
            <Button v-if="itemtype_model.canCreate()" label="Add" size="small" v-slot="slotProps">
                <RouterLink :class="slotProps.class" :to="{ name: 'NewItemForm', params: { component_module: component_module, itemtype: itemtype } }">
                    <i class="ti ti-plus"></i>
                    <span class="p-button-label">Add</span>
                </RouterLink>
            </Button>
        </div>
    </div>
</template>

<style scoped>

</style>