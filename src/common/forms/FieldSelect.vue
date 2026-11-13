<script setup lang="ts">
    /**
     * Wrapper for PrimeVue Select/MultiSelect/TreeSelect component which automatically determines default options based on item properties so it does not show an empty select on load.
     *
     * Options may be a flat list or a tree where any option may have a `children` array of nested options.
     * A TreeSelect is used when `treeMode` is set or when any provided option has children.
     * The model value is always the option value (or an array of option values when `multiple`), regardless of the mode.
     */
    import type { VirtualScrollerLazyEvent } from "@cjdevstudios/bumblevue";
    import Select from '@cjdevstudios/bumblevue/select';
    import MultiSelect from '@cjdevstudios/bumblevue/multiselect';
    import Chip from '@cjdevstudios/bumblevue/chip';
    import TreeSelect from '@cjdevstudios/bumblevue/treeselect';
    import { computed, defineComponent, inject, PropType, provide, type Ref, ref, useId } from 'vue';
    import {useDropdown} from "@/common/useDropdown";
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

    const emit = defineEmits(['change']);

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

    /**
     * Whether the options should be displayed as a tree
     */
    const isTree = computed(() => props.treeMode || options.value.some((option) => Array.isArray(option?.children) && option.children.length > 0));

    /**
     * All options, including nested children, in a single flat list for value/label lookups
     */
    const flatOptions = computed(() => {
        const result: Array<any> = [];
        const flatten = (list: Array<any>) => {
            list.forEach((option) => {
                result.push(option);
                if (Array.isArray(option?.children)) {
                    flatten(option.children);
                }
            });
        };
        flatten(options.value);
        return result;
    });

    function findOption(value: any) {
        return flatOptions.value.find((option) => option[props.optionValue] === value);
    }

    function getLabelForValue(value: any): string {
        const option = findOption(value);
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
                const option = findOption(value);
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


    /**
     * Options converted to the TreeNode format used by TreeSelect.
     * Keys are always strings, so the original option value is resolved through {@link findOption} when selecting.
     */
    const treeNodes = computed(() => {
        const toNode = (option: any): any => ({
            key: String(option[props.optionValue]),
            label: typeof props.name_field === 'function' ? props.name_field(option) : option[props.optionLabel],
            data: option,
            children: Array.isArray(option.children) ? option.children.map(toNode) : undefined,
        });
        return options.value.map(toNode);
    });

    /**
     * The model value converted to/from the selection keys object used by TreeSelect
     */
    const treeSelectionKeys = computed({
        get() {
            const values = props.multiple ? selectedValue.value : [selectedValue.value];
            const keys: Record<string, boolean> = {};
            (Array.isArray(values) ? values : []).forEach((value: any) => {
                if (value !== null && value !== undefined && value !== '') {
                    keys[String(value)] = true;
                }
            });
            return Object.keys(keys).length ? keys : null;
        },
        set(keys: Record<string, any> | null) {
            const selectedKeys = Object.keys(keys ?? {}).filter((key) => keys![key] === true || keys![key]?.checked);
            // keep previously selected values in their original order and append new ones
            const previousValues: Array<any> = props.multiple && Array.isArray(selectedValue.value) ? selectedValue.value : [];
            const orderedKeys = [
                ...previousValues.map((value) => String(value)).filter((key) => selectedKeys.includes(key)),
                ...selectedKeys.filter((key) => !previousValues.some((value) => String(value) === key)),
            ];
            const values = orderedKeys.map((key) => {
                const option = flatOptions.value.find((option) => String(option[props.optionValue]) === key);
                return option ? option[props.optionValue] : key;
            });
            selectedValue.value = props.multiple ? values : (values[0] ?? null);
        }
    });

    /**
     * Form field props for the TreeSelect.
     * The form's change/input handlers are excluded because TreeSelect emits selection keys rather than the value. The model setter updates the form state instead.
     */
    const treeFieldProps = computed(() => {
        const { onChange, onInput, ...fieldProps } = formField.field.props ?? {};
        return fieldProps;
    });

    /**
     * Hides the form context from its children.
     * TreeSelect would otherwise bind itself to the form field and read/write the raw form value as its selection keys.
     */
    const FormContextIsolation = defineComponent({
        setup(_, { slots }) {
            provide('$pcForm', undefined);
            provide('$pcFormField', undefined);
            return () => slots.default?.();
        }
    });

    function onTreeChange() {
        emit('change', { originalEvent: null, value: selectedValue.value });
    }

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
        if (props.type === null || loaded.value || loading.value) {
            return;
        }
        // load everything for now since TreeSelect does not support virtual scrolling
        loading.value = true;
        loaded.value = true;
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
        <FormContextIsolation v-if="isTree">
            <TreeSelect v-bind="treeFieldProps" :invalid="formField.field.states.invalid" :aria-labelledby="labelID" class="min-w-32" :class="label_type === 'inline' ? 'w-2/3' : ''"
                        :selectionMode="multiple ? 'multiple' : 'single'" :metaKeySelection="false" v-model="treeSelectionKeys" :options="treeNodes"
                        :loading="loading" filter :showClear="showClear" @change="onTreeChange" @beforeShow="onLazyLoadTree"
            >
                <template #value="slotProps">
                    <div v-if="$slots.value" class="flex align-items-center">
                        <slot name="value" v-bind="{ ...slotProps, value: selectedValue }"></slot>
                    </div>
                    <div v-else-if="multiple && Array.isArray(selectedValue) && selectedValue.length" class="flex flex-wrap gap-1">
                        <Chip v-for="value in selectedValue" :key="value" :label="selectedLabel[value]"></Chip>
                    </div>
                    <div v-else-if="!multiple && selectedValue !== null && selectedValue !== undefined && selectedValue !== ''" class="flex align-items-center">
                        <div>{{ selectedLabel ?? "&nbsp;" }}</div>
                    </div>
                    <div v-else class="flex align-items-center">
                        <div>{{ slotProps.placeholder || "&nbsp;" }}</div>
                    </div>
                </template>
                <template v-if="$slots.option" #option="slotProps">
                    <slot name="option" v-bind="{ ...slotProps, option: slotProps.node.data }"></slot>
                </template>
            </TreeSelect>
        </FormContextIsolation>
        <Select v-else-if="!multiple" v-bind="formField.field.props" :aria-labelledby="labelID" class="min-w-32" :class="label_type === 'inline' ? 'w-2/3' : ''"
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