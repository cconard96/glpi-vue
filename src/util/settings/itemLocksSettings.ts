import type { ComposerTranslation } from "vue-i18n";
import { Checkbox } from "primevue";
import { Setting } from "@/composables/setup/useSettings.ts";
import FieldSelect from "@/components/forms/FieldSelect.vue";

export function getItemLocksSettings($t: ComposerTranslation): Array<Setting> {
    return [
        {
            context: 'core',
            scope: 'global',
            category: 'item_locks',
            name: 'lock_use_lock_item',
            label: $t('settings.core.lock_use_lock_item.label', 'Use locks'),
            keywords: $t('settings.core.lock_use_lock_item.keywords', ''),
            field: {
                component: Checkbox,
                props: { binary: true, trueValue: '1', falseValue: '0' },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'item_locks',
            name: 'lock_lockprofile_id',
            label: $t('settings.core.lock_lockprofile_id.label', 'Profile to be used when viewing a locked item'),
            keywords: $t('settings.core.lock_lockprofile_id.keywords', ''),
            field: {
                component: FieldSelect,
                props: { type: 'Profile', showClear: false },
            },
        },
    ];
}