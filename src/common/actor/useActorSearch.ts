import { ref, type Ref } from 'vue';
import { useDebounceFn } from '@vueuse/core';
import { useApi } from '@/common/api/useApi';

export type ActorType = 'User' | 'Group' | 'Supplier';
export type ActorRole = 'requesters' | 'observers' | 'assigned';

export interface ActorMember {
    id: number;
    type?: ActorType;
    username?: string;
    realname?: string;
    firstname?: string;
    name?: string;
    [key: string]: unknown;
}

export interface ActorOption {
    /** Unique key in the `<Itemtype>-<id>` format, e.g. `User-5` */
    key: string;
    type: ActorType;
    member: ActorMember;
}

/** Actor itemtypes that may be used for each role */
export const ALLOWED_ACTOR_TYPES: Record<ActorRole, ActorType[]> = {
    requesters: ['User', 'Group'],
    observers: ['User', 'Group'],
    assigned: ['User', 'Group', 'Supplier'],
};

/**
 * Base RSQL filters per role and actor type.
 * Groups are restricted by their requester/observer/assigned flags.
 * TODO Users are not restricted by right (GLPI uses the `all` right for requesters/observers and `own_ticket` for assigned users)
 * and actors are not restricted by the entity of the item. This requires a dedicated API endpoint.
 */
const RSQL_FILTERS: Record<ActorRole, Partial<Record<ActorType, string>>> = {
    requesters: {
        User: 'is_deleted==0;is_active==1',
        Group: 'maybe_requester==1',
    },
    observers: {
        User: 'is_deleted==0;is_active==1',
        Group: 'maybe_observer==1',
    },
    assigned: {
        User: 'is_deleted==0;is_active==1',
        Group: 'maybe_assigned==1',
        Supplier: 'is_deleted==0;is_active==1',
    },
};

const SEARCH_FIELDS: Record<ActorType, string[]> = {
    User: ['username', 'realname', 'firstname'],
    Group: ['name'],
    Supplier: ['name'],
};

const REQUESTED_FIELDS: Record<ActorType, string> = {
    User: 'id username realname firstname',
    Group: 'id name',
    Supplier: 'id name',
};

export function getActorKey(type: ActorType, id: number | string): string {
    return `${type}-${id}`;
}

export function parseActorKey(key: string): { type: ActorType, id: number } | null {
    const match = key.match(/^(User|Group|Supplier)-(\d+)$/);
    return match ? { type: match[1] as ActorType, id: Number(match[2]) } : null;
}

/**
 * Build the RSQL filter used to search actors of a given type for a role
 */
export function getActorSearchFilter(role: ActorRole, type: ActorType, search: string): string {
    const filters: string[] = [];
    const base = RSQL_FILTERS[role][type];
    if (base) {
        filters.push(base);
    }
    if (search !== '') {
        const { rsqlEscape } = useApi();
        const value = `*${rsqlEscape(search)}*`;
        filters.push(`(${SEARCH_FIELDS[type].map((field) => `${field}=ilike=${value}`).join(',')})`);
    }
    return filters.join(';');
}

/**
 * Search actors (users, groups and suppliers) that may be used for a role
 * @param role The actor role, used to restrict the results
 * @param initialOptions Options that are known initially (usually the currently selected actors)
 */
export function useActorSearch(role: ActorRole, initialOptions: ActorOption[] = []) {
    const { doGraphQLRequest } = useApi();
    const options: Ref<ActorOption[]> = ref(initialOptions);
    const loading = ref(false);
    let last_request = 0;

    async function searchNow(types: ActorType[], search: string, selected_keys: string[] = [], limit = 100) {
        const request = ++last_request;
        const { graphQLStringEscape } = useApi();
        loading.value = true;
        try {
            const results = await Promise.all(types.filter((type) => ALLOWED_ACTOR_TYPES[role].includes(type)).map(async (type) => {
                const filter = graphQLStringEscape(getActorSearchFilter(role, type, search));
                const response = await doGraphQLRequest(`
                    query {
                        ${type}(filter: "${filter}", limit: ${Number(limit)}) { ${REQUESTED_FIELDS[type]} }
                    }
                `);
                return ((response?.data?.[type] ?? []) as ActorMember[])
                    .map((member) => ({ key: getActorKey(type, member.id), type, member: { ...member, type } }));
            }));
            if (request !== last_request) {
                // A newer search was started
                return;
            }
            const new_options: ActorOption[] = results.flat();
            // Keep the selected options that may have been filtered out by the search
            for (const key of selected_keys) {
                if (!new_options.some((option) => option.key === key)) {
                    const previous = options.value.find((option) => option.key === key);
                    if (previous) {
                        new_options.push(previous);
                    }
                }
            }
            options.value = new_options;
        } finally {
            if (request === last_request) {
                loading.value = false;
            }
        }
    }

    const search = useDebounceFn(searchNow, 250, { maxWait: 500 });

    /**
     * Load the members of the given keys (e.g. default values) so they can be displayed with their names
     */
    async function loadKeys(keys: string[]) {
        const by_type = new Map<ActorType, number[]>();
        for (const key of keys) {
            const parsed = parseActorKey(key);
            if (parsed && !options.value.some((option) => option.key === key)) {
                by_type.set(parsed.type, [...(by_type.get(parsed.type) ?? []), parsed.id]);
            }
        }
        const results = await Promise.all([...by_type.entries()].map(async ([type, ids]) => {
            const response = await doGraphQLRequest(`
                query {
                    ${type}(filter: "${ids.map((id) => `id==${id}`).join(',')}") { ${REQUESTED_FIELDS[type]} }
                }
            `);
            return ((response?.data?.[type] ?? []) as ActorMember[])
                .map((member) => ({ key: getActorKey(type, member.id), type, member: { ...member, type } }));
        }));
        const loaded = results.flat().filter((option) => !options.value.some((existing) => existing.key === option.key));
        options.value = [...options.value, ...loaded];
    }

    return { options, loading, search, searchNow, loadKeys };
}
