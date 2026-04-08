<script setup lang="ts">
    import {
        Accordion,
        AccordionContent,
        AccordionHeader,
        AccordionPanel,
        Button,
        DatePicker,
        FloatLabel,
        Fluid,
        InputText,
        Message,
        ScrollPanel,
        SelectButton,
        Tag,
        useDialog,
        useToast
    } from "primevue";
    import { FormField } from "@primevue/forms";
    import { defineAsyncComponent, inject, onMounted, ref } from "vue";
    import { useApi } from "@/composables/useApi";
    import type { components } from "../../../data/hlapiv2_schema";
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import { RouterLink } from "vue-router";
    import ActorFields from "@/components/timeline/ActorFields.vue";
    import SLMFields from "@/components/timeline/SLMFields.vue";
    import { useAssistanceItem } from "@/composables/useAssistanceItem.ts";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";

    const props = defineProps<{
        itemtype: 'Ticket' | 'Change' | 'Problem',
        item: components['schemas']['Ticket'] | components['schemas']['Change'] | components['schemas']['Problem'],
        formID: string,
    }>();

    const toast = useToast();
    const dialog = useDialog();
    const { doGraphQLRequest, getValidSchemaTypesFromItemtypes } = useApi();
    const {
        statusOptions, getTypeName, urgencyImpactOptions, priorityOptions, itemtypeIcon, assistanceLinkTypeLabels,
        requesters, observers, assigned, globalApprovalIcon, globalApprovalLabel, current_new_item
    } = inject<ReturnType<typeof useAssistanceItem>>('assistanceItemInstance');

    const form_resolver = async (data) => {
        // For now, just return the data as is.
        return {
            values: data,
            errors: {}
        };
    };

    const onFormSubmit = (data) => {
        console.log('Form submitted:', data);
        // Handle form submission, e.g., send data to the API.
    };

    const assistance_link_types = [
        {link_type: 'Ticket_Ticket', itemtypes: ['Ticket']},
        {link_type: 'Problem_Ticket', itemtypes: ['Ticket', 'Problem']},
        {link_type: 'Change_Ticket', itemtypes: ['Ticket', 'Change']},
        {link_type: 'Change_Problem', itemtypes: ['Change', 'Problem']},
        {link_type: 'Change_Change', itemtypes: ['Change']},
        {link_type: 'Problem_Problem', itemtypes: ['Problem']}
    ];
    let assistance_link_queries = '';
    for (const link_type of assistance_link_types) {
        if (link_type.itemtypes.includes(props.itemtype)) {
            if (link_type.itemtypes.length === 1) {
                const prop = props.itemtype.toLowerCase();
                assistance_link_queries += `
                    ${link_type.link_type}(filter: "${prop}_1.id==${props.item.id},${prop}_2.id==${props.item.id}") {
                        id link ${prop}_1 { id name status { id } } ${prop}_2 { id name status { id } }
                    }
                `;
            } else {
                const prop = props.itemtype.toLowerCase();

                assistance_link_queries += `
                    ${link_type.link_type}(filter: "${prop}.id==${props.item.id}") {
                        id link ${link_type.itemtypes.map(it => `${it.toLowerCase()} { id name status { id } }`).join(' ')}
                    }
                `;
            }
        }
    }
    const assistance_links = ref([]);
    const kbitems = ref([]);
    const item_links = ref([]);
    const project_links = ref([]);
    const slaTTOName = ref('');
    const slaTTRName = ref('');
    const olaTTOName = ref('');
    const olaTTRName = ref('');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                KBArticle_Item(filter: "itemtype==${props.itemtype};items_id==${props.item.id}") {
                    id itemtype items_id kbarticle { id name }
                }
                ${assistance_link_queries}
                ${props.itemtype}_Item(filter: "${props.itemtype.toLowerCase()}.id==${props.item.id}") {
                    id itemtype items_id
                }
                ITIL_Project(filter: "itemtype==${props.itemtype};items_id==${props.item.id}") {
                    id itemtype items_id project { id name }
                }
            }
        `, {}, 'no-cache', 'all').then((res) => {
            kbitems.value = res.data.KBArticle_Item;
            project_links.value = res.data.ITIL_Project.map(ip => ip.project);
            const links = [];
            for (const link_type of assistance_link_types) {
                if (link_type.itemtypes.includes(props.itemtype)) {
                    // get the id and name for the other side of the link
                    const link_data = res.data[link_type.link_type];
                    if (!link_data) {
                        // maybe the user does not have permission to see those itemtypes
                        continue;
                    }
                    for (const link of link_data) {
                        let linked_item = null;
                        // if this is a link between the same itemtype, find the other side of the link by ID. Otherwise look for the other itemtype.
                        if (link_type.itemtypes.length === 1) {
                            const prop = props.itemtype.toLowerCase();
                            if (link[`${prop}_1`].id === props.item.id) {
                                linked_item = link[`${prop}_2`];
                            } else {
                                linked_item = link[`${prop}_1`];
                            }
                        } else {
                            for (const it of link_type.itemtypes) {
                                if (it.toLowerCase() !== props.itemtype.toLowerCase()) {
                                    linked_item = link[it.toLowerCase()];
                                    break;
                                }
                            }
                        }
                        if (linked_item) {
                            links.push({
                                link_type: link_type.link_type,
                                link: link.link,
                                linked_item: linked_item
                            });
                        }
                    }
                }
            }
            assistance_links.value = links;

            // handle fetching extra data about the assets for this assistance item
            const linked_assets_data = res.data[`${props.itemtype}_Item`];
            getValidSchemaTypesFromItemtypes(linked_assets_data.map(i => i.itemtype)).then((valid_types) => {
                if (valid_types.length === 0) {
                    return;
                }
                doGraphQLRequest(`
                    query {
                        ${valid_types.map(type => `
                            ${type}(filter: "id=in=(${linked_assets_data.filter(i => i.itemtype === type).map(i => i.id).join(',')})") {
                                id name
                            }
                        `).join(' ')}
                    }
                `).then((res) => {
                    for (const type of valid_types) {
                        const items = res.data[type];
                        for (const item of linked_assets_data.filter(i => i.itemtype === type)) {
                            const asset_data = items.find(i => i.id === item.id);
                            if (asset_data) {
                                item_links.value.push({
                                    id: item.id,
                                    itemtype: item.itemtype,
                                    items_id: item.items_id,
                                    name: asset_data.name
                                });
                            }
                        }
                    }
                });
            });
        });
        if (props.itemtype === 'Ticket') {
            doGraphQLRequest(`
                query {
                    SLA(filter: "id=in=(${(props.item as components['schemas']['Ticket']).sla_tto},${(props.item as components['schemas']['Ticket']).sla_ttr})") {
                        id name
                    }
                    OLA(filter: "id=in=(${(props.item as components['schemas']['Ticket']).ola_tto},${(props.item as components['schemas']['Ticket']).ola_ttr})") {
                        id name
                    }
                }
            `, {}, 'cache-first').then((res) => {
                slaTTOName.value = res.data.SLA.find(sla => sla.id === (props.item as components['schemas']['Ticket']).sla_tto)?.name || '';
                slaTTRName.value = res.data.SLA.find(sla => sla.id === (props.item as components['schemas']['Ticket']).sla_ttr)?.name || '';
                olaTTOName.value = res.data.OLA.find(ola => ola.id === (props.item as components['schemas']['Ticket']).ola_tto)?.name || '';
                olaTTRName.value = res.data.OLA.find(ola => ola.id === (props.item as components['schemas']['Ticket']).ola_ttr)?.name || '';
            });
        }
    });

    function showKBSearch() {
        const dialogInstance = dialog.open(defineAsyncComponent(() => import('@/components/kb/QuickSearchKB.vue')), {
            props: {
                header: 'Search KB Articles',
                modal: true,
                draggable: false,
            },
            data: {
                actions: {
                    link: {label: 'Link to ' + getTypeName(1)},
                    use_as_solution: {label: 'Use as solution'},
                }
            },
            emits: {
                onClickAction: ({ action, article }) => {
                    if (action === 'link') {
                        // TODO Link the article to the assistance item
                    } else if (action === 'use_as_solution') {
                        console.log('article content', article.content);
                        current_new_item.value = {
                            component: defineAsyncComponent(() => import('@/components/timeline/forms/SolutionForm.vue')),
                            props: {
                                initialContent: article.content,
                            }
                        };
                        dialogInstance.close();
                    }
                }
            }
        });
    }

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
    <AdvancedForm :id="formID" :schemaName="itemtype" :initialValues="item" :resolver="form_resolver" @submit="onFormSubmit" class="w-full">
        <ScrollPanel>
            <Accordion :value="['main', 'actors']" multiple>
                <AccordionPanel value="main">
                    <AccordionHeader class="p-3" as="div">
                        <span class="max-w-full text-nowrap flex items-center overflow-hidden me-4">
                            <i :class="`${itemtypeIcon} me-2`"></i>
                            {{ getTypeName(1) }}
                            <Tag class="ms-2 overflow-hidden text-truncate flex justify-end"><span class="">Entity: {{ item.entity.name }}</span></Tag>
                        </span>
                    </AccordionHeader>
                    <AccordionContent>
                        <Fluid>
                            <div class="flex flex-col space-y-4">
                                <FormField name="date">
                                    <FloatLabel variant="on">
                                        <DatePicker inputId="item_date" showTime showIcon />
                                        <label for="item_date">Opening date</label>
                                    </FloatLabel>
                                </FormField>
                                <FormField v-if="'type' in item" name="type">
                                    <SelectButton :options="[{key: 1, label: 'Incident'}, {key: 2, label: 'Request'}]"
                                                  optionValue="key" optionLabel="label" size="small"></SelectButton>
                                </FormField>
                                <FormField name="category">
                                    <!-- TODO Make a tree select -->
                                    <FieldSelect label="Category" type="ITILCategory" label_type="on" treeMode></FieldSelect>
                                </FormField>
                                <FormField name="location">
                                    <FieldSelect label="Location" type="Location" label_type="on"></FieldSelect>
                                </FormField>
                                <FormField name="status">
                                    <FieldSelect label="Status" :options="statusOptions" optionValue="key" optionLabel="label" label_type="on" :showClear="false"></FieldSelect>
                                </FormField>
                                <div v-if="('global_validation' in item && item.global_validation) > 1">
                                    <i class="me-2" :class="globalApprovalIcon"></i>
                                    <span>Approval Status: {{ globalApprovalLabel }}</span>
                                </div>
                                <FormField name="request_type">
                                    <FieldSelect label="Request source" type="RequestType" label_type="on"></FieldSelect>
                                </FormField>
                                <FormField name="urgency">
                                    <FieldSelect label="Urgency" :options="urgencyImpactOptions" optionValue="key" optionLabel="label" label_type="on" :showClear="false">
                                        <template #value="slotProps">
                                            <div class="flex items-baseline">
                                                <i class="pi pi-circle-fill me-2" :style="`color: ${urgencyImpactOptions.find(opt => opt['key'] === slotProps.value)?.['color']}`"></i>
                                                <div>{{ urgencyImpactOptions.find(opt => opt['key'] === slotProps.value)?.['label'] || slotProps.value }}</div>
                                            </div>
                                        </template>
                                        <template #option="slotProps">
                                            <div class="flex items-baseline">
                                                <i class="pi pi-circle-fill me-2" :style="`color: ${slotProps.option['color']}`"></i>
                                                <div>{{ slotProps.option['label'] }}</div>
                                            </div>
                                        </template>
                                    </FieldSelect>
                                </FormField>
                                <FormField name="impact">
                                    <FieldSelect label="Impact" :options="urgencyImpactOptions" optionValue="key" optionLabel="label" label_type="on" :showClear="false">
                                        <template #value="slotProps">
                                            <div class="flex items-baseline">
                                                <i class="pi pi-circle-fill me-2" :style="`color: ${urgencyImpactOptions.find(opt => opt['key'] === slotProps.value)?.['color']}`"></i>
                                                <div>{{ urgencyImpactOptions.find(opt => opt['key'] === slotProps.value)?.['label'] || slotProps.value }}</div>
                                            </div>
                                        </template>
                                        <template #option="slotProps">
                                            <div class="flex items-baseline">
                                                <i class="pi pi-circle-fill me-2" :style="`color: ${slotProps.option['color']}`"></i>
                                                <div>{{ slotProps.option['label'] }}</div>
                                            </div>
                                        </template>
                                    </FieldSelect>
                                </FormField>
                                <FormField name="priority">
                                    <FieldSelect label="Priority" :options="priorityOptions" optionValue="key" optionLabel="label" label_type="on" :showClear="false">
                                        <template #value="slotProps">
                                            <div class="flex items-baseline">
                                                <i class="pi pi-circle-fill me-2" :style="`color: ${priorityOptions.find(opt => opt['key'] === slotProps.value)?.['color']}`"></i>
                                                <div>{{ priorityOptions.find(opt => opt['key'] === slotProps.value)?.['label'] || slotProps.value }}</div>
                                            </div>
                                        </template>
                                        <template #option="slotProps">
                                            <div class="flex items-baseline">
                                                <i class="pi pi-circle-fill me-2" :style="`color: ${slotProps.option['color']}`"></i>
                                                <div>{{ slotProps.option['label'] }}</div>
                                            </div>
                                        </template>
                                    </FieldSelect>
                                </FormField>
                                <FormField name="external_id">
                                    <FloatLabel variant="on">
                                        <InputText id="item_external_id"/>
                                        <label for="item_external_id">External ID</label>
                                    </FloatLabel>
                                </FormField>
                            </div>
                        </Fluid>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="actors">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-users me-2"></i>
                            Actors
                            <Tag v-if="requesters.length + observers.length + assigned.length > 0" class="align-middle" severity="secondary" :value="requesters.length + observers.length + assigned.length"></Tag>
                        </span>
                    </AccordionHeader>
                    <AccordionContent>
                        <ActorFields :requesters="requesters" :observers="observers" :assigned="assigned"></ActorFields>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="items">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-package me-2"></i>
                            Items
                            <Tag v-if="item_links.length > 0" class="align-middle" severity="secondary" :value="item_links.length"></Tag>
                        </span>
                        <Button icon="ti ti-plus" label="Add" severity="secondary" size="small" class="ms-auto" @click.prevent.stop="showNotImplementedToast"></Button>
                    </AccordionHeader>
                    <AccordionContent>
                        <div v-if="item_links.length === 0">
                            <Message severity="info">No linked items.</Message>
                        </div>
                        <div v-else class="flex flex-col space-y-2">
                            <div v-for="link in item_links" :key="link.itemtype + '_' + link.items_id" class="hover:bg-gray-800 p-2">
                                <!-- TODO Do not assume the item is an asset -->
                                <RouterLink :to="{ name: 'ItemForm', params: { component_module: 'assets', itemtype: link.itemtype, id: link.items_id } }">
                                    {{ link.itemtype }}: {{ link.name }}
                                </RouterLink>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel v-if="itemtype === 'Ticket'" value="service_levels">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-clock me-2"></i>
                            Service levels
                        </span>
                    </AccordionHeader>
                    <AccordionContent>
                        <Fluid>
                            <div class="flex flex-col space-y-4">
                                <!--suppress TypeScriptValidateTypes -->
                                <SLMFields :fields="[
                                    { field: 'own_date', label: 'Time to Own', type: 'SLA', assignedLevel: slaTTOName ? {id: (item as components['schemas']['Ticket']).sla_tto, name: slaTTOName} : null },
                                    { field: 'resolution_date', label: 'Time to Resolve', type: 'SLA', assignedLevel: slaTTRName ? {id: (item as components['schemas']['Ticket']).sla_ttr, name: slaTTRName} : null },
                                    { field: 'internal_take_into_account_date', label: 'Internal Time to Own', type: 'OLA', assignedLevel: olaTTOName ? {id: (item as components['schemas']['Ticket']).ola_tto, name: olaTTOName} : null },
                                    { field: 'internal_resolution_date', label: 'Internal Time to Resolve', type: 'OLA', assignedLevel: olaTTRName ? {id: (item as components['schemas']['Ticket']).ola_ttr, name: olaTTRName} : null },
                                ]"></SLMFields>
                            </div>
                        </Fluid>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="linked_assistance_objects">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-link me-2"></i>
                            Linked assistance objects
                            <Tag v-if="assistance_links.length > 0" class="align-middle" severity="secondary" :value="assistance_links.length"></Tag>
                        </span>
                        <Button icon="ti ti-plus" label="Add" severity="secondary" size="small" class="ms-auto" @click.prevent.stop="showNotImplementedToast"></Button>
                    </AccordionHeader>
                    <AccordionContent>
                        <div v-if="assistance_links.length === 0">
                            <Message severity="info">No linked assistance objects.</Message>
                        </div>
                        <div v-else class="flex flex-col">
                            <div v-for="link in assistance_links" :key="link.link_type + '_' + link.linked_item.id" class="hover:bg-gray-800 p-2">
                                <RouterLink :to="{ name: 'ITILTimeline', params: { itemtype: link.linked_item.__typename, id: link.linked_item.id } }">
                                    {{ assistanceLinkTypeLabels[link.link] ?? 'Linked to' }} {{ link.linked_item.__typename }}: {{ link.linked_item.name }}
                                </RouterLink>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="linked_projects">
                    <AccordionHeader class="p-3">
                        <span>
                            <i class="ti ti-layout-kanban me-2"></i>
                            Linked Projects
                            <Tag v-if="project_links.length > 0" class="align-middle" severity="secondary" :value="project_links.length"></Tag>
                        </span>
                        <Button icon="ti ti-plus" label="Add" severity="secondary" size="small" class="ms-auto" @click.prevent.stop="showNotImplementedToast"></Button>
                    </AccordionHeader>
                    <AccordionContent>
                        <div v-if="project_links.length === 0">
                            <Message severity="info">No linked projects.</Message>
                        </div>
                        <div v-else class="flex flex-col space-y-2">
                            <div v-for="project in project_links" :key="project.id" class="hover:bg-gray-800 p-2">
<!--                                <RouterLink :to="{ name: 'Project', params: { id: project.id } }">-->
                                    {{ project.name }}
<!--                                </RouterLink>-->
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="kbarticles">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-lifebuoy me-2"></i>
                            KB Articles
                            <Tag v-if="kbitems.length > 0" class="align-middle" severity="secondary" :value="kbitems.length"></Tag>
                        </span>
                        <Button icon="ti ti-plus" label="Search/Add" severity="secondary" size="small" class="ms-auto" @click.prevent.stop="showKBSearch()"></Button>
                    </AccordionHeader>
                    <AccordionContent>
                        <div v-if="kbitems.length === 0">
                            <Message severity="info">No linked KB articles.</Message>
                        </div>
                        <div v-else class="flex flex-col space-y-2">
                            <div v-for="kbitem in kbitems" :key="kbitem.id" class="hover:bg-gray-800 p-2">
                                <RouterLink :to="{ name: 'Knowbase', params: { article_id: kbitem.kbarticle.id } }">
                                    {{ kbitem.kbarticle.name }}
                                </RouterLink>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
            </Accordion>
        </ScrollPanel>
    </AdvancedForm>
</template>

<style scoped>

</style>