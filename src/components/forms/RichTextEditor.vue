<script setup lang="ts">
    import FileUpload from "./FileUpload.vue";
    import Editor from "primevue/editor";
    import { inject } from "vue";

    defineProps({
        enable_file_upload: {
            type: Boolean,
            default: false
        },
        editorProps: {
            type: Object,
            default: () => ({})
        },
        fileUploadProps: {
            type: Object,
            default: () => ({})
        }
    });

    const model = defineModel();
</script>

<template>
    <div>
        <Editor editorStyle="height: 150px" v-model="model" v-bind="editorProps"></Editor>
        <FileUpload v-if="enable_file_upload" v-bind="fileUploadProps"></FileUpload>
    </div>
</template>

<style scoped>

</style>