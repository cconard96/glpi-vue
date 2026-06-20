import { BaseItemDefinition, useBaseItem } from "@/types";
import { GLPIItemType, getDefaultRightChecks } from "@/common/useBaseItem.ts";
import { useI18n } from "vue-i18n";
import { AssetType } from "@/modules/assets/useAsset.ts";

type DropdownDefinition = BaseItemDefinition & {
    group: string,
}

type DropdownGroupDefinition = {
    key: string,
    label: string,
}

const dropdownGroups: DropdownGroupDefinition[] = [
    { key: 'common', label: 'Common' },
    { key: 'assistance', label: 'Assistance' },
    { key: 'types', label: 'Types' },
    { key: 'models', label: 'Models' },
    { key: 'virtualization', label: 'Virtualization' },
    { key: 'management', label: 'Management' },
    { key: 'tools', label: 'Tools' },
    { key: 'calendars', label: 'Calendars' },
    { key: 'operating_systems', label: 'Operating Systems' },
    { key: 'networking', label: 'Networking' },
    { key: 'cable_management', label: 'Cable Management' },
    { key: 'software', label: 'Software' },
    { key: 'user', label: 'User' },
    { key: 'rules', label: 'Rules' },
    { key: 'fields_unicity', label: 'Fields Unicity' },
    { key: 'authentication', label: 'Authentication' },
    { key: 'power_management', label: 'Power Management' },
    { key: 'appliances', label: 'Appliances' },
    { key: 'camera', label: 'Camera' },
    { key: 'others', label: 'Others' },
];

const builtinDropdowns = new Map<GLPIItemType, DropdownDefinition>([
    ['Location', {
        key: 'Location',
        module: 'setup',
        group: 'common',
        restEndpoint: '/dropdown/Location',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('dropdowns.location.label', count, { default: 'Location | Locations' });
        },
        icon: 'ti ti-map-pin',
        rightname: 'location',
        ...getDefaultRightChecks('location'),
    }],
    ['State', {
        key: 'State',
        module: 'setup',
        group: 'common',
        restEndpoint: '/dropdown/State',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('dropdowns.item_status.label', count, { default: 'Item status | Item statuses' });
        },
        icon: 'ti ti-label',
        rightname: 'state',
        ...getDefaultRightChecks('state'),
    }],
    ['Manufacturer', {
        key: 'Manufacturer',
        module: 'setup',
        group: 'common',
        restEndpoint: '/dropdown/Manufacturer',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('dropdowns.manufacturer.label', count, { default: 'Manufacturer | Manufacturers' });
        },
        icon: 'ti ti-edit',
        rightname: 'dropdown',
        ...getDefaultRightChecks('dropdown'),
    }],
    ['DenyList', {
        key: 'DenyList',
        module: 'setup',
        group: 'common',
        restEndpoint: '/dropdown/DenyList',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('dropdowns.denylist.label', count, { default: 'Denylist | Denylists' });
        },
        icon: 'ti ti-ban',
        rightname: 'config',
        ...getDefaultRightChecks('config'),
    }],
    ['DeniedMailContent', {
        key: 'DeniedMailContent',
        module: 'setup',
        group: 'common',
        restEndpoint: '/dropdown/DeniedMailContent',
        getLabel: (count: number) => {
            const { t: $t } = useI18n();
            return $t('dropdowns.denied_mail_content.label', count, { default: 'Denied mail content | Denied mail contents' });
        },
        icon: 'ti ti-mail-x',
        rightname: 'config',
        ...getDefaultRightChecks('config'),
    }],
    // ['DefaultFilter', {}],
]);

export const getAllDefinitions = (): Map<GLPIItemType, DropdownDefinition> => {
    return builtinDropdowns;
}

