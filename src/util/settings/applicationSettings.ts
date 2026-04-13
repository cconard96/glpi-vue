import type { ComposerTranslation } from "vue-i18n";
import { Checkbox, InputNumber, InputText } from "primevue";
import { defineAsyncComponent } from "vue";
import { Setting } from "@/composables/setup/useSettings.ts";

export function getApplicationSettings($t: ComposerTranslation): Array<Setting> {
    return [
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'url_base',
            label: $t('settings.core.url_base.label', 'URL of the application'),
            keywords: $t('settings.core.url_base.keywords', ''),
            field: {
                component: InputText,
                props: { type: 'url' }
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'text_login',
            label: $t('settings.core.text_login.label', 'Text on login page'),
            keywords: $t('settings.core.text_login.keywords', ''),
            field: {
                component: defineAsyncComponent(() => import('@/components/forms/RichTextEditor.vue')),
                props: { enable_file_upload: false }
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'helpdesk_doc_url',
            label: $t('settings.core.helpdesk_doc_url.label', 'Simplified interface help link'),
            keywords: $t('settings.core.helpdesk_doc_url.url_base.keywords', ''),
            field: {
                component: InputText,
                props: { type: 'url' }
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'central_doc_url',
            label: $t('settings.core.central_doc_url.label', 'Standard interface help link'),
            keywords: $t('settings.core.central_doc_url.keywords', ''),
            field: {
                component: InputText,
                props: { type: 'url' }
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'decimal_number',
            label: $t('settings.core.decimal_number.label', 'Default decimals limit'),
            keywords: $t('settings.core.decimal_number.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 0 }
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'use_public_faq',
            label: $t('settings.core.use_public_faq.label', 'Allow anonymous FAQ access'),
            keywords: $t('settings.core.use_public_faq.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' }
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'allow_unauthenticated_uploads',
            label: $t('settings.core.allow_unauthenticated_uploads.label', 'Allow unauthenticated uploads'),
            keywords: $t('settings.core.allow_unauthenticated_uploads.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' }
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'document_max_size',
            label: $t('settings.core.document_max_size.label', 'Maximum upload size (Mio)'),
            keywords: $t('settings.core.document_max_size.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 1 },
                helpText: $t('settings.core.document_max_size.helpText', 'The maximum upload size is primarily determined by the "upload_max_filesize" and "post_max_size" PHP settings. This setting is to further restrict the uploads for just GLPI.')
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'dropdown_max',
            label: $t('settings.core.dropdown_max.label', 'Page size for dropdowns'),
            keywords: $t('settings.core.dropdown_max.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 1, max: 200 },
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'application',
            name: 'ajax_limit_count',
            label: $t('settings.core.ajax_limit_count.label', 'Number of options needed to show search in dropdowns'),
            keywords: $t('settings.core.ajax_limit_count.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 1, max: 200 },
            }
        },
    ];
}