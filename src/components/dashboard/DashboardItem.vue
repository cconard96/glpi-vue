<script setup lang="ts">
    import { Skeleton } from "primevue";

    const props = defineProps({
        gridstack_id: {
            type: String,
            required: true,
        },
        x: {
            type: Number,
            required: true,
            default: -1,
        },
        y: {
            type: Number,
            required: true,
            default: -1,
        },
        width: {
            type: Number,
            required: true,
            default: 2,
        },
        height: {
            type: Number,
            required: true,
            default: 2,
        },
        card_options: {
            type: Object,
            required: true,
        },
    });
</script>

<template>
    <div class="grid-stack-item" :gs-id="gridstack_id"
         :gs-w="width" :gs-h="height" :gs-x="x >= 0 ? x : undefined" :gs-y="y >= 0 ? y : undefined"
         :gs-auto-position="!(x >= 0 && y >= 0)">
        <div class="grid-stack-item-content">
            <Skeleton height="100%"></Skeleton>
        </div>
    </div>
</template>

<style scoped>

</style>