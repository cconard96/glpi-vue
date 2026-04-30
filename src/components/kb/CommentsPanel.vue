<script setup lang="ts">
    import { Card, InputText, Tree, type TreeNode } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper.ts";
    import { onMounted, ref } from "vue";
    import { useApi } from "@/composables/useApi.ts";
    import { components } from "../../../data/hlapiv2_schema";
    import ActorAvatar from "@/components/actor/ActorAvatar.vue";

    const props = defineProps<{
        article: components['schemas']['KBArticle']
    }>();

    const { formatUsername, formatDate } = useDataHelper();
    const { doGraphQLRequest } = useApi();
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
    });
</script>

<template>
    <Card class="h-full overflow-hidden" role="complementary" aria-label="Comments"
          :pt="{ body: { class: 'h-full p-2' }, content: { class: 'overflow-auto grow-1' } }">
        <template #content>
            <Tree :value="comments" :expandedKeys="comment_expanded_keys" class="p-0">
                <template #default="{node}">
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
                </template>
            </Tree>
        </template>
        <template #footer>
            <InputText placeholder="Add a comment..." fluid></InputText>
        </template>
    </Card>
</template>

<style scoped>

</style>