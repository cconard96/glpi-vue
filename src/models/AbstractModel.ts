import { useApi } from '../composables/useApi.ts';
import { DatePicker, Password, InputText, InputNumber, Checkbox } from 'primevue';

export class AbstractModel {
    static getTypeModule(): String {
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

    static getGLPIItemtype(): Promise<String> {
        return this.getOpenAPISchema().then(schema => {
            return schema['x-itemtype'] || this.getOpenAPISchemaName();
        });
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
                if (['id', 'entity', 'is_recursive', 'is_deleted', 'date_creation', 'date_mod'].includes(key)) {
                    continue;
                }
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
                    case 'object':
                        console.log(prop);
                        continue;
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

    static getFormFieldLabels() {
        return new Map([
            ['id', 'ID'],
            ['name', 'Name'],
            ['comment', 'Comments'],
            ['date_creation', 'Creation Date'],
            ['date_mod', 'Modification Date'],
            ['status', 'Status'],
            ['location', 'Location'],
            ['entity', 'Entity'],
            ['type', 'Type'],
            ['manufacturer', 'Manufacturer'],
            ['model', 'Model'],
            ['user', 'User'],
            ['user_tech', 'Technician in Charge'],
            ['group', 'Group'],
            ['group_tech', 'Group in Charge'],
            ['contact', 'Alternate Username'],
            ['contact_num', 'Alternate Username Number'],
            ['serial', 'Serial Number'],
            ['otherserial', 'Inventory Number'],
            ['network', 'Network'],
            ['uuid', 'UUID'],
            ['autoupdatesystem', 'Update Source'],
        ]);
    }

    static getTabs(): Array {
        throw new Error('getTabs() must be implemented by subclasses');
    }

    /**
     * Return a string of all GraphQL fields recursively for this model based on the OpenAPI schema
     * @protected
     */
    static async getFullGraphQLFields(): Promise<String> {
        const schema = await this.getOpenAPISchema();
        const buildFields = (properties, parent_key: String) => {
            let fields = '';
            for (const [key, prop] of Object.entries(properties)) {
                let field_name = key;
                if (field_name === 'name' && ['user', 'user_tech'].includes(parent_key)) {
                    // Fix for GLPI bug
                    field_name = 'name: username';
                }
                if (prop.type === 'object' && prop.properties) {
                    fields += `${field_name} { ${buildFields(prop.properties, field_name)} } `;
                } else if (prop.type === 'array' && prop.items && prop.items.type === 'object' && prop.items.properties) {
                    fields += `${field_name} { ${buildFields(prop.items.properties, field_name)} } `;
                } else {
                    fields += `${field_name} `;
                }
            }
            return fields;
        };
        return buildFields(schema.properties, null);
    }

    /**
     * Load an item by ID with specified fields. If no fields are specified, load all immediate fields.
     * @param id
     * @param fields
     */
    static loadItem(id: number, fields: string[] = []): Promise<any> {
        const { doGraphQLRequest } = useApi();
        const fields_to_query = fields.length > 0 ? Promise.resolve(fields.join(' ')) : this.getFullGraphQLFields();
        return fields_to_query.then((fields) => {
            return doGraphQLRequest(`
                query {
                    ${this.getOpenAPISchemaName()}(id: ${id}) {
                        ${fields}
                    }
                }
            `).then((response) => {
                const data = response.data[this.getOpenAPISchemaName()][0];
                // flatten objects that have an 'id' field for easier use with forms
                return this.formatFieldsForForm(data);
            });
        });
    }

    static formatFieldsForForm(data: any): any {
        const formatted_data = { ...data };
        for (const [key, value] of Object.entries(formatted_data)) {
            if (value && typeof value === 'object' && 'id' in value) {
                formatted_data[key] = value.id;
                formatted_data[`_${key}`] = value; // keep the full object as well. could be useful to be able to immediately show the selection in a dropdown
            } else if (value && Array.isArray(value) && value.length > 0 && typeof value[0] === 'object' && 'id' in value[0]) {
                formatted_data[key] = value.map(item => item.id);
                formatted_data[`_${key}`] = value; // keep the full objects as well
            }
        }
        return formatted_data;
    }
}