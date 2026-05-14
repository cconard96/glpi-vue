<script setup lang="ts">
    import { useDrauu } from "@vueuse/integrations/useDrauu";
    import { useTemplateRef } from "vue";

    //TODO FINSIH
    const target = useTemplateRef('drauuRef');
    const { clear } = useDrauu(target);
</script>

<template>
    <div class="w-full">
        <Toolbar></Toolbar>
        <svg ref="drauuRef" width="100%" h="100%"></svg>
    </div>
</template>

<style scoped>

</style>