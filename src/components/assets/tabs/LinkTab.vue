<script setup lang="ts">
    import {DataTable, Column} from "primevue";
    import {AbstractModel} from "@/models/AbstractModel";
    import {useApi} from "@/composables/useApi";
    import {onMounted, ref} from "vue";

    const props = defineProps({
        main_itemtype_model: {
            type: Function as typeof AbstractModel,
            required: true
        },
        items_id: {
            type: Number,
            required: true
        }
    });

    const { doGraphQLRequest } = useApi();
    const link_info = ref(null);

    onMounted(() => {
        doGraphQLRequest(`
            query {
                ExternalLink(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()}") {
                    id itemtype name url: link open_window
                }
                ManualLink(filter: "itemtype==${props.main_itemtype_model.getOpenAPISchemaName()};items_id==${props.items_id}") {
                    id itemtype items_id name url comment open_window
                }
            }
        `).then((res) => {
            const external_links = res.data.ExternalLink ? res.data.ExternalLink.map(el => ({...el, url: el.url, type: 'External'})) : [];
            const manual_links = res.data.ManualLink ? res.data.ManualLink.map(ml => ({...ml, url: ml.url, type: 'Manual'})) : [];
            // if any link is missing a protocol, add // by default to prevent it from being treated as relative link
            external_links.forEach(el => {
                if (!/^https?:\/\//i.test(el.url) && !/^\/\//.test(el.url)) {
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