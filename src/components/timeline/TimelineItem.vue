<script setup lang="ts">
    import {
        computed,
        defineAsyncComponent,
        inject,
        onMounted,
        onUpdated, provide,
        shallowRef, toRef,
        useTemplateRef,
        watch,
        type WatchHandle
    } from "vue";
    import { useApi } from '@/composables/useApi';
    import { useIntersectionObserver } from '@vueuse/core';
    import ActorAvatar from "@/components/actor/ActorAvatar.vue";
    import { useDataHelper } from "@/composables/useDataHelper";
    import { useAssistanceTimelineItem } from "@/composables/useAssistanceTimelineItem";

    const props = defineProps<{
        item: any,
        todoListMode?: boolean
    }>();

    const assistanceTimelineItemInstance = useAssistanceTimelineItem(props.item.type, toRef(props.item.item));
    provide('assistanceTimelineItemInstance', assistanceTimelineItemInstance);
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
    <div ref="timeline_item" :id="`${item.type}-${item.item.id}`" :class="`flex mb-4 ${timeline_alignment === 'right' ? 'flex-row-reverse' : 'flex-row'} ${todoListMode ? 'w-full' : 'max-w-200'}`">
        <ActorAvatar v-if="user" class="me-2 shrink-0" :title="formatUsername(user)" actor_type="User" :actor_data="user"></ActorAvatar>
        <!-- TODO remove item prop as it is available in provided assistanceTimelineItemInstance -->
        <component v-if="!assistanceTimelineItemInstance.editMode.value" :is="assistanceTimelineItemInstance.viewItemComponent.value" :item="item.item"></component>
        <component v-else :is="assistanceTimelineItemInstance.editFormComponent.value" :item="item.item" @close="assistanceTimelineItemInstance.editMode.value = false"></component>
    </div>
</template>

<style scoped>

</style>