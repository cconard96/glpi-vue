import {FormResolverOptions} from "@primevue/forms";

export function useOpenAPIForm(schema: Record<string, any>) {
    const error_required_message = 'This field is required.';
    const error_range_message = 'The value must be between {min} and {max}.';

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

    return {
        resolveFields,
    }
}