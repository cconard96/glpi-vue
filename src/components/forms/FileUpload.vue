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
                <i class="ti ti-upload text-4xl mb-2"></i>
                <div>Drag and drop files here to attach</div>
            </div>
        </template>
    </FileUpload>
</template>

<style scoped>

</style>