<script setup lang="ts">
    import { Button, Card, InputText, Fluid, FloatLabel } from "primevue";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { inject } from "vue";
    import { useAssistanceItem } from "@/composables/useAssistanceItem.ts";

    const props = defineProps<{
        item: {
            content?: string,
            date_creation?: string,
            name?: string,
            user?: any, //TODO
            user_editor?: any, //TODO
        },
    }>();

    const { formatRelativeTime } = useDataHelper();
    const { item: assistanceItem, isNewItem } = inject<ReturnType<typeof useAssistanceItem>>('assistanceItemInstance');
</script>

<template>
    <Card :pt="{
            body: {
                class: `${!isNewItem ? 'p-2' : ''} bg-gray-200/50 dark:bg-gray-800/50`,
                style: `background-color: bg-gray-200/50 dark:bg-gray-800/50; border-radius: 0.5rem;`
            }
        }" :class="!isNewItem ? 'max-w-200' : 'w-full'">
        <template #title v-if="!isNewItem">
            <div class="justify-between flex items-center">
                <div class="text-sm">Created {{ formatRelativeTime(item.date_creation || item.date) }}</div>
                <div class="ms-4 flex items-center">
                    <Button icon="ti ti-dots-vertical" severity="secondary" variant="text" size="small" title="Actions" aria-label="Actions"></Button>
                </div>
            </div>
        </template>
        <template #content>
            <div v-if="!isNewItem">
                <div v-dompurify-html="item.content"></div>
            </div>
            <div v-else>
                <Fluid class="flex flex-col gap-4">
                    <FloatLabel>
                        <InputText id="new_ticket_name"></InputText>
                        <label for="new_ticket_name">{{ $t('ticket.field.name.label', 'Title') }}</label>
                    </FloatLabel>
                    <RichTextEditor :enable_file_upload="true"></RichTextEditor>
                </Fluid>
            </div>
        </template>
        <template #footer class="text-sm select-none">

        </template>
    </Card>
</template>

<style scoped>

</style>