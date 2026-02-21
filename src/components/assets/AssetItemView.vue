<script setup lang="ts">
    import ItemFormHeader from "@/components/forms/ItemFormHeader.vue";
    import { useAssets, loadItem, getEmptyItem } from "@/composables/assets/useAssets";
    import { provide } from "vue";
    import TabbedForm from "@/components/TabbedForm.vue";

    const props = defineProps<{
        component_module: string;
        itemtype: string;
        id?: number;
    }>();

    const asset = useAssets(props.itemtype, props.id ? await loadItem(props.itemtype, props.id) : await getEmptyItem(props.itemtype));
    provide('mainItem', asset);
</script>

<template>
    <div class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
        <ItemFormHeader></ItemFormHeader>
        <TabbedForm :tabs="asset.getTabs()"></TabbedForm>
    </div>
</template>

<style scoped>

</style>