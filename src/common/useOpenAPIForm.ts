import { FormResolverOptions } from "@primevue/forms";
import { ref } from "vue";

export function useOpenAPIForm(schema: Record<string, any>) {
    const error_required_message = 'This field is required.';
    const error_range_message = 'The value must be between {min} and {max}.';
    const isSubmitting = ref(false);

    function resolveFields(opts: FormResolverOptions): Promise<Record<string, any>> | Record<string, any> | undefined {
        const required_fields = schema.required || [];
        const errors: Record<string, Array<{message: string}>> = {};

        for (const [field_name, field_value] of Object.entries(opts.values)) {
            const field_schema = schema.properties ? schema.properties[field_name] : null;
            if (!field_schema) {
                continue;
            }

            // Check required fields
            if (required_fields.includes(field_name)) {
                if (field_value === null || field_value === undefined || field_value === '') {
                    if (!errors[field_name]) {
                        errors[field_name] = [];
                    }
                    errors[field_name].push({message: error_required_message});
                }
            }

            // Check range for numeric fields
            if ((field_schema.type === 'integer' || field_schema.type === 'number') && field_value !== null && field_value !== undefined && field_value !== '') {
                const min = field_schema.minimum;
                const max = field_schema.maximum;
                if ((min !== undefined && field_value < min) || (max !== undefined && field_value > max)) {
                    if (!errors[field_name]) {
                        errors[field_name] = [];
                    }
                    errors[field_name].push({message: error_range_message.replace('{min}', min).replace('{max}', max)});
                }
            }
        }

        return {
            values: opts.values,
            errors: errors,
        }
    }

    /**
     *
     * @todo Find a way to remove this
     */
    function formatFieldsForForm(data: any): any {
        const formatted_data = { ...data };
        for (const [key, value] of Object.entries(formatted_data)) {
            if (value && typeof value === 'object' && 'id' in value) {
                formatted_data[key] = value.id;
                formatted_data[`_${key}`] = value; // keep the full object as well. could be useful to be able to immediately show the selection in a dropdown
            } else if (value && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'id' in value[0]) {
                formatted_data[key] = value.map(item => item.id);
                formatted_data[`_${key}`] = value; // keep the full objects as well
            } else {
                if (schema.properties && schema.properties[key] && schema.properties[key].type === 'string' && (schema.properties[key].format === 'date' || schema.properties[key].format === 'date-time')) {
                    // Convert date-time strings to Date objects for easier use with date pickers
                    formatted_data[key] = value ? new Date(value as string) : null;
                }
            }
        }
        return formatted_data;
    }

    return {
        resolveFields,
        isSubmitting,
        formatFieldsForForm,
    }
}