import {type Component, computed, type ComputedRef, defineAsyncComponent, ref, type Ref, type ShallowRef, shallowRef} from "vue";
import {type components} from "../../data/hlapiv2_schema";
import { useSessionStore, ITILSubItemRights, BaseRights, ApprovalRights, TicketRights } from "@/composables/useSessionStore";

export function useAssistanceItem(itemtype: 'Ticket'|'Change'|'Problem', item: Ref<components['schemas'][typeof itemtype]>) {
    const session = useSessionStore();
    const current_new_itemtype: ShallowRef<Component> = shallowRef(null);

    const requesters = computed(() => item.value.team.filter(team => team.role === 'requester'));
    const observers = computed(() => item.value.team.filter(team => team.role === 'observer'));
    const assigned = computed(() => item.value.team.filter(team => team.role === 'assigned'));

    const isMyItem = computed(() => {
        return item.value.user_recipient.id === session.user_id || requesters.value.some(team => team.id === session.user_id && team.type === 'User');
    });
    const isItemSolvedOrClosed = computed(() => {
        //TODO combine with ITILStatus class info
        const solved_closed_statuses = [5, 6];
        if (itemtype === 'Change') {
            solved_closed_statuses.push(8, 13, 14);
        } else if (itemtype === 'Problem') {
            solved_closed_statuses.push(8);
        }
        return solved_closed_statuses.includes(item.value.status.id);
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
                item.value.type === 1 ? ApprovalRights.CREATEINCIDENT : ApprovalRights.CREATEREQUEST
            );
        } else {
            return session.hasRight(validation_rightname, BaseRights.CREATE);
        }
    });

    const canUpdateItem = computed(() => {
        if (itemtype !== 'Ticket' && !session.hasRight(itemtype.toLowerCase(), BaseRights.UPDATE)) {
            return false;
        }
        if (
            !(
                session.getActiveProfile.interface !== 'central'
                && session.hasRight(itemtype.toLowerCase(), BaseRights.CREATE)
            )
            || !session.hasAnyRight(
                itemtype.toLowerCase(),
                [BaseRights.CREATE, BaseRights.UPDATE, TicketRights.ASSIGN, TicketRights.STEAL, TicketRights.OWN, TicketRights.CHANGEPRIORITY]
            )
        ) {
            return false;
        }

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
        isAllowedAction?: ComputedRef<boolean>
    }[]> = ref([
        {
            label: 'Answer',
            icon: 'ti ti-message-circle',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/FollowupForm.vue'));
            },
            isAllowedAction: canAddFollowups
        },
        {
            label: 'Create a task',
            icon: 'ti ti-checkbox',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/TaskForm.vue'));
            },
            isAllowedAction: canAddTasks
        },
        {
            label: 'Add a solution',
            icon: 'ti ti-check',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/SolutionForm.vue'));
            },
            isAllowedAction: canSolve
        },
        {
            label: 'Add a document',
            icon: 'ti ti-files',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/DocumentForm.vue'));
            },
            isAllowedAction: canAddFollowups
        },
        {
            label: 'Ask for approval',
            icon: 'ti ti-thumb-up',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/ApprovalForm.vue'));
            },
            isAllowedAction: canAddApproval
        },
        {
            label: 'Add a cost',
            icon: 'ti ti-wallet',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/CostForm.vue'));
            },
            isAllowedAction: canUpdateItem
        },
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

    return {
        all_timeline_actions,
        allowed_timeline_actions,
        current_new_itemtype,
        mainTimelineAction,
        extraTimelineActions,
        requesters,
        observers,
        assigned,
    }
}