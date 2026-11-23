<script setup lang="ts">
    import ItemFormHeader from "@/common/forms/ItemFormHeader.vue";
    import { provide } from "vue";
    import TabbedForm from "@/common/TabbedForm.vue";
    import { useProject, getEmptyItem, loadItem } from "@/modules/tools/projects/useProject.ts";

    const props = defineProps<{
        id?: number;
    }>();

    const isNewItem = !props.id;
    const project = useProject(isNewItem ? await getEmptyItem() : await loadItem(props.id));
    provide('mainItem', project);
</script>

<template>
    <div class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
        <ItemFormHeader></ItemFormHeader>
        <TabbedForm :tabs="project.getTabs()"></TabbedForm>
    </div>
</template>

<style scoped>

</style>