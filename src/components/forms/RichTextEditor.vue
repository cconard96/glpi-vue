<script setup lang="ts">
    import FileUpload from "./FileUpload.vue";
    import Editor from "primevue/editor";

    defineProps({
        enable_file_upload: {
            type: Boolean,
            default: false
        }
    });
    const model = defineModel();
</script>

<template>
    <div>
        <Editor editorStyle="height: 150px" v-model="model"></Editor>
        <FileUpload v-if="enable_file_upload"></FileUpload>
    </div>
</template>

<style scoped>

</style>