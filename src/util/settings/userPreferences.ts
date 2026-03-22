import type { ComposerTranslation } from "vue-i18n";
import { Checkbox } from "primevue";
import { Setting } from "@/composables/setup/useSettings.ts";
import FieldSelect from "@/components/forms/FieldSelect.vue";

export function getUserPreferencesSettings($t: ComposerTranslation): Array<Setting> {
    return [];
}