<script setup lang="ts">
    import { useI18n } from "vue-i18n";

    const { t: $t } = useI18n();
</script>

<template>
    <div class="h-full w-full flex items-center justify-center">
        <div class="text-center">
            <i class="pi pi-exclamation-triangle text-4xl mb-2"></i>
            <div>{{ $t('dashboard.widget.unsupported_widget', 'Unsupported widget') }}</div>
        </div>
    </div>
</template>

<style scoped></style>
