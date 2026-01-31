<script setup lang="ts">
    // similar to the PrimeVue TabPanel but with different lazy loading behavior.
    // The PrimeVue TabPanel loads the content every single time the tab is activated and when it is deactivated, it removes the content from the DOM.
    // This version lazy loads once and keeps the content in the DOM.
    import {ref, watch, inject, computed} from "vue";

    const props = defineProps({
        value: {
            type: [String, Number],
            default: undefined
        },
        as: {
            type: [String, Object],
            default: 'DIV'
        },
        asChild: {
            type: Boolean,
            default: false
        },
        // in TabView
        header: null,
        headerStyle: null,
        headerClass: null,
        headerProps: null,
        headerActionProps: null,
        contentStyle: null,
        contentClass: null,
        contentProps: null,
        disabled: Boolean
    });

    defineOptions({
        inheritAttrs: false
    });

    const $pcTabs = inject('$pcTabs');
    const active_once = ref(false);

    defineExpose({
        active_once,
        value: props.value
    });

    const id = computed(() => {
        return `${$pcTabs?.$id}_tabpanel_${props.value}`;
    });
    const active = computed(() => {
        return $pcTabs?.d_value === props.value;
    });
    const a11yAttrs = computed(() => {
        return {
            id: id,
            tabindex: $pcTabs?.tabindex,
            role: 'tabpanel',
            'aria-labelledby': `${$pcTabs?.$id}_tab_${props.value}`,
            'data-pc-name': 'tabpanel',
            'data-p-active': active
        };
    });
    watch(active, (newVal) => {
        if (newVal && !active_once.value) {
            active_once.value = true;
        }
    }, { immediate: true });
</script>

<template>
    <slot v-if="!$pcTabs"></slot>
    <template v-else>
        <template v-if="!asChild">
            <component v-if="active_once" v-show="active" :is="as" v-bind="$attrs">
                <slot></slot>
            </component>
        </template>

        <slot v-else :active="active" :a11yAttrs="a11yAttrs"></slot>
    </template>
</template>

<style scoped>

</style>