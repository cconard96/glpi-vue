<script setup lang="ts">
    import { useAuth } from "@/composables/useAuth.ts";
    import { useRouter } from "vue-router";

    const props = defineProps({
        code: {
            type: String,
            required: true
        },
    })

    const { handleAuthCallback } = useAuth();
    const router = useRouter();

    handleAuthCallback(props.code).then(() => {
        // After handling the callback, redirect to the home page or the path specified in the query parameter 'redirect'
        const redirectPath = router.currentRoute.value.query.redirect || '/';
        router.push(redirectPath);
    }).catch((err) => {
        alert('An error occurred during authentication. Please try logging in again.');
        router.push('/login');
    });
</script>

<template>

</template>

<style scoped>

</style>