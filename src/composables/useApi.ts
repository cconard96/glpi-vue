import axios from "axios";
import type { AxiosRequestConfig, AxiosResponse } from "axios";
import {ApolloClient, HttpLink, InMemoryCache, ApolloLink, type FetchPolicy, type ErrorPolicy} from "@apollo/client/core";
import { RetryLink } from "@apollo/client/link/retry"
import { SetContextLink } from "@apollo/client/link/context";
import { gql } from "graphql-tag";
import { useAuth } from "./useAuth";
import { useSessionStore } from "./useSessionStore";
import {type components} from "../../data/hlapiv2_schema";
import { OpenAPISchemaDefinition } from "@/types";
import { useIndexedDB } from "@/composables/useIndexedDB.ts";

interface GraphQLResponseData {
    errors?: any;
}

let api_schema = null;
// Map of lowercase component names to actual component names
let component_name_map = null;

const graphql_cache = new InMemoryCache();
// @ts-ignore
const oauth_link = new SetContextLink(async (_, { headers }) => {
    const { getAuthToken, refreshAuthToken } = useAuth();
    await refreshAuthToken();
    return {
        headers: {
            ...headers,
            Authorization: `Bearer ${getAuthToken()}`,
        }
    };
});
// create apollo link chain
const link = ApolloLink.from([
    oauth_link,
    new RetryLink(),
    new HttpLink({
        uri: `${import.meta.env.VITE_GLPI_URL}/api.php/GraphQL`,
    })
]);


const apollo_client = new ApolloClient({
    link: link,
    cache: graphql_cache,
});

export interface SearchResult {
    results: any[];
    start: number | null;
    end: number | null;
    total: number | null;
}

export function useApi() {
    const { getAuthToken, refreshAuthToken } = useAuth();
    const { getOpenAPIComponent, getAllOpenAPIComponentNames, getOpenAPISchemaNameForGLPIItemtype } = useIndexedDB();

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

    const doApiRequest = (url: string, config: AxiosRequestConfig = {}): Promise<AxiosResponse<any>> => {
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

    const getComponentNameMap = () => {
        return getAllOpenAPIComponentNames().then(component_names => {
            component_name_map = {};
            component_names.forEach(name => {
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

    const getComponentSchema =
        <T extends keyof components['schemas']>(component_name: T): Promise<OpenAPISchemaDefinition> => {
        return getOpenAPIComponent(component_name);
    }

    const search = (component_module, component_name, queryParams = {}): Promise<SearchResult> => {
        return normalizeComponentName(component_name).then(normalized_name => {
            if (!normalized_name) {
                return Promise.reject(new Error(`Component ${component_name} not found in schema`));
            }
            return normalized_name;
        }).then(normalized_name => {
            // ucfirst component_module
            component_module = component_module.charAt(0).toUpperCase() + component_module.slice(1).toLowerCase();
            const url = `${component_module}/${normalized_name}`;

            const doSearch = (url, queryParams, is_retry = false): Promise<SearchResult> => {
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

    const doGraphQLRequest = <T>(query: string, variables = {}, fetchPolicy: FetchPolicy = 'no-cache', errorPolicy: ErrorPolicy = null) => {
        return apollo_client.query<GraphQLResponseData & T>({
            variables: variables,
            query: gql`${query}`,
            fetchPolicy: fetchPolicy,
            errorPolicy: errorPolicy,
        });
    };

    function getItemByID(component_name, id) {
        return getComponentSchema(component_name).then(schema => {
            if (!schema) {
                return Promise.reject(new Error(`Component ${component_name} not found in schema`));
            }
            const fields_request = getCompleteFieldsRequestForSchema(schema.properties || {});
            const query = `
                query {
                    ${component_name}(id: ${id}) {
                        ${fields_request}
                    }
                }
            `;
            return doGraphQLRequest(query).then(response => {
                if (response.data.errors) {
                    return Promise.reject(new Error(`GraphQL errors: ${JSON.stringify(response.data.errors)}`));
                }
                return response.data[`${component_name}`][0];
            });
        });
    }

    function getCompleteFieldsRequestForSchema(properties: OpenAPISchemaDefinition | {}, parent_property_name = null, parent_property_info = null) {
        let fields_query_part = ''
        // Convert OpenAPI properties to GraphQL fields request
        for (let [property_name, property_info] of Object.entries(properties)) {
            if (parent_property_info?.['x-itemtype'] === 'User' && property_name === 'name') {
                // fixup for known issue (name should be username) + get extra information to be able to display the user in dropdowns (first name, last name, etc)
                property_name = 'username firstname realname';
            }
            if (property_info?.type === 'object' && property_info?.properties) {
                // Nested object, recurse
                fields_query_part += property_name + ' { ' + getCompleteFieldsRequestForSchema(property_info.properties, property_name, property_info) + ' } ';
            } else if (property_info?.type === 'array' && property_info?.items?.properties) {
                // Array of objects, recurse
                fields_query_part += property_name + ' { ' + getCompleteFieldsRequestForSchema(property_info.items.properties, property_name, property_info) + ' } ';
            } else {
                // Scalar field
                fields_query_part += property_name + ' ';
            }
        }

        return fields_query_part;
    }

    /**
     * Takes an array of GLPI internal class names (itemtypes) and returns an array of valid schema component names.
     * @param itemtypes
     */
    function getValidSchemaTypesFromItemtypes(itemtypes: Array<string>): Promise<Array<string>> {
        return Promise.all(itemtypes.map(itemtype => {
            return getOpenAPISchemaNameForGLPIItemtype(itemtype).then(schema_name => {
                if (schema_name) {
                    return schema_name;
                } else {
                    console.warn(`No schema component found for itemtype ${itemtype}`);
                    return null;
                }
            });
        })).then(schema_names => {
            // Filter out null values
            return schema_names.filter(name => name !== null);
        });
    }

    return {
        getComponentSchema,
        search,
        doApiRequest,
        normalizeComponentName,
        doGraphQLRequest,
        getItemByID,
        apollo_client,
        getValidSchemaTypesFromItemtypes,
        getCompleteFieldsRequestForSchema,
    };
}