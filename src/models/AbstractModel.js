import { useApi } from '../composables/useApi.js';
import { DatePicker, Password, InputText, InputNumber, Checkbox } from 'primevue';

export class AbstractModel {
    static getTypeModule() {
        return null;
    }

    static getTypeName() {
        throw new Error('getTypeName() must be implemented by subclasses');
    }

    /**
     * @returns {[{label: string, to: string}]}
     */
    static getMenuBreadcrumbs() {
        return [
            { label: this.getTypeName(), to: `${this.getTypeModule()}/${this.getOpenAPISchemaName()}`.toLowerCase() }
        ];
    }

    static getOpenAPISchemaName() {
        throw new Error('getOpenAPISchemaName() must be implemented by subclasses');
    }

    static getIcon() {
        return 'ti ti-package';
    }

    static getOpenAPISchema() {
        const { getComponentSchema } = useApi();
        return getComponentSchema(this.getOpenAPISchemaName());
    }

    static getSchemaPropertiesForFields() {
        return this.getOpenAPISchema().then(schema => {
            const props = {};
            if (schema && schema.properties) {
                for (const [key, prop] of Object.entries(schema.properties)) {
                    // If name ends with '.id' and only contains a single '.', it's likely an item dropdown
                    const is_item_dropdown = key.endsWith('.id') && (key.match(/\./g) || []).length === 1;
                    const field_name = is_item_dropdown ? key.slice(0, -3) : key;
                    if (!is_item_dropdown && key.includes('.')) {
                        // Ignore other nested properties for now
                        continue;
                    }
                    props[field_name] = prop;
                }
            }
            return props;
        });
    }

    /**
     * @param mode
     * @returns {Promise<Record<string, {
     *     name: string,
     *     component: any,
     *     options: {}
     * }>>}
     */
    static getFormFields(mode = 'read') {
        return this.getSchemaPropertiesForFields().then(props => {
            const fields_data = {};
            for (const [key, prop] of Object.entries(props)) {
                const field = {
                    name: key,
                };
                // Determine PrimeVue component to use based on the OpenAPI type and format
                switch (prop.type) {
                    case 'string':
                        if (prop.format === 'date' || prop.format === 'date-time') {
                            field.component = DatePicker;
                            field.options = {showTime: prop.format === 'date-time'};
                        } else if (prop.format === 'password') {
                            field.component = Password;
                        } else {
                            field.component = InputText;
                        }
                        break;
                    case 'integer':
                    case 'number':
                        field.component = InputNumber;
                        break;
                    case 'boolean':
                        field.component = Checkbox;
                        break;
                    default:
                        continue;
                }
                field.options = field.options || {};
                field.options['readonly'] = prop.readOnly || false;
                field.options['writeonly'] = prop.writeOnly || false;
                fields_data[field.name] = field;
            }
            return fields_data;
        });
    }

    /**
     * Get the display order of form fields
     * @returns {Promise<string[]>}
     */
    static getFormFieldOrder() {
        return this.getFormFields().then(fields => {
            return Object.keys(fields);
        });
    }
}