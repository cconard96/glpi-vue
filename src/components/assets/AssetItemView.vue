<script setup lang="ts">
    import ItemFormHeader from "@/components/forms/ItemFormHeader.vue";
    import { useAsset, loadItem, getEmptyItem, type AssetType } from "@/composables/assets/useAsset.js";
    import { provide } from "vue";
    import TabbedForm from "@/components/TabbedForm.vue";

    const props = defineProps<{
        itemtype: AssetType;
        id?: number;
    }>();

    const isNewItem = !props.id;
    const asset = useAsset(props.itemtype, !isNewItem ? await loadItem(props.itemtype, props.id) : await getEmptyItem(props.itemtype));
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