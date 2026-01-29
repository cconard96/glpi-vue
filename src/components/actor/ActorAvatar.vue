<script setup lang="ts">
    import { Avatar, Popover } from 'primevue';
    import {computed, useTemplateRef} from "vue";
    import ActorInfoCard from "@/components/actor/ActorInfoCard.vue";

    interface ActorInfo {
        id: number,
        name?: string,
        username?: string,
        realname?: string,
        firstname?: string,
        title?: string,
        category?: string,
        phone?: string,
        phone2?: string,
        mobile?: string,
        email?: string,
        picture?: string,
    }
    const props = defineProps<{
        actor_type: 'User'|'Group'|'Supplier',
        actor_data: ActorInfo
    }>();

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
</script>

<template>
    <Avatar
        v-bind="$attrs"
        :image="actor_data.picture || null"
        :label="!actor_data.picture ? initials : null"
        shape="square" size="large" @mouseover="actor_card_el?.show" @mouseleave="actor_card_el?.hide"
        @touchstart="actor_card_el?.show" @touchend="actor_card_el?.hide"
    ></Avatar>
    <Popover ref="actor_card" :key="actor_type + '_' + actor_data.id">
        <ActorInfoCard :actor_type="actor_type" :actor_data="actor_data"></ActorInfoCard>
    </Popover>
</template>

<style scoped>

</style>