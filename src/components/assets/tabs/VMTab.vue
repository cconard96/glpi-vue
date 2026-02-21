<script setup lang="ts">
    import { Column, DataTable, Tag } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import type { useAssets } from "@/composables/assets/useAssets";

    const { doGraphQLRequest } = useApi();
    const { formatDataSize } = useDataHelper();
    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');
    const vm_info = ref(null);

    function getStatusSeverity(state_name: string) {
        const state_name_lc = state_name.toLowerCase();
        if (state_name_lc.includes('off')) {
            return 'warn';
        } else if (state_name_lc === 'on' || state_name_lc === 'running') {
            return 'success';
        } else {
            return 'info';
        }
    }

    onMounted(() => {
        doGraphQLRequest(`
            query {
                VirtualMachine(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id name
                    state { id name } system { id name } type { id name }
                    uuid vcpu ram
                }
            }
        `).then((res) => {
            vm_info.value = res.data.VirtualMachine;
        });
    });
</script>

<template>
    <section v-if="vm_info">
        <DataTable :value="vm_info" class="mt-6" :rows="vm_info.length"
                   sortMode="multiple" removableSort>
            <Column key="name" field="name" header="Name">
                <template #body="slotProps">{{ slotProps.data.name }}</template>
            </Column>
            <Column key="type" field="type.name" header="Type">
                <template #body="slotProps">
                    <span>{{ slotProps.data.type?.name }}</span>
                    <span v-if="slotProps.data.system?.name"> ({{ slotProps.data.system?.name }})</span>
                </template>
            </Column>
            <Column key="state" field="state.name" header="State">
                <template #body="slotProps">
                    <Tag :severity="getStatusSeverity(slotProps.data.state?.name || 'Unknown')">{{ slotProps.data.state?.name || 'Unknown' }}</Tag>
                </template>
            </Column>
            <Column key="uuid" field="uuid" header="UUID">
                <template #body="slotProps">{{ slotProps.data.uuid }}</template>
            </Column>
            <Column key="vcpu" field="vcpu" header="vCPU">
                <template #body="slotProps">{{ slotProps.data.vcpu }}</template>
            </Column>
            <Column key="ram" field="ram" header="RAM">
                <template #body="slotProps">
                    <span v-if="slotProps.data.ram">{{ formatDataSize(slotProps.data.ram, 'MB') }}</span>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>