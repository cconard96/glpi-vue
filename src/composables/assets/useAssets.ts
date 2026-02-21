import { defineAsyncComponent, type Component, type Ref, ref } from "vue";
import { useApi } from "@/composables/useApi";
import { useSessionStore, BaseRights } from "@/composables/useSessionStore";
import { type AxiosResponse } from "axios";
import { BaseItemDefinition, TabDefinition, useBaseItem } from "@/types";
import { components } from "../../../data/hlapiv2_schema";

enum AssetCapabilities {
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
}

const AssetCapabilitySets = {
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

type AssetDefinition = BaseItemDefinition & {
    capabilities: AssetCapabilities[],
}

const builtinAssets = [
    {
        key: 'Computer',
        module: 'assets',
        restEndpoint: 'Assets/Computer',
        getLabel: (count: number) => {
            return count === 1 ? 'Computer' : 'Computers';
        },
        icon: 'ti ti-device-laptop',
        rightname: 'computer',
        capabilities: [
            AssetCapabilities.HasType, AssetCapabilities.HasModel, AssetCapabilities.HasAutomaticInventory,
            AssetCapabilities.HasRacks, AssetCapabilities.HasRemoteManagement, AssetCapabilities.HasReservations,
            ...AssetCapabilitySets.CommonSet, ...AssetCapabilitySets.HardwareSet, ...AssetCapabilitySets.SoftwareSet,
            ...AssetCapabilitySets.NetworkingSet
        ],
        main_tab_component: defineAsyncComponent(() => import('@/components/assets/ComputerForm.vue')),
        canView: () => hasRight('computer', BaseRights.READ),
        canCreate: () => hasRight('computer', BaseRights.CREATE),
        canUpdate: () => hasRight('computer', BaseRights.UPDATE),
        canDelete: () => hasRight('computer', BaseRights.DELETE),
        canPurge: () => hasRight('computer', BaseRights.PURGE),
        canRestore: () => hasRight('computer', BaseRights.PURGE),
    }
];

type AssetType = AssetDefinition['key'];

const { getComponentSchema, doApiRequest, doGraphQLRequest, getCompleteFieldsRequestForSchema } = useApi();
const { hasRight } = useSessionStore();

export function loadItem(asset_type: AssetType, id: number, fields: string[] = []): Promise<Ref<components['schemas'][typeof asset_type]>> {
    return getComponentSchema(asset_type).then(schema => {
        const fields_to_query = fields.length > 0 ? fields.join(' ') : getCompleteFieldsRequestForSchema(schema.properties);
        return doGraphQLRequest(`
            query {
                ${asset_type}(id: ${id}) {
                    ${fields_to_query}
                }
            }
        `).then((response) => {
            return ref(response.data[asset_type][0]);
        });
    });
}

export function getEmptyItem(asset_type: AssetType): Promise<Ref<components['schemas'][typeof asset_type]>> {
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
    }).then(props => {
        const new_item = {};
        for (const [key, prop] of Object.entries(props)) {
            if (prop.hasOwnProperty('default')) {
                new_item[key] = prop.default;
            } else {
                new_item[key] = null;
            }
        }
        return new_item;
    });
}

export function getDefinition(asset_type): AssetDefinition {
    return builtinAssets.find(asset => asset.key === asset_type);
}

export function getAllDefinitions(): Array<AssetDefinition> {
    return builtinAssets;
}

export function createItem(asset_type: AssetType, fields: Record<string, any>): Promise<AxiosResponse<any>> {
    return doApiRequest(getDefinition(asset_type).restEndpoint, {
        method: 'POST',
        data: fields,
    });
}

