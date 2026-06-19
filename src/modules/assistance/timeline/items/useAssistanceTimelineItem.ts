import { components } from "../../../../../data/hlapiv2_schema";
import { useConfirm, useToast } from "primevue";
import { useApi } from "@/common/api/useApi";
import type { useAssistanceItem } from "@/modules/assistance/timeline/useAssistanceItem";
import { computed, defineAsyncComponent, inject, ref, Ref } from "vue";
import { useI18n } from "vue-i18n";

export type AssistanceTimelineItemtype = 'content'|'Followup'|'Task'|'Solution'|'Document'|'Cost'|'Validation'|'ValidationAnswer';
interface ContentItem {
    name: string;
    content: string;
    user: {
        id: number;
        name: string;
    },
    user_editor: {
        id: number;
        name: string;
    },
    date_creation: string|Date;
}
type AssistanceTimelineItem =
    components['schemas']['Followup'] | components['schemas']['TicketTask'] | components['schemas']['ChangeTask']
    | components['schemas']['ProblemTask'] | components['schemas']['Solution'] | components['schemas']['Document']
    | components['schemas']['TicketCost'] | components['schemas']['ChangeCost'] | components['schemas']['ProblemCost']
    | components['schemas']['TicketValidation'] | components['schemas']['ChangeValidation'] | ContentItem;

