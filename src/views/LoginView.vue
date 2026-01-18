<script setup>
    import { Form } from '@primevue/forms';
    import Card from 'primevue/card';
    import InputText from 'primevue/inputtext';
    import Password from 'primevue/password';
    import Button from 'primevue/button';
    import Message from 'primevue/message';
    import { useAuth } from '@/composables/useAuth';
    import { useRouter } from "vue-router";
    import {computed, onMounted} from "vue";

    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    const onSubmit = (data) => {
        login(data.values.username, data.values.password).then(() => {
            console.log('Login attempt finished');
            if (isAuthenticated()) {
                // goto the path specified in the query parameter 'redirect' or to the home page
                const redirectPath = router.currentRoute.value.query.redirect || '/';
                router.push(redirectPath).then(() => {
                    console.log('Navigation to', redirectPath, 'successful');
                }).catch((err) => {
                    console.error('Navigation error:', err);
                });
                console.log('Current route:', router.currentRoute.value);
            } else {
                alert('Login failed. Please check your credentials and try again.');
            }
        })
    };

    onMounted(() => {
        document.title = "GLPI - Login";
    });

    const error_message = computed(() => {
        const error_code = router.currentRoute.value.query.error;
        if (error_code === '1') {
            return 'Your session has expired';
        } else if (error_code === '2') {
            return 'An error occurred. Please login again.';
        }
        return null;
    });
</script>

<template>
    <Card class="mx-auto mt-10 w-fit" v-focustrap>
        <template #title>
            <h1 class="text-center text-4xl">GLPI</h1>
        </template>
        <template #content>
            <Message v-if="$route.query.error" class="mb-4" severity="error" variant="outlined">
                {{ error_message }}
            </Message>
            <Form @submit="onSubmit">
                <div class="mb-4">
                    <div class="max-w-64 mx-auto flex flex-col gap-3">
                        <InputText name="username" class="max-w-64" autocomplete="username"
                                   placeholder="Username" autofocus fluid />
                        <Password name="password" class="max-w-64" autocomplete="current-password"
                                  placeholder="Password" :feedback="false" fluid />
                    </div>
                </div>
                <div class="flex flex-col">
                    <Button type="submit" label="Login" class="self-center"/>
                </div>
            </Form>
        </template>
    </Card>
</template>

<style scoped>

</style>