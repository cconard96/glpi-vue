<script setup lang="ts">
    import { useMonacoEditor } from "@/composables/monaco/useMonacoEditor.ts";
    import { useId, useTemplateRef } from "vue";

    const props = defineProps<{
        value?: string;
    }>();

    const el = useTemplateRef('container')
    const id = useId();
    const editor = useMonacoEditor(id, {
        value: props.value || '',
    });
</script>

<template>
    <div :id="id" ref="container"></div>
</template>

<style scoped>

</style>