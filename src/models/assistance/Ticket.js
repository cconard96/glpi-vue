import {AbstractModel} from "@/models/AbstractModel.js";

export class Ticket extends AbstractModel {
    getOpenAPISchemaName() {
        return 'Ticket';
    }
}