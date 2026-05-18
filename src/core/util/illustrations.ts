
type IllustrationInfo = {
    title: string;
    path: string;
    tags: string[];
}

const illustrations: Record<string, IllustrationInfo> = {
    "advanced-dashboards": {
        "title": "advanced-dashboards",
        "path": `data-points.svg`,
        "tags": [
            "plugin",
            "charts",
            "reporting",
            "dashboard"
        ]
    },
    "advanced-forms": {
        "title": "Advanced forms",
        "path": `onboarding.svg`,
        "tags": [
            "plugin",
            "form",
            "survey"
        ]
    },
    "agent-config": {
        "title": "Agent config",
        "path": `qr-code-scan.svg`,
        "tags": [
            "plugin",
            "Qrcode",
            "Smartphone",
            "configuration",
            "mobile"
        ]
    },
    "alert": {
        "title": "alert",
        "path": `warning.svg`,
        "tags": [
            "plugin",
            "notification",
            "warning"
        ]
    },
    "anonymise": {
        "title": "anonymise",
        "path": 'vault.svg',
        "tags": [
            "plugin",
            "privacy",
            "data-protection",
            "file"
        ]
    },
    "anonymize-alt": {
        "title": "anonymize-alt",
        "tags": [
            "plugin",
            "privacy",
            "data-protection",
            "file",
            "folder"
        ]
    },
    "ansible": {
        "title": "ansible",
        "tags": [
            "plugin",
            "automation",
            "orchestration",
            "configuration-management"
        ]
    },
    "antivirus": {
        "title": "Antivirus",
        "path": `firewall.svg`,
        "tags": []
    },
    "application": {
        "title": "Application",
        "tags": [
            "software"
        ]
    },
    "application-altenative": {
        "title": "application-altenative",
        "tags": []
    },
    "application-edit": {
        "title": "application-edit",
        "tags": []
    },
    "approval-by-mail": {
        "title": "approval-by-mail",
        "tags": [
            "plugin"
        ]
    },
    "approve-requests": {
        "title": "Approve Requests",
        "tags": [
            "validation",
            "check",
            "ok",
            "accept",
            "confirmation"
        ]
    },
    "asset-cartridge": {
        "title": "Cartridge",
        "path": `printing-invoices.svg`,
        "tags": [
            "asset",
            "device",
            "printer"
        ]
    },
    "asset-desktop-1": {
        "title": "Desktop 1",
        "tags": [
            "asset",
            "device",
            "computer",
            "monitor"
        ]
    },
    "asset-desktop-2": {
        "title": "Desktop 2",
        "tags": [
            "asset",
            "device",
            "computer",
            "monitor"
        ]
    },
    "asset-laptop": {
        "title": "Laptop",
        "tags": [
            "asset",
            "device",
            "computer",
            "portable",
            "notebook"
        ]
    },
    "asset-lost": {
        "title": "Asset lost",
        "tags": [
            "asset",
            "device"
        ]
    },
    "asset-network-equipment": {
        "title": "Network equipment",
        "tags": [
            "asset",
            "device",
            "switch",
            "router"
        ]
    },
    "asset-peripheral": {
        "title": "Peripheral",
        "tags": [
            "asset",
            "device",
            "usb",
            "keyboard",
            "mouse"
        ]
    },
    "asset-phone": {
        "title": "Phone",
        "tags": [
            "asset",
            "device",
            "landline",
            "call",
            "communication"
        ]
    },
    "asset-printer": {
        "title": "Printer",
        "path": `printing-invoices.svg`,
        "tags": [
            "asset",
            "device",
            "fax"
        ]
    },
    "asset-server": {
        "title": "Server",
        "tags": [
            "asset",
            "device",
            "hosting"
        ]
    },
    "asset-smartphone": {
        "title": "Smartphone",
        "tags": [
            "asset",
            "device",
            "mobile",
            "cellphone",
            "communication",
            "iphone"
        ]
    },
    "backup-restoration-1": {
        "title": "Backup and restoration 1",
        "tags": [
            "database"
        ]
    },
    "backup-restoration-2": {
        "title": "Backup and restoration 2",
        "tags": [
            "cloud"
        ]
    },
    "bank": {
        "title": "Bank",
        "path": `wallet.svg`,
        "tags": [
            "building",
            "credit",
            "money",
            "finance"
        ]
    },
    "bi-reporting-1": {
        "title": "Business Intelligence and Reporting 1",
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "bi-reporting-2": {
        "title": "Business Intelligence and Reporting 2",
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "bi-reporting-3": {
        "title": "Business Intelligence and Reporting 3",
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "bi-reporting-4": {
        "title": "Business Intelligence and Reporting 4",
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "bookmark": {
        "title": "Bookmark",
        "tags": [
            "tag",
            "favorite",
            "marker",
            "label"
        ]
    },
    "branding": {
        "title": "branding",
        "path": `designer.svg`,
        "tags": [
            "plugin",
            "customization",
            "theme",
            "whitelabel"
        ]
    },
    "browse-kb": {
        "title": "Browse help articles",
        "path": `faq.svg`,
        "tags": [
            "knowledge-base",
            "faq",
            "articles",
            "documentation"
        ]
    },
    "building": {
        "title": "Building",
        "path": `building.svg`,
        "tags": [
            "building",
            "office"
        ]
    },
    "calendar": {
        "title": "Calendar",
        "path": `online-calendar.svg`,
        "tags": [
            "date",
            "schedule",
            "agenda",
            "time",
            "event",
            "planning"
        ]
    },
    "car": {
        "title": "Car",
        "path": `vintage-car.svg`,
        "tags": [
            "vehicle",
            "transport",
            "automobile"
        ]
    },
    "carbon": {
        "title": "carbon",
        "path": `environment.svg`,
        "tags": [
            "plugin",
            "footprint",
            "environment",
            "sustainability",
            "co2",
            "green-IT"
        ]
    },
    "centreon": {
        "title": "centreon",
        "tags": [
            "plugin",
            "monitoring"
        ]
    },
    "chart-area": {
        "title": "Area chart",
        "path": `financial-data.svg`,
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "chart-bar": {
        "title": "Bars chart",
        "path": `business-plan.svg`,
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "chart-donut": {
        "title": "Donut chart",
        "path": `verify-data.svg`,
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "chart-line": {
        "title": "Line chart",
        "path": `growing.svg`,
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "chart-multiple": {
        "title": "Chart multiple",
        "path": `data-trends.svg`,
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "chart-pie": {
        "title": "Pie chart",
        "path": `pie-chart.svg`,
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "chart-search": {
        "title": "Search chart",
        "tags": [
            "charts",
            "reporting",
            "dashboard",
            "analytics"
        ]
    },
    "chat-1": {
        "title": "Chat 1",
        "path": `text-messages.svg`,
        "tags": [
            "message",
            "conversation",
            "communication"
        ]
    },
    "chat-2": {
        "title": "Chat 2",
        "path": `chat.svg`,
        "tags": [
            "message",
            "chat",
            "conversation",
            "communication"
        ]
    },
    "cloud": {
        "title": "Cloud",
        "path": `clouds.svg`,
        "tags": []
    },
    "cloud-instance": {
        "title": "Cloud instance",
        "path": `clouds.svg`,
        "tags": []
    },
    "cloud-inventory": {
        "title": "cloud-inventory",
        "path": `clouds.svg`,
        "tags": [
            "plugin",
            "asset"
        ]
    },
    "cloud-network-1": {
        "title": "Cloud Network 1",
        "path": `clouds.svg`,
        "tags": []
    },
    "cloud-network-2": {
        "title": "Cloud Network 2",
        "path": `clouds.svg`,
        "tags": []
    },
    "cloud-usage": {
        "title": "Cloud usage",
        "path": `clouds.svg`,
        "tags": [
            "monitoring",
            "billing"
        ]
    },
    "collaborative-tools": {
        "title": "collaborative-tools",
        "path": `remote-meeting.svg`,
        "tags": [
            "plugin",
            "notification",
            "communication",
            "webhook"
        ]
    },
    "connectivity-issue": {
        "title": "Connectivity issue",
        "tags": [
            "network",
            "internet",
            "connection"
        ]
    },
    "container": {
        "title": "Container",
        "tags": [
            "docker",
            "virtualization"
        ]
    },
    "containers": {
        "title": "Containers",
        "tags": [
            "docker",
            "virtualization"
        ]
    },
    "contract-signing-1": {
        "title": "Contract signing 1",
        "tags": [
            "legal",
            "agreement",
            "signature"
        ]
    },
    "contract-signing-2": {
        "title": "Contract signing 2",
        "tags": [
            "legal",
            "agreement",
            "signature"
        ]
    },
    "credit": {
        "title": "credit",
        "tags": [
            "plugin",
            "ticket",
            "helpdesk"
        ]
    },
    "data-export": {
        "title": "Data export",
        "tags": [
            "database"
        ]
    },
    "data-injection": {
        "title": "data-injection",
        "tags": [
            "plugin",
            "CSV",
            "import"
        ]
    },
    "database": {
        "title": "database",
        "path": `database-tables.svg`,
        "tags": []
    },
    "database-add": {
        "title": "Add database",
        "path": `database-tables.svg`,
        "tags": []
    },
    "delivery": {
        "title": "Delivery",
        "path": `drone-delivery.svg`,
        "tags": [
            "package",
            "shipping",
            "transport"
        ]
    },
    "diagnostic": {
        "title": "Diagnostic",
        "tags": [
            "troubleshooting",
            "analysis"
        ]
    },
    "doc-developer": {
        "title": "Developer documentation",
        "tags": [
            "developer",
            "api",
            "code"
        ]
    },
    "documentation": {
        "title": "Documentation",
        "tags": [
            "docs",
            "manual",
            "guide"
        ]
    },
    "download": {
        "title": "download",
        "tags": []
    },
    "error-404": {
        "title": "Error 404",
        "path": `not-found.svg`,
        "tags": [
            "not found"
        ]
    },
    "escalade": {
        "title": "escalade",
        "tags": [
            "plugin",
            "helpdesk",
            "ticket",
            "support",
            "group"
        ]
    },
    "factory": {
        "title": "Factory",
        "path": `factory.svg`,
        "tags": [
            "building",
            "manufacturing",
            "production",
            "industry"
        ]
    },
    "faq": {
        "title": "Frequently Asked Questions",
        "path": `faq.svg`,
        "tags": [
            "faq",
            "questions",
            "help"
        ]
    },
    "fields": {
        "title": "fields",
        "tags": [
            "plugin",
            "custom",
            "form"
        ]
    },
    "file-sheet": {
        "title": "Sheet file",
        "tags": [
            "File",
            "document",
            "excel",
            "spreadsheet"
        ]
    },
    "firewall": {
        "title": "Firewall",
        "path": `firewall.svg`,
        "tags": [
            "security",
            "protection"
        ]
    },
    "fixing-bug": {
        "title": "Fixing bug",
        "tags": [
            "issue",
            "problem",
            "error"
        ]
    },
    "fixing-bug-2": {
        "title": "Fixing bug 2",
        "tags": [
            "issue",
            "problem",
            "error"
        ]
    },
    "folder": {
        "title": "Folder",
        "tags": [
            "directory"
        ]
    },
    "formcreator": {
        "title": "formcreator",
        "tags": [
            "plugin",
            "form",
            "survey"
        ]
    },
    "gantt": {
        "title": "Gantt",
        "tags": [
            "project-management",
            "planning",
            "schedule"
        ]
    },
    "gdpr-tools": {
        "title": "gdpr-tools",
        "path": `gdpr.svg`,
        "tags": [
            "plugin",
            "privacy",
            "data-protection",
            "compliance"
        ]
    },
    "gear": {
        "title": "Gear",
        "tags": [
            "settings",
            "setup",
            "configuration",
            "preferences",
            "options",
            "cog"
        ]
    },
    "gear-hand": {
        "title": "Gear hand",
        "tags": [
            "gear",
            "wrench",
            "setup",
            "settings",
            "configuration",
            "preferences",
            "options",
            "cog"
        ]
    },
    "generic-objects": {
        "title": "generic-objects",
        "tags": [
            "plugin",
            "custom",
            "asset"
        ]
    },
    "glpi-ai": {
        "title": "glpi-ai",
        "path": `artificial-intelligence.svg`,
        "tags": [
            "plugin",
            "artificial-intelligence",
            "machine-learning",
            "natural-language-processing"
        ]
    },
    "glpi-cloud-support-1": {
        "title": "GLPI Cloud Support 1",
        "tags": []
    },
    "glpi-cloud-support-2": {
        "title": "GLPI Cloud Support 2",
        "tags": []
    },
    "group": {
        "title": "Group",
        "tags": [
            "users"
        ]
    },
    "group-alternative-1": {
        "title": "Group alternative 1",
        "tags": [
            "users"
        ]
    },
    "group-alternative-2": {
        "title": "Group alternative 2",
        "tags": [
            "users"
        ]
    },
    "group-web": {
        "title": "Group web",
        "path": `global-team.svg`,
        "tags": [
            "users"
        ]
    },
    "helpdesk": {
        "title": "Helpdesk",
        "tags": [
            "headphones",
            "support",
            "customer",
            "assistance",
            "service",
            "desk",
            "call"
        ]
    },
    "hierarchy": {
        "title": "Hierarchy",
        "tags": [
            "users",
            "group",
            "organization",
            "structure",
            "management",
            "users",
            "team",
            "group"
        ]
    },
    "holiday": {
        "title": "holiday",
        "path": `beach-day.svg`,
        "tags": [
            "plugin",
            "vacation",
            "nationnal-holiday"
        ]
    },
    "inbox": {
        "title": "Inbox",
        "path": `mailbox.svg`,
        "tags": [
            "email",
            "communication",
            "message",
            "email",
            "notifications"
        ]
    },
    "inventory": {
        "title": "Inventory",
        "tags": [
            "inventory",
            "items",
            "resources"
        ]
    },
    "inventory-numbers": {
        "title": "Inventory numbers",
        "tags": [
            "items",
            "assets"
        ]
    },
    "items-export": {
        "title": "Items export",
        "tags": []
    },
    "kb-faq": {
        "title": "Knowledge base and FAQ",
        "path": `faq.svg`,
        "tags": [
            "articles",
            "documentation"
        ]
    },
    "ldap-diagnostic": {
        "title": "LDAP diagnostic",
        "tags": [
            "directory",
            "troubleshooting"
        ]
    },
    "ldap-inventory": {
        "title": "LDAP inventory",
        "tags": [
            "directory",
            "users"
        ]
    },
    "ldap-manage": {
        "title": "LDAP manage",
        "tags": [
            "directory",
            "users"
        ]
    },
    "legal": {
        "title": "Legal",
        "tags": [
            "contract",
            "agreement",
            "law",
            "regulations"
        ]
    },
    "license": {
        "title": "License",
        "tags": [
            "software",
            "certificate"
        ]
    },
    "location-1": {
        "title": "Location 1",
        "tags": [
            "map",
            "pin"
        ]
    },
    "location-2": {
        "title": "Location 2",
        "tags": [
            "map",
            "pin"
        ]
    },
    "locations": {
        "title": "Locations",
        "tags": [
            "map",
            "places",
            "arborescence"
        ]
    },
    "lock": {
        "title": "Lock",
        "tags": [
            "security",
            "protection",
            "privacy",
            "safety"
        ]
    },
    "mobility": {
        "title": "Mobility",
        "tags": [
            "transport",
            "travel"
        ]
    },
    "monitoring": {
        "title": "Monitoring",
        "tags": [
            "watch",
            "supervision"
        ]
    },
    "more-options": {
        "title": "More options",
        "tags": [
            "settings",
            "preferences"
        ]
    },
    "more-satisfaction": {
        "title": "more-satisfaction",
        "path": `for-review.svg`,
        "tags": [
            "plugin",
            "survey",
            "feedback",
            "customer",
            "CSAT",
            "rating"
        ]
    },
    "network-inventory": {
        "title": "Network inventory",
        "tags": [
            "network",
            "devices",
            "agent"
        ]
    },
    "new-user-1": {
        "title": "New user 1",
        "tags": [
            "person",
            "profile"
        ]
    },
    "new-user-2": {
        "title": "New user 2",
        "tags": [
            "person",
            "profile"
        ]
    },
    "new-user-3": {
        "title": "New user 3",
        "tags": [
            "person",
            "profile"
        ]
    },
    "new-user-4": {
        "title": "New user 4",
        "tags": [
            "person",
            "profile"
        ]
    },
    "newspaper": {
        "title": "Newspaper",
        "tags": [
            "articles"
        ]
    },
    "notes": {
        "title": "notes",
        "tags": [
            "journal"
        ]
    },
    "oauth-imap": {
        "title": "oauth-imap",
        "tags": [
            "plugin",
            "email",
            "receiver"
        ]
    },
    "oauth-sso": {
        "title": "oauth-sso",
        "tags": [
            "plugin",
            "authentication",
            "single-sign-on",
            "login"
        ]
    },
    "on-premise": {
        "title": "On-premise",
        "tags": []
    },
    "order-management": {
        "title": "order-management",
        "path": `deliveries.svg`,
        "tags": [
            "plugin",
            "asset",
            "invoice",
            "delivery",
            "shipping",
            "purchase"
        ]
    },
    "order-supplies": {
        "title": "Order supplies",
        "path": `empty-cart.svg`,
        "tags": []
    },
    "partner": {
        "title": "Partner",
        "path": `handshake-deal.svg`,
        "tags": []
    },
    "pdf-export": {
        "title": "PDF export",
        "tags": [
            "document",
            "file",
            "export"
        ]
    },
    "phone-inventory": {
        "title": "Phone inventory",
        "tags": [
            "phone",
            "device",
            "agent"
        ]
    },
    "presentation": {
        "title": "presentation",
        "tags": [
            "training",
            "slideshow",
            "conference",
            "meeting"
        ]
    },
    "print-job": {
        "title": "Print a job",
        "path": `printing-invoices.svg`,
        "tags": [
            "printer"
        ]
    },
    "printer-inventory": {
        "title": "Printer inventory",
        "path": `printing-invoices.svg`,
        "tags": [
            "printer",
            "device",
            "agent"
        ]
    },
    "question": {
        "title": "Question",
        "tags": []
    },
    "rename-glpi-strings": {
        "title": "rename-glpi-strings",
        "tags": [
            "plugin",
            "customization"
        ]
    },
    "report-issue": {
        "title": "Report an issue",
        "path": `server-error.svg`,
        "tags": [
            "problem",
            "error",
            "bug"
        ]
    },
    "request-service": {
        "title": "Request a service",
        "path": `services.svg`,
        "tags": []
    },
    "request-support": {
        "title": "Request support",
        "path": `active-support.svg`,
        "tags": [
            "assistance",
            "help",
            "ticket"
        ]
    },
    "reservation": {
        "title": "Make a reservation",
        "path": `booking.svg`,
        "tags": [
            "booking",
            "appointment",
            "schedule"
        ]
    },
    "reset-password-1": {
        "title": "Reset password 1",
        "path": `forgot-password.svg`,
        "tags": []
    },
    "reset-password-2": {
        "title": "Reset password 2",
        "path": `forgot-password.svg`,
        "tags": []
    },
    "reset-password-3": {
        "title": "Reset password 3",
        "path": `forgot-password.svg`,
        "tags": []
    },
    "rss-feeds": {
        "title": "RSS feeds",
        "tags": [
            "news",
            "articles"
        ]
    },
    "scim": {
        "title": "scim",
        "tags": [
            "plugin",
            "users",
            "import",
            "synchronization",
            "provisioning"
        ]
    },
    "security": {
        "title": "Security",
        "tags": [
            "protection",
            "privacy",
            "safety",
            "shield"
        ]
    },
    "settings": {
        "title": "Settings",
        "tags": [
            "gear",
            "setup",
            "configuration",
            "preferences",
            "options",
            "cog"
        ]
    },
    "settings-search": {
        "title": "Search settings",
        "tags": [
            "gear",
            "wrench",
            "setup",
            "configuration",
            "preferences",
            "options",
            "cog"
        ]
    },
    "shaking-hands": {
        "title": "Shaking hands",
        "tags": [
            "agreement",
            "contract",
            "business",
            "partnership",
            "collaboration"
        ]
    },
    "shared-folder": {
        "title": "Shared folder",
        "tags": [
            "directory"
        ]
    },
    "shared-inbox": {
        "title": "Shared inbox",
        "tags": [
            "email"
        ]
    },
    "software-deployment": {
        "title": "Deploy a software",
        "tags": [
            "application"
        ]
    },
    "splitcat": {
        "title": "splitcat",
        "tags": [
            "plugin",
            "categories",
            "ticket",
            "helpdesk",
            "dropdown"
        ]
    },
    "tag": {
        "title": "tag",
        "tags": [
            "plugin",
            "label",
            "classification",
            "metadata"
        ]
    },
    "technical-assistance-1": {
        "title": "Technical assistance 1",
        "tags": [
            "support",
            "helpdesk",
            "assistance"
        ]
    },
    "technical-assistance-2": {
        "title": "Technical assistance 2",
        "tags": [
            "support",
            "helpdesk",
            "assistance"
        ]
    },
    "ticket": {
        "title": "Ticket",
        "tags": [
            "helpdesk",
            "issue",
            "problem",
            "support",
            "request",
            "incident",
            "form"
        ]
    },
    "tickets": {
        "title": "Tickets",
        "path": `chat-interface.svg`,
        "tags": [
            "helpdesk",
            "issue",
            "problem",
            "support",
            "request",
            "incident",
            "list"
        ]
    },
    "time": {
        "title": "Time",
        "tags": [
            "clock",
            "schedule",
            "agenda",
            "date",
            "hour"
        ]
    },
    "training": {
        "title": "Training",
        "tags": [
            "presentation",
            "learning",
            "education",
            "course",
            "seminar"
        ]
    },
    "translation": {
        "title": "translation",
        "tags": [
            "plugin",
            "localization",
            "internationalization",
            "i18n",
            "l10n"
        ]
    },
    "tutorial": {
        "title": "Tutorial",
        "tags": [
            "tutorial",
            "how-to",
            "guide"
        ]
    },
    "uninstall": {
        "title": "uninstall",
        "tags": [
            "plugin",
            "lifecycle",
            "asset",
            "process"
        ]
    },
    "unread-messages": {
        "title": "unread-messages",
        "tags": [
            "plugin",
            "notification"
        ]
    },
    "update-1": {
        "title": "Update 1",
        "tags": [
            "software",
            "application"
        ]
    },
    "update-2": {
        "title": "Update 2",
        "tags": [
            "software",
            "application"
        ]
    },
    "user-laptop": {
        "title": "user-laptop",
        "tags": [
            "asset",
            "device",
            "computer",
            "portable",
            "notebook"
        ]
    },
    "user-offboarding": {
        "title": "User offboarding",
        "path": `clearing-desk.svg`,
        "tags": []
    },
    "virus": {
        "title": "Virus",
        "tags": [
            "malware",
            "threat",
            "security",
            "protection"
        ]
    },
    "vpn": {
        "title": "VPN",
        "tags": [
            "network",
            "internet",
            "connection"
        ]
    },
    "web": {
        "title": "Web",
        "path": `connected-world.svg`,
        "tags": [
            "www",
            "internet",
            "world",
            "browser"
        ]
    },
    "webinar": {
        "title": "Webinar",
        "path": `video-call.svg`,
        "tags": [
            "meeting",
            "conference",
            "presentation"
        ]
    },
    "wharehouse": {
        "title": "Warehouse",
        "path": `logistics.svg`,
        "tags": [
            "building",
            "storage",
            "inventory",
            "stock"
        ]
    },
    "world": {
        "title": "World",
        "path": `world.svg`,
        "tags": [
            "web",
            "www",
            "internet",
            "globe",
            "earth",
            "planet"
        ]
    },
    "youtube": {
        "title": "YouTube",
        "path": `video-files.svg`,
        "tags": [
            "video",
            "youtube",
            "channel"
        ]
    }
} as const;

export function getIllustrationPath(name: string): string {
    const default_illustration_path = `onboarding.svg`;
    if (!illustrations[name]) {
        return `/illustrations/${default_illustration_path}`;
    }
    return `/illustrations/${illustrations[name].path}`;
}