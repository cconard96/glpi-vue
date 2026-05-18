<script setup lang="ts">
    import { useApi } from "@/common/useApi.ts";
    import { getIllustrationPath } from "@/core/util/illustrations.ts";
    import { InputText, useToast } from "primevue";

    const { doGraphQLRequest } = useApi();
    const toast = useToast();

    const service_catalog_info = await doGraphQLRequest(`
        query {
            ServiceCatalogInfo {
                helpdesk_home_title
                helpdesk_home_search_enabled
                tiles {__typename ...GLPIPageTileFields ...ExternalPageTileFields ...FormTileFields }
            }
        }
        fragment GLPIPageTileFields on GLPIPageTile { _tile_type id title description illustration page }
        fragment ExternalPageTileFields on ExternalPageTile { _tile_type id title description illustration url }
        fragment FormTileFields on FormTile { _tile_type id title description illustration form { id name } }
    `).then((res) => {
        return res.data.ServiceCatalogInfo;
    });

    function selectTile(tile) {
        toast.add({
            severity: 'info',
            summary: tile.title,
            detail: `Not implemented`,
            life: 3000
        })
    }
</script>

<template>
    <div class="mt-4 flex flex-col overflow-hidden">
        <div>
            <h1 class="md:text-5xl text-3xl text-center" v-text="service_catalog_info['helpdesk_home_title']"></h1>
            <div v-if="service_catalog_info['helpdesk_home_search_enabled']" class="mt-6">
                <div class="md:mb-8 mb-4">
                    <InputText :placeholder="$t('service_catalog.search.placeholder', 'Search for services and articles...')" fluid />
                </div>
            </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 md:gap-6 gap-4 overflow-auto mb-8">
            <div v-for="tile in service_catalog_info['tiles']" :key="tile.id" tabindex="0" @click="() => selectTile(tile)" @keyup.enter="() => selectTile(tile)"
                 class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow md:p-6 p-4 flex md:flex-col flex-row cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition duration-200">
                <img v-if="tile.illustration" :src="getIllustrationPath(tile.illustration)" alt="" class="me-4 md:me-0 md:mb-4 md:h-32 h-16 object-contain" role="img">
                <div>
                    <h2 class="text-heading-2 mb-2" v-text="tile.title"></h2>
                    <p class="text-secondary md:mb-4 line-clamp-3 text-ellipsis" v-dompurify-html="tile.description"></p>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>

</style>