<script setup>
    import {useRoute, useRouter} from 'vue-router';
    import {onErrorCaptured} from "vue";

    const router = useRouter();
    const route = useRoute();

    onErrorCaptured(() => {
        if (route.name !== 'Login') {
            router.push({ name: 'Login', query: { error: '2' } });
        }
    });
</script>

<template>
    <div class="bg-[#f5f7fb] dark:bg-[#121212]">
        <Suspense>
            <RouterView :key="route.fullPath" />
        </Suspense>
    </div>
</template>

<style scoped>

</style>
