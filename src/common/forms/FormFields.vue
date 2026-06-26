<script setup lang="ts">
    import { computed } from "vue";
    import { useDeviceCapabilities } from "@/common/useDeviceCapabilities.ts";

    const props = defineProps<{
        columns?: number;
    }>();

    const { isMobileScreenSize } = useDeviceCapabilities();
    const defaultColumnCount = 2;

    const currentColumnCount = computed(() => {
        if (isMobileScreenSize.value) {
            return 1;
        }
        return props.columns ?? defaultColumnCount;
    });

    /**
     * Tailwind classes for the form fields container. Adjusts the layout based on the number of columns specified in props.
     * Also enforces specific widths and spacing for labels and their inputs so everything aligns nicely.
     * This will be used in place of the current hardcoded classes in the template to allow for dynamic column counts and easier maintenance.
     */
    const styleClasses = computed(() => {
        const columnCount = currentColumnCount.value;
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