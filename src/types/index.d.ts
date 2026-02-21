import type { Component, Ref } from "vue";

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

export interface useBaseItem {
    getDefinition: () => BaseItemDefinition,
    item: Ref<any>,
}

interface TabDefinition {
    key: string;
    label: string;
    icon: string;
    component: Component;
}