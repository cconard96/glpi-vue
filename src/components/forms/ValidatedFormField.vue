<script setup lang="ts" generic="P extends Record<string, any>">
    import { FormField } from "@primevue/forms";
    import { Checkbox, Message } from "primevue";
    import { type Component, computed, inject } from "vue";
    import FieldSelect from "@/components/forms/FieldSelect.vue";

    const props = defineProps<{
        name: string;
        label?: string;
        helpText?: string;
        as?: Component<{'$props': P}>;
        fieldProps?: P;
    }>();
    defineEmits<{
        (e: 'change', value: any): void;
    }>();

</script>

<template>
    <FormField :name="name" v-slot="$slot">
        <FieldSelect v-if="props.as === FieldSelect" v-bind="{...fieldProps, label: label}" @change="$emit('change', $event.value)"></FieldSelect>
        <!-- TODO support FloatLabel for non-FieldSelect components similar to how FieldSelect handles it. Maybe move the logic out of FieldSelect if all forms use the AdvancedForm component and this instead of Form/FormField? -->
        <label v-else-if="as && label" :class="props.as === Checkbox ? 'items-start!' : ''">
            <span>
                {{ label }}
                <span v-if="helpText" v-tooltip="helpText">
                    <i class="ti ti-info-circle"></i>
                </span>
            </span>
             <component :is="as" v-bind="fieldProps" />
        </label>
        <component v-else-if="as" :is="as" v-bind="fieldProps" />
        <slot v-else></slot>
        <Message v-if="$slot.invalid" severity="error" size="small" variant="simple" v-text="$slot.error?.message"></Message>
    </FormField>
</template>

<style scoped>

</style>