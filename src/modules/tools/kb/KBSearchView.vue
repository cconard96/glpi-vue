<script setup lang="ts">
    import {ProgressSpinner, Tree, Button} from '@cjdevstudios/bumblevue';
    import type { TreeNode } from '@cjdevstudios/bumblevue/treenode';
    import { useApi } from '@/common/api/useApi.ts';
    import { ref, onMounted, computed } from "vue";
    import KBArticle from "./KBArticle.vue";
    import {useRoute, RouterLink} from "vue-router";
    import { useI18n } from "vue-i18n";
    import type { components } from "../../../../data/hlapiv2_schema";

    const { t: $t } = useI18n();
    const { doGraphQLRequest } = useApi();
    const route = useRoute();

    const allArticles = ref<components['schemas']['KBArticle'][]>([]);
    const articlesList = computed(() => {
        // Organize articles into a tree structure
        const article_map: Record<string, TreeNode> = {};
        allArticles.value.forEach((article: any) => {
            article_map[article.id] = {
                key: article.id,
                label: article.name,
                icon: 'ti ti-file',
                children: [],
                is_favorite: article.is_favorite,
            };
        });
        const root_articles: TreeNode[] = [{
            key: 'favorites',
            label: $t('tools.knowbase.favorites', 'Favorites'),
            icon: 'ti ti-star',
            children: [],
            is_favorite: false,
        }];
        const favoritesRoot = root_articles[0];
        allArticles.value.forEach((article: any) => {
            if (article.is_favorite) {
                favoritesRoot.children!.push(article_map[article.id]);
            }
            if (article.parents && article.parents.length > 0) {
                article.parents.forEach((parent: any) => {
                    if (article_map[parent.id]) {
                        article_map[parent.id].children!.push(article_map[article.id]);
                    }
                });
            } else {
                root_articles.push(article_map[article.id]);
            }
        });
        return root_articles;
    });
    const selected_article = ref<TreeNode | null>(null);
    const expandedArticleKeys = ref({
        'favorites': true,
    });

    onMounted(() => {
        document.title = $t('tools.knowbase.label', 'Knowledge base');
    });

    await doGraphQLRequest(`query { KBArticle { id name is_favorite parents { id } } }`, {}, 'cache-first').then((res) => {
        res.data.KBArticle.forEach((article: any) => {
            allArticles.value.push({
                id: article.id,
                name: article.name,
                is_favorite: article.is_favorite,
                parents: article.parents,
            });
        });
    });

    function loadArticle(node: TreeNode) {
        if (node.key === 'favorites') {
            // expand/collapse the favorites node instead of loading an article
            expandedArticleKeys.value = {...expandedArticleKeys.value, [node.key]: !expandedArticleKeys.value[node.key] };
            return false;
        }
        // Load article content and display in the search results pane
        selected_article.value = node;
    }

    if (route.params.article_id) {
        selected_article.value = { key: route.params.article_id as string, label: '', icon: 'ti ti-file' };
        expandAllParents(selected_article.value);
    }

    /**
     * Recursively expand all parent nodes of the given node.
     * @param node
     */
    function expandAllParents(node: TreeNode) {
        if (node && node.key !== 'favorites') {
            // Find the parent of the node and expand it
            const parent = findParentNode(articlesList.value, node);
            if (parent) {
                expandedArticleKeys.value[parent.key] = true;
                expandAllParents(parent);
            }
        }
    }

    function findParentNode(nodes: TreeNode[], childNode: TreeNode): TreeNode | null {
        for (const node of nodes) {
            if (node.children && node.children.some(child => child.key == childNode.key)) {
                return node;
            }
            if (node.children) {
                const parent = findParentNode(node.children, childNode);
                if (parent) {
                    return parent;
                }
            }
        }
        return null;
    }
</script>

<template>
    <div class="grid grid-cols-[250px_1fr] gap-2 h-full overflow-hidden">
        <div class="flex flex-col gap-2 py-2 overflow-y-hidden">
            <Tree :value="articlesList" @nodeSelect="loadArticle" selectionMode="single" :expandedKeys="expandedArticleKeys"
                  :filter="true"
                  class="grid overflow-y-hidden py-0 px-0"
                  :pt="{
                      node: ({ props }) => {
                          return {
                              class: props.node.key === 'favorites' ? 'favorite-articles [&_.article-action-add]:group-hover:invisible' : ''
                          }
                      },
                      wrapper: {class: 'overflow-y-auto'},
                      nodeContent: {class: 'group p-0'}
                  }">
                <template #nodetoggleicon="{ expanded }">
                    <i class="ti" :class="expanded ? 'ti-chevron-down' : 'ti-chevron-right'"></i>
                </template>
                <template #default="{node}">
                    <div class="flex gap-2 items-center">
                        <span v-if="node.key === 'favorites'" class="ms-2">{{ node.label }}</span>
                        <RouterLink v-else :to="{ params: { article_id: node.key } }" class="no-underline text-inherit">
                            {{ node.label }}
                        </RouterLink>
                        <Button variant="text" size="small" class="article-action-add invisible group-hover:visible p-1 w-auto" icon="ti ti-file-plus"
                                :title="$t('tools.knowbase.add_article', 'Add article')"
                                :aria-label="$t('tools.knowbase.add_article', 'Add article')"
                        ></Button>
                    </div>
                </template>
            </Tree>
        </div>
        <div class="overflow-hidden">
            <Suspense v-if="selected_article">
                <KBArticle :article_id="selected_article.key"></KBArticle>
                <template #fallback>
                    <div class="flex justify-content-center align-items-center h-full">
                        <ProgressSpinner />
                    </div>
                </template>
            </Suspense>
        </div>
    </div>
</template>

<style scoped>

</style>