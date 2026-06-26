import {type Component, computed, type ComputedRef, defineAsyncComponent, ref, type Ref, type ShallowRef, shallowRef} from "vue";
import {type components} from "../../../../data/hlapiv2_schema";
import { useSessionStore, ITILSubItemRights, BaseRights, TicketApprovalRights, TicketRights } from "@/common/useSessionStore";
import { useApi } from "@/common/api/useApi";
import { useDataHelper } from "@/common/useDataHelper";
import { AssistanceTimelineItemtype } from "./items/useAssistanceTimelineItem.ts";
import { BaseItemDefinition, useBaseItem } from "@/types";
import { useI18n } from "vue-i18n";
import { getDefaultRightChecks } from "@/common/useBaseItem.ts";

type TimelineItem = components['schemas']['Followup'] | components['schemas']['TicketTask']
    | components['schemas']['ChangeTask'] | components['schemas']['ProblemTask'] | components['schemas']['Solution']
    | components['schemas']['Document'] | components['schemas']['TicketValidation'] | components['schemas']['ChangeValidation'];

type AssistanceType = 'Ticket' | 'Change' | 'Problem';
type AssistanceSchema<T extends AssistanceType = AssistanceType> = components['schemas'][T];

export const enum AssistanceItemStatus {
    NEW = 1,
    ASSIGNED = 2,
    PLANNED = 3,
    WAITING = 4,
    SOLVED = 5,
    CLOSED =  6,
    ACCEPTED =  7,
    OBSERVE =  8,
    EVAL = 9,
    APPROVAL = 10,
    TEST = 11,
    QUALIF = 12,
    REFUSED = 13,
    CANCELED = 14,
}

export const AssistanceItemStatusInfo: {
    [key in AssistanceItemStatus]: {
        key: string,
        label: string,
        icon: string,
        color: string,
    }
} = {
    1: { key: 'new', label: 'New', icon: 'ti ti-circle-filled', color: '#49bf4d' },
    2: { key: 'assigned', label: 'Processing (Assigned)', icon: 'ti ti-circle', color: '#49bf4d' },
    3: { key: 'planned', label: 'Processing (Planned)', icon: 'ti ti-calendar', color: '#1b2f62' },
    4: { key: 'waiting', label: 'Pending', icon: 'ti ti-circle-filled', color: '#ffa500' },
    5: { key: 'solved', label: 'Solved', icon: 'ti ti-circle', color: '#000000' },
    6: { key: 'closed', label: 'Closed', icon: 'ti ti-circle-filled', color: '#000000' },
    7: { key: 'accepted', label: 'Accepted', icon: 'ti ti-circle-check-filled', color: '#00ff00' },
    8: { key: 'observe', label: 'Review', icon: 'ti ti-eye', color: '#000000' },
    9: { key: 'eval', label: 'Evaluation', icon: 'ti ti-circle', color: '#add8e6' },
    10: { key: 'approval', label: 'Approval', icon: 'ti ti-help', color: '#8cabdb' },
    11: { key: 'test', label: 'Testing', icon: 'ti ti-help', color: '#ffa500' },
    12: { key: 'qualif', label: 'Qualification', icon: 'ti ti-circle', color: '#ffa500' },
    13: { key: 'refused', label: 'Refused', icon: 'ti ti-circle-x', color: '#a72f00' },
    14: { key: 'canceled', label: 'Canceled', icon: 'ti ti-ban', color: '#000000' }
}

type AssistanceDefinition<T extends AssistanceType, U extends AssistanceItemStatus[] = AssistanceItemStatus[]> = BaseItemDefinition<T> & {
    allStatuses: U,
    /** @description The statuses that are considered "solved". Must be a subset of allStatuses. */
    solvedStatuses: U[AssistanceItemStatus][],
    /** @description The statuses that are considered "closed". Must be a subset of allStatuses. */
    closedStatuses: U[AssistanceItemStatus][],
};

function getDefaultAssistanceRightChecks(rightname: string): ReturnType<typeof getDefaultRightChecks> {
    const defaultChecks = getDefaultRightChecks(rightname);
    return {
        ...defaultChecks,
    };
}

