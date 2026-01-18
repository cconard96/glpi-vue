<script setup lang="ts">
    import FileUpload from "primevue/fileupload";
    import Editor from "primevue/editor";

    defineProps({
        enable_file_upload: {
            type: Boolean,
            default: false
        }
    });
</script>

<template>
    <div>
        <Editor editorStyle="height: 150px"></Editor>
        <FileUpload v-if="enable_file_upload" :pt="{
                root: {
                    class: 'mt-2'
                },
                header: {
                    class: 'p-2',
                },
            }">
            <template #empty>
                <div class="text-center text-gray-500">
                    <i class="ti ti-upload text-4xl mb-2"></i>
                    <div>Drag and drop files here to attach</div>
                </div>
            </template>
        </FileUpload>
    </div>
</template>

<style scoped>

</style>