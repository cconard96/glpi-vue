<script setup lang="ts">
    import { onErrorCaptured, ref, type Ref } from "vue";
    import { Message } from 'primevue';

    const error: Ref<Error | null> = ref(null);
    const dev_mode = import.meta.env.DEV;

    onErrorCaptured((err) => {
        error.value = err;
        if (dev_mode) {
            console.error('Captured error in ErrorBoundary:', err);
        }
        return false;
    });
</script>

<template>
    <div v-if="error">
        <Message severity="error" icon="ti ti-exclamation-circle">
            <h2 class="font-bold mb-2">An error occurred:</h2>
            <p class="">{{ error.message }}</p>
            <p v-if="dev_mode" class="mt-4">
                <strong>Stack Trace:</strong>
                <span class="whitespace-pre-wrap">{{ error.stack }}</span>
            </p>
            <RouterLink to="/">Go back to home</RouterLink>
        </Message>
    </div>
    <div v-else class="contents"><slot></slot></div>
</template>

<style>

</style>