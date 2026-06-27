<script setup lang="ts">
    import { Card, InputText, Tree, Button } from "primevue";
    import { useDataHelper } from "@/common/useDataHelper.ts";
    import { nextTick, onMounted, ref, useTemplateRef } from "vue";
    import { useApi } from "@/common/api/useApi.ts";
    import { components } from "../../../../data/hlapiv2_schema";
    import ActorAvatar from "@/common/actor/ActorAvatar.vue";

    const props = defineProps<{
        article: components['schemas']['KBArticle']
    }>();
    defineEmits<{
        (e: 'close'): void
    }>();

    const { formatUsername, formatDate } = useDataHelper();
    const { doGraphQLRequest } = useApi();
    const comments_panel = useTemplateRef('comments_panel');
    const comment_expanded_keys = ref(new Map<string, boolean>());
    const comments = ref([]);

    onMounted(() => {
        // Load comments
        doGraphQLRequest(`
                query {
                    KBArticleComment (filter: "kbarticle.id==${props.article.id}") {
                        id comment date_creation date_mod
                        kbarticle { id }
                        user { id username firstname realname }
                        parent { id comment date_creation date_mod user { id username firstname realname } }
                    }
                }
            `).then((res) => {
            const comments_data = res.data.KBArticleComment;
            // build comment tree
            const comment_map: Record<string, any> = {};
            comments_data.forEach((comment: any) => {
                comment_expanded_keys.value.set(comment.id, true);
                comment.children = [];
                comment_map[comment.id] = {
                    ...comment,
                    key: comment.id
                };
            });
            const comment_tree: any[] = [];
            comments_data.forEach((comment: any) => {
                if (comment.parent && comment_map[comment.parent.id]) {
                    comment_map[comment.parent.id].children.push(comment);
                } else {
                    comment_tree.push(comment);
                }
            });
            comments.value = comment_tree;
        });
        comments_panel.value.focus();
    });
</script>

<template>
    <div ref="comments_panel" tabindex="0" role="complementary" aria-label="Comments">
        <Card class="h-full overflow-hidden rounded-none"
              :pt="{ body: { class: 'p-2 grow' }, content: { class: 'overflow-auto grow-1 px-2' } }">
            <template #header>
                <div class="flex flex-row-reverse px-2">
                    <Button icon="ti ti-x" severity="secondary" variant="text" size="small" @click="$emit('close')"></Button>
                </div>
            </template>
            <template #content>
                <div class="grid grid-rows-[auto_1fr] h-full">
                    <InputText placeholder="Add a comment..." fluid></InputText>
                    <Tree :value="comments" :expandedKeys="comment_expanded_keys" class="p-0" :class="comments.length === 0 ? 'h-full flex items-center justify-center' : ''">
                        <template #empty>
                            <div>
                                <span v-text="$t('comment.no_comments', 'No comments yet.')"></span>
                            </div>
                        </template>
                        <template #nodetoggleicon="{ node, expanded }">
                            <i class="ti" :class="expanded ? 'ti-chevron-down' : 'ti-chevron-right'"></i>
                        </template>
                        <template #default="{node}">
                            <div class="hover:[&>button]:block">
                                <Card class="bg-surface-200 dark:bg-surface-700" :pt="{ body: { class: 'p-2 gap-1' }, caption: { class: 'gap-1' } }">
                                    <template #title>
                                        <ActorAvatar actor_type="User" :actor_data="node.user" size="small"></ActorAvatar>
                                        <span class="text-base" v-text="formatUsername(node.user)"></span>
                                    </template>
                                    <template #subtitle>
                                        <time class="text-sm" :datetime="new Date(node.date_creation).toISOString()">
                                            {{ formatDate(node.date_creation, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                                        </time>
                                    </template>
                                    <template #content>
                                        <span class="text-base" v-text="node.comment"></span>
                                    </template>
                                </Card>
                                <Button class="hidden [@media(hover:none)]:block" :label="$t('comment.reply', 'Reply...')" variant="text" size="small"></Button>
                            </div>
                        </template>
                    </Tree>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>

</style>