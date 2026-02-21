<script setup lang="ts">
    import { Button, DataView, InputText, Message, Skeleton } from "primevue";
    import { inject, ref, watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";
    import { useApi } from "@/composables/useApi";
    import { useDataHelper } from "@/composables/useDataHelper";

    const props = defineProps({
        query: {
            type: String,
            default: ''
        },
        category: {
            type: Number,
            default: null
        },
    });

    defineEmits(['clickAction']);

    const dialogRef = inject('dialogRef');

    const { doGraphQLRequest } = useApi();
    const { formatDateTime } = useDataHelper();
    const search_query = ref(props.query || '');
    const loading = ref(true);
    const results = ref([]);

    const updateResults = useDebounceFn(() => {
        loading.value = true;
        doGraphQLRequest(`
            query {
                KBArticle(filter: "name=ilike=*${search_query.value}*,content=ilike=*${search_query.value}*", limit: 25) {
                    id name content date_mod is_faq
                    user { id username realname firstname }
                }
            }
        `).then((res) => {
            results.value = res.data.KBArticle;
            loading.value = false;
        });
    }, 300, { maxWait: 500 });

    watch(search_query, () => {
        loading.value = true;
        updateResults();
    }, { immediate: true });
</script>

<template>
    <DataView :value="results" lazy>
        <template #header>
            <InputText v-model="search_query" placeholder="Search..." class="w-full"></InputText>
        </template>
        <template #list>
            <div v-if="loading">
                <div v-for="n in 5" :key="n" class="mt-4 mb-4">
                    <Skeleton class="mb-2" width="50%" height="1.5rem"></Skeleton>
                    <Skeleton class="mb-2" width="80%" height="1rem"></Skeleton>
                    <Skeleton class="mb-2" width="80%" height="1rem"></Skeleton>
                    <Skeleton class="mb-2" width="80%" height="1rem"></Skeleton>
                    <Skeleton class="mb-2" width="80%" height="1rem"></Skeleton>
                </div>
            </div>
            <div v-else>
                <div v-for="article in results" :key="article.id" class="p-4 mb-2 border-1 border-transparent [&:not(:last-of-type)]:border-b-(--p-dataview-border-color)">
                    <h3 class="text-lg font-bold mb-1">{{ article.name }}</h3>
                    <p v-if="article.is_faq" class="text-gray-600 mb-1">Published in FAQ</p>
                    <p class="text-sm text-gray-600 mb-1">Last modified: {{ formatDateTime(article.date_mod) }}</p>
                    <p class="max-h-32 overflow-auto" v-dompurify-html="article.content"></p>
                    <div class="flex flex-row-reverse gap-2">
                        <Button v-for="(action, action_key) in (dialogRef.data.actions || {})" :key="action_key"
                                :label="action.label" class="mt-2 p-button-sm" @click="$emit('clickAction', {action: action_key, article: article})"></Button>
                    </div>
                </div>
            </div>
        </template>
        <template #empty>
            <Message severity="info">No results found.</Message>
        </template>
    </DataView>
</template>

<style scoped>

</style>