import type { Component, Ref } from "vue";
import type { components } from "../../data/hlapiv2_schema";
import { GLPIItem, GLPIItemType } from "@/common/useBaseItem.ts";

export type SchemaName = keyof components['schemas'];

export interface BaseItemDefinition<T extends GLPIItemType> {
    key: T,
    /** @description The module the item definition belongs to. May be used in the future to allow building slim versions of the frontend or disabling modules at runtime. **/
    module: string,
    restEndpoint: string,
    getLabel: (count: number) => string,
    icon: string,
    /**
     * @description The name of the right to check for this item.
     * Some itemtypes may not have a right name for themselves.
     * For example, ManualLink items are always linked to a parent item and require the UPDATE permission on the parent.
     **/
    rightname: string | null,
    /** @description The global view permission check method **/
    canView: () => boolean,
    /** @description The global create permission check method **/
    canCreate: () => boolean,
    /** @description The global update permission check method **/
    canUpdate: () => boolean,
    /** @description The global delete permission check method **/
    canDelete: () => boolean,
    /** @description The global purge permission check method **/
    canPurge: () => boolean,
    /** @description The global restore permission check method **/
    canRestore: () => boolean,
    /** @description The item-specific view permission check method. The global view permission check is not done here. **/
    canViewItem: (item: GLPIItem<T>) => boolean,
    /** @description The item-specific create permission check method. The global create permission check is not done here. **/
    canCreateItem: (data: Partial<components['schemas'][T]>) => boolean,
    /** @description The item-specific update permission check method. The global update permission check is not done here. **/
    canUpdateItem: (item: GLPIItem<T>) => boolean,
    /** @description The item-specific delete permission check method. The global delete permission check is not done here. **/
    canDeleteItem: (item: GLPIItem<T>) => boolean,
    /** @description The item-specific purge permission check method. The global purge permission check is not done here. **/
    canPurgeItem: (item: GLPIItem<T>) => boolean,
    /** @description The item-specific restore permission check method. The global restore permission check is not done here. **/
    canRestoreItem: (item: GLPIItem<T>) => boolean,
}

export interface useBaseItem<T extends GLPIItemType> {
    getDefinition: () => BaseItemDefinition<T>,
    item: Ref<components['schemas'][T]>,
}

interface TabDefinition {
    key: string;
    label: string;
    icon: string;
    component: Component;
}

interface GLPICreateResponseBody {
    id: number;
    href: string;
}

interface OpenAPISchemaDefinition {
    type: string;
    format?: string;
    description?: string;
    properties?: Record<string, OpenAPISchemaDefinition>;
    items?: OpenAPISchemaDefinition;
    /** @description Custom property to indicate the internal GLPI itemtype/class related to this schema */
    'x-itemtype'?: string;
    'x-mapped-property'?: boolean;
    'x-mapped-from'?: string;
    'x-mapper'?: (value: any) => any;
}