import axios from "axios";
import { useAuth } from "./useAuth";

let api_schema = null;
// Map of lowercase component names to actual component names
let component_name_map = null;
const { getAuthToken } = useAuth();

export function useApi() {
    const getApiSchema = () => {
        api_schema = api_schema ?? JSON.parse(localStorage.getItem('api_schema'));
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
            localStorage.setItem('api_schema', JSON.stringify(api_schema));
            console.log('API schema fetched successfully');
            return api_schema;
        }).catch(error => {
            console.error('Failed to fetch API schema:', error);
            throw error;
        });
    };

    const getComponentNameMap = () => {
        return getApiSchema().then((api_schema) => {
            component_name_map = {};
            Object.keys(api_schema.components.schemas).forEach(name => {
                component_name_map[name.toLowerCase()] = name;
            });
            return component_name_map;
        });
    }

    const getComponents = () => {
        return getApiSchema().then(schema => {
            return schema.components || {};
        });
    }

    const getComponentSchema = (component_name) => {
        return getComponents().then(components => {
            return getComponentNameMap().then(component_name_map => {
                return components.schemas ? components.schemas[component_name_map[component_name.toLowerCase()]] : null;
            })
        });
    }

    const search = (component_module, component_name, queryParams = {}) => {
        const host = import.meta.env.VITE_GLPI_URL;
        const lowerName = component_name.toLowerCase();
        return getComponentNameMap().then(component_name_map => {
            const actualName = component_name_map[lowerName];
            if (!actualName) {
                return Promise.reject(new Error(`Component ${component_name} not found in schema`));
            }
            return actualName;
        }).then(actualName => {
            // ucfirst component_module
            component_module = component_module.charAt(0).toUpperCase() + component_module.slice(1).toLowerCase();
            const url = `${host}/api.php/${component_module}/${actualName}`;

            return axios.get(url, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Accept': 'application/json',
                    'XDEBUG_TRIGGER': 'PHPSTORM'
                },
                params: queryParams
            }).then(response => {
                // get content-range header info
                const contentRange = response.headers['content-range'];
                return {
                    results: response.data,
                    start: contentRange ? parseInt(contentRange.split('/')[0].split('-')[0]) : null,
                    end: contentRange ? parseInt(contentRange.split('/')[0].split('-')[1]) : null,
                    total: contentRange ? parseInt(contentRange.split('/')[1]) : null,
                };
            }).catch(error => {
                console.error(`Failed to fetch data for component ${component_name}:`, error);
                throw error;
            });
        });
    };

    return {
        getComponentSchema,
        search,
    };
}