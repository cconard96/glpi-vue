<script setup>
import {RouterLink, useRoute} from 'vue-router';
    import { useMainMenu } from "@/composables/useMainMenu.js";
    import { useApi } from '@/composables/useApi.js';
    import { Tag, ToggleButton, Message } from "primevue";

    const { getItemtypeModelForRoute } = useMainMenu();
    const { doGraphQLRequest, getItemByID } = useApi();
    const itemtype_model = getItemtypeModelForRoute(useRoute().path);
    const form_fields = await itemtype_model.getFormFields();
    console.log(form_fields);
    const item = await getItemByID(itemtype_model.getOpenAPISchemaName(), useRoute().params.id);

    Object.values(form_fields).forEach(field => {
        // cast date strings to Date objects in item data
        if (field.component.name === 'DatePicker') {
            item[field.name] = item[field.name] ? new Date(item[field.name]) : null;
        }
    });
    console.log(item);
</script>

<template>
    <section>
        <div class="text-lg flex justify-between">
            <RouterLink :to="{ name: 'Search', params: $route.params}">
                <i class="ti ti-list-search"></i>
            </RouterLink>
            <header>
                <h1>
                    <i :class="`${itemtype_model.getIcon()} mr-2`"></i>
                    {{ item.name }}
                </h1>
            </header>
            <div>
                <Tag class="ml-2">
                    <div class="text-ellipsis text-nowrap"><span class="float-end">Entity: {{ item.entity.name }}</span></div>
                    <ToggleButton class="bg-transparent text-inherit text-(length:--p-tag-font-size) font-(--p-tag-font-weight) ps-2 py-0"
                                  v-model="item.is_recursive" onLabel="+ Child entities" offLabel="only">
                    </ToggleButton>
                </Tag>
            </div>
        </div>
        <Message severity="info">Placeholder form</Message>
        <div class="grid lg:grid-cols-2 grid-cols-1">
            <div v-for="field in form_fields" :key="field.name">
                <template v-if="field.component">
                    <label :for="field.name" class="me-2">{{ field.name }}</label>
                    <component :is="field.component" v-bind="field.options" v-model="item[field.name]"></component>
                </template>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>