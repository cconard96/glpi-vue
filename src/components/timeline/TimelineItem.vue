<script setup lang="ts">
    import Card from 'primevue/card';
    import Avatar from 'primevue/avatar';
    import {computed, onMounted, shallowRef, useTemplateRef, watch} from "vue";
    import { useApi } from '@/composables/useApi';
    import { useIntersectionObserver } from '@vueuse/core';

    const { item } = defineProps({
        item: {
            type: Object,
            required: true
        }
    });

    const human_readable_time = (timestamp: string): string => {
        const date = new Date(timestamp);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000); // difference in seconds

        if (diff < 60) return `${diff} seconds ago`;
        if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
        if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
        return date.toLocaleDateString();
    };

    const timeline_alignment = computed(() => {
        return (item.item.timeline_position === 3 || item.item.timeline_position === 4) ? 'right' : 'left';
    });

    const bg_color = computed(() => {
        switch (item.type) {
            case 'Task':
                return 'bg-yellow-400/50 dark:bg-yellow-500/25';
            case 'Solution':
                return 'bg-cyan-300/50 dark:bg-cyan-700/50';
            default:
                return 'bg-gray-200/50 dark:bg-gray-800/50';
        }
    });

    const timeline_item_element = useTemplateRef('timeline_item');
    const { doApiRequest } = useApi();
    const item_visible = shallowRef(false);

    onMounted(() => {
        timeline_item_element.value.querySelectorAll('a[href^="/front/document.send.php"]').forEach((link: HTMLAnchorElement) => {
            // remove the link but keep its inner html (probably an image)
            const parent = link.parentNode;
            if (parent) {
                while (link.firstChild) {
                    parent.insertBefore(link.firstChild, link);
                }
                parent.removeChild(link);
            }
        });

        const { stop: stopIntersectionObserver } = useIntersectionObserver(timeline_item_element, ([entry], observerElement) => {
            item_visible.value = entry?.isIntersecting || false;
        });
        watch(item_visible, (isVisible) => {
            if (isVisible) {
                stopIntersectionObserver();
                timeline_item_element.value.querySelectorAll('img[src^="/front/document.send.php"]').forEach((img: HTMLImageElement) => {
                    const url = new URL(img.src);
                    const docid = url.searchParams.get('docid');
                    // image content needs to be loaded via API and converted to base64 data url to work around authentication issues
                    img.style.display = 'none';
                    if (docid) {
                        const onImgFailure = () => {
                            img.alt = 'Failed to load image';
                            img.style.display = 'block';
                        };
                        doApiRequest(`/Management/Document/${docid}/Download`, {
                            method: 'GET',
                            responseType: 'blob'
                        }).then((response) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                img.src = reader.result as string;
                            };
                            reader.readAsDataURL(response.data);
                            img.style.display = 'block';
                        }, () => {
                            onImgFailure();
                        }).catch(() => {
                            onImgFailure();
                        });
                    }
                });
            }
        });
    });
</script>

<template>
    <div ref="timeline_item" :class="`flex mb-4 ${timeline_alignment === 'right' ? 'flex-row-reverse' : 'flex-row'}`">
        <Avatar v-if="item.item.user" icon="ti ti-user" class="mr-2" :title="item.item.user?.name || ''"></Avatar>
        <Card v-if="['Followup', 'Task', 'Solution'].includes(item.type)" :pt="{
            body: {
                class: `p-2 ${bg_color}`,
                style: `background-color: ${bg_color}; border-radius: 0.5rem;`
            }
        }">
            <template #title>
                <span class="text-sm">Created {{ human_readable_time(item.item.date_creation || item.item.date) }}</span>
            </template>
            <template #content>
                <div>
                    <div v-dompurify-html="item.item.content"></div>
                </div>
            </template>
        </Card>
        <Card v-else-if="item.type === 'Document'" :pt="{
            body: {
                class: `p-2 ${bg_color}`,
                style: `background-color: ${bg_color}; border-radius: 0.5rem;`
            }
        }">
            <template #title>
                <span class="text-sm">Uploaded {{ human_readable_time(item.item.date_creation || item.item.date) }}</span>
            </template>
            <template #content>
                <div>
                    <img :src="item.item.filepath"/>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>

</style>