<script setup lang="ts">
    /**
     * Wrapper for PrimeVue Select/MultiSelect component which automatically determines default options based on item properties so it does not show an empty select on load.
     */
    import {Select, MultiSelect, TreeSelect, Chip, VirtualScrollerLazyEvent, TreeNode} from "primevue";
    import { computed, ComputedRef, defineModel, inject, PropType, type Ref, ref, useId, watch } from 'vue';
    import {useDropdown} from "@/composables/useDropdown";
    import { components } from "../../../data/hlapiv2_schema";

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
            type: String as PropType<keyof components['schemas']>,
            default: null
        },
        condition: {
            type: String,
            default: ''
        },
        fields: {
            type: Array<string>,
            default: ['id', 'name']
        },
        name_field: {
            type: [String, Function],
            default: 'name'
        },
        options: {
            type: Array,
            default: null
        },
        showClear: {
            type: Boolean,
            default: true
        },
        treeMode: {
            type: Boolean,
            default: false
        }
    });

    defineEmits(['change']);

    const labelID = useId();
    //const model = defineModel<string | number | null | undefined>();
    const formField = inject('$pcFormField') as any;
    const options: Ref<Array<any>> = ref(props.options ?? []);

    const selectedValue = defineModel({
        get() {
            if (props.multiple) {
                return Array.isArray(formField.field.states.value) ? formField.field.states.value.map((val: any) => typeof val === 'object' && val !== null ? val[props.optionValue] : val) : [];
            }
            return typeof formField.field.states.value === 'object' && formField.field.states.value !== null ? formField.field.states.value[props.optionValue]: formField.field.states.value;
        },
        set(value) {
            return formField.field.states.value = value;
        }
    });

    function getLabelForValue(value: any): string {
        const option = options.value.find((option) => option[props.optionValue] === value);
        if (option) {
            return typeof props.name_field === 'function' ? props.name_field(option) : option[props.optionLabel];
        }
        // if it is the inital value which is not in the options, try returning the name field if it exists
        if (typeof formField.field.states.value === 'object' && formField.field.states.value !== null) {
            return formField.field.states.value[props.optionLabel] || (typeof props.name_field === 'function' ? props.name_field(formField.field.states.value) : formField.field.states.value[props.name_field]) || formField.field.states.value[props.optionValue] || formField.field.states.value;
        }
        return value;
    }

    const selectedLabel = computed(() => {
        if (props.multiple) {
            if (!Array.isArray(selectedValue.value)) {
                return '';
            }
            const selectedValues = selectedValue.value;
            // labels should be an object with the value as the key and the label as the value for easy lookup
            const labels: Record<string, string> = {};
            selectedValues.forEach((value: any, i: number) => {
                const option = options.value.find((option) => option[props.optionValue] === value);
                const formFieldValue = formField.field.states.value && Array.isArray(formField.field.states.value) ? formField.field.states.value[i] : formField.field.states.value;
                if (option) {
                    labels[value] = typeof props.name_field === 'function' ? props.name_field(option) : option[props.optionLabel];
                } else {
                    // if it is the inital value which is not in the options, try returning the name field if it exists
                    if (typeof formFieldValue === 'object' && formFieldValue !== null) {
                        labels[value] = formFieldValue[props.optionLabel] || (typeof props.name_field === 'function' ? props.name_field(formFieldValue) : formFieldValue[props.name_field]) || formFieldValue[props.optionValue] || formFieldValue || value;
                    } else {
                        labels[value] = value;
                    }
                }
            });
            return labels;
        }
        return getLabelForValue(selectedValue.value);
    });


    // const initial_value = formField.$pcForm.initialValues[`${formField.name}`];
    // const options: Ref<Array<{id: number|string, name: string}>> = ref(props.options ?? (initial_value ? (props.multiple ? initial_value : [initial_value]) : []));
    const { getDropdownOptions, getDropdownOptionsTree, loading } = useDropdown(
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

    function onLazyLoadTree() {
        if (loading.value) {
            return;
        }
        // load everything for now since TreeSelect does not support virtual scrolling
        loading.value = true;
        getDropdownOptionsTree(ref('')).then((new_options) => {
            options.value = new_options;
            loading.value = false;
        });
    }

    const virtual_scroller_options = {
        lazy: props.type !== null,
        onLazyLoad: props.treeMode ? onLazyLoadTree : onLazyLoad,
        showLoader: true,
        loading: loading.value,
        itemSize: 38
    };
</script>

<template>
    <div class="flex items-baseline" :class="label_type === 'on' ? 'p-floatlabel p-floatlabel-on' : ''">
        <label v-if="label && label_type === 'inline'" class="w-1/3 text-end me-4" :id="labelID">{{ label }}</label>
<!--        <TreeSelect v-if="treeMode" :selectionMode="multiple ? 'multiple' : 'single'" v-bind="form_field.field.props"-->
<!--                    :id="input_id" class="min-w-32" :class="label_type === 'inline' ? 'w-2/3' : ''"-->
<!--                    :optionValue="optionValue" :optionLabel="optionLabel" v-model="model" :options="options"-->
<!--                    filter :showClear="showClear" @change="$emit('change', $event)" @beforeShow="onLazyLoadTree"-->
<!--        ></TreeSelect>-->
        <Select v-if="!multiple" v-bind="formField.field.props" :aria-labelledby="labelID" class="min-w-32" :class="label_type === 'inline' ? 'w-2/3' : ''"
                :optionValue="optionValue" :optionLabel="optionLabel" v-model="selectedValue" :options="options"
                :virtual-scroller-options="virtual_scroller_options" filter autoFilterFocus :showClear="showClear"
                @change="$emit('change', $event)"
        >
            <template #value="slotProps">
                <div v-if="$slots.value" class="flex align-items-center">
                    <slot name="value" v-bind="slotProps"></slot>
                </div>
                <div v-else-if="slotProps.value" class="flex align-items-center">
                    <div>{{ selectedLabel ?? "&nbsp;" }}</div>
                </div>
                <div v-else class="flex align-items-center">
                    <div>{{ slotProps.placeholder || "&nbsp;" }}</div>
                </div>
            </template>
            <template v-if="$slots.option" #option="slotProps">
                <slot name="option" v-bind="slotProps"></slot>
            </template>
        </Select>
        <MultiSelect v-else v-bind="formField.field.props" :aria-labelledby="labelID" class="min-w-32" :class="label_type === 'inline' ? 'w-2/3' : ''"
                     :dataKey="optionValue" :optionValue="optionValue" :optionLabel="optionLabel" v-model="selectedValue" :options="options"
                     :virtual-scroller-options="virtual_scroller_options" filter autoFilterFocus display="chip" show-clear
                     :pt:label="{
                         class: 'flex-wrap',
                     }"
        >
            <template #chip="slotProps">
                <Chip :label="selectedLabel[slotProps.value]"
                      removable @remove="slotProps.removeCallback" removeIcon="ti ti-circle-x"
                />
            </template>
        </MultiSelect>
        <label v-if="label && label_type !== 'inline'" :id="labelID">{{ label }}</label>
    </div>
</template>

<style scoped>

</style>