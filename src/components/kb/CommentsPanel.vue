<script setup lang="ts">
    import { Card, InputText, Tree, type TreeNode } from "primevue";
    import { useDataHelper } from "@/composables/useDataHelper.ts";
    import { onMounted, ref } from "vue";
    import { useApi } from "@/composables/useApi.ts";
    import { components } from "../../../data/hlapiv2_schema";

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
          :pt="{ body: { class: 'h-full' }, content: { class: 'overflow-auto grow-1' } }">
        <template #content>
            <Tree :value="comments" :expandedKeys="comment_expanded_keys">
                <template #default="{node}">
                    <Card>
                        <template #title>
                            <span v-text="formatUsername(node.user)"></span>
                        </template>
                        <template #subtitle>
                            <time :datetime="new Date(node.date_creation).toISOString()">
                                {{ formatDate(node.date_creation, { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' }) }}
                            </time>
                        </template>
                        <template #content>
                            <span class="ms-2" v-text="node.comment"></span>
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