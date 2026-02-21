<script setup lang="ts">
    import { Column, DataTable } from "primevue";
    import { useApi } from "@/composables/useApi";
    import { inject, onMounted, ref } from "vue";
    import type { useAssets } from "@/composables/assets/useAssets";

    const { doGraphQLRequest } = useApi();
    const link_info = ref(null);
    const mainItem: ReturnType<typeof useAssets> = inject('mainItem');

    onMounted(() => {
        doGraphQLRequest(`
            query {
                ExternalLink(filter: "itemtype==${mainItem.getDefinition().key}") {
                    id itemtype name url: link open_window
                }
                ManualLink(filter: "itemtype==${mainItem.getDefinition().key};items_id==${mainItem.item.value.id}") {
                    id itemtype items_id name url comment open_window
                }
            }
        `).then((res) => {
            const external_links = res.data.ExternalLink ? res.data.ExternalLink.map(el => ({...el, url: el.url, type: 'External'})) : [];
            const manual_links = res.data.ManualLink ? res.data.ManualLink.map(ml => ({...ml, url: ml.url, type: 'Manual'})) : [];
            // if any link is missing a protocol, add // by default to prevent it from being treated as relative link
            external_links.forEach(el => {
                if (!/^https?:\/\//i.test(el.url) && !el.url.startsWith('//')) {
                    el.url = '//' + el.url;
                }
            });
            link_info.value = [...external_links, ...manual_links];
        });
    });
</script>

<template>
    <section v-if="link_info">
        <DataTable :value="link_info" class="mt-6" :rows="link_info.length" sortMode="multiple" removableSort>
            <Column key="url" field="url" header="Link">
                <template #body="slotProps">
                    <a :href="slotProps.data.url" :target="slotProps.data.open_window ? '_blank' : '_self'">
                        {{ slotProps.data.name }}
                    </a>
                </template>
            </Column>
            <Column key="linked_to" header="Linked To">
                <template #body="slotProps">
                    <span v-if="slotProps.data.type === 'External'">Asset Type</span>
                    <span v-else>Asset</span>
                </template>
            </Column>
        </DataTable>
    </section>
</template>

<style scoped>

</style>