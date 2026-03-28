<script setup lang="ts">
    import { Form } from '@primevue/forms';
    import { Card, InputText, Password, Button, Message } from 'primevue';
    import { useAuth } from '@/composables/useAuth';
    import { useRouter } from "vue-router";
    import { computed, onMounted, ref } from "vue";
    import { useI18n } from "vue-i18n";
    import { useBranding } from "@/composables/plugins/branding/useBranding.ts";

    const { login, isAuthenticated } = useAuth();
    const { brandName } = useBranding();
    const router = useRouter();
    const loading = ref(false);
    const { t: $t } = useI18n();

    const onSubmit = (data) => {
        loading.value = true;
        login(data.values.username, data.values.password).then(() => {
            loading.value = false;
            if (isAuthenticated()) {
                // goto the path specified in the query parameter 'redirect' or to the home page
                const redirectPath = router.currentRoute.value.query.redirect || '/';
                router.push(redirectPath);
            } else {
                alert('Login failed. Please check your credentials and try again.');
            }
        }).catch((err) => {
            loading.value = false;
            alert('An error occurred during login. Please try again later.');
        });
    };

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
    <Card class="mx-auto mt-10 w-fit" v-focustrap>
        <template #title>
            <h1 class="text-center text-4xl" v-text="brandName"></h1>
        </template>
        <template #content>
            <Message v-if="$route.query.error" class="mb-4" severity="error" variant="outlined">
                {{ error_message }}
            </Message>
            <Form @submit="onSubmit">
                <div class="mb-4">
                    <div class="max-w-64 mx-auto flex flex-col gap-3">
                        <InputText name="username" class="max-w-64" autocomplete="username"
                                   :placeholder="$t('login.username', 'Username')" autofocus fluid />
                        <Password name="password" class="max-w-64" :inputProps="{ autocomplete: 'current-password' }"
                                  :placeholder="$t('login.password', 'Password')" :feedback="false" fluid />
                    </div>
                </div>
                <div class="flex flex-col">
                    <Button :loading="loading" type="submit" :label="$t('login.button.login', 'Login')" class="self-center"/>
                </div>
            </Form>
        </template>
    </Card>
</template>

<style scoped>

</style>