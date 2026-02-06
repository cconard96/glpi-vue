<script setup lang="ts">

</script>

<template>
    <div class="
        gap-y-4 flex flex-wrap
        [&>div]:w-1/2 [&>div>label]:flex [&>div>label]:items-baseline
        [&>div>label>span:first-of-type]:w-1/3 [&>div>label>span:first-of-type]:text-end [&>div>label>span:first-of-type]:me-4
        [&>div>label>:not(span:first-of-type)]:w-2/3 [&_.p-datepicker>input]:grow-1
        [&>div>.p-message]:w-2/3 [&>div>.p-message]:ms-auto [&>div>.p-message]:ps-4 [&>div>.p-message]:mt-1
    ">
        <slot></slot>
    </div>
</template>

<style scoped>

</style>