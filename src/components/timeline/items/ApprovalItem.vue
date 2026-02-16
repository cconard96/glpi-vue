<script setup lang="ts">
    import { Button, Card, Menu, Tag, useToast } from "primevue";
    import { Form, FormField, FormInstance } from '@primevue/forms';
    import { useDataHelper } from "@/composables/useDataHelper";
    import { components } from "../../../../data/hlapiv2_schema";
    import { computed, inject, onMounted, onUpdated, Ref, shallowRef, useTemplateRef, watch } from "vue";
    import { useApi } from "@/composables/useApi";
    import { useSessionStore } from "@/composables/useSessionStore";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";
    import { useAssistanceTimelineItem } from "@/composables/useAssistanceTimelineItem";

    const props = defineProps<{
        item: components['schemas']['TicketValidation'] | components['schemas']['ChangeValidation'],
    }>();

    const { doApiRequest } = useApi();
    const actions_menu_el = useTemplateRef('actions_menu');
    const { formatRelativeTime, formatUsername } = useDataHelper();
    const { getUserID, getGroups, getFriendlyName } = useSessionStore();
    const assistanceTimelineItemInstance = inject<ReturnType<typeof useAssistanceTimelineItem>>('assistanceTimelineItemInstance');
    const { item, itemBackgroundColor, actionsMenuOptions } = assistanceTimelineItemInstance;
    const approval = item as Ref<components['schemas']['TicketValidation'] | components['schemas']['ChangeValidation']>;

    const approver: Ref<components['schemas']['User'] | components['schemas']['Group']> = shallowRef(null);
    const canAnswer = computed(() => {
        if (props.item.status >= 3) {
            return false;
        }
        if (props.item.requested_approver_type === 'User') {
            return getUserID === props.item.requested_approver_id;
        }

        if (props.item.requested_approver_type === 'Group') {
            return getGroups.some(group => group.id === props.item.requested_approver_id);
        }

        return false;
    });
    const approval_answer_form: Ref<FormInstance> = useTemplateRef('approval_answer_form');
    const assistanceItemInstance = inject('assistanceItemInstance');
    const toast = useToast();

    function fetchApproverInfo() {
        if (props.item.requested_approver_type === 'Group') {
            doApiRequest(`Administration/Group/${props.item.requested_approver_id}/`, {
                method: 'GET'
            }).then((response) => {
                approver.value = response.data;
            });
        } else if (props.item.requested_approver_type === 'User') {
            doApiRequest(`Administration/User/${props.item.requested_approver_id}/`, {
                method: 'GET'
            }).then((response) => {
                approver.value = response.data;
            });
        }
    }

    onMounted(() => {
        fetchApproverInfo();
    });

    watch([() => props.item.requested_approver_id, () => props.item.requested_approver_type], () => {
        fetchApproverInfo();
    });

    function answer(approve: boolean, approval_comment: string) {
        const values = {
            status: approve ? 3 : 4,
            approval_comment: approval_comment,
            approver: { id: getUserID }
        };
        const optimisticItemData = {
            type: 'ValidationAnswer',
            item: {
                approval_id: props.item.id,
                date: new Date(),
                comment: approval_comment,
                status: approve ? 3 : 4,
                user: {
                    id: getUserID,
                    name: getFriendlyName
                }
            }
        };

        assistanceTimelineItemInstance.updateItem(values, optimisticItemData);
        //
        // // optimistic UI update
        // assistanceItemInstance.timelineItems.value.push({
        //     type: 'ValidationAnswer',
        //     item: {
        //         approval_id: props.item.id,
        //         date: new Date(),
        //         comment: approval_comment,
        //         status: approve ? 3 : 4,
        //         user: {
        //             id: getUserID,
        //             name: getFriendlyName
        //         }
        //     }
        // });
        //
        // doApiRequest(`Assistance/${assistanceItemInstance.itemtype}/${assistanceItemInstance.item.value.id}/Timeline/Validation/${props.item.id}`, {
        //     method: 'PATCH',
        //     data: {
        //         status: approve ? 3 : 4,
        //         approval_comment: approval_comment,
        //         approver: { id: getUserID }
        //     }
        // }).catch(() => {
        //     toast.add({
        //         severity: 'error',
        //         summary: 'Error',
        //         detail: 'Failed to submit approval response. Please try again.',
        //         life: 5000,
        //     });
        // }).finally(() => {
        //     assistanceItemInstance.loadTimelineItems();
        // });
    }

    function toggleActionsMenu(e) {
        actions_menu_el.value.toggle(e);
    }
</script>

<template>
    <Card :pt="{
            body: {
                class: `p-2 ${itemBackgroundColor}`,
                style: `background-color: bg-gray-200/50 dark:bg-gray-800/50; border-radius: 0.5rem;`
            }
        }" class="max-w-200'">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm">Created {{ formatRelativeTime(approval.submission_date) }}</div>
                <div class="ms-4 flex items-center">
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"
                            @click="toggleActionsMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                    <Menu ref="actions_menu" :popup="true" :model="actionsMenuOptions"></Menu>
                </div>
            </div>
            <Tag class="text-sm select-none" v-if="approver" severity="secondary">Approval sent to {{ formatUsername(approver) }}</Tag>
        </template>
        <template #content>
            <div>
                <div v-dompurify-html="approval.submission_comment"></div>
            </div>
        </template>
        <template #footer v-if="canAnswer && approval.status < 3">
            <Form ref="approval_answer_form">
                <FormField name="approval_comment">
                    <RichTextEditor></RichTextEditor>
                </FormField>
                <div class="flex gap-2 justify-end mt-2">
                    <Button label="Refuse" severity="danger" @click="answer(false, approval_answer_form.getFieldState('approval_comment').value)"></Button>
                    <Button label="Approve" severity="success" @click="answer(true, approval_answer_form.getFieldState('approval_comment').value)"></Button>
                </div>
            </Form>
        </template>
    </Card>
</template>

<style scoped>

</style>