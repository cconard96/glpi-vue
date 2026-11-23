<script setup lang="ts">
    import Avatar from '@cjdevstudios/bumblevue/avatar';
    import Popover from '@cjdevstudios/bumblevue/popover';
    import {computed, shallowRef, useTemplateRef, watch} from "vue";
    import ActorInfoCard from "./ActorInfoCard.vue";
    import { getUserPicture, releaseUserPicture } from "./useUserPicture";
    import { type ActorInfo } from "./ActorInfoCard.vue";

    const props = withDefaults(defineProps<{
        actor_type: 'User'|'Group'|'Supplier'|'Contact',
        actor_data: ActorInfo,
        shape?: 'circle'|'square',
        size?: 'normal'|'large'|'xlarge',
    }>(), {
        shape: 'square',
        size: 'large',
    });

    const actor_card_el = useTemplateRef('actor_card');

    const initials = computed(() => {
        let firstInitial = '';
        let lastInitial = '';

        const fallback_name = props.actor_data.username || props.actor_data.name || '';

        if (props.actor_data.firstname) {
            firstInitial = props.actor_data.firstname.charAt(0).toUpperCase();
        }
        if (props.actor_data.realname) {
            lastInitial = props.actor_data.realname.charAt(0).toUpperCase();
        }
        if (!firstInitial && !lastInitial && fallback_name.length > 0) {
            firstInitial = fallback_name.charAt(0).toUpperCase();
            if (fallback_name.length > 1) {
                lastInitial = fallback_name.charAt(1).toUpperCase();
            }
        }
        return firstInitial + lastInitial;
    });

    const picture_url = shallowRef<string | null>(null);
    watch(() => [props.actor_type, props.actor_data.id, props.actor_data.picture] as const, ([actor_type, id, picture], _, onCleanup) => {
        picture_url.value = null;
        if (actor_type !== 'User') {
            return;
        }
        onCleanup(() => releaseUserPicture(id, picture));
        getUserPicture(id, picture).then((url) => {
            if (props.actor_type === actor_type && props.actor_data.id === id && props.actor_data.picture === picture) {
                picture_url.value = url;
            }
        });
    }, { immediate: true });
</script>

<template>
    <Avatar
        v-bind="$attrs" class="select-none"
        :image="picture_url ?? undefined"
        :label="picture_url ? undefined : initials"
        :shape="shape" :size="size" @mouseover="actor_card_el?.show" @mouseleave="actor_card_el?.hide"
        @touchstart.passive="actor_card_el?.show" @touchend.passive="actor_card_el?.hide"
        :pt="{ image: { class: 'object-cover object-center aspect-square' } }"
    ></Avatar>
    <Popover ref="actor_card" :key="actor_type + '_' + actor_data.id">
        <ActorInfoCard :actor_type="actor_type" :actor_data="actor_data"></ActorInfoCard>
    </Popover>
</template>

<style scoped>

</style>