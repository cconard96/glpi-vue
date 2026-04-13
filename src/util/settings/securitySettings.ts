import type { ComposerTranslation } from "vue-i18n";
import { Checkbox, InputNumber, InputText, SelectButton } from "primevue";
import { Setting } from "@/composables/setup/useSettings.ts";
import FieldSelect from "@/components/forms/FieldSelect.vue";

const rememberMeDurations = [
    {label: 'Disabled', value: 0},
    {label: '1 hour', value: 3600},
    {label: '1 hours', value: 3600 * 2},
    {label: '6 hours', value: 3600 * 6},
    {label: '12 hours', value: 3600 * 12},
];
for (let i = 1; i < 60; i++) {
    rememberMeDurations.push({label: `${i} days`, value: 3600 * 24 * i});
}

export function getSecuritySettings($t: ComposerTranslation): Array<Setting> {
    return [
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'login_remember_time',
            label: $t('settings.core.login_remember_time.label', 'Time to allow auto login (remember me)'),
            keywords: $t('settings.core.login_remember_time.keywords', ''),
            field: {
                component: FieldSelect,
                props: {options: rememberMeDurations, optionLabel: 'label', optionValue: 'value'},
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'login_remember_default',
            label: $t('settings.core.login_remember_default.label', 'Default remember me option'),
            keywords: $t('settings.core.login_remember_default.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'display_login_source',
            label: $t('settings.core.display_login_source.label', 'Display login source'),
            keywords: $t('settings.core.display_login_source.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'use_password_security',
            label: $t('settings.core.use_password_security.label', 'Force passwords to comply with security policy'),
            keywords: $t('settings.core.use_password_security.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_min_length',
            label: $t('settings.core.password_min_length.label', 'Minimum length for passwords'),
            keywords: $t('settings.core.password_min_length.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 4 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_need_number',
            label: $t('settings.core.password_need_number.label', 'Require passwords to contain a number'),
            keywords: $t('settings.core.password_need_number.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_need_letter',
            label: $t('settings.core.password_need_letter.label', 'Require passwords to contain a lowercase letter'),
            keywords: $t('settings.core.password_need_letter.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_need_caps',
            label: $t('settings.core.password_need_caps.label', 'Require passwords to contain an uppercase letter'),
            keywords: $t('settings.core.password_need_caps.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            }
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_need_symbol',
            label: $t('settings.core.password_need_symbol.label', 'Require passwords to contain a symbol'),
            keywords: $t('settings.core.password_need_symbol.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_expiration_delay',
            label: $t('settings.core.password_expiration_delay.label', 'Password expiration delay in days (-1 to disable)'),
            keywords: $t('settings.core.password_expiration_delay.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 15, max: 365, step: 5 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_expiration_notice',
            label: $t('settings.core.password_expiration_notice.label', 'Password expiration notice time in days (-1 to disable)'),
            keywords: $t('settings.core.password_expiration_notice.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 0, max: 30 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_expiration_lock_delay',
            label: $t('settings.core.password_expiration_lock_delay.label', 'Delay before account deactivation in days after password expiration (-1 to disable)'),
            keywords: $t('settings.core.password_expiration_lock_delay.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 0, max: 30 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'password_init_token_delay',
            label: $t('settings.core.password_init_token_delay.label', 'Validity period of the password initialization token'),
            keywords: $t('settings.core.password_init_token_delay.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 86400, max: 30 * 86400, step: 86400 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: 'non_reusable_passwords_count',
            label: $t('settings.core.non_reusable_passwords_count.label', 'Number of non-reusable previous passwords'),
            keywords: $t('settings.core.non_reusable_passwords_count.keywords', ''),
            field: {
                component: InputNumber,
                props: { min: 0, max: 5 },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: '2fa_suffix',
            label: $t('settings.core.2fa_suffix.label', '2FA Suffix'),
            keywords: $t('settings.core.2fa_suffix.keywords', ''),
            field: {
                component: InputText,
                props: { type: 'text' },
                helpText: 'This will be added in the issuer name for authenticator app.'
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'security',
            name: '2fa_enforced',
            label: $t('settings.core.2fa_enforced.label', 'Enforce 2FA'),
            keywords: $t('settings.core.2fa_enforced.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
    ];
}