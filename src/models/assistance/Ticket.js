import {AbstractModel} from "@/models/AbstractModel.ts";

export class Ticket extends AbstractModel {
    getOpenAPISchemaName() {
        return 'Ticket';
    }
}