const assistanceDefinitions: Map<AssistanceType, AssistanceDefinition<AssistanceType>> = new Map([
    ['Ticket', {
        key: 'Ticket',
        module: 'Assistance',
        restEndpoint: 'Ticket',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assistance.ticket.label', count, {
                default: 'Ticket | Tickets',
            });
        },
        icon: 'ti ti-alert-circle',
        rightname: 'ticket',
        ...getDefaultAssistanceRightChecks('ticket'),
        allStatuses: [
            AssistanceItemStatus.NEW, AssistanceItemStatus.APPROVAL, AssistanceItemStatus.ASSIGNED, AssistanceItemStatus.PLANNED,
            AssistanceItemStatus.WAITING, AssistanceItemStatus.SOLVED, AssistanceItemStatus.CLOSED
        ],
        solvedStatuses: [AssistanceItemStatus.SOLVED],
        closedStatuses: [AssistanceItemStatus.CLOSED],
    }],
    ['Change', {
        key: 'Change',
        module: 'Assistance',
        restEndpoint: 'Change',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assistance.change.label', count, {
                default: 'Change | Changes',
            });
        },
        icon: 'ti ti-clipboard-check',
        rightname: 'change',
        ...getDefaultAssistanceRightChecks('change'),
        allStatuses: [
            AssistanceItemStatus.NEW, AssistanceItemStatus.EVAL, AssistanceItemStatus.APPROVAL, AssistanceItemStatus.ACCEPTED,
            AssistanceItemStatus.WAITING, AssistanceItemStatus.TEST, AssistanceItemStatus.QUALIF, AssistanceItemStatus.SOLVED,
            AssistanceItemStatus.OBSERVE, AssistanceItemStatus.CLOSED, AssistanceItemStatus.CANCELED, AssistanceItemStatus.REFUSED
        ],
        solvedStatuses: [AssistanceItemStatus.OBSERVE, AssistanceItemStatus.SOLVED],
        closedStatuses: [AssistanceItemStatus.CLOSED, AssistanceItemStatus.CANCELED, AssistanceItemStatus.REFUSED],
    }],
    ['Problem', {
        key: 'Problem',
        module: 'Assistance',
        restEndpoint: 'Problem',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assistance.problem.label', count, {
                default: 'Problem | Problems',
            });
        },
        icon: 'ti ti-alert-triangle',
        rightname: 'problem',
        ...getDefaultAssistanceRightChecks('problem'),
        allStatuses: [
            AssistanceItemStatus.NEW, AssistanceItemStatus.ACCEPTED, AssistanceItemStatus.ASSIGNED, AssistanceItemStatus.PLANNED,
            AssistanceItemStatus.WAITING, AssistanceItemStatus.SOLVED, AssistanceItemStatus.CLOSED, AssistanceItemStatus.OBSERVE
        ],
        solvedStatuses: [AssistanceItemStatus.OBSERVE, AssistanceItemStatus.SOLVED],
        closedStatuses: [AssistanceItemStatus.CLOSED],
    }],
]);

export const getAllDefinitions = (): Map<AssistanceType, AssistanceDefinition<AssistanceType>> => {
    return assistanceDefinitions;
}

type Requester = components['schemas']['TeamMember'] & {role: 'requester'};
type Observer = components['schemas']['TeamMember'] & {role: 'observer'};
type Assigned = components['schemas']['TeamMember'] & {role: 'assigned'};

