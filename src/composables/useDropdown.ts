import {useApi} from "@/composables/useApi";
import {VirtualScrollerLazyEvent} from "primevue";
import {ref, type Ref} from "vue";

const { doGraphQLRequest } = useApi();

interface DropdownFetchOptions {
    condition?: string;
    fields: string[];
    name_field: string | ((item: any) => String);
}

/**
 * A composable for managing dropdown fields in forms.
 * This composable can be used to fetch options for dropdown fields based on the OpenAPI schema of a model.
 */
export function useDropdown(
    schema_name: string,
    items: Ref<Array<Object>>,
    filter: Ref<string>,
    fetch_options = {fields: ['id', 'name'], name_field: 'name'} as DropdownFetchOptions
) {
    const ITEMS_PER_PAGE = 10;
    const loading = ref(false);

    // /**
    //  * Function to be used with the onLazyLoad event of PrimeVue Select components (virtual scroller option)
    //  */
    // function lazyLoadDropdownOptions(event: VirtualScrollerLazyEvent): void {
    //     const { first, last } = event;
    //
    //     // do not load anymore if we already have enough items
    //     if (last > 0 && items.value.length >= last!) {
    //         console.log({
    //             items: items,
    //             first: first,
    //             last: last,
    //         });
    //         loading.value = false;
    //         return;
    //     }
    //
    //     getDropdownOptions(filter, first, ITEMS_PER_PAGE).then((options) => {
    //         console.log(items.value);
    //         options.forEach((option) => {
    //             if (!items.value.some(item => item.id === option.id)) {
    //                 items.value.push(option);
    //             }
    //         });
    //         // maintain ID order
    //         items.value.sort((a: any, b: any) => a.id - b.id);
    //         loading.value = false;
    //     });
    // }

    function getDropdownOptions(filter: Ref<string>, offset = 0, limit = ITEMS_PER_PAGE): Promise<Array<{ id: number, name: string }>> {
        const main_filter = filter.value ? `name=ilike='${filter.value}'` : '';
        const complete_filter = main_filter + (fetch_options.condition ? (main_filter ? `;${fetch_options.condition}` : fetch_options.condition) : '');
        const filter_clause = complete_filter ? `, filter:"${complete_filter}"` : '';
        const start_clause = offset ? `, start: ${offset}` : '';
        const limit_clause = limit ? `, limit: ${limit}` : '';
        const params = `${start_clause}${limit_clause}${filter_clause}`.replace(/^, /, '');

        const fields_request = fetch_options.fields.join(' ');
        return doGraphQLRequest(`
            query { ${schema_name}${params ? ('(' + params + ')') : ''} { ${fields_request} } }
        `, {}).then((response) => {
            return response.data[schema_name].map((item: any) => {
                return {
                    id: item.id,
                    name: typeof fetch_options.name_field === 'function' ? fetch_options.name_field(item) : item[fetch_options.name_field],
                };
            });
        });
    }

    return {
        getDropdownOptions,
        loading,
    }
}