import { AbstractModel } from "@/models/AbstractModel.js";

export class Monitor extends AbstractModel {
    static getTypeModule() {
        return 'assets';
    }

    static getTypeName() {
        return 'Monitor';
    }

    static getOpenAPISchemaName() {
        return 'Monitor';
    }

    static getIcon() {
        return 'ti ti-device-desktop';
    }
}