<script setup lang="ts" generic="P extends Record<string, any>">
    import { FormField } from "@primevue/forms";
    import { Message } from "primevue";
    import { type Component, computed } from "vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";

    const props = defineProps<{
        name: string;
        label?: string;
        as?: Component<{'$props': P}>;
        fieldProps?: P;
    }>();
    defineEmits<{
        (e: 'change', value: any): void;
    }>();

    const isFieldSelect = computed(() => {
        return props.as === FieldSelect;
    });
</script>

<template>
    <FormField :name="name" v-slot="$slot">
        <FieldSelect v-if="isFieldSelect" v-bind="{...fieldProps, label: label}" @change="$emit('change', $event.value)"></FieldSelect>
        <!-- TODO support FloatLabel for non-FieldSelect components similar to how FieldSelect handles it. Maybe move the logic out of FieldSelect if all forms use the AdvancedForm component and this instead of Form/FormField? -->
        <label v-else-if="as && label">
            <span>{{ label }}</span>
             <component :is="as" v-bind="fieldProps" />
        </label>
        <component v-else-if="as" :is="as" v-bind="fieldProps" />
        <slot v-else></slot>
        <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
    </FormField>
</template>

<style scoped>

</style>