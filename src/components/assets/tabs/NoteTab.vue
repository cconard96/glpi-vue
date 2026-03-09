<script setup lang="ts">
    import { Button, DataView, Message, SelectButton } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import type { useAsset } from "@/composables/assets/useAsset.js";

    const { doGraphQLRequest } = useApi();
    const { formatUsername, formatDateTime } = useDataHelper();
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');
    const notes_info = ref(null);
    const layout = ref('list');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                Note(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id content date_creation date_mod
                    user { id username realname firstname }
                    user_editor { id username realname firstname }
                }
            }
        `).then((res) => {
            notes_info.value = res.data.Note;
        });
    });
</script>

<template>
    <section v-if="notes_info">
        <DataView :value="notes_info" class="mt-6" :rows="notes_info.length" :layout="layout">
            <template #header>
                <div class="flex flex-row justify-between">
                    <Button icon="ti ti-plus" label="New Note"></Button>
                    <SelectButton v-model="layout" :options="['list', 'grid']">
                        <template #option="slotProps">
                            <i
                                :title="slotProps.option === 'list' ? 'List' : 'Grid'"
                                :aria-label="slotProps.option === 'list' ? 'List' : 'Grid'"
                                :class="slotProps.option === 'list' ? 'ti ti-layout-list' : 'ti ti-layout-grid'"
                            ></i>
                        </template>
                    </SelectButton>
                </div>
            </template>
            <template #list>
                <div class="p-2">
                    <div v-for="note in notes_info" :key="note.id" class="p-2 mb-2 border-1 border-transparent [&:not(:last-of-type)]:border-b-(--p-dataview-border-color)">
                        <address class="mb-2 not-italic">
                            <div><time class="text-lg" :datetime="note.date_creation" v-text="formatDateTime(note.date_creation)"></time> by {{ formatUsername(note.user) }}</div>
                            <div class="text-sm" v-if="note.date_mod && note.date_mod !== note.date_creation">Edited: <time :datetime="note.date_mod" v-text="formatDateTime(note.date_mod)"></time> by {{ formatUsername(note.user_editor) }}</div>
                        </address>
                        <div class="whitespace-pre-line" v-dompurify-html="note.content"></div>
                    </div>
                </div>
            </template>
            <template #grid>
                <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 p-2">
                    <div v-for="note in notes_info" :key="note.id" class="p-4 border-1 border-(--p-dataview-border-color) rounded-lg shadow-sm">
                        <address class="mb-2 not-italic">
                            <div><time class="text-lg" :datetime="note.date_creation" v-text="formatDateTime(note.date_creation)"></time> by {{ formatUsername(note.user) }}</div>
                            <div class="text-sm" v-if="note.date_mod && note.date_mod !== note.date_creation">Edited: <time :datetime="note.date_mod" v-text="formatDateTime(note.date_mod)"></time> by {{ formatUsername(note.user_editor) }}</div>
                        </address>
                        <div class="whitespace-pre-line" v-dompurify-html="note.content"></div>
                    </div>
                </div>
            </template>
            <template #empty>
                <Message severity="info">No notes available for this asset.</Message>
            </template>
        </DataView>
    </section>
</template>

<style scoped>

</style>