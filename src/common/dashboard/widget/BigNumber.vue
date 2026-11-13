<script setup lang="ts">
    import { computed, onMounted, ref } from "vue";

    const props = defineProps<{
        gridstack_id: string;
        options: Record<string, any>;
        value: Record<string, any>;
    }>();

    const { color } = props.options;
    const valueNumber = computed(() => props.value?.number ?? 0);
    const { label, icon } = props.value;

    // fancy count-up animation with easing
    const animationDuration = 1000;
    const displayedNumberRaw = ref(0);

    /** Large numbers may cause the text to overflow, so we show larger numbers are decimals with a unit */
    const displayedNumber = computed(() => {
        const number = displayedNumberRaw.value;
        if (number >= 1_000_000_000) {
            return `${(number / 1_000_000_000).toFixed(1)}B`;
        } else if (number >= 1_000_000) {
            return `${(number / 1_000_000).toFixed(1)}M`;
        } else if (number >= 1_000) {
            return `${(number / 1_000).toFixed(1)}K`;
        } else {
            return number.toString();
        }
    });

    const animateCounter = () => {
        // return early with the displayed number set to the final value if the user wants to skip the animation (media query prefers-reduced-motion)
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            displayedNumberRaw.value = valueNumber.value;
            return;
        }

        const startTime = performance.now();
        const endValue = valueNumber.value;
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

        const animate = (currentTime: number) => {
            const elapsedTime = currentTime - startTime;
            const progress = Math.min(elapsedTime / animationDuration, 1);
            const easedProgress = easeOutCubic(progress);
            displayedNumberRaw.value = Math.round(endValue * easedProgress);
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };
        requestAnimationFrame(animate);
    };

    onMounted(() => {
        animateCounter();
    });
</script>

<template>
    <div class="h-full border rounded p-2" :style="`color: ${color ?? 'inherit'}; border-color: ${color ?? 'inherit'};`">
        <div class="flex justify-between">
            <span class="text-3xl tabular-nums" :aria-label="`${displayedNumberRaw}`">{{ displayedNumber }}</span>
            <i v-if="props.value?.icon" :class="`text-4xl ${props.value.icon}`" :aria-hidden="true"></i>
        </div>
        <div>{{ props.value.label }}</div>
    </div>
</template>

<style scoped>

</style>