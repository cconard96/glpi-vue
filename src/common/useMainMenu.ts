import { getAllDefinitions as allAssetDefinitions } from "@/modules/assets/useAsset";
import { useI18n } from "vue-i18n";

const assetDefinitions = allAssetDefinitions();

export const useMainMenu = () => {
    const { t: $t } = useI18n();
    const menu = [
        {
            label: $t('assets.menu_label', 99, {
                default: 'Asset | Assets',
            }),
            key: "assets",
            icon: "ti ti-package",
            items: [
                //TODO Add these to the useAssets definitions

                // {
                //     label: "Consumables",
                //     icon: "ti ti-package",
                //     route: "/assets/consumable"
                // },
                // {
                //     label: "Phones",
                //     icon: "ti ti-phone",
                //     route: "/assets/phone"
                // },
                // {
                //     label: "Racks",
                //     icon: "ti ti-server",
                //     route: "/assets/rack"
                // },
                // {
                //     label: "Enclosures",
                //     icon: "ti ti-columns",
                //     route: "/assets/enclosure"
                // },
                // {
                //     label: "PDUs",
                //     icon: "ti ti-plug",
                //     route: "/assets/pdu"
                // },
                // {
                //     label: "Passive devices",
                //     icon: "ti ti-layout-navbar",
                //     route: "/assets/passivedcequipment"
                // },
                // {
                //     label: "Unmanaged assets",
                //     icon: "ti ti-question-mark",
                //     route: "/assets/unmanaged"
                // },
                // {
                //     label: "Cables",
                //     icon: "ti ti-line",
                //     route: "/assets/cable"
                // },
            ]
        },
        {
            label: $t('assistance.menu_label', 'Assistance'),
            key: "assistance",
            icon: "ti ti-headset",
            items: [
                {
                    label: $t('assistance.ticket.label', 99, {
                        default: 'Ticket | Tickets',
                    }),
                    icon: "ti ti-alert-circle",
                    route: "/assistance/ticket"
                },
                {
                    label: $t('assistance.servicecatalog.label', 'Service catalog'),
                    icon: "ti ti-library",
                    route: "/ServiceCatalog"
                },
                {
                    label: $t('assistance.change.label', 99, {
                        default: 'Change | Changes',
                    }),
                    icon: "ti ti-clipboard-check",
                    route: "/assistance/change"
                },
                {
                    label: $t('assistance.problem.label', 99, {
                        default: 'Problem | Problems',
                    }),
                    icon: "ti ti-alert-triangle",
                    route: "/assistance/problem"
                },
                {
                    label: $t('assistance.statistics.label', 'Statistics'),
                    icon: "ti ti-chart-pie",
                    route: "/assistance/statistics"
                },
                {
                    label: $t('assistance.planning.label', 'Planning'),
                    icon: "ti ti-calendar-time",
                    route: "/assistance/planning"
                },
            ]
        },
        {
            label: $t('management.menu_label', 'Management'),
            key: "management",
            icon: "ti ti-wallet",
            items: [
                {
                    label: $t('management.license.label', 99, {
                        default: 'License | Licenses',
                    }),
                    icon: "ti ti-key",
                    route: "/management/license"
                },
                {
                    label: $t('management.budget.label', 99, {
                        default: 'Budget | Budgets',
                    }),
                    icon: "ti ti-calculator",
                    route: "/management/budget"
                },
                {
                    label: $t('management.supplier.label', 99, {
                        default: 'Supplier | Suppliers',
                    }),
                    icon: "ti ti-truck-loading",
                    route: "/management/supplier"
                },
                {
                    label: $t('management.contact.label', 99, {
                        default: 'Contact | Contacts',
                    }),
                    icon: "ti ti-address-book",
                    route: "/management/contact"
                },
                {
                    label: $t('management.contract.label', 99, {
                        default: 'Contract | Contracts',
                    }),
                    icon: "ti ti-writing-sign",
                    route: "/management/contract"
                },
                {
                    label: $t('management.document.label', 99, {
                        default: 'Document | Documents',
                    }),
                    icon: "ti ti-files",
                    route: "/management/document"
                },
                {
                    label: $t('management.line.label', 99, {
                        default: 'Phone line | Phone lines',
                    }),
                    icon: "ti ti-phone-calling",
                    route: "/management/line"
                },
                {
                    label: $t('management.certificate.label', 99, {
                        default: 'Certificate | Certificates',
                    }),
                    icon: "ti ti-certificate",
                    route: "/management/certificate"
                },
                {
                    label: $t('management.datacenter.label', 99, {
                        default: 'Data center | Data centers',
                    }),
                    icon: "ti ti-building-warehouse",
                    route: "/management/datacenter"
                },
                {
                    label: $t('management.cluster.label', 99, {
                        default: 'Cluster | Clusters',
                    }),
                    icon: "ti ti-hierarchy-2",
                    route: "/management/cluster"
                },
                {
                    label: $t('management.domain.label', 99, {
                        default: 'Domain | Domains',
                    }),
                    icon: "ti ti-world-www",
                    route: "/management/domain"
                },
                {
                    label: $t('management.appliance.label', 99, {
                        default: 'Appliance | Appliances',
                    }),
                    icon: "ti ti-versions",
                    route: "/management/appliance"
                },
                {
                    label: $t('management.database.label', 99, {
                        default: 'Database | Databases',
                    }),
                    icon: "ti ti-database",
                    route: "/management/database"
                },
            ]
        },
        {
            label: $t('tools.menu_label', 'Tools'),
            key: "tools",
            icon: "ti ti-briefcase",
            items: [
                {
                    label: $t('tools.project.label', 99, {
                        default: 'Project | Projects',
                    }),
                    icon: "ti ti-layout-kanban",
                    route: "/tools/project"
                },
                {
                    label: $t('tools.reminder.label', 99, {
                        default: 'Reminder | Reminders',
                    }),
                    icon: "ti ti-note",
                    route: "/tools/reminder"
                },
                {
                    label: $t('tools.rssfeed.label', 99, {
                        default: 'RSS feed | RSS feeds',
                    }),
                    icon: "ti ti-rss",
                    route: "/tools/rssfeed"
                },
                {
                    label: $t('tools.knowbase.label', 'Knowledge base'),
                    icon: "ti ti-lifebuoy",
                    route: "/tools/knowbase"
                },
                {
                    label: $t('tools.reservation.label', 99, {
                        default: 'Reservation | Reservations',
                    }),
                    icon: "ti ti-calendar-event",
                    route: "/tools/reservation"
                },
                {
                    label: $t('tools.report.label', 99, {
                        default: 'Report | Reports',
                    }),
                    icon: "ti ti-report",
                    route: "/tools/report"
                },
                {
                    label: $t('tools.savedsearch.label', 99, {
                        default: 'Saved search | Saved searches',
                    }),
                    icon: "ti ti-bookmarks",
                    route: "/tools/savedsearch"
                },
            ]
        },
        {
            label: $t('administration.menu_label', 'Administration'),
            key: "administration",
            icon: "ti ti-shield-check",
            items: [
                {
                    label: $t('administration.user.label', 99, {
                        default: 'User | Users',
                    }),
                    icon: "ti ti-user",
                    route: "/administration/user"
                },
                {
                    label: $t('administration.group.label', 99, {
                        default: 'Group | Groups',
                    }),
                    icon: "ti ti-users",
                    route: "/administration/group"
                },
                {
                    label: $t('administration.entity.label', 99, {
                        default: 'Entity | Entities',
                    }),
                    icon: "ti ti-stack",
                    route: "/administration/entity"
                },
                {
                    label: $t('administration.rule.label', 99, {
                        default: 'Rule | Rules',
                    }),
                    icon: "ti ti-book",
                    route: "/administration/rule"
                },
                {
                    label: $t('administration.dictionary.label', 99, {
                        default: 'Dictionary | Dictionaries',
                    }),
                    icon: "ti ti-vocabulary",
                    route: "/administration/dictionary"
                },
                {
                    label: $t('administration.profile.label', 99, {
                        default: 'Profile | Profiles',
                    }),
                    icon: "ti ti-user-check",
                    route: "/administration/profile"
                },
                {
                    label: $t('administration.queuednotification.menu_label', 'Notification queue'),
                    icon: "ti ti-notification",
                    route: "/administration/queuednotification"
                },
                {
                    label: $t('administration.log.label', 99, {
                        default: 'Log | Logs',
                    }),
                    icon: "ti ti-news",
                    route: "/administration/log"
                },
                {
                    label: $t('administration.inventory.menu_label', 'Inventory'),
                    icon: "ti ti-cloud-download",
                    route: "/administration/inventory"
                },
                {
                    label: $t('administration.form.label', 99, {
                        default: 'Form | Forms',
                    }),
                    icon: "ti ti-forms",
                    route: "/administration/form"
                },
            ]
        },
        {
            label: $t('setup.menu_label', 'Setup'),
            key: "setup",
            icon: "ti ti-settings",
            items: [
                {
                    label: $t('setup.assetdefinition.label', 99, {
                        default: 'Asset definition | Asset definitions',
                    }),
                    icon: "ti ti-database-cog",
                    route: "/setup/assetdefinition"
                },
                {
                    label: $t('setup.dropdown.label', 99, {
                        default: 'Dropdown | Dropdowns',
                    }),
                    icon: "ti ti-edit",
                    route: "/setup/dropdown"
                },
                {
                    label: $t('setup.component.label', 99, {
                        default: 'Component | Components',
                    }),
                    icon: "ti ti-components",
                    route: "/setup/component"
                },
                {
                    label: $t('setup.notification.label', 99, {
                        default: 'Notification | Notifications',
                    }),
                    icon: "ti ti-bell",
                    route: "/setup/notification"
                },
                {
                    label: $t('setup.webhook.label', 99, {
                        default: 'Webhook | Webhooks',
                    }),
                    icon: "ti ti-webhook",
                    route: "/setup/webhook"
                },
                {
                    label: $t('setup.servicelevel.label', 99, {
                        default: 'Service level | Service levels',
                    }),
                    icon: "ti ti-checkup-list",
                    route: "/setup/servicelevel"
                },
                {
                    label: $t('setup.setting.menu_label', 'Settings'),
                    icon: "ti ti-adjustments",
                    route: "/setup/settings"
                },
                {
                    label: $t('setup.fieldunicity.label', 99, {
                        default: 'Field unicity rule | Field unicity rules',
                    }),
                    icon: "ti ti-fingerprint",
                    route: "/setup/fieldunicity"
                },
                {
                    label: $t('setup.crontask.label', 99, {
                        default: 'Automatic action | Automatic actions',
                    }),
                    icon: "ti ti-settings-automation",
                    route: "/setup/crontask"
                },
                {
                    label: $t('setup.authentication.menu_label', 'Authentication'),
                    icon: "ti ti-login",
                    route: "/setup/authentication"
                },
                {
                    label: $t('setup.oauthclient.label', 99, {
                        default: 'OAuth client | OAuth clients',
                    }),
                    icon: "ti ti-key",
                    route: "/setup/oauthclient"
                },
                {
                    label: $t('setup.mailcollector.label', 99, {
                        default: 'Receiver | Receivers',
                    }),
                    icon: "ti ti-inbox",
                    route: "/setup/mailcollector"
                },
                {
                    label: $t('setup.link.label', 99, {
                        default: 'External link | External links',
                    }),
                    icon: "ti ti-link",
                    route: "/setup/link"
                },
                {
                    label: $t('setup.plugin.label', 99, {
                        default: 'Plugin | Plugins',
                    }),
                    icon: "ti ti-puzzle",
                    route: "/setup/plugin"
                },
            ]
        },
    ];

    for (const [asset_type, def] of assetDefinitions.entries()) {
        if (!def.canView()) {
            continue;
        }
        const section = menu.find(s => s.key === 'assets');
        if (section) {
            section.items.push({
                label: def.getLabel(99), //TODO find way to get a count for the 'many' form of the label
                icon: def.icon || "ti ti-package",
                route: `/assets/${asset_type}`,
            });
        }
    }

    return {
        menu,
    };
}