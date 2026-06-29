<script setup lang="ts">
    import { Column, DataTable, Button, useDialog, useToast } from "primevue";
    import { useApi } from "@/common/api/useApi";
    import { defineAsyncComponent, inject, onMounted, ref } from "vue";
    import { type useAsset } from "@/modules/assets/useAsset.js";
    import { useI18n } from "vue-i18n";

    const { doGraphQLRequest, doApiRequest } = useApi();
    const dialog = useDialog();
    const toast = useToast();
    const { t: $t } = useI18n();
    const appliance_info = ref(null);
    const mainItem: ReturnType<typeof useAsset> = inject('mainItem');

    onMounted(() => {
        loadRelations();
    });

    async function loadRelations() {
        return doGraphQLRequest(`
            query {
                Appliance_Item(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id
                    appliance { id name }
                    environment { id name }
                    domain { id name }
                    location { id name }
                    network { id name }
                }
            }
        `).then((res) => {
            appliance_info.value = res.data.Appliance_Item;
        });
    }

    function openAddRelationDialog(usedRelationsData: { appliance: {id: number}, environment: any[]; domain: any[]; location: any[]; network: any[]; }) {
        const relationDialog = dialog.open(defineAsyncComponent(() => import('@/common/dialog/ItemSelectionDialog.vue')), {
            props: {
                header: $t('management.appliance.addRelation', 'Add Relation'),
                modal: true,
                draggable: false,
                //dismissableMask: true, //TODO the other dialogs need this
            },
            data: {
                allowedItemtypes: ['ApplianceEnvironment', 'Domain', 'Location', 'Network'],
                selectedItems: {
                    ApplianceEnvironment: usedRelationsData.environment,
                    Domain: usedRelationsData.domain,
                    Location: usedRelationsData.location,
                    Network: usedRelationsData.network,
                },
                itemtypeSelectProps: {
                    placeholder: $t('management.appliance.selectRelationType', 'Select relation type'),
                },
            },
            emits: {
                onSave: async (addedItems, removedItems) => {
                    const endpoint = `/Assets/${mainItem.getDefinition().key}/${mainItem.item.value.id}/Appliance/${usedRelationsData.appliance.id}`;

                    const apiRequests = [];
                    let failureCount = 0;
                    for (const [itemtype, items] of Object.entries(addedItems)) {
                        const api_itemtype = itemtype === 'ApplianceEnvironment' ? 'Environment' : itemtype;
                        for (const item of items) {
                            apiRequests.push(doApiRequest(`${endpoint}/${api_itemtype}/${item.id}`, {
                                method: 'POST',
                            }).catch(() => {
                                failureCount++;
                            }));
                        }
                    }

                    for (const [itemtype, items] of Object.entries(removedItems)) {
                        const api_itemtype = itemtype === 'ApplianceEnvironment' ? 'Environment' : itemtype;
                        for (const item of items) {
                            apiRequests.push(doApiRequest(`${endpoint}/${api_itemtype}/${item.id}`, {
                                method: 'DELETE',
                            }).catch(() => {
                                failureCount++;
                            }));
                        }
                    }

                    relationDialog.close();

                    await Promise.all(apiRequests);

                    await loadRelations();
                    if (failureCount > 0) {
                        toast.add({
                            severity: 'error',
                            summary: $t('common.error.error', 'Error'),
                            detail: $t('management.appliance.relationUpdateFailed', 'Failed to update some relations.'),
                            life: 5000,
                        });
                    } else {
                        toast.add({
                            severity: 'success',
                            summary: $t('common.success.success', 'Success'),
                            detail: $t('management.appliance.relationUpdateSuccess', 'Relations updated successfully.'),
                            life: 3000,
                        });
                    }
                }
            }
        });
    }
</script>

<template>
    <section v-if="appliance_info">
        <DataTable :value="appliance_info" class="mt-6" :rows="appliance_info.length" sortMode="multiple" removableSort>
            <Column key="appliance.name" field="appliance.name" :header="$t('item.fields.name', 'Name')"></Column>
            <Column key="relations" header="Relations">
                <template #body="slotProps">
                    <div v-if="slotProps.data.environment.length > 0">
                        <div v-for="env in slotProps.data.environment" :key="env.id">
                            <strong>{{ $t('setup.dropdown.applianceenvironment.label', 1, {
                                default: 'Appliance Environment | Appliance Environments',
                            }) }}</strong> {{ env.name }}
                        </div>
                    </div>
                    <div v-if="slotProps.data.domain.length > 0">
                        <div v-for="dom in slotProps.data.domain" :key="dom.id">
                            <strong>{{ $t('management.domain.label', 1, {
                                default: 'Domain | Domains',
                            }) }}</strong> {{ dom.name }}
                        </div>
                    </div>
                    <div v-if="slotProps.data.location.length > 0">
                        <div v-for="loc in slotProps.data.location" :key="loc.id">
                            <strong>{{ $t('setup.dropdowns.location', 1, {
                                default: 'Location | Locations',
                            }) }}</strong> {{ loc.name }}
                        </div>
                    </div>
                    <div v-if="slotProps.data.network.length > 0">
                        <div v-for="net in slotProps.data.network" :key="net.id">
                            <strong>{{ $t('setup.dropdowns.network', 1, {
                                default: 'Network | Networks',
                            }) }}</strong> {{ net.name }}
                        </div>
                    </div>
                    <Button variant="link" size="small" severity="secondary" class="p-0" @click="openAddRelationDialog(slotProps.data)">
                        <i class="ti ti-plus"></i>
                        {{ $t('management.appliance.addRelation', 'Add Relation') }}
                    </Button>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>