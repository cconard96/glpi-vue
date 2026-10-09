<script setup lang="ts">
    import { useAuth } from "@/common/api/useAuth.ts";
    import { useRouter } from "vue-router";

    const props = defineProps({
        code: {
            type: String,
            required: false
        },
        state: {
            type: String,
            required: false
        },
        error: {
            type: String,
            required: false
        },
        error_description: {
            type: String,
            required: false
        }
    })

    const { handleAuthCallback, takePostLoginRedirect } = useAuth();
    const router = useRouter();

    const failLogin = (reason: string) => {
        console.error('Authentication failed:', reason);
        router.push({ name: 'Login', query: { error: '2' } });
    };

    if (props.error) {
        // The authorization server rejected the request or the user denied consent
        failLogin(props.error_description || props.error);
    } else if (!props.code) {
        failLogin('No authorization code was returned');
    } else {
        handleAuthCallback(props.code, props.state ?? null).then(() => {
            // Return to wherever the user was headed before being sent to the login screen
            router.push(takePostLoginRedirect() || '/');
        }).catch((err) => {
            failLogin(err?.message ?? String(err));
        });
    }
</script>

<template>

</template>

<style scoped>

</style>
