<script setup lang="ts">
    import { Card, ProgressSpinner, Button, Popover, Divider, Menu, InputText, Tree } from 'primevue';
    import { useApi } from '@/composables/useApi.ts';
    import {computed, ref, useTemplateRef, watch} from "vue";
    import RichTextEditor from "@/components/forms/RichTextEditor.vue";
    import {useSessionStore} from "@/composables/useSessionStore";
    import {useRouter} from "vue-router";
    import {useDataHelper} from "@/composables/useDataHelper";
    import CommentsPanel from "@/components/kb/CommentsPanel.vue";

    const props = defineProps({
        article_id: {
            type: [String, Number],
            required: true
        }
    });

    const { replace: replaceRoute } = useRouter();
    const { hasRight } = useSessionStore();
    const { doGraphQLRequest } = useApi();
    const { formatUsername, formatDate } = useDataHelper();
    const loading = ref(false);
    const article = ref(null);
    const edit_mode = ref(false);
    const share_popover_el = useTemplateRef('share_popover');
    const actions_menu_el = useTemplateRef('actions_menu');

    function loadArticle(article_id: string|number) {
        loading.value = true;
        doGraphQLRequest(`
            query {
                KBArticle (filter: "id==${article_id}") {
                    id name content date_creation date_mod views is_faq
                    user { id username firstname realname }
                }
            }
        `).then((res) => {
            const article_data = res.data.KBArticle[0];
            article.value = article_data;
            article.value.name = ref(article_data.name);
            article.value.content = ref(article_data.content);
            loading.value = false;
            document.title = `KB Article - ${article.value.name}`;
            replaceRoute({ path: '/tools/knowbase/' + article.value.id });
        });
    }

    watch(() => props.article_id, () => {
        if (props.article_id) {
            loadArticle(props.article_id);
        }
    });
    await loadArticle(props.article_id);

    const is_edited = computed(() => {
        if (!article.value) {
            return false;
        }
        const creation_date = new Date(article.value.date_creation);
        const mod_date = new Date(article.value.date_mod);
        return mod_date > creation_date;
    });
    const comments_opened = ref(false);

    function toggleShareOptions(e) {
        if (share_popover_el.value) {
            share_popover_el.value.toggle(e);
        }
    }

    function toggleActionsMenu(e) {
        if (actions_menu_el.value) {
            actions_menu_el.value.toggle(e);
        }
    }
</script>

<template>
    <div :class="`grid h-full ${comments_opened ? 'grid-cols-[1fr_250px]' : ''}`">
        <Card v-if="!loading && article" role="article" class="h-full overflow-hidden" :pt="{ body: { class: 'overflow-auto' } }">
            <template #header>
                <div v-if="hasRight('knowbase', 2)" class="flex justify-end p-4 gap-2">
                    <Button icon="ti ti-share" label="Share" severity="secondary"
                            @click="toggleShareOptions" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                    <Popover ref="share_popover">
                        Share options (not implemented)
                    </Popover>
                    <Button :icon="edit_mode ? 'ti ti-device-floppy' : 'ti ti-edit'" :label="edit_mode ? 'Save' : 'Edit'" @click="edit_mode = !edit_mode"></Button>
                    <Divider layout="vertical"></Divider>
                    <Button icon="ti ti-dots-vertical" title="More actions" variant="outlined"
                            @click="toggleActionsMenu" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                    <Menu ref="actions_menu" popup :model="[
                        { key: 'show_comments', label: 'Show comments', icon: 'ti ti-messages', command: () => { comments_opened = !comments_opened } }
                    ]"></Menu>
                </div>
            </template>
            <template #title>
                <h1 class="text-4xl font-semibold text-heading" v-text="article.name"></h1>
            </template>
            <template #subtitle>
                <address class="text-sm text-muted-foreground">
                    <span v-if="!is_edited">Written By: </span>
                    <span v-else>Edited By: </span>
                    <span v-if="article.user" v-text="formatUsername(article.user)"></span>
                    <span v-else>
                        Unknown Author
                    </span>
                </address>
                <div>
                    Edited on:
                    <time :datetime="new Date(article.date_mod).toISOString()">
                        {{ formatDate(article.date_mod, { year: 'numeric', month: 'long', day: 'numeric' }) }}
                    </time>
                    <span class="mx-2">|</span>
                    <span>{{ article.views }} Views</span>
                </div>
            </template>
            <template #content>
                <div v-if="!edit_mode" v-dompurify-html="article.content"></div>
                <div v-else>
                    <RichTextEditor v-model="article.content"></RichTextEditor>
                </div>
            </template>
        </Card>
        <div v-else-if="loading" class="flex justify-center items-center h-64">
            <ProgressSpinner />
        </div>
        <CommentsPanel v-if="comments_opened" :article="article" ref="comments_panel"></CommentsPanel>
    </div>
</template>

<style scoped>

</style>