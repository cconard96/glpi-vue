<script setup lang="ts">
    import {
        Accordion,
        AccordionContent,
        AccordionHeader,
        AccordionPanel, DatePicker, FloatLabel,
        InputText,
        MultiSelect,
        ScrollPanel,
        Select, Tag
    } from "primevue";
    import { Form } from "@primevue/forms";
    import {computed, onMounted, ref} from "vue";
    import {useApi} from "@/composables/useApi";
    import { ITILStatus } from "@/models/assistance/ITILStatus.js";
    import type { components } from 'data/hlapiv2_schema';

    type ITILObject = components['schemas']['Ticket'] | components['schemas']['Change'] | components['schemas']['Problem'];

    const { itemtype, item } = defineProps<{
        itemtype: string,
        item: ITILObject
    }>();

    const { doApiRequest, normalizeComponentName, doGraphQLRequest } = useApi();
    const categories = ref([]);
    const request_types = ref([]);
    const locations = ref([]);
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
    const getInitialFormValues = () => {
        return {
            // For now, just return an empty object.
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

    const opening_date = computed({
        get() {
            return item.date ? new Date(item.date) : null;
        },
        set(value) {
            item.date = value ? value.toISOString() : null;
        }
    });
    const time_to_own = computed({
        get() {
            return item.time_to_own ? new Date(item.time_to_own) : null;
        },
        set(value) {
            item.time_to_own = value ? value.toISOString() : null;
        }
    });

    const normalized_itemtype = ref(await normalizeComponentName(itemtype));

    onMounted(() => {
        doApiRequest(`Assistance/${normalized_itemtype.value}/${item.id}/TeamMember`).then((res) => {
            team.value = res.data;
        })
        doGraphQLRequest(`
            query {
                RequestType {
                    key: id
                    label: name
                }
                ITILCategory {
                    key: id
                    label: completename
                }
                Location {
                    key: id
                    label: completename
                }
            }
        `).then((res) => {
            categories.value = res.data.data.ITILCategory;
            request_types.value = res.data.data.RequestType;
            locations.value = res.data.data.Location;
        });
    });
</script>

<template>
    <Form v-slot="$form" :resolver="form_resolver" @submit="onFormSubmit" class="w-full">
        <ScrollPanel>
            <Accordion :value="['main', 'actors']" multiple>
                <AccordionPanel value="main">
                    <AccordionHeader>
                        <span>
                            <i :class="`${itemtype_icon} mr-2`"></i>
                            {{ itemtype_name }}
                            <Tag class="ml-2">Entity: {{ item.entity.name }}</Tag>
                        </span>
                    </AccordionHeader>
                    <AccordionContent>
                        <div class="flex flex-col space-y-4">
                            <div>
                                <FloatLabel variant="on">
                                    <DatePicker inputId="item_date" name="date" v-model="opening_date"
                                                showTime showIcon
                                                class="max-w-full"/>
                                    <label for="item_date">Opening date</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_type" name="type" v-model="item['type']"
                                            :options="[{key: 1, label: 'Incident'}, {key: 2, label: 'Request'}]"
                                            optionValue="key" optionLabel="label"
                                            class="w-full"
                                    ></Select>
                                    <label for="item_type">Type</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_category" name="category" v-model="item.category.id"
                                            :filter="categories.length > 5" filterMode="lenient" :options="categories"
                                            optionValue="key" optionLabel="label" show-clear
                                            class="w-full"
                                    ></Select>
                                    <label for="item_category">Category</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_status" name="status" v-model="item.status.id"
                                            :options="statuses"
                                            optionValue="key" optionLabel="label"
                                            class="w-full"
                                    ></Select>
                                    <label for="item_status">Status</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_request_type" name="request_type" v-model="item.request_type.id"
                                            :filter="request_types.length > 5" filterMode="lenient" :options="request_types"
                                            optionValue="key" optionLabel="label"
                                            class="w-full"
                                    ></Select>
                                    <label for="item_request_type">Request source</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_urgency" name="urgency" v-model="item.urgency"
                                            :options="urgency_impact_options"
                                            optionValue="key" optionLabel="label"
                                            class="w-full"
                                    ></Select>
                                    <label for="item_urgency">Urgency</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_impact" name="impact" v-model="item.impact"
                                            :options="urgency_impact_options"
                                            optionValue="key" optionLabel="label"
                                            class="w-full"
                                    ></Select>
                                    <label for="item_impact">Impact</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_priority" name="priority" v-model="item.priority"
                                            :options="priority_options"
                                            optionValue="key" optionLabel="label"
                                            class="w-full"
                                    ></Select>
                                    <label for="item_priority">Priority</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <Select inputId="item_location" name="location" v-model="item.location.id"
                                            :filter="locations.length > 5" filterMode="lenient" :options="locations"
                                            optionValue="key" optionLabel="label" show-clear
                                            class="w-full"
                                    ></Select>
                                    <label for="item_location">Location</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <InputText id="item_external_id" name="external_id" v-model="item.external_id" class="w-full"/>
                                    <label for="item_external_id">External ID</label>
                                </FloatLabel>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="actors">
                    <AccordionHeader>
                                <span>
                                    <i class="ti ti-users mr-2"></i>
                                    Actors
                                </span>
                    </AccordionHeader>
                    <AccordionContent>
                        <div class="flex flex-col space-y-4">
                            <div>
                                <FloatLabel variant="on">
                                    <MultiSelect inputId="item_requester" name="requester" v-model="selected_requesters"
                                                 :filter="requesters.length > 5" filterMode="lenient" :options="requesters"
                                                 optionValue="key" optionLabel="label" disabled
                                    ></MultiSelect>
                                    <label for="item_requester">Requester</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <MultiSelect inputId="item_observer" name="observer" v-model="selected_observers"
                                                 :filter="observers.length > 5" filterMode="lenient" :options="observers"
                                                 optionValue="key" optionLabel="label" disabled
                                    ></MultiSelect>
                                    <label for="item_observer">Observer</label>
                                </FloatLabel>
                            </div>
                            <div>
                                <FloatLabel variant="on">
                                    <MultiSelect inputId="item_assigned" name="assigned" v-model="selected_assigned"
                                                 :filter="assigned.length > 5" filterMode="lenient" :options="assigned"
                                                 optionValue="key" optionLabel="label" disabled
                                                 dataKey="key"
                                    ></MultiSelect>
                                    <label for="item_assigned">Assigned to</label>
                                </FloatLabel>
                            </div>
                        </div>
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="items">
                    <AccordionHeader>
                                <span>
                                    <i class="ti ti-package mr-2"></i>
                                    Items
                                </span>
                    </AccordionHeader>
                    <AccordionContent>Not implemented</AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="service_levels">
                    <AccordionHeader>
                                <span>
                                    <i class="ti ti-clock mr-2"></i>
                                    Service levels
                                </span>
                    </AccordionHeader>
                    <AccordionContent>
                        Not implemented
                    </AccordionContent>
                </AccordionPanel>
                <AccordionPanel value="linked_assistance_objects">
                    <AccordionHeader>
                                <span>
                                    <i class="ti ti-link mr-2"></i>
                                    Linked assistance objects
                                </span>
                    </AccordionHeader>
                    <AccordionContent>Not implemented</AccordionContent>
                </AccordionPanel>
            </Accordion>
        </ScrollPanel>
    </Form>
</template>

<style scoped>

</style>