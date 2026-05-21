<script setup lang="ts">

</script>

<template>
    <div class="print-target contents">
        <slot></slot>
    </div>
</template>

<style scoped>
    @media print {
        :global(body *) {
            visibility: hidden;
        }
        .print-target, .print-target * {
            visibility: visible;
        }
        .print-target {
            position: absolute;
            left: 0;
            top: 0;
        }
    }
</style>