<script setup lang="ts">
    import {
        computed,
        defineAsyncComponent,
        inject,
        onMounted,
        onUpdated,
        shallowRef,
        useTemplateRef,
        watch,
        type WatchHandle
    } from "vue";
    import { useApi } from '@/composables/useApi';
    import { useIntersectionObserver } from '@vueuse/core';
    import ActorAvatar from "@/components/actor/ActorAvatar.vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import FollowupItem from "@/components/timeline/items/FollowupItem.vue";
    import TaskItem from "@/components/timeline/items/TaskItem.vue";
    import SolutionItem from "@/components/timeline/items/SolutionItem.vue";
    import ContentItem from "@/components/timeline/items/ContentItem.vue";
    import DocumentItem from "@/components/timeline/items/DocumentItem.vue";
    import CostItem from "@/components/timeline/items/CostItem.vue";
    import ApprovalItem from "@/components/timeline/items/ApprovalItem.vue";
    import ApprovalAnswerItem from "@/components/timeline/items/ApprovalAnswerItem.vue";

    const props = defineProps<{
        item: any,
        todoListMode?: boolean
    }>();

    const assistanceItemInstance = inject('assistanceItemInstance');
    const { formatUsername } = useDataHelper();

    const timeline_alignment = computed(() => {
        return (props.item.item.timeline_position === 3 || props.item.item.timeline_position === 4) ? 'right' : 'left';
    });

    const timeline_item_element = useTemplateRef('timeline_item');
    const { doApiRequest } = useApi();
    const item_visible = shallowRef(false);

    const user = computed(() => {
        return props.item.type === 'content' ? assistanceItemInstance.item._user_recipient : (props.item.item.user || props.item.item.requester);
    });
    let item_visible_watcher: WatchHandle|null = null;

    watch(() => props.item, () => {
        handleInlineImages();
    }, {immediate: true});

    item_visible_watcher = watch(item_visible, (isVisible) => {
        if (isVisible) {
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

    function handleInlineImages() {
        if (!timeline_item_element.value) {
            return;
        }
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
    }


    onMounted(() => {
        console.log('Mounted timeline item ' + props.item.type + '-' + props.item.item.id);
        const { stop: stopIntersectionObserver } = useIntersectionObserver(timeline_item_element, ([entry], observerElement) => {
            item_visible.value = entry?.isIntersecting || false;
        });
        handleInlineImages();
    });
    onUpdated(() => {
        item_visible.value = false;
        handleInlineImages();
    });

    watch(() => props.todoListMode, () => {
        handleInlineImages();
    });
</script>

<template>
    <div ref="timeline_item" :class="`flex mb-4 ${timeline_alignment === 'right' ? 'flex-row-reverse' : 'flex-row'} ${todoListMode ? 'w-full' : 'max-w-200'}`">
        <ActorAvatar v-if="user" class="me-2 shrink-0" :title="formatUsername(user)" actor_type="User" :actor_data="user"></ActorAvatar>
        <component v-if="item.type === 'content'" :is="ContentItem"
                   :item="item.item"></component>
        <component v-if="item.type === 'Followup'" :is="FollowupItem"
                   :item="item.item"></component>
        <component v-if="item.type === 'Task'" :is="TaskItem"
                   :item="item.item"></component>
        <component v-if="item.type === 'Solution'" :is="SolutionItem"
                   :item="item.item"></component>
        <component v-if="item.type === 'Document'" :is="DocumentItem"
                   :item="item.item"></component>
        <component v-if="item.type === 'Cost'" :is="CostItem"
                   :item="item.item"></component>
        <component v-if="item.type === 'Validation'" :is="ApprovalItem"
                   :item="item.item"></component>
        <component v-if="item.type === 'ValidationAnswer'" :is="ApprovalAnswerItem"
                   :item="item.item"></component>
    </div>
</template>

<style scoped>

</style>