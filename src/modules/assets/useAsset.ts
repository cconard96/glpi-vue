import { Component, defineAsyncComponent, type Ref, ref } from "vue";
import { useApi } from "@/common/api/useApi";
import { type AxiosResponse } from "axios";
import { BaseItemDefinition, GLPICreateResponseBody, TabDefinition, useBaseItem } from "@/types";
import { components } from "../../../data/hlapiv2_schema";
import { useRouter } from "vue-router";
import { ToastServiceMethods } from "primevue";
import { useI18n } from "vue-i18n";
import { GLPIItem, GLPIItemType, getDefaultRightChecks } from "@/common/useBaseItem.ts";

export enum AssetCapabilities {
    HasType = 'hasType',
    HasModel = 'hasModel',
    HasAntiviruses = 'hasAntivirus',
    HasAppliances = 'hasAppliance',
    HasCertificates = 'hasCertificates',
    HasComponents = 'hasComponents',
    HasPeripherals = 'hasPeripherals',
    HasContracts = 'hasContracts',
    HasDatabases = 'hasDatabases',
    HasDocuments = 'hasDocuments',
    HasDomains = 'hasDomains',
    HasInfocom = 'hasInfocom',
    HasGlobalSearch = 'hasGlobalSearch',
    HasHistory = 'hasHistory',
    HasImpactAnalysis = 'hasImpactAnalysis',
    HasAutomaticInventory = 'hasAutomaticInventory',
    HasKnowledgeBase = 'hasKnowledgeBase',
    HasLinks = 'hasLinks',
    HasNetworkPorts = 'hasNetworkPorts',
    HasNotes = 'hasNotes',
    HasOS = 'hasOS',
    HasPlugs = 'hasPlugs',
    HasProjects = 'hasProjects',
    HasRacks = 'hasRacks',
    HasRemoteManagement = 'hasRemoteManagement',
    HasReservations = 'hasReservations',
    HasSockets = 'hasSockets',
    HasSoftware = 'hasSoftware',
    HasVirtualization = 'hasVirtualization',
    HasVolumes = 'hasVolumes',
    HasTemplates = 'hasTemplates',
}

export const AssetCapabilitySets = {
    CommonSet: [
        AssetCapabilities.HasAppliances, AssetCapabilities.HasCertificates, AssetCapabilities.HasContracts,
        AssetCapabilities.HasDocuments, AssetCapabilities.HasInfocom, AssetCapabilities.HasGlobalSearch,
        AssetCapabilities.HasHistory, AssetCapabilities.HasImpactAnalysis, AssetCapabilities.HasLinks,
        AssetCapabilities.HasKnowledgeBase, AssetCapabilities.HasNotes, AssetCapabilities.HasProjects,
    ],
    HardwareSet: [AssetCapabilities.HasComponents, AssetCapabilities.HasVolumes, AssetCapabilities.HasPlugs, AssetCapabilities.HasPeripherals],
    SoftwareSet: [AssetCapabilities.HasSoftware, AssetCapabilities.HasOS, AssetCapabilities.HasVirtualization, AssetCapabilities.HasDatabases, AssetCapabilities.HasAntiviruses],
    NetworkingSet: [AssetCapabilities.HasNetworkPorts, AssetCapabilities.HasSockets, AssetCapabilities.HasDomains],
}

type AssetDefinition = BaseItemDefinition<AssetType> & {
    capabilities: AssetCapabilities[],
    /** @description The component to use for rendering this item in the main tab */
    main_tab_component: Component,
}

export type AssetType = Extract<GLPIItemType, 'Computer' | 'Monitor' | 'Software' | 'NetworkEquipment' | 'Peripheral' | 'Printer' | 'Cartridge'>;

