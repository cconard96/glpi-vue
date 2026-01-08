<script setup>
    import { onErrorCaptured, ref } from "vue";
    import { Message } from 'primevue';

    const error = ref(null);

    onErrorCaptured((err) => {
        error.value = err;
    });
</script>

<template>
    <div v-if="error">
        <Message severity="error" icon="ti ti-exclamation-circle">
            <h2 class="font-bold mb-2">An error occurred:</h2>
            <p class="">{{ error.message }}</p>
            <RouterLink to="/">Go back to home</RouterLink>
        </Message>
    </div>
    <div v-else><slot></slot></div>
</template>

<style>

</style>