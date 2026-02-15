<script setup lang="ts">
    import TimelineItem from "@/components/timeline/TimelineItem.vue";
    import { computed, onMounted, provide, ref, type Ref, shallowRef, useTemplateRef, watch } from "vue";
    import { useApi } from "@/composables/useApi.ts";
    import { Button, ButtonGroup, Menu, Popover, SelectButton, SplitButton, Timeline, ToggleSwitch, ProgressBar, useToast } from 'primevue';
    import { RouterLink } from "vue-router";
    import FieldsPanel from "@/components/timeline/FieldsPanel.vue";
    import { type components } from "../../../data/hlapiv2_schema";
    import { useAssistanceItem } from "@/composables/useAssistanceItem";
    import { AbstractModel } from "@/models/AbstractModel";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useInterval } from "@/composables/useInterval";

    const { itemtype, id } = defineProps({
        itemtype: {
            type: String,
            required: true
        },
        id: {
            type: Number,
            required: true
        }
    });

    const toast = useToast();
    const { doApiRequest, normalizeComponentName, getComponentSchema } = useApi();
    const { formatDuration } = useDataHelper();
    const normalized_itemtype = ref(await normalizeComponentName(itemtype));
    const item: Ref<components['schemas']['Ticket'] | components['schemas']['Change'] | components['schemas']['Problem']>  = ref(null);
    const assistanceItemInstance = useAssistanceItem(normalized_itemtype.value, item);
    provide('assistanceItemInstance', assistanceItemInstance);
    const {
        mainTimelineAction, extraTimelineActions, current_new_item, statusIcon, statusColor,
        loadTimelineItems, timelineItems, canUpdateItem, milestones
    } = assistanceItemInstance;

    await doApiRequest(`Assistance/${normalized_itemtype.value}/${id}`).then(async (res) => {
        item.value = AbstractModel.formatFieldsForForm(res.data, await getComponentSchema(normalized_itemtype.value));
    });
    await loadTimelineItems();

    const left_side = useTemplateRef('left-side');
    const right_side = useTemplateRef('right-side');

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

    onMounted(() => {
        document.title = `${itemtype_name} #${item.value.id} - ${item.value.name}`;

        //fetch timeline items every 1 minute to keep it updated without the user having to reload, but back off to 5 minutes when idle
        useInterval(loadTimelineItems, 60 * 1000, 5 * 60 * 1000);
    });

    const filters = {
        filter_description: {
            label: 'Description',
            icon: 'ti ti-alert-circle',
            value: ref(true)
        },
        filter_followups: {
            label: 'Followups',
            icon: 'ti ti-message-circle',
            value: ref(true)
        },
        filter_tasks: {
            label: 'Tasks',
            icon: 'ti ti-checkbox',
            value: ref(true)
        },
        filter_documents: {
            label: 'Documents',
            icon: 'ti ti-files',
            value: ref(true)
        },
        filter_approvals: {
            label: 'Approvals',
            icon: 'ti ti-thumb-up',
            value: ref(true)
        },
        filter_solutions: {
            label: 'Solutions',
            icon: 'ti ti-check',
            value: ref(true)
        },
        filter_costs: {
            label: 'Costs',
            icon: 'ti ti-wallet',
            value: ref(true)
        },
    };
    const view_mode = ref('default');
    const filtered_items = computed(() => {
        const filtered = timelineItems.value.filter((timeline_item) => {
            if (view_mode.value === 'todo') {
                return timeline_item.type === 'Task';
            }
            switch (timeline_item.type) {
                case 'Followup':
                    return filters.filter_followups.value.value;
                case 'Task':
                    return filters.filter_tasks.value.value;
                case 'Document':
                    return filters.filter_documents.value.value;
                case 'Approval':
                    return filters.filter_approvals.value.value;
                case 'Solution':
                    return filters.filter_solutions.value.value;
                case 'Cost':
                    return filters.filter_costs.value.value;
                default:
                    return true;
            }
        });
        return filtered.sort((a, b) => {
            const dateA = new Date(a.item.date_creation || a.item.date || a.item.submission_date);
            const dateB = new Date(b.item.date_creation || b.item.date || b.item.submission_date);
            return dateA.getTime() - dateB.getTime();
        }).slice().reverse();
    });

    const actions_menu_el = useTemplateRef('actions_menu');
    const filters_menu_el = useTemplateRef('filters_menu');
    const pdf_root = useTemplateRef('pdf_root');
    function toggleActionsMenu(e) {
        actions_menu_el.value.toggle(e);
    }
    function toggleFiltersMenu(e) {
        filters_menu_el.value.toggle(e);
    }

    const total_task_duration = computed(() => {
        if (!timelineItems.value) {
            return 0;
        }
        return timelineItems.value.reduce((total, timeline_item) => {
            if (timeline_item.type === 'Task' && timeline_item.item.duration) {
                return total + timeline_item.item.duration;
            }
            return total;
        }, 0);
    });

    /**
     * Percent of tasks in DONE state among all TO-DO/DONE tasks (informational task ignored)
     */
    const task_percent_done = computed(() => {
        if (!timelineItems.value) {
            return 0;
        }
        let done_count = 0;
        let todo_done_count = 0;
        timelineItems.value.forEach((timeline_item) => {
            if (timeline_item.type === 'Task') {
                if (timeline_item.item.state && timeline_item.item.state === 2) {
                    done_count++;
                }
                if (timeline_item.item.state && [1, 2].includes(timeline_item.item.state)) {
                    todo_done_count++;
                }
            }
        });
        return todo_done_count > 0 ? Math.round((done_count / todo_done_count) * 100) : 0;
    });

    function exportPDF() {
        view_mode.value = 'default';
        import('html2pdf.js').then((m) => {
            const html2pdf = m.default;
            html2pdf().from(pdf_root.value).set({
                filename: `${itemtype_name}_${item.value.id}.pdf`,
                html2canvas: { scale: 2 },
                jsPDF: { unit: 'mm', format: 'a4' },
                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
            }).save();
        });
    }

    watch(current_new_item, (newValue, oldValue) => {
        if (oldValue === null) {
            view_mode.value = 'default';
            // scroll component into view
            setTimeout(() => {
                const component_el = document.getElementById('timeline-new-item-form');
                if (component_el) {
                    component_el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    // focus the component
                    component_el.focus();
                }
            }, 100);
        }
    });

    function showNotImplementedToast() {
        toast.add({
            severity: 'info',
            summary: 'Not implemented',
            detail: 'This action is not implemented yet',
            life: 5000,
        });
    }
