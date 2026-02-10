<script setup lang="ts">
    import {
        Accordion, AccordionContent, AccordionHeader, AccordionPanel,
        DatePicker, FloatLabel, InputText, MultiSelect, ScrollPanel,
        Message, Tag, SelectButton, Fluid, Button
    } from "primevue";
    import { Form, FormField } from "@primevue/forms";
    import {computed, onMounted, ref} from "vue";
    import {useApi} from "@/composables/useApi";
    import { ITILStatus } from "@/models/assistance/ITILStatus.js";
    import type { components } from 'data/hlapiv2_schema';
    import FieldSelect from "@/components/forms/FieldSelect.vue";
    import { RouterLink } from "vue-router";

    type ITILObject = components['schemas']['Ticket'] | components['schemas']['Change'] | components['schemas']['Problem'];

    const { itemtype, item } = defineProps<{
        itemtype: string,
        item: ITILObject
    }>();

    const { doApiRequest, normalizeComponentName, doGraphQLRequest, getValidSchemaTypesFromItemtypes } = useApi();
    const statuses = ITILStatus.getForSelect(itemtype);
    const urgency_impact_options = [
        {
            key: 5,
            label: 'Very high'
        },
        {
            key: 4,
            label: 'High'
        },
        {
            key: 3,
            label: 'Medium'
        },
        {
            key: 2,
            label: 'Low'
        },
        {
            key: 1,
            label: 'Very low'
        }
    ];
    const priority_options = [
        {
            key: 6,
            label: 'Major'
        },
        ...urgency_impact_options
    ];
    const team = ref<components['schemas']['TeamMember'][]>([]);
    const requesters = computed(() => {
        if (!team.value) return [];
        return team.value
            .filter(member => member.role === 'requester')
            .map(member => ({
                key: member.name,
                label: member.display_name
            }));
    });
    const selected_requesters = computed(() => {
        return requesters.value.map(r => r.key);
    });
    const observers = computed(() => {
        if (!team.value) return [];
        return team.value
            .filter(member => member.role === 'observer')
            .map(member => ({
                key: member.name,
                label: member.display_name
            }));
    });
    const selected_observers = computed(() => {
        return observers.value.map(r => r.key);
    });
    const assigned = computed(() => {
        if (!team.value) return [];
        return team.value
            .filter(member => member.role === 'assigned')
            .map(member => ({
                key: member.name,
                label: member.display_name
            }));
    });
    const selected_assigned = computed(() => {
        return assigned.value.map(r => r.key);
    });

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

    let itemtype_name, itemtype_icon;
    switch (itemtype) {
        case 'ticket':
            itemtype_icon = 'ti ti-alert-circle';
            itemtype_name = 'Ticket';
            break;
        case 'change':
            itemtype_icon = 'ti ti-clipboard-check';
            itemtype_name = 'Change';
            break;
        case 'problem':
            itemtype_icon = 'ti ti-alert-triangle';
            itemtype_name = 'Problem';
            break;
        default:
            itemtype_icon = 'ti ti-alert-circle';
            itemtype_name = itemtype;
    }

    const normalized_itemtype = ref(await normalizeComponentName(itemtype));
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
        if (link_type.itemtypes.includes(normalized_itemtype.value)) {
            if (link_type.itemtypes.length === 1) {
                const prop = normalized_itemtype.value.toLowerCase();
                assistance_link_queries += `
                    ${link_type.link_type}(filter: "${prop}_1.id==${item.id},${prop}_2.id==${item.id}") {
                        id link ${prop}_1 { id name status { id } } ${prop}_2 { id name status { id } }
                    }
                `;
            } else {
                const prop = normalized_itemtype.value.toLowerCase();

                assistance_link_queries += `
                    ${link_type.link_type}(filter: "${prop}.id==${item.id}") {
                        id link ${link_type.itemtypes.map(it => `${it.toLowerCase()} { id name status { id } }`).join(' ')}
                    }
                `;
            }
        }
    }
    const assistance_links = ref([]);
    const assistance_linktype_labels = {
        1: 'Linked to',
        2: 'Duplicate of',
        3: 'Child of',
        4: 'Parent of',
    };
    const kbitems = ref([]);
    const item_links = ref([]);

    onMounted(() => {
        doApiRequest(`Assistance/${normalized_itemtype.value}/${item.id}/TeamMember`).then((res) => {
            team.value = res.data;
        });
        doGraphQLRequest(`
            query {
                KBArticle_Item(filter: "itemtype==${normalized_itemtype.value};items_id==${item.id}") {
                    id itemtype items_id kbarticle { id name }
                }
                ${assistance_link_queries}
                ${normalized_itemtype.value}_Item(filter: "${normalized_itemtype.value.toLowerCase()}.id==${item.id}") {
                    id itemtype items_id
                }
            }
        `, {}, 'no-cache', 'all').then((res) => {
            kbitems.value = res.data.KBArticle_Item;
            const links = [];
            for (const link_type of assistance_link_types) {
                if (link_type.itemtypes.includes(normalized_itemtype.value)) {
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
                            const prop = normalized_itemtype.value.toLowerCase();
                            if (link[`${prop}_1`].id === item.id) {
                                linked_item = link[`${prop}_2`];
                            } else {
                                linked_item = link[`${prop}_1`];
                            }
                        } else {
                            for (const it of link_type.itemtypes) {
                                if (it.toLowerCase() !== normalized_itemtype.value.toLowerCase()) {
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
            const linked_assets_data = res.data[`${normalized_itemtype.value}_Item`];
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
    });

    const global_validation_icon = computed(() => {
        if (!('global_validation' in item) || !item.global_validation) {
            return null;
        }
        switch (item.global_validation) {
            case 2:
                return 'ti ti-clock text-amber-500';
            case 3:
                return 'ti ti-check text-green-700';
            case 4:
                return 'ti ti-x text-red-700';
        }
        return null;
    });
    const global_validation_label = computed(() => {
        if (!('global_validation' in item) || !item.global_validation) {
            return null;
        }
        switch (item.global_validation) {
            case 2:
                return 'Pending';
            case 3:
                return 'Accepted';
            case 4:
                return 'Refused';
        }
        return null;
    });
</script>

<template>
    <Form v-slot="$form" :initialValues="item" :resolver="form_resolver" @submit="onFormSubmit" class="w-full">
        <ScrollPanel>
            <Accordion :value="['main', 'actors']" multiple>
                <AccordionPanel value="main">
                    <AccordionHeader class="p-3" as="div">
                        <span class="max-w-full text-nowrap flex items-center overflow-hidden me-4">
                            <i :class="`${itemtype_icon} me-2`"></i>
                            {{ itemtype_name }}
                            <Tag class="ms-2 overflow-hidden text-truncate flex justify-end"><span class="">Entity: {{ item._entity.name }}</span></Tag>
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
                                <FormField name="type">
                                    <SelectButton :options="[{key: 1, label: 'Incident'}, {key: 2, label: 'Request'}]"
                                                  optionValue="key" optionLabel="label" size="small"></SelectButton>
                                </FormField>
                                <FormField name="category">
                                    <!-- TODO Make a tree select -->
                                    <FieldSelect label="Category" type="ITILCategory" label_type="on"></FieldSelect>
                                </FormField>
                                <FormField name="location">
                                    <FieldSelect label="Location" type="Location" label_type="on"></FieldSelect>
                                </FormField>
                                <FormField name="status">
                                    <FieldSelect label="Status" :options="statuses" optionValue="key" optionLabel="label" label_type="on"></FieldSelect>
                                </FormField>
                                <div v-if="('global_validation' in item && item.global_validation) > 1">
                                    <i class="me-2" :class="global_validation_icon"></i>
                                    <span>Approval Status: {{ global_validation_label }}</span>
                                </div>
                                <FormField name="request_type">
                                    <FieldSelect label="Request source" type="RequestType" label_type="on"></FieldSelect>
                                </FormField>
                                <FormField name="urgency">
                                    <FieldSelect label="Urgency" :options="urgency_impact_options" optionValue="key" optionLabel="label" label_type="on"></FieldSelect>
                                </FormField>
                                <FormField name="impact">
                                    <FieldSelect label="Impact" :options="urgency_impact_options" optionValue="key" optionLabel="label" label_type="on"></FieldSelect>
                                </FormField>
                                <FormField name="priority">
                                    <FieldSelect label="Priority" :options="priority_options" optionValue="key" optionLabel="label" label_type="on"></FieldSelect>
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
                        </span>
                    </AccordionHeader>
                    <AccordionContent>
                        <div class="flex flex-col space-y-4">
                            <div>
                                <FloatLabel variant="on">
                                    <MultiSelect inputId="item_requester" name="requester" v-model="selected_requesters"
                                                 :filter="requesters.length > 5" filterMode="lenient" :options="requesters"
                                                 optionValue="key" optionLabel="label" disabled fluid
                                    ></MultiSelect>
                                    <label for="item_requester">Requester</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <MultiSelect inputId="item_observer" name="observer" v-model="selected_observers"
                                                 :filter="observers.length > 5" filterMode="lenient" :options="observers"
                                                 optionValue="key" optionLabel="label" disabled fluid
                                    ></MultiSelect>
                                    <label for="item_observer">Observer</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <MultiSelect inputId="item_assigned" name="assigned" v-model="selected_assigned"
                                                 :filter="assigned.length > 5" filterMode="lenient" :options="assigned"
                                                 optionValue="key" optionLabel="label" disabled fluid
                                                 dataKey="key"
                                    ></MultiSelect>
                                    <label for="item_assigned">Assigned to</label>
                                </FloatLabel>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="items">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-package me-2"></i>
                            Items
                            <Tag v-if="item_links.length > 0" severity="secondary" :value="item_links.length"></Tag>
                        </span>
                        <Button icon="ti ti-plus" label="Add" severity="secondary" size="small" class="ms-auto"></Button>
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
                <AccordionPanel value="service_levels">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-clock me-2"></i>
                            Service levels
                        </span>
                    </AccordionHeader>
                    <AccordionContent>
                        Not implemented
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="linked_assistance_objects">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-link me-2"></i>
                            Linked assistance objects
                            <Tag v-if="assistance_links.length > 0" severity="secondary" :value="assistance_links.length"></Tag>
                        </span>
                        <Button icon="ti ti-plus" label="Add" severity="secondary" size="small" class="ms-auto"></Button>
                    </AccordionHeader>
                    <AccordionContent>
                        <div v-if="assistance_links.length === 0">
                            <Message severity="info">No linked assistance objects.</Message>
                        </div>
                        <div v-else class="flex flex-col">
                            <div v-for="link in assistance_links" :key="link.link_type + '_' + link.linked_item.id" class="hover:bg-gray-800 p-2">
                                <RouterLink :to="{ name: 'ITILTimeline', params: { itemtype: link.linked_item.__typename, id: link.linked_item.id } }">
                                    {{ assistance_linktype_labels[link.link] ?? 'Linked to' }} {{ link.linked_item.__typename }}: {{ link.linked_item.name }}
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
                        </span>
                    </AccordionHeader>
                    <AccordionContent>Not implemented</AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="kbarticles">
                    <AccordionHeader class="p-3" as="div">
                        <span>
                            <i class="ti ti-lifebuoy me-2"></i>
                            KB Articles
                            <Tag v-if="kbitems.length > 0" severity="secondary" :value="kbitems.length"></Tag>
                        </span>
                        <Button icon="ti ti-plus" label="Add" severity="secondary" size="small" class="ms-auto"></Button>
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
    </Form>
</template>

<style scoped>

</style>