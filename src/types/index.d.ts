import type { Component, Ref } from "vue";
import type { components } from "../../data/hlapiv2_schema";

export interface BaseItemDefinition {
    key: string,
    module: string,
    restEndpoint: string,
    getLabel: (count: number) => string,
    icon: string,
    rightname: string,
    main_tab_component: Component,
    canView: () => boolean,
    canCreate: () => boolean,
    canUpdate: () => boolean,
    canDelete: () => boolean,
    canPurge: () => boolean,
    canRestore: () => boolean,
}

export interface useBaseItem<T extends keyof components['schemas']> {
    getDefinition: () => BaseItemDefinition,
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