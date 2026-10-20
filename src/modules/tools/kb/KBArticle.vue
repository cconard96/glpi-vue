<script setup lang="ts">
    import { Card, ProgressSpinner, Button, Popover, Divider, Menu, InputText, Tree } from '@cjdevstudios/bumblevue';
    import { useApi } from '@/common/api/useApi.ts';
    import {computed, ref, useTemplateRef, watch} from "vue";
    import RichTextEditor from "@/common/forms/RichTextEditor.vue";
    import {useSessionStore} from "@/common/useSessionStore";
    import {useRouter} from "vue-router";
    import {useDataHelper} from "@/common/useDataHelper";
    import CommentsPanel from "./CommentsPanel.vue";
    import { useToast } from '@cjdevstudios/bumblevue/usetoast';
    import { useI18n } from "vue-i18n";

    const props = defineProps({
        article_id: {
            type: [String, Number],
            required: true
        }
    });

    const { replace: replaceRoute } = useRouter();
    const { hasRight } = useSessionStore();
    const { doGraphQLRequest, doApiRequest } = useApi();
    const { formatUsername, formatDate } = useDataHelper();
    const loading = ref(false);
    const article = ref(null);
    const edit_mode = ref(false);
    const share_popover_el = useTemplateRef('share_popover');
    const actions_menu_el = useTemplateRef('actions_menu');
    const { t: $t } = useI18n();
    const toast = useToast();

    const preEditArticle = ref({
        name: '',
        content: ''
    });

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
            article.value.content = ref(article_data.content ?? '');
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

    function editArticle() {
        edit_mode.value = true;
        // Store the current article state in preEditArticle
        if (article.value) {
            preEditArticle.value.name = article.value.name;
            preEditArticle.value.content = article.value.content;
        }
    }

    function saveArticle() {
        if (!article.value) {
            return;
        }
        const payload = {
            name: article.value.name,
            content: article.value.content
        };
        doApiRequest(`/Knowledgebase/Article/${article.value.id}/`, {
            method: 'PATCH',
            data: payload
        }).then((res) => {
            article.value = res.data;
            article.value.name = ref(article.value.name);
            article.value.content = ref(article.value.content ?? '');
            edit_mode.value = false;
            toast.add({
                severity: 'success',
                summary: $t('common.success', 'Success'),
                detail: $t('tools.knowbase.article_saved', 'Article saved successfully.'),
                life: 3000
            });
        }).catch((err) => {
            toast.add({
                severity: 'error',
                summary: $t('common.error', 'Error'),
                detail: err.response.data.detail,
                life: 3000
            });
        });
    }

    function cancelEdit() {
        edit_mode.value = false;
        if (article.value) {
            article.value.name = preEditArticle.value.name;
            article.value.content = preEditArticle.value.content;
        }
    }
</script>

<template>
    <div :class="`grid h-full gap-2 ${comments_opened ? 'grid-cols-[1fr_250px]' : ''}`">
        <Card v-if="!loading && article" role="article" class="h-full overflow-hidden rounded-none" :pt="{ body: { class: 'overflow-auto py-0' } }">
            <template #header>
                <div v-if="hasRight('knowbase', 2)" class="flex justify-end p-4 gap-2">
                    <Button icon="ti ti-share" label="Share" severity="secondary" size="small"
                            @click="toggleShareOptions" aria-haspopup="true" aria-controls="overlay_menu"></Button>
                    <Popover ref="share_popover">
                        Share options (not implemented)
                    </Popover>
                    <Button v-if="edit_mode" icon="ti ti-x" size="small" label="Cancel" severity="secondary" @click="cancelEdit()"></Button>
                    <Button :icon="edit_mode ? 'ti ti-device-floppy' : 'ti ti-edit'" size="small" :label="edit_mode ? 'Save' : 'Edit'" @click="!edit_mode ? editArticle() : saveArticle()"></Button>
                    <Divider layout="vertical" class="mx-2"></Divider>
                    <Button icon="ti ti-dots-vertical" size="small" title="More actions" variant="outlined"
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
                    <span>
                        <i class="ti ti-eye align-text-bottom" aria-hidden="true"></i>
                        {{ article.views }} Views
                    </span>
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
        <CommentsPanel v-if="comments_opened" :article="article" ref="comments_panel" @close="comments_opened = false"></CommentsPanel>
    </div>
</template>

<style scoped>

</style>