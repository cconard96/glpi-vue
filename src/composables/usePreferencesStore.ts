import {defineStore} from "pinia";

export const usePreferencesStore = defineStore('preferences', {
    state: () => ({
        preferences: {}
    }),
    actions: {
        loadPreferences(preferencesData) {
            this.preferences = preferencesData || {};
        }
    }
});