// const builtinDropdownTypes = [
//     {
//         label: 'Assistance',
//         items: [
//             { label: 'Assistance categories', icon: '' },
//             { label: 'Task categories', icon: '' },
//             { label: 'Task templates', icon: '' },
//             { label: 'Solution types', icon: '' },
//             { label: 'Solution templates', icon: '' },
//             { label: 'Approval steps', icon: '' },
//             { label: 'Approval templates', icon: '' },
//             { label: 'Request sources', icon: '' },
//             { label: 'Followup templates', icon: '' },
//             { label: 'Project states', icon: '' },
//             { label: 'Project types', icon: '' },
//             { label: 'Project task types', icon: '' },
//             { label: 'Project task templates', icon: '' },
//             { label: 'External event templates', icon: '' },
//             { label: 'Event categories', icon: '' },
//             { label: 'Pending reasons', icon: '' },
//             { label: 'Service catalog categories', icon: '' },
//         ]
//     },
//     {
//         label: 'Types',
//         items: [
//             { label: 'Computer types', icon: '' },
//             { label: 'Network equipment types', icon: '' },
//             { label: 'Printer types', icon: '' },
//             { label: 'Monitor types', icon: '' },
//             { label: 'Peripheral types', icon: '' },
//             { label: 'Phone types', icon: '' },
//             { label: 'License types', icon: '' },
//             { label: 'Cartridge types', icon: '' },
//             { label: 'Consumable types', icon: '' },
//             { label: 'Contract types', icon: '' },
//             { label: 'Contact types', icon: '' },
//             { label: 'Generic device types', icon: '' },
//             { label: 'Sensor types', icon: '' },
//             { label: 'Memory types', icon: '' },
//             { label: 'Supplier types', icon: '' },
//             { label: 'Interface types', icon: '' },
//             { label: 'Case types', icon: '' },
//             { label: 'Phone power supply types', icon: '' },
//             { label: 'Filesystem types', icon: '' },
//             { label: 'Certificate types', icon: '' },
//             { label: 'Budget types', icon: '' },
//             { label: 'Simcard types', icon: '' },
//             { label: 'Phone line types', icon: '' },
//             { label: 'Rack types', icon: '' },
//             { label: 'PDU types', icon: '' },
//             { label: 'Passive device types', icon: '' },
//             { label: 'Cluster types', icon: '' },
//             { label: 'Database instance types', icon: '' },
//         ]
//     },
//     {
//         label: 'Models',
//         items: [
//             { label: 'Computer models', icon: '' },
//             { label: 'Network equipment models', icon: '' },
//             { label: 'Printer models', icon: '' },
//             { label: 'Monitor models', icon: '' },
//             { label: 'Peripheral models', icon: '' },
//             { label: 'Phone models', icon: '' },
//             { label: 'Camera device models', icon: '' },
//             { label: 'Case device models', icon: '' },
//             { label: 'Controller device models', icon: '' },
//             { label: 'Drive device models', icon: '' },
//             { label: 'Generic device models', icon: '' },
//             { label: 'Graphics card device models', icon: '' },
//             { label: 'Hard drive device models', icon: '' },
//             { label: 'Memory device models', icon: '' },
//             { label: 'System board device models', icon: '' },
//             { label: 'Network card device models', icon: '' },
//             { label: 'PCI device models', icon: '' },
//             { label: 'Power supply device models', icon: '' },
//             { label: 'Processor device models', icon: '' },
//             { label: 'Sound card device models', icon: '' },
//             { label: 'Sensor device models', icon: '' },
//             { label: 'Rack models', icon: '' },
//             { label: 'Enclosure models', icon: '' },
//             { label: 'PDU models', icon: '' },
//             { label: 'Passive device models', icon: '' },
//         ]
//     },
//     {
//         label: 'Virtualization',
//         items: [
//             { label: 'Virtualization systems', icon: '' },
//             { label: 'Virtualization models', icon: '' },
//             { label: 'Virtualization states', icon: '' },
//         ]
//     },
//     {
//         label: 'Management',
//         items: [
//             { label: 'Document categories', icon: '' },
//             { label: 'Document types', icon: '' },
//             { label: 'Business criticality levels', icon: '' },
//             { label: 'Database instance categories', icon: '' },
//         ]
//     },
//     {
//         label: 'Tools',
//         items: [
//             { label: 'Knowledge base categories', icon: '' },
//         ]
//     },
//     {
//         label: 'Calendars',
//         items: [
//
//             { label: 'Calendars', icon: '' },
//             { label: 'Close times', icon: '' },
//         ]
//     },
//     {
//         label: 'Operating Systems',
//         items: [
//
//             { label: 'Operating systems', icon: '' },
//             { label: 'Operating system versions', icon: '' },
//             { label: 'Service packs', icon: '' },
//             { label: 'Operating system architectures', icon: '' },
//             { label: 'Editions', icon: '' },
//             { label: 'Kernels', icon: '' },
//             { label: 'Kernel versions', icon: '' },
//             { label: 'Update sources', icon: '' }, //This is not related to OS? It is usually filled to indicate the software that provides the inventory data for an asset to GLPI such as the GLPI Agent.
//         ]
//     },
//     {
//         label: 'Networking', // Include Internet dropdowns
//         items: [
//
//             { label: 'Network interfaces', icon: '' },
//             { label: 'Networks', icon: '' },
//             { label: 'Network port types', icon: '' },
//             { label: 'VLANs', icon: '' },
//             { label: 'Phone line operators', icon: '' },
//             { label: 'Domain types', icon: '' },
//             { label: 'Domain relations', icon: '' },
//             { label: 'Record types types', icon: '' },
//             { label: 'Fiber types', icon: '' },
//             { label: 'IP networks', icon: '' },
//             { label: 'Internet domains', icon: '' },
//             { label: 'Wifi networks', icon: '' },
//             { label: 'Network names', icon: '' },
//         ]
//     },
//     {
//         label: 'Cable Management',
//         items: [
//
//             { label: 'Cable types', icon: '' },
//             { label: 'Cable strands', icon: '' },
//             { label: 'Socket models', icon: '' },
//         ]
//     },
//     {
//         label: 'Software',
//         items: [
//             { label: 'Software categories', icon: '' },
//         ]
//     },
//     {
//         label: 'User',
//         items: [
//             { label: 'User titles', icon: '' },
//             { label: 'User categories', icon: '' },
//         ]
//     },
//     {
//         label: 'Rules',
//         items: [
//
//             { label: 'LDAP criteria', icon: '' },
//         ]
//     },
//     {
//         label: 'Fields Unicity',
//         items: [
//
//             { label: 'Field unicity exclusions', icon: '' }, //TODO Should be with the field unicity instead?
//         ]
//     },
//     {
//         label: 'Authentication',
//         items: [
//
//             { label: 'SSO fields', icon: '' },
//         ]
//     },
//     {
//         label: 'Power Management',
//         items: [
//
//             { label: 'Plugs', icon: '' },
//         ]
//     },
//     {
//         label: 'Appliances',
//         items: [
//             { label: 'Appliance types', icon: '' },
//             { label: 'Appliance environments', icon: '' },
//         ]
//     },
//     {
//         label: 'Camera',
//         items: [
//             { label: 'Resolutions', icon: '' },
//             { label: 'Image formats', icon: '' },
//         ]
//     },
//     {
//         label: 'Others',
//         items: [
//             { label: 'USB vendors', icon: '' },
//             { label: 'PCI vendors', icon: '' },
//             { label: 'Webhook categories', icon: '' },
//         ]
//     },
//     {
//         //TODO add custom asset/custom dropdown types
//         label: 'Custom Dropdowns',
//         items: []
//     },
// ];

export const getGroupedDropdownTypes = () => {
    return builtinDropdownTypes;
};

export function useDropdown(): useBaseItem & {

} {
    function getDropdownTypes() {
        // flatten the grouped dropdown types into a single Map
        return builtinDropdownTypes.reduce((map, group) => {
            group.items.forEach(item => {
                map.set(item.key, item);
            });
            return map;
        }, new Map<string, { label: string; icon: string }>());
    }
}