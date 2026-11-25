<script setup lang="ts">
    /**
     * DatePicker bound to a form field holding the date as a string in the same format as the GLPI date/time question inputs
     * (`Y-m-d`, `H:i` or `Y-m-d\TH:i`).
     */
    import DatePicker from "@cjdevstudios/bumblevue/datepicker";
    import { computed, inject } from "vue";
    import FormContextIsolation from "@/common/forms/FormContextIsolation";
    import { formatDateTimeAnswer } from "@/modules/assistance/forms/viewer/useFormRenderer";

    const props = defineProps<{
        isDateEnabled: boolean;
        isTimeEnabled: boolean;
    }>();

    const formField = inject('$pcFormField') as any;

    function parse(value: unknown): Date | null {
        if (typeof value !== 'string' || value === '') {
            return null;
        }
        let match = value.match(/^(\d{4})-(\d{2})-(\d{2})(?:[Tt ](\d{2}):(\d{2}))?/);
        if (match) {
            return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]), Number(match[4] ?? 0), Number(match[5] ?? 0));
        }
        match = value.match(/^(\d{2}):(\d{2})/);
        if (match) {
            const date = new Date();
            date.setHours(Number(match[1]), Number(match[2]), 0, 0);
            return date;
        }
        return null;
    }

    const model = computed({
        get: () => parse(formField?.field.states.value),
        set: (value: Date | Date[] | null | undefined) => {
            const date = Array.isArray(value) ? value[0] : value;
            formField.field.states.value = date instanceof Date ? formatDateTimeAnswer(date, props.isDateEnabled, props.isTimeEnabled) : '';
        },
    });

    const fieldProps = computed(() => {
        const { onChange, onInput, ...rest } = formField?.field.props ?? {};
        return rest;
    });
</script>

<template>
    <FormContextIsolation>
        <DatePicker v-bind="fieldProps" v-model="model" :invalid="formField?.field.states.invalid"
                    :showTime="isDateEnabled && isTimeEnabled" :timeOnly="!isDateEnabled && isTimeEnabled" hourFormat="24"
                    dateFormat="yy-mm-dd" showIcon showButtonBar fluid></DatePicker>
    </FormContextIsolation>
</template>
