import { defineStore } from 'pinia'

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
        /** @type {number[]} */
        profiles: [],
        /** @type {number[]} */
        active_entities: [],
        /** @type {id: number, name: string, interface: string} */
        active_profile: null,
        /** @type {id: number, short_name: string, complete_name: string, recursive: number} */
        active_entity: null,
    }),
    actions: {
        loadSession(sessionData) {
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
        getActiveEntities: (state) => state.active_entities,
        getActiveProfile: (state) => state.active_profile,
        getActiveEntity: (state) => state.active_entity,
    },
    persist: true,
});