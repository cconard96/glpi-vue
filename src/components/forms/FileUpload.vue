<script setup lang="ts">
    import FileUpload from "primevue/fileupload";
</script>

<template>
    <FileUpload :pt="{
        root: {
            class: 'mt-2'
        },
        header: {
            class: 'p-2',
        },
    }">
        <template #empty>
            <div class="text-center text-gray-500">
                <i class="ti ti-upload text-3xl mb-2 me-2"></i>
                <span>Drag and drop files here to attach</span>
            </div>
        </template>
    </FileUpload>
</template>

<style scoped>

</style>