<script setup>
    import Card from 'primevue/card';
    import Avatar from 'primevue/avatar';
    import {computed} from "vue";

    const { item } = defineProps({
        item: {
            type: Object,
            required: true
        }
    });

    const human_readable_time = (timestamp) => {
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

    //TODO src and href for images stored in GLPI need to be fixed to point to the correct URL and allow access from outside GLPI
</script>

<template>
    <div :class="`flex mb-4 ${timeline_alignment === 'right' ? 'flex-row-reverse' : 'flex-row'}`">
        <Avatar v-if="item.item.user" icon="ti ti-user" class="mr-2" :title="item.item.user?.name || ''"></Avatar>
        <Card :pt="{
            body: { class: 'p-2' }
        }">
            <template #title>
                <span class="text-sm">Created {{ human_readable_time(item.item.date_creation || item.item.date) }}</span>
            </template>
            <template #content>
                <div>
                    <div v-html="item.item.content"></div>
                </div>
            </template>
        </Card>
    </div>
</template>

<style scoped>

</style>