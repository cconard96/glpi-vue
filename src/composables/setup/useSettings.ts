import { NavigationFailure, useRouter } from "vue-router";
import { Checkbox, InputNumber, InputText, SelectButton } from "primevue";
import { useI18n } from "vue-i18n";
import { type Component, computed, defineAsyncComponent, ref } from "vue";
import { useApi } from "@/composables/useApi.ts";
import { components } from "../../../data/hlapiv2_schema";
import FieldSelect from "@/components/forms/FieldSelect.vue";
import { useFuse } from "@vueuse/integrations/useFuse";
import { getApplicationSettings } from "@/util/settings/applicationSettings.ts";
import { getItemLocksSettings } from "@/util/settings/itemLocksSettings.ts";
import { getProjectSettings } from "@/util/settings/projectSettings.ts";
import { getSearchSettings } from "@/util/settings/searchSettings.ts";
import { getSecuritySettings } from "@/util/settings/securitySettings.ts";
import { getUserPreferencesSettings } from "@/util/settings/userPreferences.ts";

interface SettingCategoryData {
    label: string;
    description: string;
    icon: string;
}

export const settingScopes = {
    'global': 'Global',
    'entity': 'Entity',
    'profile': 'Profile',
    'user': 'User',
} as const satisfies Record<string, string>;

export const settingContexts = ['core', 'inventory'] as const;

export const settingCategories = {
    'application': {
        label: 'Application',
        description: 'Application settings for your GLPI instance',
        icon: 'ti ti-adjustments'
    },
    'default_preferences': {
        label: 'Default Preferences',
        description: 'Default preferences for users, including language, theme, and notification settings',
        icon: 'ti ti-palette',
    },
    'search': {
        label: 'Search',
        description: 'Search settings',
        icon: 'ti ti-search',
    },
    'item_locks': {
        label: 'Item locks',
        description: 'Locking items when they are edited to prevent concurrent modifications',
        icon: 'ti ti-lock',
    },
    "projects": {
        label: 'Projects',
        description: 'Project management',
        icon: 'ti ti-briefcase',
    },
    "security": {
        label: 'Security',
        description: 'Password policies, 2FA and other security related settings',
        icon: 'ti ti-shield-lock',
    },
    //TODO
    "asset_definitions": {
        label: 'Asset definitions',
        description: 'Custom asset definitions',
        icon: 'ti ti-database-cog',
    },
    "notifications": {
        label: 'Notifications',
        description: 'Notifications',
        icon: 'ti ti-bell',
    },
    "webhooks": {
        label: 'Webhooks',
        description: 'Webhooks',
        icon: 'ti ti-webhook',
    },
    "slm": {
        label: 'Service levels',
        description: 'Service levels (SLA and OLA))',
        icon: 'ti ti-checkup-list',
    },
    "field_unicity": {
        label: 'Field unicity',
        description: 'Field unicity constraints',
        icon: 'ti ti-fingerprint',
    },
    "crontasks": {
        label: 'Automatic actions',
        description: 'Sutomatic actions and scheduled tasks',
        icon: 'ti ti-settings-automation',
    },
    "authentication": {
        label: 'Authentication',
        description: 'Suthentication methods and identity providers',
        icon: 'ti ti-login',
    },
    "oauth": {
        label: 'OAuth',
        description: 'OAuth clients',
        icon: 'ti ti-key',
    },
    "email_receivers": {
        label: 'Email receivers',
        description: 'Email receivers and processing',
        icon: 'ti ti-mail',
    },
    "external_links": {
        label: 'External links',
        description: 'External links and integrations',
        icon: 'ti ti-link',
    },
    "plugins": {
        label: 'Plugins',
        description: 'Plugins',
        icon: 'ti ti-puzzle',
    },
    "dictionaries": {
        label: 'Dictionaries',
        description: 'Dictionaries',
        icon: 'ti ti-vocabulary',
    },
    "rules": {
        label: 'Rules',
        description: 'Rules and business logic',
        icon: 'ti ti-book',
    },
    "inventory": {
        label: 'Inventory',
        description: 'Inventory management and discovery',
        icon: 'ti ti-cloud-download',
    },
    "forms": {
        label: 'Forms',
        description: 'Assistance forms',
        icon: 'ti ti-forms',
    }
} as const satisfies Record<string, SettingCategoryData>;

export interface Setting {
    context: string;
    scope: keyof typeof settingScopes;
    category: keyof typeof settingCategories;
    name: string;
    label: string;
    /** Extra keywords, those not already in the label or description, to help searching for this setting in the UI */
    keywords: string;
    field: {
        component: Component,
        props: Record<string, any>,
        helpText?: string,
    }
}

export function useSettings() {
    const { t: $t } = useI18n({ useScope: 'global' });
    const { doGraphQLRequest } = useApi();

    const allSettings: Array<Setting> = [
        ...getApplicationSettings($t),
        ...getSearchSettings($t),
        ...getItemLocksSettings($t),
        ...getProjectSettings($t),
        ...getSecuritySettings($t),
        ...getUserPreferencesSettings($t),
    ];
    const allSettingsForSearch = computed(() => {
        // add a 'key' property based on context, category and name to uniquely identify selections
        return allSettings.map(setting => ({
            ...setting,
            key: `${setting.context}.${setting.category}.${setting.name}`,
            field: '', //Exclude field as the AutoComplete component doesn't handle nested objects well.
        }));
    });

    const searchQuery = ref('');
    const { results } = useFuse(searchQuery, allSettingsForSearch, {
        resultLimit: 10,
        fuseOptions: {
            keys: ['name', 'label', 'keywords'],
            minMatchCharLength: 1,
            threshold: 0.5,
        }
    });

    function getSettingRoute(setting: typeof allSettings[number]) {
        const context = setting.context;
        const scope = setting.scope;
        const category = setting.category;

        return `/setup/settings/${context}/${scope}/${category}`;
    }

    function gotoSetting(setting: typeof allSettings[number]): Promise<void | NavigationFailure> {
        const router = useRouter();
        const route = getSettingRoute(setting);
        return router.push(route);
    }

    function getSettingDefinitions(context?: string, scope?: string, category?: string) {
        console.log({
            context,
            scope,
            category,
        });
        return allSettings.filter(setting => {
            if (context && setting.context !== context) {
                return false;
            }
            if (scope && setting.scope !== scope) {
                return false;
            }
            return !(category && setting.category !== category);
        });
    }

    function getSettingValues(context: string, scope?: string, category?: string) {
        let names = null;
        if (scope || category) {
            const filteredSettings = getSettingDefinitions(context, scope, category);
            names = filteredSettings.map(setting => setting.name);
        }
        const nameFilter = names ? `;name=in=(${names.join(',')})` : '';

        return doGraphQLRequest<{
            Config: Array<components['schemas']['Config']>
        }>(`
            query  {
                Config(filter: "context==${context}${nameFilter}") {
                    name value
                }
            }
        `).then(response => {
            const config = response.data.Config;
            const values: Record<string, string> = {};
            config.forEach((item: { name: string; value: string }) => {
                values[item.name] = item.value;
            });
            return values;
        });
    }

    const filteredSettings = computed(() => {
        return results.value.map(result => result.item);
    });

    return {
        getSettingRoute,
        getSettingDefinitions,
        getSettingValues,
        searchQuery,
        filteredSettings,
    }
}