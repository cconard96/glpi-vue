<script setup lang="ts">
    import { useMarkdown } from "@/common/util/useMarkdown";
    import type { MarkdownCardOptions } from "@/common/dashboard/dashboard";

    const props = defineProps<{
        gridstack_id: string;
        options: MarkdownCardOptions;
    }>();

    const { renderedContent } = useMarkdown(props.options.markdown_content, {
        offsetSemanticHeadingLevels: 1, // skip h1 semantic to ensure correct document layout but keep the correct styling for it.
    });
</script>

<template>
    <div class="h-full border rounded p-2" :style="`border-color: ${options.color ?? 'inherit'};`">
        <div v-dompurify-html="renderedContent"></div>
    </div>
</template>

<style scoped>

</style>