export function useAssistanceTimelineItem(itemtype: AssistanceTimelineItemtype, item: Ref<AssistanceTimelineItem>) {
    const toast = useToast();
    const confirm = useConfirm();
    const { doApiRequest } = useApi();
    const assistanceItemInstance: ReturnType<typeof useAssistanceItem>|null = inject('assistanceItemInstance', null);
    const editMode = ref(false);

    //TODO proper translations/pluralization
    function getTypeName(count: number) {
        const { t: $t } = useI18n();
        switch (itemtype) {
            case 'content':
                return $t('assistance.timeline.content');
            case 'Followup':
                return $t('assistance.followup.label', count, {
                    default: 'Followup | Followups',
                });
            case 'Task':
                return $t('assistance.task.label', count, {
                    default: 'Task | Tasks',
                });
            case 'Solution':
                return $t('assistance.solution.label', count, {
                    default: 'Solution | Solutions',
                });
            case 'Document':
                return $t('assistance.document.label', count, {
                    default: 'Document | Documents',
                });
            case 'Cost':
                return $t('assistance.cost.label', count, {
                    default: 'Cost | Costs',
                });
            case 'Validation':
                return $t('assistance.approval.label', count, {
                    default: 'Approval | Approvals',
                });
            case 'ValidationAnswer':
                return $t('assistance.approval_answer.label', count, {
                    default: 'Approval Answer | Approval Answers',
                });
        }
    }

    /**
     * Returns the REST endpoint for the current timeline item based on its type and the provided parent itemtype and ID.
     * @param parentItemtype The itemtype of the parent item (Ticket, Change or Problem).
     * If undefined, the itemtype from the provided assistanceItemInstance will be used.
     * @param parentID The ID of the parent item.
     * If undefined, the ID from the provided assistanceItemInstance will be used.
     */
    function getRESTEndpoint(parentItemtype: string = undefined, parentID: number = undefined) {
        parentItemtype ??= assistanceItemInstance?.itemtype;
        parentID ??= assistanceItemInstance?.item.value.id;
        switch (itemtype) {
            case 'Followup':
                return `/Assistance/${parentItemtype}/${parentID}/Timeline/Followup`;
            case 'Task':
                return `/Assistance/${parentItemtype}/${parentID}/Timeline/Task`;
            case 'Solution':
                return `/Assistance/${parentItemtype}/${parentID}/Timeline/Solution`;
            case 'Document':
                return `/Assistance/${parentItemtype}/${parentID}/Timeline/Document`;
            case 'Cost':
                return `/Assistance/${parentItemtype}/${parentID}/Cost`;
            case 'Validation':
            case 'ValidationAnswer':
                // approval requests and their answers are part of the same item. For display purposes, they show as separate items in the timeline.
                return `/Assistance/${parentItemtype}/${parentID}/Timeline/Validation`;
        }
    }

    const itemBackgroundColor = computed(() => {
        switch (itemtype) {
            case 'content':
            case 'Followup':
            case 'Document':
            case 'Cost':
            case 'Validation':
                return 'bg-gray-200/50 dark:bg-gray-800/50';
            case 'Task':
                return 'bg-yellow-400/50 dark:bg-yellow-500/25';
            case 'Solution':
                return 'bg-cyan-300/50 dark:bg-cyan-700/50';
            default:
                return 'bg-gray-200/50 dark:bg-gray-800/50';
        }
    });

    const editFormComponent = computed(() => {
        switch (itemtype) {
            case 'Followup':
                return defineAsyncComponent(() => import('@/modules/assistance/timeline/forms/FollowupForm.vue'));
            case 'Task':
                return defineAsyncComponent(() => import('@/modules/assistance/timeline/forms/TaskForm.vue'));
            case 'Solution':
                return defineAsyncComponent(() => import('@/modules/assistance/timeline/forms/SolutionForm.vue'));
            case 'Document':
                return defineAsyncComponent(() => import('@/modules/assistance/timeline/forms/DocumentForm.vue'));
            case 'Cost':
                return defineAsyncComponent(() => import('@/modules/assistance/timeline/forms/CostForm.vue'));
            case 'Validation':
                return defineAsyncComponent(() => import('@/modules/assistance/timeline/forms/ApprovalForm.vue'));
        }
    });

    const viewItemComponent = computed(() => {
        switch (itemtype) {
            case 'content':
                return defineAsyncComponent(() => import('./ContentItem.vue'));
            case 'Followup':
                return defineAsyncComponent(() => import('./FollowupItem.vue'));
            case 'Task':
                return defineAsyncComponent(() => import('./TaskItem.vue'));
            case 'Solution':
                return defineAsyncComponent(() => import('./SolutionItem.vue'));
            case 'Document':
                return defineAsyncComponent(() => import('./DocumentItem.vue'));
            case 'Cost':
                return defineAsyncComponent(() => import('./CostItem.vue'));
            case 'Validation':
                return defineAsyncComponent(() => import('./ApprovalItem.vue'));
            case 'ValidationAnswer':
                return defineAsyncComponent(() => import('./ApprovalAnswerItem.vue'));
            default:
                return null;
        }
    });

    /**
     * Deletes the given timeline item after confirming with the user as a result of a user action like clicking a delete button.
     * If an assistanceItemInstance instance is provided, optimistic UI updates will be done to remove the item from the UI immediately, and the timeline items will be reloaded after the API call to ensure the UI is in sync with the backend.
     * If the API call fails, an error toast will be shown and the timeline will be reloaded to restore the deleted item in the UI.
     *
     * @param parentItemtype The itemtype of the parent item (Ticket, Change or Problem).
     * If undefined, the itemtype from the provided assistanceItemInstance will be used.
     * If used within the timeline view, this provided instance should always be available.
     * @param parentID The ID of the parent item.
     * If undefined, the ID from the provided assistanceItemInstance will be used.
     * If used within the timeline view, this provided instance should always be available.
     */
    function userDeleteItem(parentItemtype: 'Ticket'|'Change'|'Problem' = undefined, parentID: number = undefined) {
        parentItemtype ??= assistanceItemInstance?.itemtype;
        parentID ??= assistanceItemInstance?.item.value.id;

        const { t: $t } = useI18n();

        if (itemtype === 'content') {
            // not a real timeline item, but rather a representation of the ticket/change/problem description.
            return;
        }

        confirm.require({
            message: $t('common.confirm.item_deletion', {
                itemType: getTypeName(1).toLowerCase(),
            }, 'Are you sure you want to delete this {itemType}?'),
            header: $t('common.confirm.item_deletion_title', 'Danger Zone'),
            icon: 'ti ti-circle-x',
            rejectLabel: $t('common.cancel', 'Cancel'),
            rejectProps: {
                label: $t('common.cancel', 'Cancel'),
                severity: 'secondary',
                outlined: true
            },
            acceptProps: {
                label: $t('common.delete', 'Delete'),
                severity: 'danger'
            },
            accept: () => {
                // Optimistic UI
                if (assistanceItemInstance !== null) {
                    assistanceItemInstance.timelineItems.value = assistanceItemInstance.timelineItems.value.filter(i => {
                        return !(i.type === itemtype && i.item.id === (item.value as Exclude<AssistanceTimelineItem, ContentItem>).id);
                    });
                }

                doApiRequest(`${getRESTEndpoint(parentItemtype, parentID)}/${(item.value as Exclude<AssistanceTimelineItem, ContentItem>).id}`, {
                    method: 'DELETE'
                }).catch(() => {
                    toast.add({
                        severity: 'error',
                        summary: $t('common.error.error', 'Error'),
                        detail: $t('common.error.item_deletion', {
                            itemType: getTypeName(1).toLowerCase(),
                        }, 'Failed to delete the {itemType}. Please try again.'),
                        life: 5000,
                    });
                }).finally(() => {
                    if (assistanceItemInstance !== null) {
                        assistanceItemInstance.loadTimelineItems();
                    }
                });
            }
        });
    }

    /**
     *
     * @param itemData The data sent to the server to create the item
     * @param pendingItemData The data used for the pending/placeholder item in the timeline. The data may be formatted differently from the data sent to the server.
     * @param parentItemtype The itemtype of the parent item (Ticket, Change or Problem).
     * If undefined, the itemtype from the provided assistanceItemInstance will be used.
     * @param parentID The ID of the parent item.
     * If undefined, the ID from the provided assistanceItemInstance will be used.
     */
    function addItem(itemData: AssistanceTimelineItem, pendingItemData: AssistanceTimelineItem, parentItemtype: 'Ticket'|'Change'|'Problem' = undefined, parentID: number = undefined) {
        parentItemtype ??= assistanceItemInstance?.itemtype;
        parentID ??= assistanceItemInstance?.item.value.id;

        const { t: $t } = useI18n();

        if (itemtype === 'content') {
            return;
        }

        if (assistanceItemInstance) {
            assistanceItemInstance.timelineItems.value.push({
                type: itemtype,
                item: pendingItemData,
            });
        }

        return doApiRequest(getRESTEndpoint(parentItemtype, parentID), {
            method: 'POST',
            data: itemData,
        }).catch(() => {
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('common.error.item_additon', {
                    itemType: getTypeName(1).toLowerCase(),
                }, 'Failed to add the {itemType}. Please try again.'),
                life: 5000,
            });
        }).finally(() => {
            if (assistanceItemInstance !== null) {
                assistanceItemInstance.loadTimelineItems();
            }
        });
    }

    /**
     *
     * @param itemData The data sent to the server to update the item
     * @param pendingItemData The data used for the pending/placeholder item in the timeline. The data may be formatted differently from the data sent to the server.
     * @param parentItemtype The itemtype of the parent item (Ticket, Change or Problem).
     * If undefined, the itemtype from the provided assistanceItemInstance will be used.
     * @param parentID The ID of the parent item.
     * If undefined, the ID from the provided assistanceItemInstance will be used.
     */
    function updateItem(itemData: AssistanceTimelineItem, pendingItemData: AssistanceTimelineItem, parentItemtype: 'Ticket'|'Change'|'Problem' = undefined, parentID: number = undefined) {
        parentItemtype ??= assistanceItemInstance?.itemtype;
        parentID ??= assistanceItemInstance?.item.value.id;

        const { t: $t } = useI18n();

        if (itemtype === 'content') {
            return;
        }

        if (assistanceItemInstance) {
            // find the original item in the timeline and update it optimistically
            const originalItemIndex = assistanceItemInstance.timelineItems.value
                .findIndex(i => i.type === itemtype && i.item.id === (item.value as Exclude<AssistanceTimelineItem, ContentItem>).id);
            if (originalItemIndex !== -1) {
                assistanceItemInstance.timelineItems.value[originalItemIndex] = {
                    type: itemtype,
                    item: pendingItemData,
                };
            }
        }

        return doApiRequest(`${getRESTEndpoint(parentItemtype, parentID)}/${item.value.id}`, {
            method: 'PATCH',
            data: itemData,
        }).catch(() => {
            toast.add({
                severity: 'error',
                summary: $t('common.error.error', 'Error'),
                detail: $t('common.error.item_update', {
                    itemType: getTypeName(1).toLowerCase(),
                }, 'Failed to update the {itemType}. Please try again.'),
                life: 5000,
            });
        }).finally(() => {
            if (assistanceItemInstance !== null) {
                assistanceItemInstance.loadTimelineItems();
            }
        });
    }

    const actionsMenuOptions = computed(() => {
        const options = [];
        const { t: $t } = useI18n();

        if (['Followup', 'Task', 'Solution', 'Document', 'Cost', 'Validation'].includes(itemtype)) {
            options.push({key: 'edit', label: $t('common.edit', 'Edit'), icon: 'ti ti-pencil', command: () => { editMode.value = true }});
            options.push({key: 'delete', label: $t('common.delete', 'Delete'), icon: 'ti ti-trash', command: () => userDeleteItem()});
        }
        return options;
    });

    return {
        itemtype,
        item,
        getTypeName,
        getRESTEndpoint,
        itemBackgroundColor,
        editFormComponent,
        viewItemComponent,
        editMode,
        actionsMenuOptions,
        addItem,
        updateItem,
    }
}