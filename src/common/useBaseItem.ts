import {type components} from "../../data/hlapiv2_schema";
import { Ref } from "vue";
import { BaseItemDefinition } from "@/types";
import { getAllDefinitions as getAllAssetDefinitions } from "@/modules/assets/useAsset.ts";
import { getAllDefinitions as getAllAssistanceDefinitions } from "@/modules/assistance/timeline/useAssistanceItem.ts";
import { getAllDefinitions as getAllDropdownDefinitions } from "@/modules/setup/dropdowns/useDropdowns.ts";
import { BaseRights, useSessionStore } from "@/common/useSessionStore.ts";
import { useI18n } from "vue-i18n";

const { hasRight, hasEntityAccessForItem } = useSessionStore();

export type GLPIItemType = keyof components['schemas'];
export type GLPIItem<T extends GLPIItemType> = components['schemas'][T];

export function getDefaultRightChecks<T extends GLPIItemType>(rightname: string): Pick<BaseItemDefinition<T>, 'canView' | 'canCreate' | 'canUpdate' | 'canDelete' | 'canPurge' | 'canRestore' | 'canViewItem' | 'canCreateItem' | 'canUpdateItem' | 'canDeleteItem' | 'canPurgeItem' | 'canRestoreItem'> {
    return {
        canView: () => hasRight(rightname, BaseRights.READ),
        canCreate: () => hasRight(rightname, BaseRights.CREATE),
        canUpdate: () => hasRight(rightname, BaseRights.UPDATE),
        canDelete: () => hasRight(rightname, BaseRights.DELETE),
        canPurge: () => hasRight(rightname, BaseRights.PURGE),
        canRestore: () => hasRight(rightname, BaseRights.PURGE),
        canViewItem: (item: GLPIItem<T>) => hasEntityAccessForItem(item),
        canCreateItem: (data: Partial<GLPIItem<T>>) => hasEntityAccessForItem(data),
        canUpdateItem: (item: GLPIItem<T>) => hasEntityAccessForItem(item),
        canDeleteItem: (item: GLPIItem<T>) => hasEntityAccessForItem(item),
        canPurgeItem: (item: GLPIItem<T>) => hasEntityAccessForItem(item),
        canRestoreItem: (item: GLPIItem<T>) => hasEntityAccessForItem(item),
    }
}

/**
 * A composable providing some common properties and methods for some commonly used types of items.
 * Not every type of item is supported. If an item type may be linked alongside other types of items, such as associated items in a ticket, then it should be supported here.
 * This helps avoid needing to import and use several, more specific composables like useAsset and useAssistanceItem for generic use cases.
 * By contrast, types like Rules do not need supported here as they are relatively isolated from a UI POV.
 * @todo Should this be expanded to cover more?
 * @todo If not expanding, are all of the currently supported types needed to be here?
 */