export function useAssets(asset_type: AssetType, item: Ref<components['schemas'][typeof asset_type]>): useBaseItem & {
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
} {
    function getDefinition(): AssetDefinition {
        return builtinAssets.find(asset => asset.key === asset_type);
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
            tabs.push({ key: 'hardware', label: 'Hardware', icon: 'ti ti-components', component: defineAsyncComponent(() => import('@/components/assets/tabs/HardwareTab.vue')) });
        }
        if (hasAnyCapability(AssetCapabilitySets.SoftwareSet)) {
            tabs.push({ key: 'ossoftwareinstall', label: 'OS / Software', icon: 'ti ti-device-desktop-cog', component: defineAsyncComponent(() => import('@/components/assets/tabs/OSSoftwareTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasImpactAnalysis)) {
            //TODO Not implemented due to missing API implementation
        }
        if (hasCapability(AssetCapabilities.HasComponents)) {
            tabs.push({ key: 'lines', label: 'Phone Lines', icon: 'ti ti-phone-calling', component: defineAsyncComponent(() => import('@/components/assets/tabs/LineTab.vue')) });
        }
        if (hasAnyCapability(AssetCapabilitySets.NetworkingSet)) {
            tabs.push({ key: 'networkport', label: 'Network Ports', icon: 'ti ti-network', component: defineAsyncComponent(() => import('@/components/assets/tabs/NetworkPortTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasRemoteManagement)) {
            tabs.push({ key: 'remotemanagement', label: 'Remote Management', icon: 'ti ti-screen-share', component: defineAsyncComponent(() => import('@/components/assets/tabs/RemoteManagementTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasInfocom)) {
            tabs.push({ key: 'infocom', label: 'Management', icon: 'ti ti-wallet', component: defineAsyncComponent(() => import('@/components/assets/tabs/InfocomTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasContracts)) {
            tabs.push({ key: 'contract', label: 'Contracts', icon: 'ti ti-writing-sign', component: defineAsyncComponent(() => import('@/components/assets/tabs/ContractTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasDocuments)) {
            tabs.push({ key: 'document', label: 'Documents', icon: 'ti ti-files', component: defineAsyncComponent(() => import('@/components/assets/tabs/DocumentTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasVirtualization)) {
            tabs.push({ key: 'virtualization', label: 'Virtualization', icon: 'ti ti-brand-docker', component: defineAsyncComponent(() => import('@/components/assets/tabs/VMTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasKnowledgeBase)) {
            tabs.push({ key: 'kb', label: 'Knowledge base', icon: 'ti ti-lifebuoy', component: defineAsyncComponent(() => import('@/components/assets/tabs/KBArticleTab.vue')) });
        }
        tabs.push({ key: 'assistance', label: 'Assistance', icon: 'ti ti-headset', component: defineAsyncComponent(() => import('@/components/assets/tabs/AssistanceTab.vue')) });
        if (hasCapability(AssetCapabilities.HasProjects)) {
            tabs.push({ key: 'project', label: 'Projects', icon: 'ti ti-layout-kanban', component: defineAsyncComponent(() => import('@/components/assets/tabs/ProjectTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasLinks)) {
            tabs.push({ key: 'link', label: 'Links', icon: 'ti ti-link', component: defineAsyncComponent(() => import('@/components/assets/tabs/LinkTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasCertificates)) {
            tabs.push({ key: 'certificate', label: 'Certificates', icon: 'ti ti-certificate', component: defineAsyncComponent(() => import('@/components/assets/tabs/CertificateTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasNotes)) {
            tabs.push({ key: 'note', label: 'Notes', icon: 'ti ti-notes', component: defineAsyncComponent(() => import('@/components/assets/tabs/NoteTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasReservations)) {
            //TODO Not implemented
        }
        if (hasCapability(AssetCapabilities.HasDomains)) {
            tabs.push({ key: 'domain', label: 'Domains', icon: 'ti ti-world-www', component: defineAsyncComponent(() => import('@/components/assets/tabs/DomainTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasAppliances)) {
            tabs.push({ key: 'appliance', label: 'Appliances', icon: 'ti ti-versions', component: defineAsyncComponent(() => import('@/components/assets/tabs/ApplianceTab.vue')) });
        }
        if (hasCapability(AssetCapabilities.HasDatabases)) {
            tabs.push({ key: 'database', label: 'Databases', icon: 'ti ti-database', component: defineAsyncComponent(() => import('@/components/assets/tabs/DatabaseTab.vue')) });
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

    return {
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
    }
}