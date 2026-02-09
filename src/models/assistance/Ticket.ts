import {AbstractModel} from "@/models/AbstractModel.ts";

export class Ticket extends AbstractModel {
    static readonly rightname = 'ticket';

    static getTypeModule() {
        return 'assistance';
    }

    static getTypeName(count: number = 1) {
        return 'Ticket';
    }

    getOpenAPISchemaName() {
        return 'Ticket';
    }

    static getIcon() {
        return 'ti ti-alert-circle';
    }

    static getTabs() {
        return [
            { key: 'main', label: this.getTypeName(), icon: this.getIcon() },
        ];
    }

    static getRESTEndpoint(): String {
        return 'Assistance/Ticket';
    }
}