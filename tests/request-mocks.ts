import { http, HttpResponse } from "msw";
import { server } from 'vitest/browser';
import { setupWorker } from "msw/browser";

const { readFile } = server.commands;

const httpHandlers = [
    http.post(`${import.meta.env.VITE_GLPI_URL}/api.php/token`, () => {
        console.log('Mocking token endpoint');
        return HttpResponse.json({
            "token_type":"Bearer",
            "expires_in":3600,
            "access_token":"TEST_ACCESS_TOKEN",
            "refresh_token":"TEST_REFRESH_TOKEN",
            // expire in an hour
            "expiration": Date.now() + 3600 * 1000,
        });
    }),
    http.get(`${import.meta.env.VITE_GLPI_URL}/api.php/Session`, () => {
        return HttpResponse.json({
            "user_id": 99,
            "use_mode": 0,
            "friendly_name": "John Doe",
            "name": "jdoe",
            "real_name": "Doe",
            "first_name": "John",
            "default_entity": 0,
            "profiles": {
                "1": {
                    "name": "Self-Service",
                    "entities": [
                        {
                            "id": 0,
                            "name": "Root entity",
                            "is_recursive": 1
                        }
                    ]
                },
                "4": {
                    "name": "Super-Admin",
                    "entities": [
                        {
                            "id": 0,
                            "name": "Root entity",
                            "is_recursive": 1
                        }
                    ]
                }
            },
            "active_entities": [0],
            "groups": [],
            "active_profile": {
                "id": 4,
                "name": "Super-Admin",
                "interface": "central",
                "ticket_status": "{\"1\":{\"1\":true,\"10\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"6\":true},\"10\":{\"1\":true,\"10\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"6\":true},\"2\":{\"1\":true,\"10\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"6\":true},\"3\":{\"1\":true,\"10\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"6\":true},\"4\":{\"1\":true,\"10\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"6\":true},\"5\":{\"1\":true,\"10\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"6\":true},\"6\":{\"1\":true,\"10\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"6\":true}}",
                "change_status": "{\"1\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"9\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"10\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"7\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"4\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"11\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"12\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"5\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"8\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"6\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"14\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true},\"13\":{\"1\":true,\"9\":true,\"10\":true,\"7\":true,\"4\":true,\"11\":true,\"12\":true,\"5\":true,\"8\":true,\"6\":true,\"14\":true,\"13\":true}}",
                "problem_status": "{\"1\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true},\"7\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true},\"2\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true},\"3\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true},\"4\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true},\"5\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true},\"8\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true},\"6\":{\"1\":true,\"7\":true,\"2\":true,\"3\":true,\"4\":true,\"5\":true,\"8\":true,\"6\":true}}",
                "rights": {
                    "agent": 19,
                    "appliance": 31,
                    "asset_test": 3871,
                    "asset_test2": 0,
                    "backup": 1045,
                    "bookmark_public": 23,
                    "budget": 127,
                    "cable_management": 31,
                    "calendar": 23,
                    "cartridge": 3967,
                    "certificate": 255,
                    "change": 132223,
                    "changevalidation": 1044,
                    "cluster": 31,
                    "computer": 4095,
                    "config": 3,
                    "consumable": 3967,
                    "contact_enterprise": 255,
                    "contract": 255,
                    "dashboard": 23,
                    "database": 31,
                    "datacenter": 31,
                    "defaultfilter": 23,
                    "device": 23,
                    "devicesimcard_pinpuk": 3,
                    "document": 8447,
                    "domain": 31,
                    "dropdown": 23,
                    "dropdown_tag": 23,
                    "entity": 3327,
                    "externalevent": 1055,
                    "followup": 64535,
                    "form": 31,
                    "global_validation": 0,
                    "group": 119,
                    "infocom": 23,
                    "internet": 159,
                    "inventory": 3073,
                    "itilcategory": 23,
                    "itilfollowuptemplate": 23,
                    "itiltemplate": 23,
                    "itilvalidationtemplate": 23,
                    "knowbase": 15383,
                    "knowbasecategory": 23,
                    "license": 255,
                    "line": 255,
                    "lineoperator": 23,
                    "link": 23,
                    "location": 23,
                    "locked_field": 6,
                    "logs": 1,
                    "monitor": 4095,
                    "networking": 4095,
                    "notification": 23,
                    "oauth_client": 23,
                    "password_update": 1,
                    "pendingreason": 31,
                    "peripheral": 4095,
                    "personalization": 3,
                    "phone": 4095,
                    "planning": 3073,
                    "printer": 4095,
                    "problem": 1151,
                    "profile": 23,
                    "project": 1151,
                    "projecttask": 1145,
                    "queuednotification": 31,
                    "recurrentchange": 31,
                    "refusedequipment": 19,
                    "reminder_public": 159,
                    "reports": 1,
                    "reservation": 1055,
                    "rssfeed_public": 159,
                    "rule_asset": 1047,
                    "rule_change": 1047,
                    "rule_dictionnary_dropdown": 23,
                    "rule_dictionnary_printer": 23,
                    "rule_dictionnary_software": 23,
                    "rule_import": 23,
                    "rule_ldap": 23,
                    "rule_location": 23,
                    "rule_mailcollector": 23,
                    "rule_problem": 1047,
                    "rule_softwarecategories": 23,
                    "rule_ticket": 1047,
                    "search_config": 3072,
                    "show_group_hardware": 1,
                    "slm": 279,
                    "snmpcredential": 31,
                    "software": 4095,
                    "solutiontemplate": 23,
                    "state": 23,
                    "statistic": 1,
                    "system_logs": 1,
                    "task": 64535,
                    "taskcategory": 23,
                    "tasktemplate": 23,
                    "ticket": 523295,
                    "ticketcost": 23,
                    "ticketrecurrent": 23,
                    "ticketvalidation": 15376,
                    "transfer": 23,
                    "typedoc": 23,
                    "unmanaged": 27,
                    "user": 15519,
                },
                "helpdesk_hardware": 3,
                "helpdesk_item_type": "[\"Computer\",\"Monitor\",\"NetworkEquipment\",\"Peripheral\",\"Phone\",\"Printer\",\"Software\",\"DCRoom\",\"Rack\",\"Enclosure\",\"Database\"]",
                "managed_domainrecordtypes": "[-1]"
            },
            "active_entity": {
                "id": 0,
                "short_name": "Root entity (tree structure)",
                "complete_name": "Root entity (tree structure)",
                "recursive": 1
            }
        });
    }),
    http.get(`${import.meta.env.VITE_GLPI_URL}/api.php/doc.json`, async () => {
        const components = await readFile('./tests/fixtures/components.json', { encoding: 'utf-8'});
        return HttpResponse.json({
            components: JSON.parse(components),
        });
    }),
    http.get(`${import.meta.env.VITE_GLPI_URL}/api.php/Session/EntityTree`, () => {
        return HttpResponse.json([
            {
                "key": 0,
                "label": "Root entity",
                "children": [],
                "expanded": true,
                "selected": true
            }
        ]);
    }),
    http.get(`${import.meta.env.VITE_GLPI_URL}/api.php/Administration/User/99/Preference`, () => {
        return HttpResponse.json({
            "id": 99,
            "language": null,
            "use_mode": 0,
            "list_limit": 20,
            "date_format": null,
            "number_format": null,
            "name_format": null,
            "csv_delimiter": null,
            "is_ids_visible": null,
            "use_flat_dropdowntree": null,
            "use_flat_dropdowntree_on_search_result": null,
            "show_new_tickets_on_home": null,
            "priority_color_verylow": null,
            "priority_color_low": null,
            "priority_color_medium": null,
            "priority_color_high": null,
            "priority_color_veryhigh": null,
            "priority_color_major": null,
            "private_followups_by_default": null,
            "private_tasks_by_default": null,
            "show_count_on_tabs": null,
            "refresh_view_interval": null,
            "set_default_tech": null,
            "set_default_requester": null,
            "set_followup_tech": null,
            "set_solution_tech": null,
            "home_list_limit": null,
            "notification_to_myself": null,
            "duedate_color_ok": null,
            "duedate_color_warning": null,
            "duedate_color_critical": null,
            "duedate_threshold_warning": null,
            "duedate_threshold_warning_unit": null,
            "duedate_threshold_critical": null,
            "duedate_threshold_critical_unit": null,
            "pdf_font": null,
            "keep_devices_when_purging_item": null,
            "show_new_item_after_creation": null,
            "default_task_state": null,
            "default_task_state_planned": null,
            "palette": null,
            "page_layout": null,
            "timeline_order": null,
            "richtext_layout": null,
            "autolock_mode": null,
            "directunlock_notification": null,
            "highcontrast_css": null,
            "default_homepage_tab": null,
            "toast_location": null,
            "timeline_action_button_layout": null,
            "timeline_date_format": null,
            "default_is_notifications_enabled": null,
            "show_search_form": null,
            "search_pagination_on_top": null,
            "timezone": "America\/New_York",
            "default_requesttype": null
        });
    }),
];

export const mswServer = setupWorker(...httpHandlers);

export function startMockServer() {
    return mswServer.start({
        onUnhandledRequest: 'error',
        quiet: true,
    });
}

export function stopMockServer() {
    mswServer.stop();
}