const builtinAssets: Map<AssetType, AssetDefinition> = new Map([
    ['Computer', {
        key: 'Computer',
        module: 'assets',
        restEndpoint: 'Assets/Computer',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assets.computer.label', count, {
                default: 'Computer | Computers',
            });
        },
        icon: 'ti ti-device-laptop',
        rightname: 'computer',
        capabilities: [
            AssetCapabilities.HasType, AssetCapabilities.HasModel, AssetCapabilities.HasAutomaticInventory,
            AssetCapabilities.HasRacks, AssetCapabilities.HasRemoteManagement, AssetCapabilities.HasReservations,
            AssetCapabilities.HasTemplates,
            ...AssetCapabilitySets.CommonSet, ...AssetCapabilitySets.HardwareSet, ...AssetCapabilitySets.SoftwareSet,
            ...AssetCapabilitySets.NetworkingSet
        ],
        main_tab_component: defineAsyncComponent(() => import('./ComputerForm.vue')),
        ...getDefaultRightChecks('computer'),
    }],
    ['Monitor', {
        key: 'Monitor',
        module: 'assets',
        restEndpoint: 'Assets/Monitor',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assets.monitor.label', count, {
                default: 'Monitor | Monitors',
            });
        },
        icon: 'ti ti-device-desktop',
        rightname: 'monitor',
        capabilities: [
            AssetCapabilities.HasType, AssetCapabilities.HasModel, AssetCapabilities.HasAutomaticInventory,
            AssetCapabilities.HasRacks, AssetCapabilities.HasReservations, AssetCapabilities.HasTemplates,
            ...AssetCapabilitySets.CommonSet, ...AssetCapabilitySets.HardwareSet, ...AssetCapabilitySets.SoftwareSet,
            ...AssetCapabilitySets.NetworkingSet
        ],
        main_tab_component: defineAsyncComponent(() => import('./MonitorForm.vue')),
        ...getDefaultRightChecks('monitor'),
    }],
    ['Software', {
        key: 'Software',
        module: 'assets',
        restEndpoint: 'Assets/Software',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assets.software.label', count, {
                default: 'Software | Software',
            });
        },
        icon: 'ti ti-apps',
        rightname: 'software',
        capabilities: [
            AssetCapabilities.HasReservations, AssetCapabilities.HasTemplates, ...AssetCapabilitySets.CommonSet,
        ],
        main_tab_component: defineAsyncComponent(() => import('./SoftwareForm.vue')),
        ...getDefaultRightChecks('software'),
    }],
    ['NetworkEquipment', {
        key: 'NetworkEquipment',
        module: 'assets',
        restEndpoint: 'Assets/NetworkEquipment',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assets.networkequipment.label', count, {
                default: 'Network Equipment | Network Equipment',
            });
        },
        icon: 'ti ti-network',
        rightname: 'networking',
        capabilities: [
            AssetCapabilities.HasType, AssetCapabilities.HasModel, AssetCapabilities.HasAutomaticInventory,
            AssetCapabilities.HasRacks, AssetCapabilities.HasRemoteManagement, AssetCapabilities.HasReservations,
            AssetCapabilities.HasTemplates,
            ...AssetCapabilitySets.CommonSet, ...AssetCapabilitySets.HardwareSet, ...AssetCapabilitySets.SoftwareSet,
            ...AssetCapabilitySets.NetworkingSet
        ],
        main_tab_component: defineAsyncComponent(() => import('./NetworkEquipmentForm.vue')),
        ...getDefaultRightChecks('networking'),
    }],
    ['Peripheral', {
        key: 'Peripheral',
        module: 'assets',
        restEndpoint: 'Assets/Peripheral',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assets.peripheral.label', count, {
                default: 'Peripheral | Peripherals',
            });
        },
        icon: 'ti ti-usb',
        rightname: 'peripheral',
        capabilities: [
            AssetCapabilities.HasType, AssetCapabilities.HasModel, AssetCapabilities.HasAutomaticInventory,
            AssetCapabilities.HasRacks, AssetCapabilities.HasReservations, AssetCapabilities.HasTemplates,
            ...AssetCapabilitySets.CommonSet, ...AssetCapabilitySets.HardwareSet, ...AssetCapabilitySets.SoftwareSet,
            ...AssetCapabilitySets.NetworkingSet
        ],
        main_tab_component: defineAsyncComponent(() => import('./PeripheralForm.vue')),
        ...getDefaultRightChecks('peripheral'),
    }],
    ['Printer', {
        key: 'Printer',
        module: 'assets',
        restEndpoint: 'Assets/Printer',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assets.printer.label', count, {
                default: 'Printer | Printers',
            });
        },
        icon: 'ti ti-printer',
        rightname: 'printer',
        capabilities: [
            AssetCapabilities.HasType, AssetCapabilities.HasModel, AssetCapabilities.HasAutomaticInventory,
            AssetCapabilities.HasRacks, AssetCapabilities.HasReservations, AssetCapabilities.HasTemplates,
            ...AssetCapabilitySets.CommonSet, ...AssetCapabilitySets.HardwareSet, ...AssetCapabilitySets.SoftwareSet,
            ...AssetCapabilitySets.NetworkingSet
        ],
        main_tab_component: defineAsyncComponent(() => import('./PrinterForm.vue')),
        ...getDefaultRightChecks('printer'),
    }],
    ['Cartridge', {
        key: 'Cartridge',
        module: 'assets',
        restEndpoint: 'Assets/Cartridge',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('assets.cartridge.label', count, {
                default: 'Cartridge | Cartridges',
            });
        },
        icon: 'ti ti-droplet-half-2',
        rightname: 'cartridge',
        capabilities: [], //TODO
        main_tab_component: defineAsyncComponent(() => import('./CartridgeForm.vue')),
        ...getDefaultRightChecks('cartridge'),
    }]
]);

