<script setup>
    import Card from 'primevue/card';
    import Avatar from 'primevue/avatar';

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
</script>

<template>
    <div class="flex flex-row">
        <Avatar icon="ti ti-user" class="mr-2" :title="item.item.user?.name || ''"></Avatar>
        <Card :pt="{
            body: { class: 'p-2' }
        }">
            <template #title>
                <span class="text-base">Created by: {{ item.item.user?.name || '' }}</span>
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