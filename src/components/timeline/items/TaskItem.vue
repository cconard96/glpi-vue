<script setup lang="ts">
    import { Button, Card, Checkbox, Tag } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useApi } from '@/composables/useApi';
    import { components } from "../../../../data/hlapiv2_schema";
    import { inject } from "vue";

    const props = defineProps<{
        item: components['schemas']['TicketTask'] | components['schemas']['ChangeTask'] | components['schemas']['ProblemTask'],
    }>();

    const assistanceItemInstance = inject('assistanceItemInstance');
    const { formatRelativeTime, formatUsername, formatDuration } = useDataHelper();
    const { doApiRequest } = useApi();

    function changeTaskState(event: Event) {
        const target = event.target as HTMLInputElement;
        target.disabled = true;
        doApiRequest(`Assistance/${assistanceItemInstance.itemtype}/${assistanceItemInstance.item.value.id}/Timeline/Task/${props.item.id}`, {
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
</script>

<template>
    <Card :pt="{
            body: {
                class: `p-2 bg-yellow-400/50 dark:bg-yellow-500/25`,
                style: `background-color: bg-yellow-400/50 dark:bg-yellow-500/25; border-radius: 0.5rem;`
            }
        }" class="max-w-200'">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm">Created {{ formatRelativeTime(item.date_creation || item.date) }}</div>
                <div class="ms-4 flex items-center">
                    <i v-if="item.is_private" class="ti ti-eye-off" title="Private task" aria-label="Private task"></i>
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"></Button>
                </div>
            </div>
        </template>
        <template #content>
            <div>
                <div v-dompurify-html="item.content"></div>
            </div>
        </template>
        <template #footer class="text-sm">
            <div class="gap-2 flex select-none">
                <Tag v-if="item.user_tech" severity="secondary">
                    <i class="ti ti-user me-2" aria-label="Assigned to"></i>
                    {{ formatUsername(item.user_tech) }}
                </Tag>
                <Tag v-if="item.group_tech" severity="secondary">
                    <i class="ti ti-users me-2" aria-label="Assigned to group"></i>
                    {{ formatUsername(item.group_tech) }}
                </Tag>
                <Tag v-if="item.duration" severity="secondary">
                    <i class="ti ti-clock me-2" aria-label="Duration"></i>
                    {{ formatDuration(item.duration, 'm', 'narrow') }}
                </Tag>
                <Tag v-if="item.category?.id" severity="secondary">
                    <i class="ti ti-tag me-2" aria-label="Category"></i>
                    {{ item.category.name }}
                </Tag>
            </div>
        </template>
    </Card>
    <Checkbox v-if="item.state > 0" class="ms-2 mt-2" size="large" binary :default-value="item.state == 2" @change="changeTaskState"></Checkbox>
</template>

<style scoped>

</style>