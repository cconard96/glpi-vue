<script setup lang="ts">
    import { Tree, Message, InputText } from 'primevue';
    import {onMounted, ref} from "vue";
    import {useApi} from "@/composables/useApi";
    import {useDebounceFn} from "@vueuse/core";

    const { doGraphQLRequest } = useApi();
    const nodes = ref([]);
    const search_term = ref('');
    const RESULT_LIMIT = 100;

    onMounted(() => {
        loadSoftware();
    });

    const loadSoftware = useDebounceFn(() => {
        const filter = search_term.value
            ? `is_deleted==false;name=ilike='*${search_term.value}*'`
            : 'is_deleted==false';
        doGraphQLRequest(`
            query { Software(filter: "${filter}", limit: ${RESULT_LIMIT}, sort: "name") { id name is_deleted } }
        `, {} , search_term.value ? 'network-only' : 'cache-first').then(res => {
            nodes.value = res.data.Software.map((software: any) => ({
                key: software.id,
                label: software.name,
                leaf: false,
                loading: false,
                selectable: false,
            }));
        });
    }, 100, { maxWait: 1000 });

    function onNodeExpand(node) {
        if (node.children) {
            return;
        }
        node.loading = true;
        doGraphQLRequest(`
            query { SoftwareVersion(filter: "software.id==${node.key}") { id name arch software { id } } }
        `).then(res => {
            node.children = res.data.SoftwareVersion.map((version: any) => ({
                key: version.id,
                label: `${version.name} (${version.arch})`,
                leaf: true,
                selectable: true,
            }));
            node.loading = false;
        });
    }
</script>

<template>
    <Message v-if="nodes.length >= RESULT_LIMIT" severity="info" class="mb-3">Results have been limited to {{ RESULT_LIMIT }} for performance reasons. Please use the search to load more specific results.</Message>
    <InputText v-model="search_term" placeholder="Search" class="mb-3 w-full" @input="loadSoftware"></InputText>
    <Tree :value="nodes" loadingMode="icon" @nodeExpand="onNodeExpand"></Tree>
</template>

<style scoped>

</style>