<script setup lang="ts">
    /**
     * Wrapper for PrimeVue Select/MultiSelect component which automatically determines default options based on item properties so it does not show an empty select on load.
     */
    import {Select, MultiSelect, Chip, VirtualScrollerLazyEvent} from "primevue";
    import {defineModel, inject, type Ref, ref, useId, watch} from 'vue';
    import {useDropdown} from "@/composables/useDropdown";

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
        },
        label_type: {
            type: String,
            validator(value: unknown): boolean {
                return ['inline', 'on'].includes(value as string);
            },
            default: 'inline'
        },
        type: {
            type: String,
            default: null
        },
        condition: {
            type: String,
            default: ''
        },
        fields: {
            type: Array<String>,
            default: ['id', 'name']
        },
        name_field: {
            type: [String, Function],
            default: 'name'
        },
        options: {
            type: Array<{id: Number|String, name: String}>,
            default: null
        },
        showClear: {
            type: Boolean,
            default: true
        }
    });

    defineEmits(['change']);

    const input_id = useId();
    const model = defineModel<string | number | null | undefined>();
    const form_field = inject('$pcFormField') as any;
    const initial_value = form_field.$pcForm.initialValues[`_${form_field.name}`];
    const options: Ref<Array<{id: Number|String, name: String}>> = ref(props.options ?? (initial_value ? (props.multiple ? initial_value : [initial_value]) : []));
    const { getDropdownOptions, loading } = useDropdown(
        props.type,
        options,
        ref(''),
        { condition: props.condition, fields: props.fields, name_field: props.name_field }
    );
    const loaded = ref(false);

    function onLazyLoad(event: VirtualScrollerLazyEvent) {
        if (loaded.value || loading.value) {
            return;
        }

        loading.value = true;
        loaded.value = true;
        getDropdownOptions(ref(''), 0, 0).then((new_options) => {
            options.value = new_options;
            loading.value = false;
        });
    }

    const virtual_scroller_options = {
        lazy: props.type !== null,
        onLazyLoad: onLazyLoad,
        showLoader: true,
        loading: loading.value,
        itemSize: 38
    };
</script>

<template>
    <div class="flex items-baseline" :class="label_type === 'on' ? 'p-floatlabel p-floatlabel-on' : ''">
        <label v-if="label && label_type === 'inline'" class="w-1/3 text-end me-4" :for="input_id">{{ label }}</label>
        <Select v-if="!multiple" v-bind="form_field.field.props" :id="input_id" class="min-w-32" :class="label_type === 'inline' ? 'w-2/3' : ''"
                :optionValue="optionValue" :optionLabel="optionLabel" v-model="model" :options="options"
                :virtual-scroller-options="virtual_scroller_options" filter autoFilterFocus :showClear="showClear"
                @change="$emit('change', $event)"
        >
            <template #value="slotProps">
                <div v-if="$slots.value" class="flex align-items-center">
                    <slot name="value" v-bind="slotProps"></slot>
                </div>
                <div v-else-if="slotProps.value" class="flex align-items-center">
                    <div>{{ options.find(opt => opt[optionValue] === slotProps.value)?.[optionLabel] || slotProps.value }}</div>
                </div>
                <div v-else class="flex align-items-center">
                    <div>{{ slotProps.placeholder || '&nbsp;' }}</div>
                </div>
            </template>
            <template v-if="$slots.option" #option="slotProps">
                <slot name="option" v-bind="slotProps"></slot>
            </template>
        </Select>
        <MultiSelect v-else v-bind="form_field.field.props" :id="input_id" class="min-w-32" :class="label_type === 'inline' ? 'w-2/3' : ''"
                     :dataKey="optionValue" :optionValue="optionValue" :optionLabel="optionLabel" v-model="model" :options="options"
                     :virtual-scroller-options="virtual_scroller_options" filter autoFilterFocus display="chip" show-clear>
            <template #chip="slotProps">
                <Chip :label="options.find(opt => opt[optionValue] === slotProps.value)?.[optionLabel] || slotProps.value"
                      removable @remove="slotProps.removeCallback" removeTokenIcon="ti ti-circle-x"
                />
            </template>
        </MultiSelect>
        <label v-if="label && label_type !== 'inline'" :for="input_id">{{ label }}</label>
    </div>
</template>

<style scoped>

</style>