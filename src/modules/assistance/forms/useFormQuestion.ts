import { defineAsyncComponent } from "vue";
import { TreeNode } from "@cjdevstudios/bumblevue/treenode";
import { useI18n } from "vue-i18n";

export const questionTypeComponentMap = {
    'Glpi\\Form\\QuestionType\\QuestionTypeRequestType': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionRequestType.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeFile': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionFile.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeItem': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionItem.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeNumber': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionNumber.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeRequester': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionRequester.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeEmail': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionEmail.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeUserDevice': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionUserDevice.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeDropdown': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionDropdown.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeShortText': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionShortText.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeObserver': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionObserver.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeLongText': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionLongText.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeItemDropdown': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionItemDropdown.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeCheckbox': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionCheckbox.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeDateTime': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionDateTime.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeUrgency': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionUrgency.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeRadio': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionRadio.vue')),
    'Glpi\\Form\\QuestionType\\QuestionTypeAssignee': defineAsyncComponent(() => import('@/modules/assistance/forms/questions/QuestionAssignee.vue')),
}

export function getItemQuestionOptions(): TreeNode[] {
    const { t: $t } = useI18n();
    return [
        { key: 'category_glpi_objects', label: $t('form.questions.item.category.glpi_objects', 'GLPI Objects') },
    ];
}

export default function useFormQuestion() {

}