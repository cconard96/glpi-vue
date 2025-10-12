import axios from "axios";
import { useAuth } from "./useAuth";
import { useSessionStore } from "./useSessionStore";

let api_schema = null;
// Map of lowercase component names to actual component names
let component_name_map = null;
const { getAuthToken, refreshAuthToken } = useAuth();

export function useApi() {
    /**
     * Get headers for the session data like entity and profile
     */
    const getSessionHeaders = () => {
        const session = useSessionStore();
        if (!session.user_id) {
            // Not logged in yet
            return {};
        }
        return {
            'GLPI-Entity': session.active_entity.id,
            'GLPI-Entity-Recursive': session.active_entity.recursive,
            'GLPI-Profile': session.active_profile.id,
        }
    }

    /**
     *
     * @param {string} url
     * @param {axios.AxiosRequestConfig} config
     * @returns {Promise<axios.AxiosResponse<any>>}
     */
    const doApiRequest = (url, config = {}) => {
        const host = import.meta.env.VITE_GLPI_URL;
        // ensure the url does not start with a slash
        if (url.startsWith('/')) {
            url = url.substring(1);
        }
        return refreshAuthToken().then(() => {
            return axios.request({
                ...config,
                url: `${host}/api.php/${url}`,
                headers: Object.assign({
                    'Authorization': `Bearer ${getAuthToken()}`,
                    ...getSessionHeaders()
                })
            });
        });
    }

    const getApiSchema = () => {
        api_schema = api_schema ?? JSON.parse(localStorage.getItem('api_schema'));
        if (api_schema) {
            return Promise.resolve(api_schema);
        }

        return doApiRequest('doc.json').then(response => {
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

    const normalizeComponentName = (name) => {
        return getComponentNameMap().then(component_name_map => {
            return component_name_map[name.toLowerCase()] || name;
        });
    }

    const getComponents = () => {
        return getApiSchema().then(schema => {
            return schema.components || {};
        });
    }

    const getComponentSchema = (component_name) => {
        return getComponents().then(components => {
            return normalizeComponentName(component_name).then(normalized_name => {
                return components.schemas ? components.schemas[normalized_name] : null;
            });
        });
    }

    const search = (component_module, component_name, queryParams = {}) => {
        return normalizeComponentName(component_name).then(normalized_name => {
            if (!normalized_name) {
                return Promise.reject(new Error(`Component ${component_name} not found in schema`));
            }
            return normalized_name;
        }).then(normalized_name => {
            // ucfirst component_module
            component_module = component_module.charAt(0).toUpperCase() + component_module.slice(1).toLowerCase();
            const url = `${component_module}/${normalized_name}`;

            const doSearch = (url, queryParams, is_retry = false) => {
                return doApiRequest(url, {
                    headers: {
                        'Accept': 'application/json',
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
                    if (error.response && error.response.status === 401 && !is_retry) {
                        // Unauthorized, possibly token expired. Try to refresh token and retry once.
                        console.warn('Unauthorized request, attempting to refresh token and retry...');
                        const { refreshAuthToken } = useAuth();
                        return refreshAuthToken().then(() => {
                            return doSearch(url, queryParams, true);
                        });
                    }
                    console.error(`Failed to fetch data for component ${component_name}:`, error);
                    throw error;
                });
            };
            return doSearch(url, queryParams, false);
        });
    };

    const doGraphQLRequest = (query) => {
        const host = import.meta.env.VITE_GLPI_URL;
        return refreshAuthToken().then(() => {
            return axios.post(`${host}/api.php/GraphQL`, { query }, {
                headers: {
                    'Authorization': `Bearer ${getAuthToken()}`,
                    'Content-Type': 'application/json',
                    ...getSessionHeaders()
                },
            });
        });
    };

    return {
        getComponentSchema,
        search,
        doApiRequest,
        normalizeComponentName,
        doGraphQLRequest,
    };
}