import { defineStore } from 'pinia'
import { useApi } from "@/common/api/useApi";
import {components} from "../../data/hlapiv2_schema";
import { GLPIItem, GLPIItemType } from "@/common/useBaseItem.ts";

// oxlint-disable-next-line no-unused-vars
interface EntityTreeNode {
    key: number,
    label: string,
    children: EntityTreeNode[],
    expanded: boolean,
    selected: boolean,
}

export const useSessionStore = defineStore('session', {
    state: () => ({
        /** @type {string|null} */
        current_time: null,
        /** @type {number|null} */
        user_id: null,
        /** @type {number} */
        use_mode: 0,
        /** @type {string|null} */
        friendly_name: null,
        /** @type {string|null} */
        name: null,
        /** @type {string|null} */
        real_name: null,
        /** @type {string|null} */
        first_name: null,
        /** @type {integer|null} */
        default_entity: null,
        /** @type {Record<number, {name: string, entities: {id: number, is_recursive: 0 | 1, name: string}[]}>} */
        profiles: {},
        /** @type {number[]} */
        active_entities: [],
        /** @type {id: number, name: string, interface: string} */
        active_profile: null,
        /** @type {id: number, short_name: string, complete_name: string, recursive: number} */
        active_entity: null,
        /** @type {number[]} */
        groups: [],
        /** @type {EntityTreeNode[]} */
        entityTreeData: null,
        /** @type {Map<number, number[]>} Cache of known parent entities. This cache is only populated as needed and should not be relied on outside this Pinia store. */
        entityParentMapCache: new Map(),
        /** @type {Map<number, number[]>} Cache of known child entities. This cache is only populated as needed and should not be relied on outside this Pinia store. */
        entityChildMapCache: new Map(),
    }),
    actions: {
        loadSession(sessionData: components['schemas']['Session']) {
            this.current_time = sessionData.current_time || null;
            this.user_id = sessionData.user_id || null;
            this.use_mode = sessionData.use_mode || 0;
            this.friendly_name = sessionData.friendly_name || null;
            this.name = sessionData.name || null;
            this.real_name = sessionData.real_name || null;
            this.first_name = sessionData.first_name || null;
            this.default_entity = sessionData.default_entity || null;
            this.profiles = sessionData.profiles || [];
            this.active_entities = sessionData.active_entities || [];
            this.active_profile = sessionData.active_profile || null;
            this.active_entity = sessionData.active_entity || null;
            this.groups = sessionData.groups || [];
            this.entityParentMapCache = new Map();
            this.entityChildMapCache = new Map();

            const { apollo_client } = useApi();
            apollo_client.resetStore();
        },
        loadEntityTreeData(treeData) {
            this.entityTreeData = treeData;
        },
        clearSession() {
            this.current_time = null;
            this.user_id = null;
            this.use_mode = 0;
            this.friendly_name = null;
            this.name = null;
            this.real_name = null;
            this.first_name = null;
            this.default_entity = null;
            this.profiles = [];
            this.active_entities = [];
            this.active_profile = null;
            this.active_entity = null;
            this.groups = [];
            this.entityParentMapCache = new Map();
            this.entityChildMapCache = new Map();

            const { apollo_client } = useApi();
            apollo_client.resetStore();
        },
        changeEntity(newEntity) {
            this.active_entity = newEntity;
            const { apollo_client } = useApi();
            apollo_client.resetStore();
        },
        changeProfile(newProfile) {
            this.active_profile = newProfile;
            const { apollo_client } = useApi();
            apollo_client.resetStore();
        },
        setDebugMode(isDebug) {
            this.use_mode = isDebug ? 2 : 1;
        },
        getValidProfilesForEntity(entityId: number) {
            // for a profile to be valid, it must be directly assigned to the entity or, to a parent of the entity AND recursive.
            // entity parent info can be gathered from the entity tree data
            // the entities applicable for profiles are found in `profiles[].entities` in the session data.
            const validProfiles = [];
            for (const [profile_id, profile] of Object.entries(this.profiles)) {
                const applicableEntities = Object.values(profile.entities).map(e => e.id);
                if (applicableEntities.includes(entityId)) {
                    validProfiles.push({
                        ...profile,
                        id: parseInt(profile_id)
                    });
                    continue;
                }
                const parentEntities = this.getParentEntities(entityId);

                // check if profile assigned to a parent of the entity AND recursive.
                if (parentEntities.some(parentId => applicableEntities.includes(parentId) && profile.entities[parentId].is_recursive)) {
                    validProfiles.push({
                        ...profile,
                        id: parseInt(profile_id)
                    });
                    continue;
                }

                // if (parentEntities.some(parentId => applicableEntities.includes(parentId))) {
                //     validProfiles.push(profile);
                //     continue;
                // }
            }
            return validProfiles;
        }
    },
    getters: {
        getServerTime: (state) => {
            return state.current_time ? new Date(state.current_time) : null;
        },
        getUserID: (state) => state.user_id,
        isDebugMode: (state) => state.use_mode === 2,
        getFriendlyName: (state) => state.friendly_name,
        getName: (state) => state.name,
        getRealName: (state) => state.real_name,
        getFirstName: (state) => state.first_name,
        getDefaultEntity: (state) => state.default_entity,
        getProfiles: (state) => state.profiles,
        getGroups: (state) => state.groups,
        getActiveEntities: (state) => state.active_entities,
        getActiveProfile: (state) => state.active_profile,
        getActiveEntity: (state) => state.active_entity,
        getEntityTreeData: (state) => state.entityTreeData,
        hasRight: (state) => {
            return (module: string, right: number) => {
                const module_rights = state.active_profile?.rights?.[module] || 0;
                return (module_rights & right) === right;
            }
        },
        hasAnyRight: (state) => {
            return (module: string, rights: number[]) => {
                const module_rights = state.active_profile?.rights?.[module] || 0;
                return rights.some(right => (module_rights & right) === right);
            };
        },
        hasAllRights: (state) => {
            return (module: string, rights: number[]) => {
                const module_rights = state.active_profile?.rights?.[module] || 0;
                return rights.every(right => (module_rights & right) === right);
            };
        },
        getParentEntities(state) {
            return (entityId: number) => {
                if (state.entityParentMapCache.has(entityId)) {
                    return state.entityParentMapCache.get(entityId);
                }
                // traverse the entity tree data to find all parent entities of the given entity id
                const parents = [];

                function traverse(nodes, parentId = null) {
                    for (const node of nodes) {
                        if (node.key === entityId) {
                            if (parentId !== null) {
                                parents.push(parentId);
                            }
                            return true; // stop traversal once the entity is found
                        }
                        if (traverse(node.children, node.key)) {
                            if (parentId !== null) {
                                parents.push(parentId);
                            }
                            return true;
                        }
                    }
                    return false;
                }

                if (state.entityTreeData) {
                    traverse(state.entityTreeData);
                }

                state.entityParentMapCache.set(entityId, parents);
                return parents;
            }
        },
        getChildEntities(state) {
            return (entityId: number) => {
                if (state.entityChildMapCache.has(entityId)) {
                    return state.entityChildMapCache.get(entityId);
                }
                // traverse the entity tree data to find all child entities of the given entity id
                const children = [];

                function traverse(nodes) {
                    for (const node of nodes) {
                        if (node.key === entityId) {
                            collectChildren(node);
                            return true; // stop traversal once the entity is found
                        }
                        if (traverse(node.children)) {
                            return true;
                        }
                    }
                    return false;
                }

                function collectChildren(node) {
                    for (const child of node.children) {
                        children.push(child.key);
                        collectChildren(child);
                    }
                }

                if (state.entityTreeData) {
                    traverse(state.entityTreeData);
                }

                state.entityChildMapCache.set(entityId, children);
                return children;
            }
        },
        hasAccessToEntity: (state) => {
            return function(entityId: number, is_recursive = false) {
                // If the root entity is active and recursive, then all entities are accessible
                if (state.active_entity.id === 0 && state.active_entity.recursive) {
                    return true;
                }
                if (state.active_entities.includes(entityId)) {
                    return true;
                }
                if (!is_recursive) {
                    return false;
                }
                // Check if the user has access to any of the child entities in case the user is connected to a parent of the entity
                const childEntities = state.entityChildMapCache.get(entityId) || this.getChildEntities(entityId);
                return state.active_entities.some(activeEntityId => childEntities.includes(activeEntityId));
            }
        },
        /** Check if the user can currently see the entity a given item belongs to */
        hasEntityAccessForItem: (state) => {
            const _hasEntityAccessForItem: {
                (item: GLPIItem<GLPIItemType>): boolean,
                (itemtype: string, items_id: number): boolean,
            } = (itemOrItemtype: GLPIItem<GLPIItemType> | string, items_id?: number) => {
                if (typeof itemOrItemtype === 'string') {
                    //TODO load the item from the API to get its entity and recursive properties
                    //note that 'itemtype' is the class name on the GLPI server side, not the API schema name so we need to implement
                    //a mapping between itemtypes (which can be found in the OpenAPI schema) and the schema names.
                }
                const item = itemOrItemtype as GLPIItem<GLPIItemType>;
                // Item is global (not linked to any entity), so it's accessible
                //TODO check schema, not provided data to tell if the item is global or not.
                if (!('entity' in item)) {
                    return true;
                }
                // If the root entity is active and recursive, then all entities are accessible
                if (state.active_entity.id === 0 && state.active_entity.recursive) {
                    return true;
                }

                const itemEntityID = item.entity;
                if (state.active_entities.includes(itemEntityID)) {
                    return true;
                }

                if (!('is_recursive' in item) || !item.is_recursive) {
                    return false;
                }
                // Check if the user has access to any of the child entities of the item's entity in case the user is connected to a child of the item's entity
                const childEntities = state.entityChildMapCache.get(itemEntityID) || this.getChildEntities(itemEntityID);
                return state.active_entities.some(activeEntityId => childEntities.includes(activeEntityId));
            }
            return _hasEntityAccessForItem;
        }
    },
    persist: true,
});

