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
            { key: 'lines', label: 'Phone Lines', icon: 'ti ti-phone-calling', component: defineAsyncComponent(() => import('@/components/assets/tabs/LineTab.vue')) },
            { key: 'networkport', label: 'Network Ports', icon: 'ti ti-network', component: defineAsyncComponent(() => import('@/components/assets/tabs/NetworkPortTab.vue')) },
            { key: 'remotemanagement', label: 'Remote Management', icon: 'ti ti-screen-share', component: defineAsyncComponent(() => import('@/components/assets/tabs/RemoteManagementTab.vue')) },
            { key: 'infocom', label: 'Management', icon: 'ti ti-wallet', component: defineAsyncComponent(() => import('@/components/assets/tabs/InfocomTab.vue')) },
            { key: 'contract', label: 'Contracts', icon: 'ti ti-writing-sign', component: defineAsyncComponent(() => import('@/components/assets/tabs/ContractTab.vue')) },
            { key: 'document', label: 'Documents', icon: 'ti ti-files', component: defineAsyncComponent(() => import('@/components/assets/tabs/DocumentTab.vue')) },
            { key: 'virtualization', label: 'Virtualization', icon: 'ti ti-brand-docker', component: defineAsyncComponent(() => import('@/components/assets/tabs/VMTab.vue')) },
            { key: 'kb', label: 'Knowledge base', icon: 'ti ti-lifebuoy', component: defineAsyncComponent(() => import('@/components/assets/tabs/KBArticleTab.vue')) },
            { key: 'assistance', label: 'Assistance', icon: 'ti ti-headset', component: defineAsyncComponent(() => import('@/components/assets/tabs/AssistanceTab.vue')) },
            { key: 'project', label: 'Projects', icon: 'ti ti-layout-kanban', component: defineAsyncComponent(() => import('@/components/assets/tabs/ProjectTab.vue')) },
            { key: 'link', label: 'Links', icon: 'ti ti-link', component: defineAsyncComponent(() => import('@/components/assets/tabs/LinkTab.vue')) },
            { key: 'certificate', label: 'Certificates', icon: 'ti ti-certificate', component: defineAsyncComponent(() => import('@/components/assets/tabs/CertificateTab.vue')) },
            { key: 'note', label: 'Notes', icon: 'ti ti-notes', component: defineAsyncComponent(() => import('@/components/assets/tabs/NoteTab.vue')) },
            { key: 'reservation', label: 'Reservations', icon: '' },
            { key: 'domain', label: 'Domains', icon: 'ti ti-world-www', component: defineAsyncComponent(() => import('@/components/assets/tabs/DomainTab.vue')) },
            { key: 'appliance', label: 'Appliances', icon: 'ti ti-versions', component: defineAsyncComponent(() => import('@/components/assets/tabs/ApplianceTab.vue')) },
            { key: 'database', label: 'Databases', icon: 'ti ti-database', component: defineAsyncComponent(() => import('@/components/assets/tabs/DatabaseTab.vue')) },
        ];
    }
}