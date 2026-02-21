<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import { type useAssets } from "@/composables/assets/useAssets";

    const { doGraphQLRequest } = useApi();
    const appliance_info = ref(null);
    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
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
    });
</script>

<template>
    <section v-if="appliance_info">
        <DataTable :value="appliance_info" class="mt-6" :rows="appliance_info.length" sortMode="multiple" removableSort>
            <Column key="appliance.name" field="appliance.name" header="Name"></Column>
            <Column key="relations" header="Relations">
                <template #body="slotProps">
                    <div v-if="slotProps.data.environment.length > 0">
                        <div v-for="env in slotProps.data.environment" :key="env.id">
                            <strong>Environment:</strong> {{ env.name }}
                        </div>
                    </div>
                    <div v-if="slotProps.data.domain.length > 0">
                        <div v-for="dom in slotProps.data.domain" :key="dom.id">
                            <strong>Domain:</strong> {{ dom.name }}
                        </div>
                    </div>
                    <div v-if="slotProps.data.location.length > 0">
                        <div v-for="loc in slotProps.data.location" :key="loc.id">
                            <strong>Location:</strong> {{ loc.name }}
                        </div>
                    </div>
                    <div v-if="slotProps.data.network.length > 0">
                        <div v-for="net in slotProps.data.network" :key="net.id">
                            <strong>Network:</strong> {{ net.name }}
                        </div>
                    </div>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>