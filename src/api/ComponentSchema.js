import { ArrayAccessor } from "@/util/ArrayAccessor.js";

export class ComponentSchema {
    TYPE_STRING = 'string';
    TYPE_INTEGER = 'integer';
    TYPE_NUMBER = 'number';
    TYPE_BOOLEAN = 'boolean';
    TYPE_OBJECT = 'object';
    TYPE_ARRAY = 'array';

    FORMAT_STRING_BYTE = 'byte';
    FORMAT_STRING_BINARY = 'binary';
    FORMAT_STRING_DATE = 'date';
    FORMAT_STRING_DATE_TIME = 'date-time';
    FORMAT_STRING_PASSWORD = 'password';
    FORMAT_STRING_STRING = 'string';
    FORMAT_INTEGER_INT32 = 'int32';
    FORMAT_INTEGER_INT64 = 'int64';
    FORMAT_NUMBER_DOUBLE = 'double';
    FORMAT_NUMBER_FLOAT = 'float';
    FORMAT_BOOLEAN_BOOLEAN = 'boolean';

    constructor(component_schema) {
        this.description = component_schema.description || '';
        this.properties = component_schema.properties || {};
    }

    flattenProperties(prefix = '', collapse_array_types = false, parent_obj = null) {
        const flattened = {};
        const to_flatten = parent_obj?.properties || this.properties;
        for (let [name, prop] of Object.entries(to_flatten)) {
            if (collapse_array_types && prop.type === this.TYPE_ARRAY) {
                prop = prop.items;
            }
            if (prop?.type === this.TYPE_OBJECT) {
                const is_mapped_object = prop.hasOwnProperty('x-mapped-from');
                const new_props = this.flattenProperties(`${prefix}${name}.`, collapse_array_types, prop);
                if (is_mapped_object) {
                    // set x-mapped-property on all new_props
                    for (let new_prop of Object.values(new_props)) {
                        new_prop['x-mapped-property'] = true;
                    }
                }
                Object.assign(flattened, new_props);
            } else {
                flattened[`${prefix}${name}`] = prop;
            }
        }
        return flattened;
    }

    /**
     * Converts raw results from the API into a more friendly format based on the schema.
     * For example, the dates are converted to more readable local date strings.
     * @param results
     */
    formatResults(results) {
        if (Array.isArray(results)) {
            return results.map(item => this.formatResults(item));
        } else if (typeof results === 'object' && results !== null) {
            const formatted = {};
            for (let [key, value] of Object.entries(results)) {
                const prop_schema = this.properties[key];
                if (prop_schema) {
                    if (prop_schema.type === this.TYPE_STRING && (prop_schema.format === this.FORMAT_STRING_DATE || prop_schema.format === this.FORMAT_STRING_DATE_TIME)) {
                        // Convert to local date string
                        const date = new Date(value);
                        if (!isNaN(date.getTime())) {
                            formatted[key] = date.toLocaleString();
                        } else {
                            formatted[key] = value; // Invalid date, keep original
                        }
                    } else if (prop_schema.type === this.TYPE_ARRAY && Array.isArray(value)) {
                        // Recursively format array items
                        if (prop_schema.items) {
                            const item_schema = new ComponentSchema({ properties: { item: prop_schema.items } });
                            formatted[key] = item_schema.formatResults(value);
                        } else {
                            formatted[key] = value;
                        }
                    } else if (prop_schema.type === this.TYPE_OBJECT && typeof value === 'object' && value !== null) {
                        // Recursively format object properties
                        const nested_schema = new ComponentSchema(prop_schema);
                        formatted[key] = nested_schema.formatResults(value);
                    } else {
                        formatted[key] = value; // No special formatting needed
                    }
                } else {
                    formatted[key] = value; // No schema available, keep original
                }
            }
            return formatted;
        } else {
            return results; // Primitive type, return as is
        }
    }
}