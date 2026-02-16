<script setup lang="ts">
    import { Button, Card, Checkbox, Menu, Tag } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useApi } from '@/composables/useApi';
    import { components } from "../../../../data/hlapiv2_schema";
    import { inject, Ref, useTemplateRef } from "vue";
    import { useAssistanceTimelineItem } from "@/composables/useAssistanceTimelineItem";

    const props = defineProps<{
        item: components['schemas']['TicketTask'] | components['schemas']['ChangeTask'] | components['schemas']['ProblemTask'],
    }>();

    const { item, itemBackgroundColor, actionsMenuOptions, getRESTEndpoint } = inject<ReturnType<typeof useAssistanceTimelineItem>>('assistanceTimelineItemInstance');
    const task = item as Ref<components['schemas']['TicketTask'] | components['schemas']['ChangeTask'] | components['schemas']['ProblemTask']>;
    const { formatRelativeTime, formatUsername, formatDuration } = useDataHelper();
    const { doApiRequest } = useApi();
    const actions_menu_el = useTemplateRef('actions_menu');

    function changeTaskState(event: Event) {
        const target = event.target as HTMLInputElement;
        target.disabled = true;
        doApiRequest(getRESTEndpoint(), {
            method: 'PATCH',
            data: {
                state: target.checked ? 2 : 1
            }
        }).then(() => {
            // update the task state in the timeline item
            props.item.state = target.checked ? 2 : 1;
        }).catch(() => {
            // revert the checkbox state on failure
            target.checked = !target.checked;
        }).finally(() => {
            setTimeout(() => {
                target.disabled = false;
            }, 500);
        });
    }

    function toggleActionsMenu(e) {
        actions_menu_el.value.toggle(e);
    }
</script>

<template>
    <Card :pt="{
            body: {
                class: `p-2 ${itemBackgroundColor}`,
                style: `background-color: ${itemBackgroundColor}; border-radius: 0.5rem;`
            }
        }" class="max-w-200'">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm">Created {{ formatRelativeTime(task.date_creation || task.date) }}</div>
                <div class="ms-4 flex items-center">
                    <i v-if="task.is_private" class="ti ti-eye-off" title="Private task" aria-label="Private task"></i>
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"
                            @click="toggleActionsMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                    <Menu ref="actions_menu" :popup="true" :model="actionsMenuOptions"></Menu>
                </div>
            </div>
        </template>
        <template #content>
            <div>
                <div v-dompurify-html="task.content"></div>
            </div>
        </template>
        <template #footer class="text-sm">
            <div class="gap-2 flex select-none">
                <Tag v-if="task.user_tech" severity="secondary">
                    <i class="ti ti-user me-2" aria-label="Assigned to"></i>
                    {{ formatUsername(task.user_tech) }}
                </Tag>
                <Tag v-if="task.group_tech" severity="secondary">
                    <i class="ti ti-users me-2" aria-label="Assigned to group"></i>
                    {{ formatUsername(task.group_tech) }}
                </Tag>
                <Tag v-if="task.duration" severity="secondary">
                    <i class="ti ti-clock me-2" aria-label="Duration"></i>
                    {{ formatDuration(task.duration, 'm', 'narrow') }}
                </Tag>
                <Tag v-if="task.category?.id" severity="secondary">
                    <i class="ti ti-tag me-2" aria-label="Category"></i>
                    {{ task.category.name }}
                </Tag>
            </div>
        </template>
    </Card>
    <Checkbox v-if="task.state > 0" class="ms-2 mt-2" size="large" binary :default-value="task.state == 2" @change="changeTaskState"></Checkbox>
</template>

<style scoped>

</style>