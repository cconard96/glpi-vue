import { AbstractModel } from "@/models/AbstractModel.js";
import { Computer, Monitor } from "@/models/assets";

export const useMainMenu = () => {
    const menu = [
        {
            label: "Assets",
            key: "assets",
            icon: "ti ti-package",
            items: [
                {
                    label: "Computers",
                    icon: "ti ti-device-laptop",
                    route: "/assets/computer",
                    itemtype_model: Computer,
                },
                {
                    label: "Monitors",
                    icon: "ti ti-device-desktop",
                    route: "/assets/monitor",
                    itemtype_model: Monitor,
                },
                {
                    label: "Software",
                    icon: "ti ti-apps",
                    route: "/assets/software"
                },
                {
                    label: "Network devices",
                    icon: "ti ti-network",
                    route: "/assets/networkequipment"
                },
                {
                    label: "Peripherals",
                    icon: "ti ti-usb",
                    route: "/assets/peripheral"
                },
                {
                    label: "Printers",
                    icon: "ti ti-printer",
                    route: "/assets/printer"
                },
                {
                    label: "Cartridges",
                    icon: "ti ti-droplet-half-2",
                    route: "/assets/cartridge"
                },
                {
                    label: "Consumables",
                    icon: "ti ti-package",
                    route: "/assets/consumable"
                },
                {
                    label: "Phones",
                    icon: "ti ti-phone",
                    route: "/assets/phone"
                },
                {
                    label: "Racks",
                    icon: "ti ti-server",
                    route: "/assets/rack"
                },
                {
                    label: "Enclosures",
                    icon: "ti ti-columns",
                    route: "/assets/enclosure"
                },
                {
                    label: "PDUs",
                    icon: "ti ti-plug",
                    route: "/assets/pdu"
                },
                {
                    label: "Passive devices",
                    icon: "ti ti-layout-navbar",
                    route: "/assets/passivedcequipment"
                },
                {
                    label: "Unmanaged assets",
                    icon: "ti ti-question-mark",
                    route: "/assets/unmanaged"
                },
                {
                    label: "Cables",
                    icon: "ti ti-line",
                    route: "/assets/cable"
                },
            ]
        },
        {
            label: "Assistance",
            key: "assistance",
            icon: "ti ti-headset",
            items: [
                {
                    label: "Tickets",
                    icon: "ti ti-alert-circle",
                    route: "/assistance/ticket"
                },
                {
                    label: "Service catalog",
                    icon: "ti ti-library",
                    route: "/assistance/servicecatalog"
                },
                {
                    label: "Changes",
                    icon: "ti ti-clipboard-check",
                    route: "/assistance/change"
                },
                {
                    label: "Problems",
                    icon: "ti ti-alert-triangle",
                    route: "/assistance/problem"
                },
                {
                    label: "Statistics",
                    icon: "ti ti-chart-pie",
                    route: "/assistance/statistics"
                },
            ]
        },
        {
            label: "Management",
            key: "management",
            icon: "ti ti-wallet",
            items: [
                {
                    label: "Licenses",
                    icon: "ti ti-key",
                    route: "/management/license"
                },
                {
                    label: "Budgets",
                    icon: "ti ti-calculator",
                    route: "/management/budget"
                },
                {
                    label: "Suppliers",
                    icon: "ti ti-truck-loading",
                    route: "/management/supplier"
                },
                {
                    label: "Contacts",
                    icon: "ti ti-address-book",
                    route: "/management/contact"
                },
                {
                    label: "Contracts",
                    icon: "ti ti-writing-sign",
                    route: "/management/contract"
                },
                {
                    label: "Documents",
                    icon: "ti ti-files",
                    route: "/management/document"
                },
                {
                    label: "Phone lines",
                    icon: "ti ti-phone-calling",
                    route: "/management/line"
                },
                {
                    label: "Certificates",
                    icon: "ti ti-certificate",
                    route: "/management/certificate"
                },
                {
                    label: "Data centers",
                    icon: "ti ti-building-warehouse",
                    route: "/management/datacenter"
                },
                {
                    label: "Clusters",
                    icon: "ti ti-hierarchy-2",
                    route: "/management/cluster"
                },
                {
                    label: "Domains",
                    icon: "ti ti-world-www",
                    route: "/management/domain"
                },
                {
                    label: "Appliances",
                    icon: "ti ti-versions",
                    route: "/management/appliance"
                },
                {
                    label: "Databases",
                    icon: "ti ti-database",
                    route: "/management/database"
                },
            ]
        },
        {
            label: "Tools",
            key: "tools",
            icon: "ti ti-briefcase",
            items: [
                {
                    label: "Projects",
                    icon: "ti ti-layout-kanban",
                    route: "/tools/project"
                },
                {
                    label: "Reminders",
                    icon: "ti ti-note",
                    route: "/tools/reminder"
                },
                {
                    label: "RSS feeds",
                    icon: "ti ti-rss",
                    route: "/tools/rssfeed"
                },
                {
                    label: "Knowledge base",
                    icon: "ti ti-lifebuoy",
                    route: "/tools/knowbase"
                },
                {
                    label: "Reservations",
                    icon: "ti ti-calendar-event",
                    route: "/tools/reservation"
                },
                {
                    label: "Reports",
                    icon: "ti ti-report",
                    route: "/tools/report"
                },
                {
                    label: "Saved searches",
                    icon: "ti ti-bookmarks",
                    route: "/tools/savedsearch"
                },
            ]
        },
        {
            label: "Administration",
            key: "administration",
            icon: "ti ti-shield-check",
            items: [
                {
                    label: "Users",
                    icon: "ti ti-user",
                    route: "/administration/user"
                },
                {
                    label: "Groups",
                    icon: "ti ti-users",
                    route: "/administration/group"
                },
                {
                    label: "Entities",
                    icon: "ti ti-stack",
                    route: "/administration/entity"
                },
                {
                    label: "Rules",
                    icon: "ti ti-book",
                    route: "/administration/rule"
                },
                {
                    label: "Dictionaries",
                    icon: "ti ti-vocabulary",
                    route: "/administration/dictionary"
                },
                {
                    label: "profiles",
                    icon: "ti ti-user-check",
                    route: "/administration/profile"
                },
                {
                    label: "Notification queue",
                    icon: "ti ti-notification",
                    route: "/administration/queuednotification"
                },
                {
                    label: "Logs",
                    icon: "ti ti-news",
                    route: "/administration/log"
                },
                {
                    label: "Inventory",
                    icon: "ti ti-cloud-download",
                    route: "/administration/inventory"
                },
                {
                    label: "Forms",
                    icon: "ti ti-forms",
                    route: "/administration/form"
                },
            ]
        },
        {
            label: "Setup",
            key: "setup",
            icon: "ti ti-settings",
            items: [
                {
                    label: "Asset definitions",
                    icon: "ti ti-database-cog",
                    route: "/setup/assetdefinition"
                },
                {
                    label: "Dropdowns",
                    icon: "ti ti-edit",
                    route: "/setup/dropdown"
                },
                {
                    label: "Components",
                    icon: "ti ti-components",
                    route: "/setup/component"
                },
                {
                    label: "Notifications",
                    icon: "ti ti-bell",
                    route: "/setup/notification"
                },
                {
                    label: "Webhooks",
                    icon: "ti ti-webhook",
                    route: "/setup/webhook"
                },
                {
                    label: "Service levels",
                    icon: "ti ti-checkup-list",
                    route: "/setup/servicelevel"
                },
                {
                    label: "General",
                    icon: "ti ti-adjustments",
                    route: "/setup/general"
                },
                {
                    label: "Fields unicity",
                    icon: "ti ti-fingerprint",
                    route: "/setup/fieldunicity"
                },
                {
                    label: "Automatic actions",
                    icon: "ti ti-settings-automation",
                    route: "/setup/crontask"
                },
                {
                    label: "Authentication",
                    icon: "ti ti-login",
                    route: "/setup/authentication"
                },
                {
                    label: "OAuth clients",
                    icon: "ti ti-key",
                    route: "/setup/oauthclient"
                },
                {
                    label: "Receivers",
                    icon: "ti ti-inbox",
                    route: "/setup/mailcollector"
                },
                {
                    label: "External links",
                    icon: "ti ti-link",
                    route: "/setup/link"
                },
                {
                    label: "Plugins",
                    icon: "ti ti-puzzle",
                    route: "/setup/plugin"
                },
            ]
        },
    ];

    function getItemtypeModelForRoute(route_path) {
        console.log(`Getting itemtype model for route: ${route_path}`);
        // remove query parameters
        const path_without_query = route_path.split('?')[0];
        // if the given route has an id part at the end, remove it
        const clean_route = path_without_query.replace(/\/\d+$/, '');
        console.log('clean_route:', clean_route);
        for (const section of menu) {
            for (const item of section.items) {
                if (item.route === clean_route && item.itemtype_model) {
                    return item.itemtype_model;
                }
            }
        }
    }

    return {
        menu,
        getItemtypeModelForRoute,
    };
}