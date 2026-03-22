import type { ComposerTranslation } from "vue-i18n";
import { Checkbox } from "primevue";
import { Setting } from "@/composables/setup/useSettings.ts";
import FieldSelect from "@/components/forms/FieldSelect.vue";

export function getProjectSettings($t: ComposerTranslation): Array<Setting> {
    return [
        {
            context: 'core',
            scope: 'global',
            category: 'projects',
            name: 'projecttask_unstarted_states_id',
            label: $t('settings.core.projecttask_unstarted_states_id.label', 'Status of unstarted tasks'),
            keywords: $t('settings.core.projecttask_unstarted_states_id.keywords', ''),
            field: {
                component: FieldSelect,
                props: { type: 'ProjectState', showClear: false },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'projects',
            name: 'projecttask_inprogress_states_id',
            label: $t('settings.core.projecttask_inprogress_states_id.label', 'Status of tasks in progress'),
            keywords: $t('settings.core.projecttask_inprogress_states_id.keywords', ''),
            field: {
                component: FieldSelect,
                props: { type: 'ProjectState', showClear: false },
            },
        },
        {
            context: 'core',
            scope: 'global',
            category: 'projects',
            name: 'projecttask_completed_states_id',
            label: $t('settings.core.projecttask_completed_states_id.label', 'Status of completed tasks'),
            keywords: $t('settings.core.projecttask_completed_states_id.keywords', ''),
            field: {
                component: FieldSelect,
                props: { type: 'ProjectState', showClear: false },
            },
        },
    ];
}