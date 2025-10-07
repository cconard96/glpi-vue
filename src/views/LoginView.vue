<script setup>
    import { Form } from '@primevue/forms';
    import Card from 'primevue/card';
    import InputText from 'primevue/inputtext';
    import Password from 'primevue/password';
    import Button from 'primevue/button';
    import { useAuth } from '@/composables/useAuth';
    import { useRouter } from "vue-router";

    const { login, isAuthenticated } = useAuth();
    const router = useRouter();

    const onSubmit = (data) => {
        login(data.values.username, data.values.password).then(() => {
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
</script>

<template>
    <Card class="mx-auto mt-10 w-fit" v-focustrap>
        <template #title>
            <h1 class="text-center text-4xl">GLPI</h1>
        </template>
        <template #content>
            <Form @submit="onSubmit">
                <div class="flex flex-col gap-1 mb-4">
                    <InputText name="username" autocomplete="username" placeholder="Username" autofocus/>
                    <Password name="password" autocomplete="password" placeholder="Password" :feedback="false" />
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