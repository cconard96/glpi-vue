<script setup lang="ts">
    import { Button, SplitButton } from "primevue";
    import { AssetCapabilities, getDefinition } from "@/composables/assets/useAsset.js";

    const props = defineProps<{
        itemtype: string;
        items_id: number;
    }>();

    const asset = getDefinition(props.itemtype);
    const extraAddActions = [];
    if (asset && asset.canCreate()) {
        if (asset.capabilities.includes(AssetCapabilities.HasTemplates)) {
            extraAddActions.push(
                { label: 'Add from template', icon: 'ti ti-copy', command: () => {} },
                { label: 'Manage templates', icon: 'ti ti-settings', command: () => {} },
            );
        }
        extraAddActions.push(
            { label: 'Import', icon: 'ti ti-file-import', command: () => {} }
        );
    };
</script>

<template>
    <div v-if="asset" class="content-center flex gap-2">
        <SplitButton v-if="asset.canCreate()" size="small" severity="primary" :buttonProps="{
                as: 'router-link',
                to: { name: 'NewAssetItemForm', params: { itemtype: itemtype } }
        }"
                :model="extraAddActions">
            <i class="ti ti-plus"></i>
            <span class="p-button-label">Add</span>
        </SplitButton>
        <Button v-if="asset.capabilities.includes(AssetCapabilities.HasModel)" size="small" severity="secondary" variant="text"
                as="router-link" :to="{ name: 'Search', params: { component_module: 'dropdowns', itemtype: `${itemtype}Model` } }">
            <i class="ti ti-list"></i>
            <span class="p-button-label">Models</span>
        </Button>
        <Button v-if="asset.capabilities.includes(AssetCapabilities.HasType)" size="small" severity="secondary" variant="text"
                as="router-link" :to="{ name: 'Search', params: { component_module: 'assets', itemtype: `${itemtype}Type` } }">
            <i class="ti ti-list"></i>
            <span class="p-button-label">Types</span>
        </Button>
    </div>
</template>

<style scoped>

</style>