<script setup lang="ts">
    import TimelineItem from "@/components/timeline/TimelineItem.vue";
    import {ref, onMounted, useTemplateRef, shallowRef, defineAsyncComponent} from "vue";
    import { useApi } from "@/composables/useApi.ts";
    import { Button, SplitButton, ButtonGroup, Menu } from 'primevue';
    import { RouterLink } from "vue-router";
    import { ITILStatus } from "@/models/assistance/ITILStatus.js";
    import FieldsPanel from "@/components/timeline/FieldsPanel.vue";

    const { itemtype, id } = defineProps({
        itemtype: {
            type: String,
            required: true
        },
        id: {
            type: [String, Number],
            required: true
        }
    });

    const { doApiRequest, normalizeComponentName } = useApi();
    const normalized_itemtype = ref(await normalizeComponentName(itemtype));
    const item = ref(null);
    const items = ref(null);

    const extra_data_promises = [
        doApiRequest(`Assistance/${normalized_itemtype.value}/${id}`).then((res) => {
            item.value = res.data;
            if (item.value.category === null) {
                item.value.category = { id: null, name: '' };
            }
            if (item.value.request_type === null) {
                item.value.request_type = { id: null, name: '' };
            }
            if (item.value.location === null) {
                item.value.location = { id: null, name: '' };
            }
        }),
        doApiRequest(`Assistance/${normalized_itemtype.value}/${id}/Timeline`).then((res) => {
            items.value = res.data;
        }),
    ];
    await Promise.all(extra_data_promises);

    const left_side = useTemplateRef('left-side');
    const right_side = useTemplateRef('right-side');
    const current_new_itemtype = shallowRef(null);

    let itemtype_name;
    switch (itemtype) {
        case 'ticket':
            itemtype_name = 'Ticket';
            break;
        case 'change':
            itemtype_name = 'Change';
            break;
        case 'problem':
            itemtype_name = 'Problem';
            break;
        default:
            itemtype_name = itemtype;
    }

    const extra_timeline_actions = [
        {
            label: 'Create a task',
            icon: 'ti ti-checkbox',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/TaskForm.vue'));
            }
        },
        {
            label: 'Add a solution',
            icon: 'ti ti-check',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/SolutionForm.vue'));
            }
        },
        {
            label: 'Add a document',
            icon: 'ti ti-files',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/DocumentForm.vue'));
            }
        },
        {
            label: 'Ask for approval',
            icon: 'ti ti-thumb-up',
            command: () => {
                current_new_itemtype.value = defineAsyncComponent(() => import('@/components/timeline/forms/ApprovalForm.vue'));
            }
        },
    ];

    onMounted(() => {
        document.title = `GLPI - ${itemtype_name} #${item.value.id} - ${item.value.name}`;
    });

    const actions_menu_el = useTemplateRef('actions_menu');
    function toggleActionsMenu(e) {
        actions_menu_el.value.toggle(e);
    }
</script>

<template>
    <section class="overflow-hidden">
        <div class="text-lg flex justify-between">
            <RouterLink :to="{ name: 'Search', params: {component_module: 'assistance', itemtype: itemtype}}" title="Back to list">
                <i class="ti ti-list-search"></i>
            </RouterLink>
            <header>
                <h1>
                    <i :class="`${ITILStatus.getIcon(item.status.id)} mr-2`"
                       :style="`color: ${ITILStatus.getColor(item.status.id)}`"></i>
                    {{ item.name }}
                </h1>
            </header>
            <div></div>
        </div>
        <div class="grid grid-cols-12 h-full">
            <div ref="left-side" class="col-span-8 2xl:col-span-9 flex flex-col-reverse space-y-4 px-10 overflow-y-auto pb-10">
                <component v-if="current_new_itemtype !== null" :is="current_new_itemtype" @close="current_new_itemtype = null"></component>
                <TimelineItem v-for="item in items.slice().reverse()" :key="`${item.type}-${item.item.id}`" :item="item" />
                <TimelineItem key="content" :item="{
                    type: 'content',
                    item: {
                        name: item.name,
                        content: item.content,
                        user: item.user,
                        user_editor: item.user_editor,
                        date_creation: item.date_creation || item.date
                    }
                }"></TimelineItem>
            </div>
            <div ref="right-side" class="col-span-4 2xl:col-span-3 overflow-y-auto">
                <FieldsPanel :itemtype="itemtype" :item="item"></FieldsPanel>
            </div>
            <div class="relative h-22 col-span-12">
                <div class="absolute inset-x-0 bottom-0 h-20 justify-between flex">
                    <div class="[&>*]:me-2">
                        <SplitButton v-if="current_new_itemtype === null" label="Answer" icon="ti ti-message-circle"
                                     :model="extra_timeline_actions" :menuButtonProps="{'aria-label': 'More Options'}"
                                     @click="current_new_itemtype = defineAsyncComponent(() => import('@/components/timeline/forms/FollowupForm.vue'));">
                        </SplitButton>
                        <Button icon="ti ti-filter" title="Timeline filter" variant="outlined"></Button>
                        <Button icon="ti ti-list-check" title="View TODO list" variant="outlined"></Button>
                    </div>
                    <div class="">
                        <ButtonGroup>
                            <Button title="Put in trashbin" icon="ti ti-trash" severity="danger"></Button>
                            <Button title="Actions" icon="ti ti-dots-vertical" variant="outlined"
                                    @click="toggleActionsMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                            <Menu ref="actions_menu" :popup="true" :model="[
                                { key: 'clone', label: 'Clone', icon: 'ti ti-copy' },
                                { key: 'transfer', label: 'Add to transfer list', icon: 'ti ti-corner-right-up' },
                                { key: 'merge_as_followup', label: 'Merge as Followup', icon: 'ti ti-git-merge' },
                                { key: 'link_project_task', label: 'Link project task', icon: 'ti ti-link' },
                                { key: 'add_contract', label: 'Add contract', icon: 'ti ti-writing-sign' },
                                { key: 'link_kb_article', label: 'Link KB article', icon: 'ti ti-lifebuoy' },
                                { key: 'add_document', label: 'Add document', icon: 'ti ti-file-plus' },
                            ]"></Menu>
                            <Button label="Save" icon="ti ti-device-floppy" severity="info"></Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>