export function useBaseItem<T extends GLPIItemType>(itemtype: T, item: Ref<GLPIItem<T>>) {
    const { t: $t } = useI18n();

    const itemDefinitions: Map<GLPIItemType, BaseItemDefinition<GLPIItemType>> = new Map({
        ...getAllAssetDefinitions(),
        ...getAllAssistanceDefinitions(),
        ...(new Map([
            ['License', {
                key: 'License',
                module: 'Management',
                restEndpoint: '/Management/License',
                getLabel: (count: number) => $t('management.license.label', count, { default: 'License | Licenses' }),
                icon: 'ti ti-key',
                rightname: 'license',
                ...getDefaultRightChecks('license'),
            }],
            ['Budget', {
                key: 'Budget',
                module: 'Management',
                restEndpoint: '/Management/Budget',
                getLabel: (count: number) => $t('management.budget.label', count, { default: 'Budget | Budgets' }),
                icon: 'ti ti-calculator',
                rightname: 'budget',
                ...getDefaultRightChecks('budget'),
            }],
            ['Supplier', {
                key: 'Supplier',
                module: 'Management',
                restEndpoint: '/Management/Supplier',
                getLabel: (count: number) => $t('management.supplier.label', count, { default: 'Supplier | Suppliers' }),
                icon: 'ti ti-truck-loading',
                rightname: 'supplier',
                ...getDefaultRightChecks('supplier'),
            }],
            ['Contact', {
                key: 'Contact',
                module: 'Management',
                restEndpoint: '/Management/Contact',
                getLabel: (count: number) => $t('management.contact.label', count, { default: 'Contact | Contacts' }),
                icon: 'ti ti-address-book',
                rightname: 'contact',
                ...getDefaultRightChecks('contact'),
            }],
            ['Contract', {
                key: 'Contract',
                module: 'Management',
                restEndpoint: '/Management/Contract',
                getLabel: (count: number) => $t('management.contract.label', count, { default: 'Contract | Contracts' }),
                icon: 'ti ti-writing-sign',
                rightname: 'contract',
                ...getDefaultRightChecks('contract'),
            }],
            ['Document', {
                key: 'Document',
                module: 'Management',
                restEndpoint: '/Management/Document',
                getLabel: (count: number) => $t('management.document.label', count, { default: 'Document | Documents' }),
                icon: 'ti ti-files',
                rightname: 'document',
                ...getDefaultRightChecks('document'),
            }],
            ['Line', {
                key: 'Line',
                module: 'Management',
                restEndpoint: '/Management/Line',
                getLabel: (count: number) => $t('management.line.label', count, { default: 'Phone line | Phone lines' }),
                icon: 'ti ti-phone-calling',
                rightname: 'line',
                ...getDefaultRightChecks('line'),
            }],
            ['Certificate', {
                key: 'Certificate',
                module: 'Management',
                restEndpoint: '/Management/Certificate',
                getLabel: (count: number) => $t('management.certificate.label', count, { default: 'Certificate | Certificates' }),
                icon: 'ti ti-certificate',
                rightname: 'certificate',
                ...getDefaultRightChecks('certificate'),
            }],
            ['DataCenter', {
                key: 'DataCenter',
                module: 'Management',
                restEndpoint: '/Management/DataCenter',
                getLabel: (count: number) => $t('management.datacenter.label', count, { default: 'Data center | Data centers' }),
                icon: 'ti ti-building-warehouse',
                rightname: 'datacenter',
                ...getDefaultRightChecks('datacenter'),
            }],
            ['Cluster', {
                key: 'Cluster',
                module: 'Management',
                restEndpoint: '/Management/Cluster',
                getLabel: (count: number) => $t('management.cluster.label', count, { default: 'Cluster | Clusters' }),
                icon: 'ti ti-hierarchy-2',
                rightname: 'datacenter',
                ...getDefaultRightChecks('datacenter'),
            }],
            ['Domain', {
                key: 'Domain',
                module: 'Management',
                restEndpoint: '/Management/Domain',
                getLabel: (count: number) => $t('management.domain.label', count, { default: 'Domain | Domains' }),
                icon: 'ti ti-world-www',
                rightname: 'domain',
                ...getDefaultRightChecks('domain'),
            }],
            ['Appliance', {
                key: 'Appliance',
                module: 'Management',
                restEndpoint: '/Management/Appliance',
                getLabel: (count: number) => $t('management.appliance.label', count, { default: 'Appliance | Appliances' }),
                icon: 'ti ti-versions',
                rightname: 'datacenter',
                ...getDefaultRightChecks('datacenter'),
            }],
            ['Database', {
                key: 'Database',
                module: 'Management',
                restEndpoint: '/Management/Database',
                getLabel: (count: number) => $t('management.database.label', count, { default: 'Database | Databases' }),
                icon: 'ti ti-database',
                rightname: 'database',
                ...getDefaultRightChecks('database'),
            }],
            ['Project', {
                key: 'Project',
                module: 'Tools',
                restEndpoint: '/Project',
                getLabel: (count: number) => $t('tools.project.label', count, { default: 'Project | Projects' }),
                icon: 'ti ti-layout-kanban',
                rightname: 'project',
                ...getDefaultRightChecks('project'),
            }],
            ['Reminder', {
                key: 'Reminder',
                module: 'Tools',
                restEndpoint: '/Tools/Reminder',
                getLabel: (count: number) => $t('tools.reminder.label', count, { default: 'Reminder | Reminders' }),
                icon: 'ti ti-note',
                rightname: 'reminder',
                ...getDefaultRightChecks('reminder'),
            }],
            ['RSSFeed', {
                key: 'RSSFeed',
                module: 'Tools',
                restEndpoint: '/Tools/RSSFeed',
                getLabel: (count: number) => $t('tools.rssfeed.label', count, { default: 'RSS feed | RSS feeds' }),
                icon: 'ti ti-rss',
                rightname: 'rssfeed',
                ...getDefaultRightChecks('rssfeed'),
            }],
            ['KBArticle', {
                key: 'KBArticle',
                module: 'Tools',
                restEndpoint: '/Knowbase/Article',
                getLabel: (count: number) => $t('knowbase.article.label', count, { default: 'KB Article | KB Articles' }),
                icon: 'ti ti-lifebuoy',
                rightname: 'knowbase',
                ...getDefaultRightChecks('knowbase'),
            }],
            ['Reservation', {
                key: 'Reservation',
                module: 'Tools',
                //TODO This endpoint is not implemented in GLPI yet
                restEndpoint: '/Tools/Reservation',
                getLabel: (count: number) => $t('tools.reservation.label', count, { default: 'Reservation | Reservations' }),
                icon: 'ti ti-calendar-event',
                rightname: 'reservation',
                ...getDefaultRightChecks('reservation'),
            }],
            ['User', {
                key: 'User',
                module: 'Administration',
                restEndpoint: '/Administration/User',
                getLabel: (count: number) => $t('administration.user.label', count, { default: 'User | Users' }),
                icon: 'ti ti-user',
                rightname: 'user',
                ...getDefaultRightChecks('user'),
            }],
            ['Group', {
                key: 'Group',
                module: 'Administration',
                restEndpoint: '/Administration/Group',
                getLabel: (count: number) => $t('administration.group.label', count, { default: 'Group | Groups' }),
                icon: 'ti ti-users',
                rightname: 'group',
                ...getDefaultRightChecks('group'),
            }],
            ['Entity', {
                key: 'Entity',
                module: 'Administration',
                restEndpoint: '/Administration/Entity',
                getLabel: (count: number) => $t('administration.entity.label', count, { default: 'Entity | Entities' }),
                icon: 'ti ti-stack',
                rightname: 'entity',
                ...getDefaultRightChecks('entity'),
            }],
            ['Profile', {
                key: 'Profile',
                module: 'Administration',
                restEndpoint: '/Administration/Profile',
                getLabel: (count: number) => $t('administration.profile.label', count, { default: 'Profile | Profiles' }),
                icon: 'ti ti-user-check',
                rightname: 'profile',
                ...getDefaultRightChecks('profile'),
            }],
            ...getAllDropdownDefinitions(),
            //TODO Components
            //TODO Notification templates and notifications
            ['SLM', {
                key: 'SLM',
                module: 'Setup',
                restEndpoint: '/Setup/SLM',
                getLabel: (count: number) => $t('setup.slm.label', count, { default: 'SLM | SLMs' }),
                icon: 'ti ti-checkup-list',
                rightname: 'slm',
                ...getDefaultRightChecks('slm'),
            }],
            ['FieldUnicity', {
                key: 'FieldUnicity',
                module: 'Setup',
                restEndpoint: '/Setup/FieldUnicity',
                getLabel: (count: number) => $t('setup.field_unicity.label', count, { default: 'Field unicity | Field unicities' }),
                icon: 'ti ti-fingerprint',
                rightname: 'config',
                ...getDefaultRightChecks('config'),
            }],
            ['AutomaticAction', {
                key: 'AutomaticAction',
                module: 'Setup',
                restEndpoint: '/Setup/AutomaticAction',
                getLabel: (count: number) => $t('setup.automaticaction.label', count, { default: 'Automatic action | Automatic actions' }),
                icon: 'ti ti-settings-automation',
                rightname: 'config',
                ...getDefaultRightChecks('config'),
            }],
            ['OAuthClient', {
                key: 'OAuthClient',
                module: 'Setup',
                restEndpoint: '/Setup/OAuthClient',
                getLabel: (count: number) => $t('setup.oauthclient.label', count, { default: 'OAuth client | OAuth clients' }),
                icon: 'ti ti-key',
                rightname: 'config',
                ...getDefaultRightChecks('config'),
            }],
            ['EmailCollector', {
                key: 'EmailCollector',
                module: 'Setup',
                restEndpoint: '/Setup/EmailCollector',
                getLabel: (count: number) => $t('setup.emailcollector.label', count, { default: 'Email collector | Email collectors' }),
                icon: 'ti ti-inbox',
                rightname: 'config',
                ...getDefaultRightChecks('config'),
            }],
            ['ExternalLink', {
                key: 'ExternalLink',
                module: 'Setup',
                restEndpoint: '/Setup/ExternalLink',
                getLabel: (count: number) => $t('setup.externallink.label', count, { default: 'External link | External links' }),
                icon: 'ti ti-link',
                rightname: 'link',
                ...getDefaultRightChecks('link'),
            }],
            ['ManualLink', {
                key: 'ManualLink',
                module: 'Setup',
                restEndpoint: '/Setup/ManualLink',
                getLabel: (count: number) => $t('setup.manuallink.label', count, { default: 'Manual link | Manual links' }),
                icon: 'ti ti-link',
                rightname: null,
                canView: () => true,
                canCreate: () => true,
                canUpdate: () => true,
                canDelete: () => true,
                canPurge: () => true,
                canRestore: () => true,
                // TODO Check parent item UPDATE permissions,
                canViewItem: (item: GLPIItem<'ManualLink'>) => hasEntityAccessForItem(item),
                canCreateItem: (data: Partial<GLPIItem<'ManualLink'>>) => hasEntityAccessForItem(data.itemtype, data.items_id),
                canUpdateItem: (item: GLPIItem<'ManualLink'>) => hasEntityAccessForItem(item),
                canDeleteItem: (item: GLPIItem<'ManualLink'>) => hasEntityAccessForItem(item),
                canPurgeItem: (item: GLPIItem<'ManualLink'>) => hasEntityAccessForItem(item),
                canRestoreItem: (item: GLPIItem<'ManualLink'>) => hasEntityAccessForItem(item),
            }],
        ]))
    });

    function getDefinition(): BaseItemDefinition<T> {
        const definition = itemDefinitions.get(itemtype) as BaseItemDefinition<T> | undefined;
        if (!definition) {
            throw new Error(`No definition found for item type ${itemtype}`);
        }
        return definition;
    }

    /** Checks global and item-specific permissions for the given CRUD action. */
    function can(action: 'view' | 'create' | 'update' | 'delete' | 'purge' | 'restore') {
        const definition = getDefinition();
        switch (action) {
            case 'view':
                return definition.canView() && definition.canViewItem(item.value);
            case 'create':
                return definition.canCreate() && definition.canCreateItem(item.value);
            case 'update':
                return definition.canUpdate() && definition.canUpdateItem(item.value);
            case 'delete':
                return definition.canDelete() && definition.canDeleteItem(item.value);
            case 'purge':
                return definition.canPurge() && definition.canPurgeItem(item.value);
            case 'restore':
                return definition.canRestore() && definition.canRestoreItem(item.value);
            default:
                return false;
        }
    }
}