// declare ts constants for rights
export const BaseRights = {
    READ: 1,
    UPDATE: 2,
    CREATE: 4,
    DELETE: 8,
    PURGE: 16,
}

export const ITILSubItemRights = {
    SEEPUBLIC: 1,
    UPDATEMY: 2,
    ADDMY: 4,
    DELETE: 8,
    PURGE: 16,
    UPDATEALL: 1024,
    ADD_AS_GROUP: 2048,
    ADDALLITEM: 4096,
    SEEPRIVATE: 8192,
    ADD_AS_OBSERVER: 16384,
    ADD_AS_TECHNICIAN: 32768,
    SEEPRIVATEGROUPS: 65536,
}

export const TicketApprovalRights = {
    /** Can create approval requests for "Request" type of tickets */
    CREATEREQUEST: 1024,
    /** Can create approval requests for "Incident" type of tickets */
    CREATEINCIDENT: 2048,
    /** Can validate approval requests for "Request" type of tickets */
    VALIDATEREQUEST: 4096,
    /** Can validate approval requests for "Incident" type of tickets */
    VALIDATEINCIDENT: 8192,
}

export const ChangeApprovalRights = {
    VALIDATE: 1024,
}

export const BaseAssistanceRights = {
    READMY: 1,
    UPDATE: 2,
    CREATE: 4,
    DELETE: 8,
    PURGE: 16,
    READALL: 1024,
    SURVEY: 131072,
}

export const TicketRights = {
    ...BaseAssistanceRights,
    READGROUP: 2048,
    READASSIGN: 4096,
    ASSIGN: 8192,
    STEAL: 16384,
    OWN: 32768,
    CHANGEPRIORITY: 65536,
    READNEWTICKET: 262144,
}