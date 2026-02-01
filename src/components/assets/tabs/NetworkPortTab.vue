<script setup lang="ts">
    import { DataTable, Column, Message} from "primevue";
    import {AbstractModel} from "@/models/AbstractModel";
    import {useApi} from "@/composables/useApi";
    import {onMounted, ref} from "vue";
    import {useDataHelper} from "@/composables/useDataHelper";

    const props = defineProps({
        main_itemtype_model: {
            type: Function as typeof AbstractModel,
            required: true
        },
        items_id: {
            type: Number,
            required: true
        }
    });

    const { doGraphQLRequest } = useApi();
    const { formatDataSpeed, formatDataSize } = useDataHelper();
    const port_info = ref(null);
    const port_statuses = {
        1: {
            label: 'Up',
            color: 'success'
        },
        2: {
            label: 'Down',
            severity: 'danger'
        },
        3: {
            label: 'Testing',
            severity: 'info'
        }
    };

    onMounted(() => {
        doGraphQLRequest(`query {
                NetworkPort(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id instantiation_type name logical_number mac
                    if_mtu if_speed if_internal_status if_connection_status if_last_change
                    if_in_bytes if_out_bytes if_in_errors if_out_errors
                    if_status if_description if_alias port_duplex trunk
                }
            }`).then((res) => {
            port_info.value = res.data.data.NetworkPort;
        });
    });
</script>

<template>
    <section v-if="port_info">
        <Message severity="info">VLAN and connection info not yet implemented. Missing API implementation.</Message>
        <DataTable :value="port_info" class="mt-6" :rows="port_info.length" sortMode="multiple" removableSort>
            <Column key="name" field="name" header="Name">
                <template #body="slotProps">{{ slotProps.data.name }}</template>
            </Column>
            <Column key="if_alias" field="if_alias" header="Alias">
                <template #body="slotProps">{{ slotProps.data.if_alias }}</template>
            </Column>
            <Column key="logical_number" field="logical_number" header="Port Number">
                <template #body="slotProps">{{ slotProps.data.logical_number }}</template>
            </Column>
            <Column key="if_mtu" field="if_mtu" header="MTU">
                <template #body="slotProps">{{ slotProps.data.if_mtu }}</template>
            </Column>
            <Column key="if_speed" field="if_speed" header="Speed">
                <template #body="slotProps">{{ formatDataSpeed(slotProps.data.if_speed, 'bps') }}</template>
            </Column>
            <Column key="if_internal_status" field="if_internal_status" header="Status">
                <template #body="slotProps">
                    <span>
                        <i :title="port_statuses[slotProps.data.if_internal_status]?.label || 'Unknown'"
                            :class="`ti ti-circle-filled text-[var(--p-tag-${port_statuses[slotProps.data.if_internal_status]?.severity || 'warn'}-color)]`"></i>
                    </span>
                </template>
            </Column>
            <Column key="if_last_change" field="if_last_change" header="Last Change">
                <template #body="slotProps">{{ slotProps.data.if_last_change }}</template>
            </Column>
            <Column key="io_bytes" header="RX/TX">
                <template #body="slotProps">
                    <span>
                        {{ formatDataSize(slotProps.data.if_in_bytes || 0, 'B') }} / {{ formatDataSize(slotProps.data.if_out_bytes || 0, 'B') }}
                    </span>
                </template>
            </Column>
            <Column key="io_errors" header="RX/TX Errors">
                <template #body="slotProps">
                    <span>
                        {{ slotProps.data.if_in_errors || 0 }} / {{ slotProps.data.if_out_errors || 0 }}
                    </span>
                </template>
            </Column>
            <Column key="if_duplex" field="port_duplex" header="Duplex">
                <template #body="slotProps">{{ slotProps.data.port_duplex }}</template>
            </Column>

        </DataTable>
    </section>
</template>

<style scoped>

</style>