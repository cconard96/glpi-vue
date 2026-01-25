import { AbstractModel } from "@/models/AbstractModel.ts";

export default class Monitor extends AbstractModel {
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