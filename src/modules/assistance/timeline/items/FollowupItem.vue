<script setup lang="ts">
    import { Button, Card, Menu, Tag } from "primevue";
    import { useDataHelper } from "@/common/useDataHelper";
    import { components } from "../../../../../data/hlapiv2_schema";
    import { inject, Ref, useTemplateRef } from "vue";
    import { useApi } from "@/common/api/useApi";
    import { useAssistanceTimelineItem } from "./useAssistanceTimelineItem";

    const props = defineProps<{
        item: components['schemas']['Followup'],
    }>();

    const { formatRelativeTime } = useDataHelper();
    const { doApiRequest } = useApi();
    const actions_menu_el = useTemplateRef('actions_menu');
    const { item, itemBackgroundColor, actionsMenuOptions } = inject<ReturnType<typeof useAssistanceTimelineItem>>('assistanceTimelineItemInstance');
    const followup = item as Ref<components['schemas']['Followup']>;

    function toggleActionsMenu(e) {
        actions_menu_el.value.toggle(e);
    }
</script>

<template>
    <Card :pt:body="{
            class: `p-2 ${itemBackgroundColor}`,
            style: `background-color: ${itemBackgroundColor}; border-radius: 0.5rem;`
        }" class="max-w-200'">
        <template #title>
            <div class="justify-between flex items-center">
                <div class="text-sm">{{ $t('common.created', { dateTime: formatRelativeTime(followup.date_creation || followup.date) }, 'Created {dateTime}') }}</div>
                <div class="ms-4 flex items-center">
                    <i v-if="followup.is_private" class="ti ti-eye-off" :title="$t('assistance.fields.private')" :aria-label="$t('assistance.fields.private')"></i>
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" :title="$t('common.actions', 'Actions')" :aria-label="$t('common.actions', 'Actions')"
                            @click="toggleActionsMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                    <Menu ref="actions_menu" :popup="true" :model="actionsMenuOptions"></Menu>
                </div>
            </div>
        </template>
        <template #content>
            <div>
                <div v-dompurify-html="followup.content"></div>
            </div>
        </template>
        <template #footer class="text-sm select-none">
            <Tag v-if="followup.request_type && followup.request_type.id" severity="secondary">
                <i class="ti ti-inbox me-2" :aria-label="$t('setup.dropdown.requesttype.label')"></i>
                {{ followup.request_type.name }}
            </Tag>
        </template>
    </Card>
</template>

<style scoped>

</style>