export function useAssistanceItem<T extends AssistanceType>(itemtype: T, item: Ref<AssistanceSchema<T>>): useBaseItem<T> & {
    itemtype: T,
    timelineItems: Ref<Array<{type: AssistanceTimelineItemtype, item: TimelineItem}>>,
    loadTimelineItems: () => Promise<void>,
    all_timeline_actions: Ref<{
        label: string,
        icon: string,
        command: () => void,
        isAllowedAction?: ComputedRef<boolean> | boolean
    }[]>,
    allowed_timeline_actions: ComputedRef<{
        label: string,
        icon: string,
        command: () => void,
        isAllowedAction?: ComputedRef<boolean> | boolean
    }[]>,
    current_new_item: ShallowRef<{
        component: Component,
        props?: Record<string, any>
    }>,
    mainTimelineAction: ComputedRef<{
        label: string,
        icon: string,
        command: () => void,
        isAllowedAction?: ComputedRef<boolean> | boolean
    }>,
    extraTimelineActions: ComputedRef<{
        label: string,
        icon: string,
        command: () => void,
        isAllowedAction?: ComputedRef<boolean> | boolean
    }[]>,
    requesters: ComputedRef<Requester[]>,
    observers: ComputedRef<Observer[]>,
    assigned: ComputedRef<Assigned[]>,
    statusIcon: ComputedRef<string>,
    statusColor: ComputedRef<string>,
    statusOptions: ComputedRef<Array<{key: AssistanceItemStatus, label: string}>>,
    itemtypeIcon: ComputedRef<string>,
    urgencyImpactOptions: Array<{key: number, label: string, color: string}>,
    priorityOptions: Array<{key: number, label: string, color: string}>,
    getTypeName: (count: number) => string,
    assistanceLinkTypeLabels: Record<number, string>,
    globalApprovalIcon: ComputedRef<string | null>,
    globalApprovalLabel: ComputedRef<string | null>,
    canUpdateItem: ComputedRef<boolean>,
    milestones: ComputedRef<Array<{status: string, date: string}>>,
} {
    const session = useSessionStore();
    const { doApiRequest } = useApi();
    const { formatDateTime } = useDataHelper();

    const current_new_item: ShallowRef<{
        component: Component,
        props?: Record<string, any>
    }> = shallowRef(null);

    function getDefinition(): AssistanceDefinition<T> {
        return assistanceDefinitions.get(itemtype) as AssistanceDefinition<T>;
    }

    const requesters = computed(() => item.value.team.filter(team => team.role === 'requester') as Requester[]);
    const observers = computed(() => item.value.team.filter(team => team.role === 'observer') as Observer[]);
    const assigned = computed(() => item.value.team.filter(team => team.role === 'assigned') as Assigned[]);

    const isMyItem = computed(() => {
        return item.value.user_recipient.id === session.user_id || requesters.value.some(team => team.id === session.user_id && team.type === 'User');
    });
    const isItemSolvedOrClosed = computed(() => {
        const def = getDefinition();
        return def.solvedStatuses.includes(item.value.status.id) || def.closedStatuses.includes(item.value.status.id);
    });

    const isUserAssigned = computed(() => {
        return assigned.value.some(team => (team.type === 'User' && team.id === session.user_id) || (team.type === 'Group' && session.groups.includes(team.id)));
    });

    const canAddFollowups = computed(() => {
        if (isItemSolvedOrClosed.value) {
            // Already solved/closed
            return false;
        }
        const can_add_as_group = session.hasRight('followup', ITILSubItemRights.ADD_AS_GROUP);

        return (
            // Can add followups on any item they can view
            session.hasRight('followup', ITILSubItemRights.ADDALLITEM)
            // Can add followups on their own items
            || (session.hasRight('followup', ITILSubItemRights.ADDMY) && isMyItem.value)
            // Can add followups on items they are observing
            || (session.hasRight('followup', ITILSubItemRights.ADD_AS_OBSERVER) && observers.value.some(team => team.id === session.user_id))
            // Can add followups on items requested by one of their groups
            || (can_add_as_group && session.hasRight('followup', ITILSubItemRights.ADDMY) && requesters.value.some(team => team.type === 'Group' && session.groups.includes(team.id)))
            // Can add followups on items observed by one of their groups
            || (can_add_as_group && session.hasRight('followup', ITILSubItemRights.ADD_AS_OBSERVER) && observers.value.some(team => team.type === 'Group' && session.groups.includes(team.id)))
            // Can add followups on items assigned to them or their groups
            || (session.hasRight('followup', ITILSubItemRights.ADD_AS_TECHNICIAN) && isUserAssigned.value)
        );
    });

    const canAddTasks = computed(() => {
        if (isItemSolvedOrClosed.value) {
            // Already solved/closed
            return false;
        }
        const can_add_as_group = session.hasRight('task', ITILSubItemRights.ADD_AS_GROUP);

        return (
            // Can add tasks on any item they can view
            session.hasRight('task', ITILSubItemRights.ADDALLITEM)
            // Can add tasks on their own items
            || (session.hasRight('task', ITILSubItemRights.ADDMY) && isMyItem.value)
            // Can add tasks on items they are observing
            || (session.hasRight('task', ITILSubItemRights.ADD_AS_OBSERVER) && observers.value.some(team => team.id === session.user_id))
            // Can add tasks on items requested by one of their groups
            || (can_add_as_group && session.hasRight('task', ITILSubItemRights.ADDMY) && requesters.value.some(team => team.type === 'Group' && session.groups.includes(team.id)))
            // Can add tasks on items observed by one of their groups
            || (can_add_as_group && session.hasRight('task', ITILSubItemRights.ADD_AS_OBSERVER) && observers.value.some(team => team.type === 'Group' && session.groups.includes(team.id)))
            // Can add tasks on items assigned to them or their groups
            || (session.hasRight('task', ITILSubItemRights.ADD_AS_TECHNICIAN) && isUserAssigned.value)
        );
    });

    const canSolve = computed(() =>  {
        //TODO The status matrix needs added to the session info in the API (The statuses allowed to be changed to from certain other statuses).
        if (isItemSolvedOrClosed.value) {
            // Already solved/closed
            return false;
        }
        return (
            // User can update all items
            session.hasRight(itemtype.toLowerCase(), BaseRights.UPDATE)
            // User is assigned to the item directly or via group
            || isUserAssigned.value
        );
    });

    const canAddApproval = computed(() => {
        if (isItemSolvedOrClosed.value) {
            // Already solved/closed
            return false;
        }
        const validation_rightname = itemtype.toLowerCase() + 'validation';
        if (itemtype === 'Ticket') {
            return session.hasRight(
                validation_rightname,
                (item.value as AssistanceSchema<'Ticket'>).type === 1 ? TicketApprovalRights.CREATEINCIDENT : TicketApprovalRights.CREATEREQUEST
            );
        } else {
            return session.hasRight(validation_rightname, BaseRights.CREATE);
        }
    });

    const canUpdateItem = computed(() => {
        if (itemtype !== 'Ticket' && !session.hasRight(itemtype.toLowerCase(), BaseRights.UPDATE)) {
            return false;
        }
        // if (
        //     !(
        //         session.getActiveProfile.interface !== 'central'
        //         && session.hasRight(itemtype.toLowerCase(), BaseRights.CREATE)
        //     )
        //     || !session.hasAnyRight(
        //         itemtype.toLowerCase(),
        //         [BaseRights.CREATE, BaseRights.UPDATE, TicketRights.ASSIGN, TicketRights.STEAL, TicketRights.OWN, TicketRights.CHANGEPRIORITY]
        //     )
        // ) {
        //     return false;
        // }

        //TODO Requesters can make some updates to their tickets before they are taken into account by a technician

        // Non-central interface users cannot update by this point
        if (session.getActiveProfile.interface !== 'central') {
            return false;
        }

        if (itemtype !== 'Ticket') {
            return session.hasRight(itemtype.toLowerCase(), BaseRights.UPDATE);
        } else {
            return (
                session.hasRight(itemtype.toLowerCase(), BaseRights.UPDATE)
                || (session.hasRight(itemtype.toLowerCase(), TicketRights.OWN) && isUserAssigned.value)
            );
        }
    });

    const all_timeline_actions: Ref<{
        label: string,
        icon: string,
        command: () => void,
        isAllowedAction?: ComputedRef<boolean> | boolean
    }[]> = ref([
        {
            label: 'Answer',
            icon: 'ti ti-message-circle',
            command: () => {
                current_new_item.value = {
                    component: defineAsyncComponent(() => import('./forms/FollowupForm.vue'))
                };
            },
            isAllowedAction: canAddFollowups
        },
        {
            label: 'Create a task',
            icon: 'ti ti-checkbox',
            command: () => {
                current_new_item.value = {
                    component: defineAsyncComponent(() => import('./forms/TaskForm.vue'))
                };
            },
            isAllowedAction: canAddTasks
        },
        {
            label: 'Add a solution',
            icon: 'ti ti-check',
            command: () => {
                current_new_item.value = {
                    component: defineAsyncComponent(() => import('./forms/SolutionForm.vue'))
                };
            },
            isAllowedAction: canSolve
        },
        {
            label: 'Add a document',
            icon: 'ti ti-files',
            command: () => {
                current_new_item.value = {
                    component: defineAsyncComponent(() => import('./forms/DocumentForm.vue'))
                };
            },
            isAllowedAction: canAddFollowups
        },
        {
            label: 'Ask for approval',
            icon: 'ti ti-thumb-up',
            command: () => {
                current_new_item.value = {
                    component: defineAsyncComponent(() => import('./forms/ApprovalForm.vue'))
                };
            },
            isAllowedAction: canAddApproval
        },
        {
            label: 'Add a cost',
            icon: 'ti ti-wallet',
            command: () => {
                current_new_item.value = {component: defineAsyncComponent(() => import('./forms/CostForm.vue'))};
            },
            isAllowedAction: canUpdateItem
        },
        {
            label: 'Add signature',
            icon: 'ti ti-signature',
            command: () => {
                current_new_item.value = {component: defineAsyncComponent(() => import('./forms/SignatureForm.vue'))};
            },
            isAllowedAction: canAddFollowups
        }
    ]);

    const allowed_timeline_actions = computed(() => {
        return all_timeline_actions.value.filter((action) => {
            return action.isAllowedAction || false;
        });
    });

    /**
     * The timeline action that shows as the main button in the SplitButton.
     * This is the first allowed action in the list, or null if there are no allowed actions.
     */
    const mainTimelineAction = computed(() => allowed_timeline_actions.value.length > 0 ? allowed_timeline_actions.value[0] : null);

    /** The allowed timeline actions minus the main timeline action, which show as the options in the SplitButton dropdown. */
    const extraTimelineActions = computed(() => allowed_timeline_actions.value.length > 1 ? allowed_timeline_actions.value.slice(1) : []);

    const statusIcon = computed(() => AssistanceItemStatusInfo[item.value.status.id] ? AssistanceItemStatusInfo[item.value.status.id].icon : '');
    const statusColor = computed(() => AssistanceItemStatusInfo[item.value.status.id] ? AssistanceItemStatusInfo[item.value.status.id].color : '#000000');
    const statusOptions = computed(() => {
        return getDefinition().allStatuses.map(status_id => {
            const status_info = AssistanceItemStatusInfo[status_id];
            return {
                key: status_id,
                label: status_info ? status_info.label : `Status ${status_id}`,
            }
        });
    });

    const itemtypeIcon = computed(() => {
        return getDefinition().icon;
    });

    const urgencyImpactOptions = [
        {key: 5, label: 'Very high', color: '#ffadad'},
        {key: 4, label: 'High', color: '#ffbfbf'},
        {key: 3, label: 'Medium', color: '#ffcece'},
        {key: 2, label: 'Low', color: '#ffe0e0'},
        {key: 1, label: 'Very low', color: '#fff2f2'},
    ];
    const priorityOptions = [
        {key: 6, label: 'Major', color: '#ff5555'},
        ...urgencyImpactOptions
    ];

    const getTypeName = (count: number) => {
        return getDefinition().getLabel(count);
    }

    const assistanceLinkTypeLabels = {
        1: 'Linked to',
        2: 'Duplicate of',
        3: 'Child of',
        4: 'Parent of',
    };

    const globalApprovalIcon = computed(() => {
        if (!('global_validation' in item.value) || !item.value.global_validation) {
            return null;
        }
        switch (item.value.global_validation) {
            case 2:
                return 'ti ti-clock text-amber-500';
            case 3:
                return 'ti ti-check text-green-700';
            case 4:
                return 'ti ti-x text-red-700';
        }
        return null;
    });

    const globalApprovalLabel = computed(() => {
        if (!('global_validation' in item.value) || !item.value.global_validation) {
            return null;
        }
        switch (item.value.global_validation) {
            case 2:
                return 'Pending';
            case 3:
                return 'Accepted';
            case 4:
                return 'Refused';
        }
        return null;
    });

    const timelineItems: Ref<Array<{type: AssistanceTimelineItemtype, item: TimelineItem}>> = ref(null);

    function loadTimelineItems() {
        return doApiRequest(`Assistance/${itemtype}/${item.value.id}/Timeline`).then((res) => {
            return res.data;
        }).then((updated_items) => {
            // load costs as timeline items as they are not considered part of the timeline in GLPI
            return doApiRequest(`Assistance/${itemtype}/${item.value.id}/Cost`).then((res) => {
                const costs = res.data.map(cost => {
                    cost.date = cost.end_date || cost.begin_date || new Date().toISOString();
                    return {
                        type: 'Cost',
                        item: cost,
                    }
                });
                const newTimelineItems = [...updated_items, ...costs];

                (updated_items as Array<{type: string, item: TimelineItem}>).forEach(timeline_item => {
                    if (
                        timeline_item.type === 'Validation'
                        && (timeline_item.item as components['schemas']['TicketValidation' | 'ChangeValidation']).status >= 3
                    ) {
                        newTimelineItems.push({
                            type: 'ValidationAnswer',
                            item: {
                                approval_id: timeline_item.item.id,
                                date: (timeline_item.item as components['schemas']['TicketValidation' | 'ChangeValidation']).approval_date,
                                comment: (timeline_item.item as components['schemas']['TicketValidation' | 'ChangeValidation']).approval_comment,
                                status: (timeline_item.item as components['schemas']['TicketValidation' | 'ChangeValidation']).status,
                                user: (timeline_item.item as components['schemas']['TicketValidation' | 'ChangeValidation']).approver
                            }
                        });
                    }
                });
                timelineItems.value = newTimelineItems;
            });
        });
    }

    const milestones = computed(() => {
        const milestone_items = [
            { status: 'Opening Date', date: formatDateTime(item.value.date || item.value.date_creation) }
        ];

        if ('take_into_account_date' in item.value) {
            // old tickets (<10.0.4 won't have the take_into_account_date field set. use date_creation + take_into_account_duration instead
            if (item.value.take_into_account_date) {
                milestone_items.push({status: 'Take into account', date: formatDateTime(item.value.take_into_account_date)});
            } else if (item.value.take_into_account_duration) {
                milestone_items.push({
                    status: 'Take into account',
                    date: formatDateTime(new Date(item.value.date_creation).getTime() + item.value.take_into_account_duration * 1000)
                });
            }
        }

        if ([5, 6, 8, 13, 14].includes(item.value.status.id)) {
            if (item.value.date_solve) {
                milestone_items.push({status: 'Resolution', date: formatDateTime(item.value.date_solve)});
            }
        }

        if ([6, 13, 14].includes(item.value.status.id)) {
            if (item.value.date_close) {
                milestone_items.push({status: 'Closure', date: formatDateTime(item.value.date_close)});
            }
        }

        // TODO Finish

        return milestone_items.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    });

    return {
        getDefinition,
        itemtype,
        item,
        timelineItems,
        loadTimelineItems,
        all_timeline_actions,
        allowed_timeline_actions,
        current_new_item,
        mainTimelineAction,
        extraTimelineActions,
        requesters,
        observers,
        assigned,
        statusIcon,
        statusColor,
        statusOptions,
        itemtypeIcon,
        urgencyImpactOptions,
        priorityOptions,
        getTypeName,
        assistanceLinkTypeLabels,
        globalApprovalIcon,
        globalApprovalLabel,
        canUpdateItem,
        milestones,
    }
}