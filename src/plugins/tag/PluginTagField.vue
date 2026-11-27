<script setup lang="ts">
    import Tag from "@cjdevstudios/bumblevue/tag";
    import { useColor } from "@/common/util/useColor";

    const props = defineProps<{
        item: { tags?: Array<{ id: number, name: string, color: string }> }
    }>();

    const accessibleColorPairs = props.item.tags?.map(tag => useColor(tag.color ?? "#808080").getAccessibleColorPair()) ?? [];
</script>

<template>
    <div class="overflow-auto flex gap-2 flex-nowrap">
        <Tag v-for="(tag, index) in props.item.tags ?? []" :key="tag.id" v-text="tag.name" class="text-nowrap"
             :style="`background-color: ${accessibleColorPairs[index].backgroundColor}; color: ${accessibleColorPairs[index].color}; user-select: none`" />
    </div>
</template>

<style scoped>

</style>
