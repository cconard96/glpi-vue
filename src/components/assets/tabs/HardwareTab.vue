<script setup lang="ts">
    import {
        DataTable, Card, Column, Message, DataView, ProgressBar,
        Accordion, AccordionPanel, AccordionHeader, AccordionContent
    } from 'primevue';
    import {AbstractModel} from "@/models/AbstractModel";
    import {useApi} from "@/composables/useApi";
    import {onMounted, ref, watch} from "vue";
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
    const { formatDataSize, getObjectProp, getUsedPercentage } = useDataHelper();
    const components_info = ref(null);
    const component_counts = ref({});
    const loaded_components = ref(false);
    const active_accordion = ref<string|null>(null);
    const component_columns: Record<string, Array<{field: string, header: string}>> = {
        'BatteryItem': [
            { field: 'battery.designation', header: 'Designation' },
            { field: 'battery.manufacturer.name', header: 'Manufacturer' },
            { field: 'battery.model.name', header: 'Model' },
            { field: 'voltage', header: 'Voltage' },
            { field: 'capacity', header: 'Capacity' },
            { field: 'serial', header: 'Serial' },
            { field: 'real_capacity', header: 'Real Capacity' },
        ],
        'CameraItem': [
            { field: 'camera.designation', header: 'Designation' },
            { field: 'camera.manufacturer.name', header: 'Manufacturer' },
            { field: 'camera.model.name', header: 'Model' },
            { field: 'serial', header: 'Serial' },
        ],
        'CaseItem': [
            { field: 'case.designation', header: 'Designation' },
            { field: 'case.manufacturer.name', header: 'Manufacturer' },
            { field: 'case.model.name', header: 'Model' },
            { field: 'serial', header: 'Serial' },
        ],
        'ControllerItem': [
            { field: 'controller.designation', header: 'Designation' },
            { field: 'controller.manufacturer.name', header: 'Manufacturer' },
            { field: 'controller.model.name', header: 'Model' },
            { field: 'is_raid', header: 'Is RAID' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'DriveItem': [
            { field: 'drive.designation', header: 'Designation' },
            { field: 'drive.manufacturer.name', header: 'Manufacturer' },
            { field: 'drive.model.name', header: 'Model' },
            { field: 'is_writer', header: 'Is Writer' },
            { field: 'speed', header: 'Speed' },
            { field: 'interface.name', header: 'Interface' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'FirmwareItem': [
            { field: 'firmware.designation', header: 'Designation' },
            { field: 'firmware.manufacturer.name', header: 'Manufacturer' },
            { field: 'firmware.model.name', header: 'Model' },
            { field: 'firmware.version', header: 'Version' },
            { field: 'serial', header: 'Serial' },
        ],
        'GenericDeviceItem': [
            { field: 'generic_device.designation', header: 'Designation' },
            { field: 'generic_device.manufacturer.name', header: 'Manufacturer' },
            { field: 'generic_device.model.name', header: 'Model' },
            { field: 'serial', header: 'Serial' },
        ],
        'GraphicCardItem': [
            { field: 'graphic_card.designation', header: 'Designation' },
            { field: 'graphic_card.manufacturer.name', header: 'Manufacturer' },
            { field: 'graphic_card.model.name', header: 'Model' },
            { field: 'graphic_card.chipset', header: 'Chipset' },
            { field: 'graphic_card.interface.name', header: 'Interface' },
            { field: 'graphic_card.memory_default', header: 'Default Memory' },
            { field: 'memory', header: 'Memory' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'HardDriveItem': [
            { field: 'hard_drive.designation', header: 'Designation' },
            { field: 'hard_drive.manufacturer.name', header: 'Manufacturer' },
            { field: 'hard_drive.model.name', header: 'Model' },
            { field: 'hard_drive.rpm', header: 'RPM' },
            { field: 'hard_drive.cache', header: 'Cache' },
            { field: 'hard_drive.capacity_default', header: 'Default Capacity' },
            { field: 'interface.name', header: 'Interface' },
            { field: 'capacity', header: 'Capacity' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'MemoryItem': [
            { field: 'memory.designation', header: 'Designation' },
            { field: 'memory.manufacturer.name', header: 'Manufacturer' },
            { field: 'memory.model.name', header: 'Model' },
            { field: 'memory.frequency', header: 'Frequency' },
            { field: 'memory.size_default', header: 'Default Size' },
            { field: 'size', header: 'Size' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'NetworkCardItem': [
            { field: 'network_card.designation', header: 'Designation' },
            { field: 'network_card.manufacturer.name', header: 'Manufacturer' },
            { field: 'network_card.model.name', header: 'Model' },
            { field: 'network_card.bandwidth', header: 'Bandwidth' },
            { field: 'network_card.mac_default', header: 'Default MAC' },
            { field: 'mac', header: 'MAC' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'PCIDeviceItem': [
            { field: 'pci_device.designation', header: 'Designation' },
            { field: 'pci_device.manufacturer.name', header: 'Manufacturer' },
            { field: 'pci_device.model.name', header: 'Model' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'PowerSupplyItem': [
            { field: 'power_supply.designation', header: 'Designation' },
            { field: 'power_supply.manufacturer.name', header: 'Manufacturer' },
            { field: 'power_supply.model.name', header: 'Model' },
            { field: 'power_supply.power', header: 'Power' },
            { field: 'power_supply.is_atx', header: 'Is ATX' },
            { field: 'serial', header: 'Serial' },
        ],
        'ProcessorItem': [
            { field: 'processor.designation', header: 'Designation' },
            { field: 'processor.manufacturer.name', header: 'Manufacturer' },
            { field: 'processor.model.name', header: 'Model' },
            { field: 'processor.frequency', header: 'Frequency' },
            { field: 'frequency_default', header: 'Default Frequency' },
            { field: 'nbcores_default', header: 'Default Cores' },
            { field: 'nbthreads_default', header: 'Default Threads' },
            { field: 'nbcores', header: 'Cores' },
            { field: 'nbthreads', header: 'Threads' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'SensorItem': [
            { field: 'sensor.designation', header: 'Designation' },
            { field: 'sensor.manufacturer.name', header: 'Manufacturer' },
            { field: 'sensor.model.name', header: 'Model' },
            { field: 'serial', header: 'Serial' },
        ],
        'SoundCardItem': [
            { field: 'sound_card.designation', header: 'Designation' },
            { field: 'sound_card.manufacturer.name', header: 'Manufacturer' },
            { field: 'sound_card.model.name', header: 'Model' },
            { field: 'serial', header: 'Serial' },
            { field: 'busID', header: 'Bus ID' },
        ],
        'SystemboardItem': [
            { field: 'systemboard.designation', header: 'Designation' },
            { field: 'systemboard.manufacturer.name', header: 'Manufacturer' },
            { field: 'systemboard.model.name', header: 'Model' },
            { field: 'systemboard.chipset', header: 'Chipset' },
            { field: 'serial', header: 'Serial' },
        ],
    };
    const volumes_info = ref(null);
    const loaded_volumes = ref(false);
    const encryption_statuses = {
        0: 'Unencrypted',
        1: 'Encrypted',
        2: 'Partially Encrypted',
    };

    onMounted(async () => {
        // Load data for summary
        await doGraphQLRequest(`query {
            ProcessorItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                id itemtype items_id processor { designation manufacturer { id name } model { id name } frequency } serial otherserial busID frequency nbcores nbthreads
            }
            HardDriveItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                id itemtype items_id hard_drive { designation manufacturer { id name } model { id name } rpm cache interface { id name } } serial otherserial busID capacity
            }
            MemoryItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                id itemtype items_id memory { designation manufacturer { id name } model { id name } frequency } serial otherserial busID size
            }
        }`).then((res) => {
            if (components_info.value === null) {
                components_info.value = {};
            }
            for (const [key, items] of Object.entries(res.data)) {
                if (['ProcessorItem', 'HardDriveItem', 'MemoryItem'].includes(key)) {
                    components_info.value[key] = items;
                }
                component_counts.value[key] = items.length;
            }
        });
    });

    function loadExtraComponentsInfo() {
        if (loaded_components.value) {
            return;
        }
        doGraphQLRequest(`
            query {
                BatteryItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id battery { designation manufacturer { id name } model { id name } voltage capacity } serial otherserial real_capacity
                }
                CameraItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id camera { designation manufacturer { id name } model { id name } }
                }
                CaseItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id case { designation manufacturer { id name } model { id name } } serial otherserial
                }
                ControllerItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id controller { designation manufacturer { id name } model { id name } is_raid } serial otherserial busID
                }
                DriveItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id drive { designation manufacturer { id name } model { id name } is_writer speed interface { id name } } serial otherserial busID
                }
                FirmwareItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id firmware { designation manufacturer { id name } model { id name } version } serial otherserial
                }
                GenericDeviceItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id generic_device { designation manufacturer { id name } model { id name } } serial otherserial
                }
                GraphicCardItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id graphic_card { designation manufacturer { id name } model { id name } chipset interface { id name } memory_default } serial otherserial busID memory
                }
                NetworkCardItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id network_card { designation manufacturer { id name } model { id name } bandwidth mac_default } serial otherserial busID mac
                }
                PCIDeviceItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id pci_device { designation manufacturer { id name } model { id name } } serial otherserial busID
                }
                PowerSupplyItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id power_supply { designation manufacturer { id name } model { id name } power is_atx } serial otherserial
                }
                SensorItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id sensor { designation manufacturer { id name } model { id name } } serial otherserial
                }
                SoundCardItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id sound_card { designation manufacturer { id name } model { id name } } serial otherserial busID
                }
                SystemboardItem(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id systemboard { designation manufacturer { id name } model { id name } chipset } serial otherserial
                }
            }
        `).then((res) => {
            if (components_info.value === null) {
                components_info.value = {};
            }
            for (const [key, items] of Object.entries(res.data)) {
                components_info.value[key] = items;
                component_counts.value[key] = items.length;
                loaded_components.value = true;
            }
        });
    }

    function loadVolumesInfo() {
        if (loaded_volumes.value) {
            return;
        }
        doGraphQLRequest(`
            query {
                Volume(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id name device mount_point filesystem { id name } total_size free_size encryption_status encryption_tool encryption_algorithm encryption_type
                }
            }
        `).then((res) => {
            volumes_info.value = res.data.Volume;
            loaded_volumes.value = true;
        });
    }

    watch(() => active_accordion.value, (newVal) => {
        if (newVal.includes('components')) {
            loadExtraComponentsInfo();
        } else if (newVal.includes('volumes')) {
            loadVolumesInfo();
        }
    });
</script>

<template>
    <section v-if="components_info !== null" class="">
        <div class="text-4xl text-center mb-2">Hardware summary</div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card v-if="components_info.ProcessorItem" class="flex flex-row items-center" :pt="{body: { class: 'p-2'} }">
                <template #header>
                    <i class="ti ti-cpu text-6xl"></i>
                    <span class="sr-only">Processor</span>
                </template>
                <template #content>
                    <div><span class="text-lg me-2">Total Processors:</span>{{ components_info.ProcessorItem.length }}</div>
                    <div><span class="text-lg me-2">Total Cores:</span>{{ components_info.ProcessorItem.length > 0 ? components_info.ProcessorItem.reduce((acc, proc) => acc + (proc.nbcores || 0), 0) : 0 }}</div>
                    <div><span class="text-lg me-2">Total Threads:</span>{{ components_info.ProcessorItem.length > 0 ? components_info.ProcessorItem.reduce((acc, proc) => acc + (proc.nbthreads || 0), 0) : 0 }}</div>
                </template>
            </Card>
            <Card v-if="components_info.HardDriveItem" class="flex flex-row items-center" :pt="{body: { class: 'p-2'} }">
                <template #header>
                    <i class="ti ti-server-2 text-6xl"></i>
                    <span class="sr-only">Storage</span>
                </template>
                <template #content>
                    <div><span class="text-lg me-2">Total Drives:</span>{{ components_info.HardDriveItem.length }}</div>
                    <div><span class="text-lg me-2">Total Storage:</span>{{ components_info.HardDriveItem.length > 0 ? formatDataSize(components_info.HardDriveItem.reduce((acc, drive) => acc + (drive.capacity || 0), 0), 'MB') : '0 B' }}</div>
                </template>
            </Card>
            <Card v-if="components_info.MemoryItem" class="flex flex-row items-center" :pt="{body: { class: 'p-2'} }">
                <template #header>
                    <i class="ti ti-topology-bus rotate-180 block text-6xl"></i>
                    <span class="sr-only">Memory</span>
                </template>
                <template #content>
                    <div><span class="text-lg me-2">Total Modules:</span>{{ components_info.MemoryItem.length }}</div>
                    <div><span class="text-lg me-2">Total Memory:</span>{{ components_info.MemoryItem.length > 0 ? formatDataSize(components_info.MemoryItem.reduce((acc, mem) => acc + (mem.size || 0), 0), 'MB') : '0 B' }}</div>
                </template>
            </Card>
        </div>
        <Accordion class="mt-4" multiple v-model:value="active_accordion">
            <AccordionPanel value="volumes">
                <AccordionHeader>Volumes</AccordionHeader>
                <AccordionContent>
                    <div v-if="volumes_info !== null && volumes_info.length > 0">
                        <DataView :value="volumes_info">
                            <template #list="slotProps">
                                <Card v-for="(item, index) in slotProps.items" :key="index" class="">
                                    <template #title>
                                        <div class="text-base">
                                            <span>{{ item.name }}</span>
                                            <span v-if="item.name !== item.mount_point"> - {{ item.mount_point }}</span>
                                            <span v-if="item.filesystem"> ({{ item.filesystem.name }})</span>
                                        </div>
                                    </template>
                                    <template #subtitle>
                                        <div>
                                            <div v-if="item.device !== item.mount_point">Device: {{ item.device }}</div>
                                            <div v-if="item.encryption_status">
                                                Encryption: {{ encryption_statuses[item.encryption_status] }}
                                                <span v-if="item.encryption_tool"> using {{ item.encryption_tool  }}</span>
                                                <span v-if="item.encryption_algorithm"> ({{ item.encryption_algorithm }})</span>
                                                <span v-if="item.encryption_type"> - Type: {{ item.encryption_type }}</span>
                                            </div>
                                        </div>
                                    </template>
                                    <template #content>
                                        <ProgressBar :value="item.total_size > 0 ? ((item.total_size - item.free_size) / item.total_size) * 100 : 0" :showValue="true" :style="{height: '20px'}">
                                            <template #default>
                                                <span>{{ formatDataSize(item.total_size - item.free_size, 'MB') }} used of {{ formatDataSize(item.total_size, 'MB') }} ({{ getUsedPercentage(item.total_size, item.free_size) }}%)</span>
                                            </template>
                                        </ProgressBar>
                                    </template>
                                </Card>
                            </template>
                        </DataView>
                    </div>
                </AccordionContent>
            </AccordionPanel>
            <AccordionPanel value="components">
                <AccordionHeader>Components</AccordionHeader>
                <AccordionContent>
                    <div v-for="(items, component_type) in components_info" :key="component_type" class="mb-6">
                        <DataTable v-if="items.length > 0" :value="items" :rows="100" :totalRecords="items.length">
                            <template #header>
                                <div class="font-bold text-lg">{{ component_type.replace('Item', '').replace(/([A-Z])/g, ' $1').trim() }} ({{ items.length }})</div>
                            </template>
                            <Column v-for="col in component_columns[component_type]" :field="col.field" :header="col.header">
                                <template #body="slotProps">
                            <span>{{
                                    col.field.endsWith('capacity') || col.field.endsWith('size') ?
                                        formatDataSize(getObjectProp(slotProps.data, col.field), 'MB') :
                                        getObjectProp(slotProps.data, col.field)
                                }}</span>
                                </template>
                            </Column>
                        </DataTable>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
    </section>
</template>

<style scoped>

</style>