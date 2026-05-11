<script setup lang="ts">
    import { useAssistanceItem, getEmptyItem, AssistanceType, AssistanceSchema } from "@/composables/useAssistanceItem.ts";
    import { useApi } from "@/composables/useApi.ts";
    import { ref } from "vue";
    import { Button } from "primevue";

    const props = defineProps<{
        itemtype: AssistanceType;
        items_id: number;
    }>();

    const { getItemByID } = useApi();
    const assistanceItem = useAssistanceItem(props.itemtype, ref(props.items_id > 0 ? getItemByID(props.itemtype, props.items_id) as AssistanceSchema : await getEmptyItem(props.itemtype)));
</script>

<template>
    <div v-if="assistanceItem" class="content-center flex gap-2">
        <Button v-if="assistanceItem.canCreate" size="small" severity="primary"
                as="router-link" :to="{ name: 'NewAssistanceItemForm', params: { itemtype: itemtype } }">
            <i class="ti ti-plus"></i>
            <span class="p-button-label">Add</span>
        </Button>
    </div>
</template>

<style scoped>

</style>