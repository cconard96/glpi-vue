import { AbstractModel } from "@/models/AbstractModel.ts";
import {defineAsyncComponent} from "vue";

export default class Computer extends AbstractModel {
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

    static getTabs() {
        return [
            { key: 'main', label: this.getTypeName(), icon: this.getIcon(), component: defineAsyncComponent(() => import('@/components/assets/ComputerForm.vue')) },
            { key: 'hardware', label: 'Hardware', icon: 'ti ti-components', component: defineAsyncComponent(() => import('@/components/assets/tabs/HardwareTab.vue')) },
            { key: 'ossoftwareinstall', label: 'OS / Software', icon: 'ti ti-device-desktop-cog', component: defineAsyncComponent(() => import('@/components/assets/tabs/OSSoftwareTab.vue')) },
            { key: 'impact', label: 'Impact Analysis', icon: '' },
            { key: 'lines', label: 'Phone Lines', icon: '' },
            { key: 'networkport', label: 'Network Ports', icon: 'ti ti-network', component: defineAsyncComponent(() => import('@/components/assets/tabs/NetworkPortTab.vue')) },
            { key: 'sockets', label: 'Sockets', icon: '' },
            { key: 'remotemanagement', label: 'Remote Management', icon: 'ti ti-screen-share', component: defineAsyncComponent(() => import('@/components/assets/tabs/RemoteManagementTab.vue')) },
            { key: 'infocom', label: 'Management', icon: 'ti ti-wallet', component: defineAsyncComponent(() => import('@/components/assets/tabs/InfocomTab.vue')) },
            { key: 'contract', label: 'Contracts', icon: '' },
            { key: 'document', label: 'Documents', icon: '' },
            { key: 'virtualization', label: 'Virtualization', icon: 'ti ti-brand-docker', component: defineAsyncComponent(() => import('@/components/assets/tabs/VMTab.vue')) },
            { key: 'kb', label: 'Knowledge base', icon: '' },
            { key: 'assistance', label: 'Assistance', icon: '' },
            { key: 'project', label: 'Projects', icon: '' },
            { key: 'link', label: 'Links', icon: '' },
            { key: 'certificate', label: 'Certificates', icon: '' },
            { key: 'note', label: 'Notes', icon: 'ti ti-notes', component: defineAsyncComponent(() => import('@/components/assets/tabs/NoteTab.vue')) },
            { key: 'reservation', label: 'Reservations', icon: '' },
            { key: 'domain', label: 'Domains', icon: '' },
            { key: 'appliance', label: 'Appliances', icon: '' },
            { key: 'database', label: 'Databases', icon: '' },
        ];
    }
}