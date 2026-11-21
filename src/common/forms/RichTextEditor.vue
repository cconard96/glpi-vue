<script setup lang="ts">
    import FileUpload from "./FileUpload.vue";
    import Editor, { EditorProps } from "@cjdevstudios/bumblevue/editor";
    import { FileUploadProps } from "@cjdevstudios/bumblevue/fileupload";

    withDefaults(defineProps<{
        enable_file_upload?: boolean;
        editorProps?: EditorProps;
        fileUploadProps?: FileUploadProps;
    }>(), {
        enable_file_upload: false,
        editorProps: () => ({}),
        fileUploadProps: () => ({})
    });

    const model = defineModel<string>();
</script>

<template>
    <div>
        <Editor editorStyle="height: 150px" v-model="model" v-bind="editorProps"></Editor>
        <FileUpload v-if="enable_file_upload" v-bind="fileUploadProps"></FileUpload>
    </div>
</template>

<style scoped>

</style>