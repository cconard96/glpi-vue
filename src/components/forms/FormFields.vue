<script setup lang="ts">
    import { computed } from "vue";

    const props = defineProps<{
        columns?: number;
    }>();

    const defaultColumnCount = 2;

    /**
     * Tailwind classes for the form fields container. Adjusts the layout based on the number of columns specified in props.
     * Also enforces specific widths and spacing for labels and their inputs so everything aligns nicely.
     * This will be used in place of the current hardcoded classes in the template to allow for dynamic column counts and easier maintenance.
     */
    const styleClasses = computed(() => {
        const columnCount = props.columns ?? defaultColumnCount;
        const baseClasses = [
            "gap-y-4",
            "grid",
            `grid-cols-${columnCount}`,
            "[&>div>label]:flex",
            "[&>div>label]:items-baseline",
            "[&>div>label>span:first-of-type]:w-1/3",
            "[&>div>label>span:first-of-type]:text-end",
            "[&>div>label>span:first-of-type]:me-4",
            "[&>div>label>:not(span:first-of-type)]:w-2/3",
            "[&_.p-datepicker>input]:grow-1",
            "[&>div>.p-message]:w-2/3",
            "[&>div>.p-message]:ms-auto",
            "[&>div>.p-message]:ps-4",
            "[&>div>.p-message]:mt-1"
        ];

        return baseClasses.join(' ');
    });
</script>

<template>
    <div :class="styleClasses">
        <slot></slot>
    </div>
</template>

<style scoped>

</style>