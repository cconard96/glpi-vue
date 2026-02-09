import { AbstractModel } from "@/models/AbstractModel.ts";

export default class Monitor extends AbstractModel {
    static getTypeModule() {
        return 'assets';
    }

    static getTypeName(count: number = 1) {
        return 'Monitor';
    }

    static getOpenAPISchemaName() {
        return 'Monitor';
    }

    static getIcon() {
        return 'ti ti-device-desktop';
    }
}