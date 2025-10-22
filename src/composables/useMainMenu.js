import { AbstractModel } from "@/models/AbstractModel.js";
import { Computer } from "@/models/assets/Computer.js";

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
                    route: "/assets/monitor"
                },
                {
                    label: "Software",
                    icon: "ti ti ti-apps",
                    route: "/assets/software"
                },
                {
                    label: "Network devices",
                    icon: "ti ti ti-apps",
                    route: "/assets/networkequipment"
                },
                {
                    label: "Peripherals",
                    icon: "ti ti ti-apps",
                    route: "/assets/peripheral"
                },
                {
                    label: "Printers",
                    icon: "ti ti ti-apps",
                    route: "/assets/printer"
                },
                {
                    label: "Cartridges",
                    icon: "ti ti ti-apps",
                    route: "/assets/cartridge"
                },
                {
                    label: "Consumables",
                    icon: "ti ti ti-apps",
                    route: "/assets/consumable"
                },
                {
                    label: "Phones",
                    icon: "ti ti ti-apps",
                    route: "/assets/phone"
                },
                {
                    label: "Racks",
                    icon: "ti ti ti-apps",
                    route: "/assets/rack"
                },
                {
                    label: "Enclosures",
                    icon: "ti ti ti-apps",
                    route: "/assets/enclosure"
                },
                {
                    label: "PDUs",
                    icon: "ti ti ti-apps",
                    route: "/assets/pdu"
                },
                {
                    label: "Passive devices",
                    icon: "ti ti ti-apps",
                    route: "/assets/passivedcequipment"
                },
                {
                    label: "Unmanaged assets",
                    icon: "ti ti ti-apps",
                    route: "/assets/unmanaged"
                },
                {
                    label: "Cables",
                    icon: "ti ti ti-apps",
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
                    icon: "ti ti-device-laptop",
                    route: "/management/license"
                },
                {
                    label: "Budgets",
                    icon: "ti ti-device-laptop",
                    route: "/management/budget"
                },
                {
                    label: "Suppliers",
                    icon: "ti ti-device-laptop",
                    route: "/management/supplier"
                },
                {
                    label: "Contacts",
                    icon: "ti ti-device-laptop",
                    route: "/management/contact"
                },
                {
                    label: "Contracts",
                    icon: "ti ti-device-laptop",
                    route: "/management/contract"
                },
                {
                    label: "Documents",
                    icon: "ti ti-device-laptop",
                    route: "/management/document"
                },
                {
                    label: "Phone lines",
                    icon: "ti ti-device-laptop",
                    route: "/management/line"
                },
                {
                    label: "Certificates",
                    icon: "ti ti-device-laptop",
                    route: "/management/certificate"
                },
                {
                    label: "Data centers",
                    icon: "ti ti-device-laptop",
                    route: "/management/datacenter"
                },
                {
                    label: "Clusters",
                    icon: "ti ti-device-laptop",
                    route: "/management/cluster"
                },
                {
                    label: "Domains",
                    icon: "ti ti-device-laptop",
                    route: "/management/domain"
                },
                {
                    label: "Appliances",
                    icon: "ti ti-device-laptop",
                    route: "/management/appliance"
                },
                {
                    label: "Databases",
                    icon: "ti ti-device-laptop",
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
                    icon: "ti ti-device-laptop",
                    route: "/tools/project"
                },
                {
                    label: "Reminders",
                    icon: "ti ti-device-laptop",
                    route: "/tools/reminder"
                },
                {
                    label: "RSS feeds",
                    icon: "ti ti-device-laptop",
                    route: "/tools/rssfeed"
                },
                {
                    label: "Knowledge base",
                    icon: "ti ti-device-laptop",
                    route: "/tools/knowbase"
                },
                {
                    label: "Reservations",
                    icon: "ti ti-device-laptop",
                    route: "/tools/reservation"
                },
                {
                    label: "Reports",
                    icon: "ti ti-device-laptop",
                    route: "/tools/report"
                },
                {
                    label: "Saved searches",
                    icon: "ti ti-device-laptop",
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
                    icon: "ti ti-device-laptop",
                    route: "/administration/user"
                },
                {
                    label: "Groups",
                    icon: "ti ti-device-laptop",
                    route: "/administration/group"
                },
                {
                    label: "Entities",
                    icon: "ti ti-device-laptop",
                    route: "/administration/entity"
                },
                {
                    label: "Rules",
                    icon: "ti ti-device-laptop",
                    route: "/administration/rule"
                },
                {
                    label: "Dictionaries",
                    icon: "ti ti-device-laptop",
                    route: "/administration/dictionary"
                },
                {
                    label: "profiles",
                    icon: "ti ti-device-laptop",
                    route: "/administration/profile"
                },
                {
                    label: "Notification queue",
                    icon: "ti ti-device-laptop",
                    route: "/administration/queuednotification"
                },
                {
                    label: "Logs",
                    icon: "ti ti-device-laptop",
                    route: "/administration/log"
                },
                {
                    label: "Inventory",
                    icon: "ti ti-device-laptop",
                    route: "/administration/inventory"
                },
                {
                    label: "Forms",
                    icon: "ti ti-device-laptop",
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
                    icon: "ti ti-device-laptop",
                    route: "/setup/assetdefinition"
                },
                {
                    label: "Dropdowns",
                    icon: "ti ti-device-laptop",
                    route: "/setup/dropdown"
                },
                {
                    label: "Components",
                    icon: "ti ti-device-laptop",
                    route: "/setup/component"
                },
                {
                    label: "Notifications",
                    icon: "ti ti-device-laptop",
                    route: "/setup/notification"
                },
                {
                    label: "Webhooks",
                    icon: "ti ti-device-laptop",
                    route: "/setup/webhook"
                },
                {
                    label: "Service levels",
                    icon: "ti ti-device-laptop",
                    route: "/setup/servicelevel"
                },
                {
                    label: "General",
                    icon: "ti ti-device-laptop",
                    route: "/setup/general"
                },
                {
                    label: "Fields unicity",
                    icon: "ti ti-device-laptop",
                    route: "/setup/fieldunicity"
                },
                {
                    label: "Automatic actions",
                    icon: "ti ti-device-laptop",
                    route: "/setup/crontask"
                },
                {
                    label: "Authentication",
                    icon: "ti ti-device-laptop",
                    route: "/setup/authentication"
                },
                {
                    label: "OAuth clients",
                    icon: "ti ti-device-laptop",
                    route: "/setup/oauthclient"
                },
                {
                    label: "Receivers",
                    icon: "ti ti-device-laptop",
                    route: "/setup/mailcollector"
                },
                {
                    label: "External links",
                    icon: "ti ti-device-laptop",
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

    return { menu };
}