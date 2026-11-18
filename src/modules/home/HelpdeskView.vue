<script setup lang="ts">
    import { useApi } from "@/common/api/useApi.ts";
    import { getIllustrationPath } from "@/common/util/illustrations.ts";
    import InputText from '@cjdevstudios/bumblevue/inputtext';
    import { useToast } from '@cjdevstudios/bumblevue/usetoast';
    import HelpdeskTile from "@/modules/home/HelpdeskTile.vue";

    const { doGraphQLRequest } = useApi();
    const toast = useToast();

    const service_catalog_info = await doGraphQLRequest(`
        query {
            HelpdeskTilesInfo {
                helpdesk_home_title
                helpdesk_home_search_enabled
                tiles {__typename ...GLPIPageTileFields ...ExternalPageTileFields ...FormTileFields }
            }
        }
        fragment GLPIPageTileFields on GLPIPageTile { _tile_type id title description illustration page }
        fragment ExternalPageTileFields on ExternalPageTile { _tile_type id title description illustration url }
        fragment FormTileFields on FormTile { _tile_type id title description illustration form { id name } }
    `).then((res) => {
        return res.data.HelpdeskTilesInfo;
    });
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
            <HelpdeskTile v-for="tile in service_catalog_info['tiles']" :key="tile._tile_type + '_' + tile.id" :tile="tile"></HelpdeskTile>
        </div>
    </div>
</template>

<style scoped>

</style>