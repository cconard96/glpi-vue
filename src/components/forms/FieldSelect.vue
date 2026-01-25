<script setup lang="ts">
    /**
     * Wrapper for PrimeVue Select/MultiSelect component which automatically determines default options based on item properties so it does not show an empty select on load.
     */
    import { Select, MultiSelect } from "primevue";
    import {defineModel, inject, useId} from 'vue';

    const props = defineProps({
        optionValue: {
            type: String,
            default: 'id'
        },
        optionLabel: {
            type: String,
            default: 'name'
        },
        multiple: {
            type: Boolean,
            default: false
        },
        label: {
            type: String,
            default: ''
        }
    });

    const input_id = useId();
    const model = defineModel<string | number | null | undefined>();
    const form_field = inject('$pcFormField') as any;
    const initial_options: Array<{id: Number|String, name: String}> = props.multiple ? form_field.$pcForm.initialValues[`_${form_field.name}`] : [form_field.$pcForm.initialValues[`_${form_field.name}`]];
</script>

<template>
    <div class="flex items-baseline">
        <label class="w-1/3 text-end me-4" v-if="label" :for="input_id">{{ label }}</label>
        <Select v-if="!multiple" v-bind="form_field.field.props" :id="input_id" class="w-2/3" :optionValue="optionValue" :optionLabel="optionLabel" v-model="model" :options="initial_options"></Select>
        <MultiSelect v-else v-bind="form_field.field.props" :id="input_id" class="w-2/3" :dataKey="optionValue" :optionValue="optionValue" :optionLabel="optionLabel" v-model="model" :options="initial_options"></MultiSelect>
    </div>
</template>

<style scoped>

</style>