type AssetSchema<T extends AssetType> = GLPIItem<T>;

const { getComponentSchema, doApiRequest, doGraphQLRequest, getCompleteFieldsRequestForSchema } = useApi();
const router = useRouter();

export function loadItem<T extends AssetType>(asset_type: T, id: number, fields: string[] = []): Promise<Ref<AssetSchema<T>>> {
    return getComponentSchema(asset_type).then(schema => {
        const fields_to_query = fields.length > 0 ? fields.join(' ') : getCompleteFieldsRequestForSchema(schema.properties);
        return doGraphQLRequest(`
            query {
                ${asset_type}(id: ${id}) {
                    ${fields_to_query}
                }
            }
        `).then((response) => {
            // @ts-ignore
            return ref(response.data[asset_type][0] satisfies AssetSchema<T>);
        });
    });
}

export function getEmptyItem<T extends AssetType>(asset_type: T): Promise<Ref<AssetSchema<T>>> {
    return getComponentSchema(asset_type).then(schema => {
        const props = {};
        if (schema && schema.properties) {
            for (const [key, prop] of Object.entries(schema.properties)) {
                // If name ends with '.id' and only contains a single '.', it's likely an item dropdown
                const is_item_dropdown = key.endsWith('.id') && (key.match(/\./g) || []).length === 1;
                const field_name = is_item_dropdown ? key.slice(0, -3) : key;
                if (!is_item_dropdown && key.includes('.')) {
                    // Ignore other nested properties for now
                    continue;
                }
                props[field_name] = prop;
            }
        }
        return props;
    }).then((props: Record<string, object>) => {
        const new_item = {};
        for (const [key, prop] of Object.entries(props)) {
            if ('default' in prop) {
                new_item[key] = prop.default;
            } else {
                new_item[key] = null;
            }
        }
        return ref(new_item) as Ref<AssetSchema<T>>;
    });
}

export const getDefinition = <T extends AssetType>(asset_type: T): AssetDefinition => {
    return builtinAssets.get(asset_type);
}

export const getAllDefinitions = (): Map<AssetType, AssetDefinition> => {
    return builtinAssets;
}

export function createItem<T extends AssetType>(asset_type: T, fields: components['schemas'][T]): Promise<AxiosResponse<GLPICreateResponseBody>> {
    return doApiRequest(getDefinition(asset_type).restEndpoint, {
        method: 'POST',
        data: fields,
    });
}

