<script setup lang="ts">
    import ItemFormHeader from "@/components/forms/ItemFormHeader.vue";
    import TabbedForm from "@/components/TabbedForm.vue";
    import { useEntity } from "@/composables/admin/useEntity.ts";
    import { defineAsyncComponent, provide, ref } from "vue";
    import { useApi } from "@/composables/useApi.ts";

    const props = defineProps<{
        id?: number;
    }>();

    const { getComponentSchema, doApiRequest, doGraphQLRequest, getCompleteFieldsRequestForSchema } = useApi();
    const entity = ref(await doGraphQLRequest(`
        query {
            Entity(id: ${props.id}) {
                ${getCompleteFieldsRequestForSchema((await getComponentSchema('Entity')).properties)}
            }
        }
    `).then((response) => {
        return ref(response.data['Entity'][0]);
    }));

    provide('mainItem', useEntity(entity));
</script>

<template>
    <div class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
        <ItemFormHeader></ItemFormHeader>
        <TabbedForm :tabs="[
            {
                key: 'main',
                label: 'Entity',
                icon: 'ti ti-stack',
                 component: defineAsyncComponent(() => import('./EntityForm.vue'))
            },
            {
                key: 'ui',
                label: 'UI Customization',
                icon: 'ti ti-palette',
                component: defineAsyncComponent(() => import('./tabs/UICustomizationTab.vue'))
            }
        ]"></TabbedForm>
    </div>
</template>

<style scoped>

</style>