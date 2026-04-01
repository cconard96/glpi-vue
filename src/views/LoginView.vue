<script setup lang="ts">
    import { Card, Button, Message } from 'primevue';
    import { useAuth } from '@/composables/useAuth';
    import { useRouter } from "vue-router";
    import { computed, onMounted, ref } from "vue";
    import { useI18n } from "vue-i18n";
    import { useBranding } from "@/composables/plugins/branding/useBranding.ts";

    const { authorize } = useAuth();
    const { brandName } = useBranding();
    const router = useRouter();
    const loading = ref(false);
    const { t: $t } = useI18n();

    onMounted(() => {
        document.title = $t('login.title', {
            brandName: brandName.value
        });
    });

    const error_message = computed(() => {
        const error_code = router.currentRoute.value.query.error;
        if (error_code === '1') {
            return $t('login.error.session_expired', 'Your session has expired');
        } else if (error_code === '2') {
            return $t('login.error.fatalAppError', 'An error occurred. Please login again.');
        }
        return null;
    });
</script>

<template>
    <Card class="mx-auto mt-10 w-fit min-w-64" v-focustrap>
        <template #title>
            <h1 class="text-center text-4xl mb-4" v-text="brandName"></h1>
        </template>
        <template #content>
            <div class="w-100 text-center">
                <Message v-if="$route.query.error" class="mb-4" severity="error" variant="outlined">
                    {{ error_message }}
                </Message>
                <Button label="Login" severity="primary" @click="authorize"/>
    <!--            <Button label="Continue as guest" class="w-full" severity="secondary" @click="router.push('/')"/>-->
            </div>
        </template>
    </Card>
</template>

<style scoped>

</style>