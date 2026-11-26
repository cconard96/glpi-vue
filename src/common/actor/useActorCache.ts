import { reactive } from "vue";
import { useApi } from "@/common/api/useApi";
import type { ActorInfo } from "@/common/actor/ActorInfoCard.vue";

export type CachedActorType = 'User' | 'Group' | 'Supplier' | 'Contact';

const ACTOR_FIELDS: Record<CachedActorType, string> = {
    User: 'id username realname firstname title { name } category { name } phone phone2 mobile emails { email is_default } picture',
    Group: 'id name',
    Supplier: 'id name',
    Contact: 'id name',
};

/** Shared cache of actor data keyed by `${type}-${id}` */
const actors = reactive(new Map<string, ActorInfo>());
/** Keys which are loading or have been loaded (even if not found) to avoid repeated requests */
const requested = new Set<string>();

function cacheKey(type: string, id: number) {
    return `${type}-${id}`;
}

/** Convert the GraphQL data into the flat {@link ActorInfo} format */
function normalizeActor(type: CachedActorType, data: Record<string, any>): ActorInfo {
    if (type !== 'User') {
        return { id: data.id, name: data.name };
    }
    const emails: Array<{ email: string; is_default: boolean }> = data.emails ?? [];
    return {
        id: data.id,
        username: data.username,
        realname: data.realname,
        firstname: data.firstname,
        title: data.title?.name ?? '',
        category: data.category?.name ?? '',
        phone: data.phone,
        phone2: data.phone2,
        mobile: data.mobile,
        email: (emails.find(e => e.is_default) ?? emails[0])?.email ?? '',
        picture: data.picture,
    };
}

export function clearActorCache() {
    actors.clear();
    requested.clear();
}

/**
 * Batch loading and lookup of actor (User/Group/Supplier/Contact) data for display purposes.
 */
export function useActorCache() {
    const { doGraphQLRequest } = useApi();

    /**
     * Load all actors not already loaded/requested.
     */
    async function loadActors(refs: Array<{ itemtype: string; items_id: number }>): Promise<void> {
        const ids_by_type = new Map<CachedActorType, Set<number>>();
        for (const ref of refs) {
            if (!(ref.itemtype in ACTOR_FIELDS)) {
                continue;
            }
            const id = Number(ref.items_id);
            const key = cacheKey(ref.itemtype, id);
            if (!Number.isInteger(id) || requested.has(key)) {
                continue;
            }
            requested.add(key);
            const type = ref.itemtype as CachedActorType;
            if (!ids_by_type.has(type)) {
                ids_by_type.set(type, new Set());
            }
            ids_by_type.get(type)!.add(id);
        }
        if (ids_by_type.size === 0) {
            return;
        }

        const query_parts = [...ids_by_type.entries()].map(([type, ids]) => {
            return `${type}(filter: "id=in=(${[...ids].join(',')})", limit: ${ids.size}) { ${ACTOR_FIELDS[type]} }`;
        });
        try {
            const response = await doGraphQLRequest<Partial<Record<CachedActorType, ActorInfo[]>>>(
                `query { ${query_parts.join('\n')} }`, {}, 'cache-first'
            );
            for (const type of ids_by_type.keys()) {
                for (const actor of response.data?.[type] ?? []) {
                    actors.set(cacheKey(type, actor.id), normalizeActor(type, actor as Record<string, any>));
                }
            }
        } catch (e) {
            // Allow a later retry
            for (const [type, ids] of ids_by_type) {
                ids.forEach(id => requested.delete(cacheKey(type, id)));
            }
            console.error('Failed to load actors', e);
        }
    }

    function getActor(itemtype: string, items_id: number): ActorInfo | undefined {
        return actors.get(cacheKey(itemtype, Number(items_id)));
    }

    /** Get a display name for an actor. Falls back to a placeholder if the actor is not loaded. */
    function getActorName(itemtype: string, items_id: number, fallback = ''): string {
        const actor = getActor(itemtype, items_id);
        if (!actor) {
            return fallback;
        }
        if (itemtype === 'User') {
            const full = [actor.firstname, actor.realname].filter(Boolean).join(' ');
            return full || actor.username || actor.name || fallback;
        }
        return actor.name || fallback;
    }

    return {
        loadActors,
        getActor,
        getActorName,
    };
}
