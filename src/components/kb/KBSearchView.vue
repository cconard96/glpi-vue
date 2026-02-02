<script setup lang="ts">
import {ProgressSpinner, Tree} from 'primevue';
    import type { TreeNode } from 'primevue/treenode';
    import { useApi } from '@/composables/useApi.ts';
    import {ref} from "vue";
    import KBArticle from "@/components/kb/KBArticle.vue";
    import {useRoute, RouterLink} from "vue-router";

    const { doGraphQLRequest } = useApi();
    const route = useRoute();

    const articles_list = ref<TreeNode[]>([
        { key: '0', label: 'No category', icon: 'ti ti-folder', selectable: false, children: [] }
    ]);
    const selected_article = ref<TreeNode | null>(null);

    await doGraphQLRequest(`query { KBCategory { id name parent { id name } } KBArticle { id name categories { id } } }`).then((res) => {
        const categories = res.data.KBCategory;
        const articles = res.data.KBArticle;
        // Build category tree
        const category_map: Record<string, TreeNode> = {};
        categories.forEach((cat: any) => {
            category_map[cat.id] = {
                key: cat.id,
                label: cat.name,
                icon: 'ti ti-folder',
                selectable: false,
                children: []
            };
        });
        // Assign categories to their parents
        categories.forEach((cat: any) => {
            if (cat.parent && category_map[cat.parent.id ?? '0']) {
                category_map[cat.parent.id].children.push(category_map[cat.id]);
            } else {
                articles_list.value.push(category_map[cat.id]);
            }
        });
        // Assign articles to categories
        articles.forEach((art: any) => {
            const article_node: TreeNode = {
                key: art.id,
                label: art.name,
                icon: 'ti ti-file',
                selectable: true
            };
            if (art.categories.length > 0) {
                art.categories.forEach((cat: any) => {
                    if (category_map[cat.id]) {
                        category_map[cat.id].children.push(article_node);
                    }
                });
            } else {
                articles_list.value[0].children.push(article_node);
            }
        });
    });

    function loadArticle(node: TreeNode) {
        // Load article content and display in the search results pane
        selected_article.value = node;
    }

    if (route.params.article_id) {
        selected_article.value = { key: route.params.article_id as string, label: '', icon: 'ti ti-file' };
    }
</script>

<template>
    <div class="grid grid-cols-[250px_1fr] gap-4 overflow-hidden">
        <Tree :value="articles_list" @nodeSelect="loadArticle" selectionMode="single">
            <template #nodetoggleicon="{ node, expanded }">
                <i class="ti" :class="expanded ? 'ti-chevron-down' : 'ti-chevron-right'"></i>
            </template>
            <template #default="{node}">
                <span v-if="node.children" class="ms-2">{{ node.label }}</span>
                <RouterLink v-else :to="{ params: { article_id: node.key } }" class="no-underline text-inherit">
                    {{ node.label }}
                </RouterLink>
            </template>
        </Tree>
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