</script>

<template>
    <section ref="pdf_root" class="grid grid-rows-[auto_1fr] h-full overflow-hidden">
        <div class="text-lg flex justify-between p-2">
            <RouterLink :to="{ name: 'Search', params: {component_module: 'assistance', itemtype: itemtype}}" title="Back to list">
                <i class="ti ti-list-search"></i>
            </RouterLink>
            <header>
                <h1>
                    <i :class="`${statusIcon} mr-2`" :style="`color: ${statusColor}`"></i>
                    {{ item.name }}
                </h1>
            </header>
            <div></div>
        </div>
        <div class="grid grid-cols-12 overflow-y-hidden">
            <div ref="left-side" class="col-span-8 2xl:col-span-9 flex flex-col-reverse space-y-4 px-10 overflow-y-auto pb-10">
                <template v-if="view_mode !== 'milestones'">
                    <component id="timeline-new-item-form" v-if="current_new_item !== null && view_mode === 'default'" :is="current_new_item.component" v-bind="current_new_item.props" @close="current_new_item = null"></component>
                    <TimelineItem v-for="item in filtered_items" :key="`${item.type}-${item.item.id}`"
                                  :item="item" :todoListMode="view_mode === 'todo'" />
                    <TimelineItem :class="(view_mode !== 'todo' && filters.filter_description.value.value) ? '' : 'hidden'" key="content" :item="{
                        type: 'content',
                        item: {
                            name: item.name,
                            content: item.content,
                            user: item.user,
                            user_editor: item.user_editor,
                            date_creation: item.date_creation || item.date
                        }
                    }"></TimelineItem>
                    <div v-if="view_mode === 'todo'">
                        <div class="flex flex-col gap-4 mb-8">
                            <div class="me-6">
                                <i class="ti ti-clock text-2xl me-2"></i>
                                Total Task Duration: {{ formatDuration(total_task_duration, 's') }}
                            </div>
                            <div class="flex">
                                <i class="ti ti-check text-2xl me-2"></i>
                                <ProgressBar class="w-64" :value="task_percent_done" :showValue="true"></ProgressBar>
                            </div>
                        </div>
                    </div>
                </template>
                <template v-else>
                    <Timeline :value="milestones">
                        <template #opposite="slotProps">
                            {{ slotProps.item.date }}
                        </template>
                        <template #content="slotProps">
                            {{ slotProps.item.status }}
                        </template>
                    </Timeline>
                </template>
            </div>
            <div ref="right-side" class="col-span-4 2xl:col-span-3 overflow-y-auto">
                <FieldsPanel :itemtype="normalized_itemtype" :item="item"></FieldsPanel>
            </div>
            <div class="relative h-22 col-span-12">
                <div class="absolute inset-x-0 bottom-0 h-20 justify-between flex">
                    <div class="[&>*]:me-2">
                        <SplitButton v-if="current_new_item === null && mainTimelineAction" :label="mainTimelineAction.label" :icon="mainTimelineAction.icon"
                                     :model="extraTimelineActions" :menuButtonProps="{'aria-label': 'More Options'}"
                                     @click="mainTimelineAction.command">
                        </SplitButton>
                        <Button icon="ti ti-filter" title="Timeline filter" variant="outlined"
                                @click="toggleFiltersMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                        <Popover ref="filters_menu">
                            <div class="flex flex-col gap-2">
                                <div class="flex" v-for="[filter_item_key, filter_item] in Object.entries(filters)">
                                    <ToggleSwitch :id="filter_item_key" :model-value="filter_item.value"></ToggleSwitch>
                                    <label :for="filter_item_key" class="ms-2">
                                        <i :class="filter_item.icon"></i>
                                        {{ filter_item.label }}
                                    </label>
                                </div>
                            </div>
                        </Popover>
                        <SelectButton :pt="{ pcToggleButton: {root: { class: 'inline-flex px-(--p-button-padding-x) py-(--p-button-padding-y)' } } }"
                                      :options="[
                            { key: 'default', label: 'Default View', icon: 'ti ti-messages' },
                            { key: 'todo', label: 'TODO List View', icon: 'ti ti-list-check' },
                            { key: 'milestones', label: 'Milestones View', icon: 'ti ti-flag' },
                        ]" v-model="view_mode" optionValue="key" optionLabel="label">
                            <template #option="slotProps">
                                <i
                                    :title="slotProps.option.label"
                                    :aria-label="slotProps.option.label"
                                    :class="slotProps.option.icon"
                                    class="text-base!"
                                ></i>
                            </template>
                        </SelectButton>
                    </div>
                    <div class="">
                        <ButtonGroup>
                            <Button title="Put in trashbin" icon="ti ti-trash" severity="danger" variant="outlined"></Button>
                            <Button title="Actions" icon="ti ti-dots-vertical" variant="outlined"
                                    @click="toggleActionsMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                            <Menu ref="actions_menu" :popup="true" :model="[
                                { key: 'clone', label: 'Clone', icon: 'ti ti-copy', command: showNotImplementedToast },
                                { key: 'transfer', label: 'Transfer to another entity', icon: 'ti ti-corner-right-up', command: showNotImplementedToast },
                                { key: 'merge_as_followup', label: 'Merge as Followup', icon: 'ti ti-git-merge', command: showNotImplementedToast },
                                { key: 'save_as_pdf', label: 'Save as PDF', icon: 'ti ti-file-type-pdf', command: exportPDF },
                            ]"></Menu>
                            <Button label="Save" icon="ti ti-device-floppy" severity="primary"></Button>
                        </ButtonGroup>
                    </div>
                </div>
            </div>
        </div>
    </section>
</template>

<style scoped>

</style>