import type { ComposerTranslation } from "vue-i18n";
import { Checkbox, InputNumber, SelectButton } from "primevue";
import { Setting } from "@/composables/setup/useSettings.ts";
import FieldSelect from "@/components/forms/FieldSelect.vue";

export function getSearchSettings($t: ComposerTranslation): Array<Setting> {
    return [
        {
            context: 'core',
            scope: 'global',
            category: 'search',
            name: 'allow_search_view',
            label: $t('settings.core.allow_search_view.label', 'Items seen'),
            keywords: $t('settings.core.allow_search_view.keywords', ''),
            field: {
                component: SelectButton,
                props: {
                    options: [
                        {label: 'No', value: '0'},
                        {label: 'Yes (last criteria)', value: '1'},
                        {label: 'Yes (default criteria)', value: '2'},
                    ],
                    optionLabel: 'label',
                    optionValue: 'value'
                },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'search',
            name: 'allow_search_global',
            label: $t('settings.core.allow_search_global.label', 'Global search'),
            keywords: $t('settings.core.allow_search_global.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'search',
            name: 'allow_search_all',
            label: $t('settings.core.allow_search_all.label', 'Allow searching across all columns, even those not shown'),
            keywords: $t('settings.core.allow_search_all.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'search',
            name: 'list_limit_max',
            label: $t('settings.core.list_limit_max.label', 'Default search results per page limit'),
            keywords: $t('settings.core.list_limit_max.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 5, max: 200 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'search',
            name: 'cut',
            label: $t('settings.core.cut.label', 'Default character limit for summary text'),
            keywords: $t('settings.core.cut.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 50, step: 50 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'search',
            name: 'url_maxlength',
            label: $t('settings.core.url_maxlength.label', 'Default URL length limit'),
            keywords: $t('settings.core.url_maxlength.keywords', ''),
            field: {
                component: InputNumber,
                props: { step: 5, max: 80 },
            },
        },
    ];
}