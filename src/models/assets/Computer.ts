import { AbstractModel } from "@/models/AbstractModel.js";

export class Computer extends AbstractModel {
    static getTypeModule() {
        return 'assets';
    }

    static getTypeName() {
        return 'Computer';
    }

    static getOpenAPISchemaName() {
        return 'Computer';
    }

    static getIcon() {
        return 'ti ti-device-laptop';
    }
}