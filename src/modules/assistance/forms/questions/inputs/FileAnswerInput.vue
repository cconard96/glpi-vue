<script setup lang="ts">
    /**
     * File selection bound to a form field holding the list of selected file names
     * (which is what GLPI conditions are evaluated against).
     * TODO The files are only kept locally: the HL API has no way to attach uploaded files to form answers yet.
     */
    import FileUpload from "@/common/forms/FileUpload.vue";
    import { inject } from "vue";
    import FormContextIsolation from "@/common/forms/FormContextIsolation";

    const formField = inject('$pcFormField') as any;

    function onFilesChanged(event: { files: File[] }) {
        formField.field.states.value = event.files.map((file) => file.name);
    }
</script>

<template>
    <FormContextIsolation>
        <FileUpload mode="advanced" multiple customUpload :auto="false" :showUploadButton="false" :showCancelButton="false"
                    @select="onFilesChanged" @remove="onFilesChanged" @clear="onFilesChanged({ files: [] })"></FileUpload>
    </FormContextIsolation>
</template>