export function useAsset<T extends AssetType>(asset_type: T, item: Ref<components['schemas'][T]>): useBaseItem<T> & {
    getTabs: () => TabDefinition[],
    getSchema: () => Promise<any>,
    getGLPIItemtype: () => Promise<string>,
    getSchemaPropertiesForFields: () => Promise<Record<string, any>>,
    hasCapability: (capability: AssetCapabilities) => boolean,
    hasAllCapabilities: (capabilities: AssetCapabilities[]) => boolean,
    hasAnyCapability: (capabilities: AssetCapabilities[]) => boolean,
    canViewItem: () => boolean,
    canUpdateItem: () => boolean,
    canDeleteItem: () => boolean,
    canPurgeItem: () => boolean,
    canRestoreItem: () => boolean,
    updateItem: (fields: components['schemas'][T]) => Promise<AxiosResponse>,
    createOrUpdateItem: (fields: components['schemas'][T], toastService?: ToastServiceMethods, redirectToNewItem?: boolean) => Promise<void | AxiosResponse>,
} {
    function getDefinition(): AssetDefinition {
        return builtinAssets.get(asset_type);
    }

    function hasCapability(capability: AssetCapabilities): boolean {
        const definition = getDefinition();
        return definition ? definition.capabilities.includes(capability) : false;
    }

    function hasAllCapabilities(capabilities: AssetCapabilities[]): boolean {
        const definition = getDefinition();
        return definition ? capabilities.every(cap => definition.capabilities.includes(cap)) : false;
    }

    function hasAnyCapability(capabilities: AssetCapabilities[]): boolean {
        const definition = getDefinition();
        return definition ? capabilities.some(cap => definition.capabilities.includes(cap)) : false;
    }

    function getTabs(): TabDefinition[] {
        const definition = getDefinition();
        const tabs: TabDefinition[] = [
            { key: 'main', label: definition.getLabel(1), icon: definition.icon, component: definition.main_tab_component },
        ];

        if (hasAnyCapability(AssetCapabilitySets.HardwareSet)) {
            tabs.push({ key: 'hardware', label: 'Hardware', icon: 'ti ti-components', component: defineAsyncComponent(() => import('./tabs/HardwareTab.vue')) });
        }
        if (hasAnyCapability(AssetCapabilitySets.SoftwareSet)) {
            tabs.push({ key: 'ossoftwareinstall', label: 'OS / Software', icon: 'ti ti-device-desktop-cog', component: defineAsyncComponent(() => import('./tabs/OSSoftwareTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasImpactAnalysis)) {
            //TODO Not implemented due to missing API implementation
        }
        if (hasCapability(AssetCapabilities.HasComponents)) {
            tabs.push({ key: 'lines', label: 'Phone Lines', icon: 'ti ti-phone-calling', component: defineAsyncComponent(() => import('./tabs/LineTab.vue')) });
        }
        if (hasAnyCapability(AssetCapabilitySets.NetworkingSet)) {
            tabs.push({ key: 'networkport', label: 'Network Ports', icon: 'ti ti-network', component: defineAsyncComponent(() => import('./tabs/NetworkPortTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasRemoteManagement)) {
            tabs.push({ key: 'remotemanagement', label: 'Remote Management', icon: 'ti ti-screen-share', component: defineAsyncComponent(() => import('./tabs/RemoteManagementTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasInfocom)) {
            tabs.push({ key: 'infocom', label: 'Management', icon: 'ti ti-wallet', component: defineAsyncComponent(() => import('./tabs/InfocomTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasContracts)) {
            tabs.push({ key: 'contract', label: 'Contracts', icon: 'ti ti-writing-sign', component: defineAsyncComponent(() => import('./tabs/ContractTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasDocuments)) {
            tabs.push({ key: 'document', label: 'Documents', icon: 'ti ti-files', component: defineAsyncComponent(() => import('./tabs/DocumentTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasVirtualization)) {
            tabs.push({ key: 'virtualization', label: 'Virtualization', icon: 'ti ti-brand-docker', component: defineAsyncComponent(() => import('./tabs/VMTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasKnowledgeBase)) {
            tabs.push({ key: 'kb', label: 'Knowledge base', icon: 'ti ti-lifebuoy', component: defineAsyncComponent(() => import('./tabs/KBArticleTab.vue')) });
        }
        tabs.push({ key: 'assistance', label: 'Assistance', icon: 'ti ti-headset', component: defineAsyncComponent(() => import('./tabs/AssistanceTab.vue')) });
        if (hasCapability(AssetCapabilities.HasProjects)) {
            tabs.push({ key: 'project', label: 'Projects', icon: 'ti ti-layout-kanban', component: defineAsyncComponent(() => import('./tabs/ProjectTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasLinks)) {
            tabs.push({ key: 'link', label: 'Links', icon: 'ti ti-link', component: defineAsyncComponent(() => import('./tabs/LinkTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasCertificates)) {
            tabs.push({ key: 'certificate', label: 'Certificates', icon: 'ti ti-certificate', component: defineAsyncComponent(() => import('./tabs/CertificateTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasNotes)) {
            tabs.push({ key: 'note', label: 'Notes', icon: 'ti ti-notes', component: defineAsyncComponent(() => import('./tabs/NoteTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasReservations)) {
            //TODO Not implemented
        }
        if (hasCapability(AssetCapabilities.HasDomains)) {
            tabs.push({ key: 'domain', label: 'Domains', icon: 'ti ti-world-www', component: defineAsyncComponent(() => import('./tabs/DomainTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasAppliances)) {
            tabs.push({ key: 'appliance', label: 'Appliances', icon: 'ti ti-versions', component: defineAsyncComponent(() => import('./tabs/ApplianceTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasDatabases)) {
            tabs.push({ key: 'database', label: 'Databases', icon: 'ti ti-database', component: defineAsyncComponent(() => import('./tabs/DatabaseTab.vue')) });
        }

        return tabs;
    }

    function getSchema(): Promise<any> {
        return getComponentSchema(asset_type);
    }

    function getGLPIItemtype(): Promise<any> {
        return getSchema().then(schema => {
            return schema['x-itemtype'] || asset_type;
        });
    }

    function getSchemaPropertiesForFields() {
        return getSchema().then(schema => {
            const props = {};
            if (schema && schema.properties) {
                for (const [key, prop] of Object.entries(schema.properties)) {
                    // If name ends with '.id' and only contains a single '.', it's likely an item dropdown
                    const is_item_dropdown = key.endsWith('.id') && (key.match(/\./g) || []).length === 1;
                    const field_name = is_item_dropdown ? key.slice(0, -3) : key;
                    if (!is_item_dropdown && key.includes('.')) {
                        // Ignore other nested properties for now
                        continue;
                    }
                    props[field_name] = prop;
                }
            }
            return props;
        });
    }

    function canViewItem(): boolean {
        const definition = getDefinition();
        return definition ? definition.canView() : false;
    }

    function canUpdateItem(): boolean {
        const definition = getDefinition();
        return definition ? definition.canUpdate() : false;
    }

    function canDeleteItem(): boolean {
        const definition = getDefinition();
        return definition ? definition.canDelete() : false;
    }

    function canPurgeItem(): boolean {
        const definition = getDefinition();
        return definition ? definition.canPurge() : false;
    }

    function canRestoreItem(): boolean {
        const definition = getDefinition();
        return definition ? definition.canRestore() : false;
    }

    function updateItem(fields: components['schemas'][T]): Promise<AxiosResponse> {
        if (!('id' in item.value) || !item.value.id) {
            throw new Error('Cannot update item');
        }
        return doApiRequest(`${getDefinition().restEndpoint}/${item.value.id}`, {
            method: 'PATCH',
            data: fields,
        });
    }

    function createOrUpdateItem(fields: components['schemas'][T], toastService: ToastServiceMethods = null, redirectToNewItem: boolean = true): Promise<void | AxiosResponse> {
        const handleFailure = (err) => {
            if (err.response && err.response.data && err.response.data.message) {
                toastService.add({severity: 'error', summary: 'Error', detail: err.response.data.message, life: 5000});
            } else {
                toastService.add({severity: 'error', summary: 'Error', detail: 'An unknown error occurred.', life: 5000});
            }
        }
        if ('id' in item.value && item.value.id) {
            return updateItem(fields).then(response => {
                if (toastService !== null) {
                    toastService.add({severity: 'success', summary: 'Success', detail: 'Item updated successfully.', life: 5000});
                }
                return response;
            }).catch(handleFailure);
        } else {
            return createItem(asset_type, fields).then(response => {
                if (toastService !== null) {
                    toastService.add({severity: 'success', summary: 'Success', detail: 'Item created successfully.', life: 5000});
                }
                if (redirectToNewItem) {
                    const new_id = response.data.id;
                    // Redirect to the new item page
                    router.push({
                        name: 'AssetItemForm',
                        params: {
                            itemtype: asset_type,
                            id: new_id,
                        }
                    });
                }
                return response;
            }).catch(handleFailure);
        }
    }

    return {
        // @ts-ignore
        getDefinition,
        hasCapability,
        hasAllCapabilities,
        hasAnyCapability,
        getTabs,
        getSchema,
        getGLPIItemtype,
        getSchemaPropertiesForFields,
        item,
        canViewItem,
        canUpdateItem,
        canDeleteItem,
        canPurgeItem,
        canRestoreItem,
        createOrUpdateItem,
        updateItem,
    }
}