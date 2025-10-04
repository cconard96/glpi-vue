<script setup>
import {useRoute, useRouter} from 'vue-router';

    const router = useRouter();
    const route = useRoute();
</script>

<template>
    <div>
      <RouterView :key="route.fullPath" />
    </div>
</template>

<style scoped>

</style>
