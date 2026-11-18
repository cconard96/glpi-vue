<script setup lang="ts">
    import { getIllustrationPath } from "@/common/util/illustrations.ts";
    import { useRouter } from 'vue-router';
    import { useToast } from '@cjdevstudios/bumblevue/usetoast';
    import { useI18n } from 'vue-i18n';

    interface GLPIPageTile {
        _tile_type: 'GLPIPageTile';
        title: string;
        description: string;
        illustration: string;
        page: string;
    }

    interface ExternalPageTile {
        _tile_type: 'ExternalPageTile';
        title: string;
        description: string;
        illustration: string;
        url: string;
    }

    interface FormTile {
        _tile_type: 'FormTile';
        title: string;
        description: string;
        illustration: string;
        form: {
            id: string;
            name: string;
        };
    }

    const props = defineProps<{
        tile: GLPIPageTile | ExternalPageTile | FormTile;
    }>();

    const toast = useToast();
    const router = useRouter();
    const { t: $t } = useI18n();

    const selectTile = () => {
        if (props.tile._tile_type === 'GLPIPageTile') {
            // Need to map the page to a route.
            let tileRoute = '';
            if (props.tile.page === 'faq') {
                tileRoute = '/tools/knowbase';
            } else if (props.tile.page === 'service_catalog') {
                // we do not have a separate route for service catalog, so we will just go to the homepage.
                tileRoute = '/';
            } else if (props.tile.page === 'reservation') {
                tileRoute = '/tools/reservation';
            } else if (props.tile.page === 'approval') {
                // TODO set search criteria to show only tickets waiting for approval from the current user
                tileRoute = '/assistance/ticket';
            } else if (props.tile.page === 'tickets') {
                tileRoute = '/assistance/ticket';
            }
            if (tileRoute === '') {
                toast.add({
                    severity: 'error',
                    summary: $t('error.error', 'Error'),
                    detail: `No route found for page ${props.tile.page}`,
                })
            } else {
                router.push(tileRoute);
            }
        } else if (props.tile._tile_type === 'ExternalPageTile') {
            window.open(props.tile.url, '_blank');
        } else if (props.tile._tile_type === 'FormTile') {
            router.push(`/assistance/form/${props.tile.form.id}`);
        }
    }
</script>

<template>
    <div tabindex="0" @click="selectTile" @keyup.enter="selectTile"
         class="bg-surface-0 dark:bg-surface-900 rounded-lg shadow md:p-6 p-4 flex md:flex-col flex-row cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-800 transition duration-200">
        <img v-if="tile.illustration" :src="getIllustrationPath(tile.illustration)" alt="" class="me-4 md:me-0 md:mb-4 md:h-32 h-16 object-contain" role="img">
        <div>
            <h2 class="text-heading-2 mb-2" v-text="tile.title"></h2>
            <p class="text-secondary md:mb-4 line-clamp-3 text-ellipsis" v-dompurify-html="tile.description"></p>
        </div>
    </div>
</template>

<style scoped>

</style>
