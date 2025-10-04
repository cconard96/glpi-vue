import axios from "axios";
import { useAuth } from "./useAuth";

let api_schema = null;
// Map of lowercase component names to actual component names
let component_name_map = null;
const { getAuthToken } = useAuth();

export function useApi() {
    const getApiSchema = () => {
        if (api_schema) {
            return Promise.resolve(api_schema);
        }

        const host = import.meta.env.VITE_GLPI_URL;
        const openapi_url = `${host}/api.php/doc.json`;

        return axios.get(openapi_url, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        }).then(response => {
            api_schema = response.data;
            component_name_map = {};
            if (api_schema.components && api_schema.components.schemas) {
                Object.keys(api_schema.components.schemas).forEach(name => {
                    component_name_map[name.toLowerCase()] = name;
                });
            }
            console.log('API schema fetched successfully');
            return api_schema;
        }).catch(error => {
            console.error('Failed to fetch API schema:', error);
            throw error;
        });
    };

    const getComponents = () => {
        return getApiSchema().then(schema => {
            return schema.components || {};
        });
    }

    const getComponentSchema = (component_name) => {
        return getComponents().then(components => {
            return components.schemas ? components.schemas[component_name_map[component_name.toLowerCase()]] : null;
        });
    }

    const search = (component_name, queryParams = {}) => {
        const host = import.meta.env.VITE_GLPI_URL;
        const lowerName = component_name.toLowerCase();
        const actualName = component_name_map[lowerName];
        if (!actualName) {
            return Promise.reject(new Error(`Component ${component_name} not found in schema`));
        }
        const url = `${host}/api.php/${actualName}`;

        return axios.get(url, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`,
                'Accept': 'application/json',
                'XDEBUG_TRIGGER': 'PHPSTORM'
            },
            params: queryParams
        }).then(response => {
            return response.data;
        }).catch(error => {
            console.error(`Failed to fetch data for component ${component_name}:`, error);
            throw error;
        });
    };

    return {
        getComponentSchema,
        search,
    };
}