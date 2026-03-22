<script setup lang="ts">
    import { Card, type Component } from 'primevue';
    import { useSessionStore, TicketRights, BaseAssistanceRights, TicketApprovalRights, ChangeApprovalRights } from "@/composables/useSessionStore";
    import { computed } from "vue";

    const { hasAnyRight } = useSessionStore();

    const showTickets = hasAnyRight('ticket', [TicketRights.READMY, TicketRights.READALL, TicketRights.READASSIGN]);
    const showMyTickets = hasAnyRight('ticket', [TicketRights.READMY, TicketRights.READALL]);
    const showProblems = hasAnyRight('problem', [BaseAssistanceRights.READMY, BaseAssistanceRights.READALL]);
    const showChanges = hasAnyRight('change', [BaseAssistanceRights.READMY, BaseAssistanceRights.READALL]);
    const canValidateTickets = hasAnyRight('ticket', [TicketApprovalRights.VALIDATEREQUEST, TicketApprovalRights.VALIDATEINCIDENT]);
    const canValidateChanges = hasAnyRight('change', [ChangeApprovalRights.VALIDATE]);

    const widgets = computed(() => {
        // const widgets: {
        //     widget: Component,
        //     title: string,
        //     widgetProps?: Record<string, unknown>,
        // } = [];

        const widgets = [];

        if (canValidateTickets) {
            widgets.push({
                type: 'list',
                itemtype: 'Ticket',
                title: 'Tickets to validate',
                status: 'tovalidate',
            });
        }

        if (showTickets) {
            if (showMyTickets) {
                //TODO toapprove

                widgets.push({
                    type: 'list',
                    itemtype: 'Ticket',
                    title: 'Satisfaction surveys',
                    status: 'survey',
                });

                widgets.push({
                    type: 'list',
                    itemtype: 'Ticket',
                    title: 'My tickets in progress',
                    status: 'requestbyself',
                });

                widgets.push({
                    type: 'list',
                    itemtype: 'Ticket',
                    title: 'My observed tickets in progress',
                    status: 'observed',
                });

                widgets.push({
                    type: 'list',
                    itemtype: 'Ticket',
                    title: 'My tickets waiting to be processed',
                    status: 'process',
                });

                widgets.push({
                    type: 'list',
                    itemtype: 'Ticket',
                    title: 'My tickets waiting',
                    status: 'waiting',
                });

                widgets.push({
                    type: 'list',
                    itemtype: 'TicketTask',
                    title: 'My ticket tasks to do',
                    status: 'todo',
                });
            }
            widgets.push({
                type: 'list',
                itemtype: 'Ticket',
                title: 'Rejected tickets',
                status: 'validation.rejected',
            });
            widgets.push({
                type: 'list',
                itemtype: 'Ticket',
                title: 'Tickets with rejected solutions',
                status: 'solution.rejected',
            });
        }

        if (showProblems) {
            widgets.push({
                type: 'list',
                itemtype: 'Problem',
                title: 'My problems waiting to be processed',
                status: 'process',
            });

            widgets.push({
                type: 'list',
                itemtype: 'ProblemTask',
                title: 'My problem tasks to do',
                status: 'todo',
            });
        }

        if (canValidateChanges) {
            widgets.push({
                type: 'list',
                itemtype: 'Change',
                title: 'Changes to validate',
                status: 'tovalidate',
            });
        }

        if (showChanges) {
            widgets.push({
                type: 'list',
                itemtype: 'Change',
                title: 'My changes waiting to be processed',
                status: 'process',
            });

            widgets.push({
                type: 'list',
                itemtype: 'ChangeTask',
                title: 'My change tasks to do',
                status: 'todo',
            });
        }

        //TODO Planning list

        //TODO Reminder list

        //TODO Public reminder list

        //TODO Project list

        //TODO Project task list

        return widgets;
    });
</script>

<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card v-for="widget in widgets" :key="widget.title" class="rounded shadow p-4">
            <template #header>
                <h2 class="text-lg font-bold">{{ widget.title }}</h2>
            </template>
            <template #content>
                <!-- Placeholder for widget content -->
                <div class="text-gray-500">Content for {{ widget.type }} ({{ widget.itemtype }}, status: {{ widget.status }})</div>
            </template>
        </Card>
    </div>
</template>

<style scoped>

</style>