import {defineStore} from "pinia";
import { components } from "../../data/hlapiv2_schema";

export const usePreferencesStore = defineStore('preferences', {
    state: (): {
        preferences: components['schemas']['UserPreferences']
    } => ({
        preferences: {}
    }),
    actions: {
        loadPreferences(preferencesData) {
            this.preferences = preferencesData || {};
        }
    }
});