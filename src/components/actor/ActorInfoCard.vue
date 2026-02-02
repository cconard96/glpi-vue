<script setup lang="ts">
    import { Card } from 'primevue';
    import {computed, onBeforeMount, ref} from "vue";
    import { useApi } from '@/composables/useApi';

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

    const actor_data = props.actor_data;
    const loaded = ref(false);
    const { doGraphQLRequest } = useApi();

    onBeforeMount(() => {
        if (props.actor_type === 'User') {
            doGraphQLRequest(
                `
                    query {
                        User (filter: "id==${props.actor_data.id}") {
                            id username realname firstname title { id name } category { id name } phone phone2 mobile emails { id email is_default } picture
                        }
                    }
                `,
                {},
                'cache-first'
            ).then((res) => {
                const user_data = res.data.User[0];
                Object.assign(actor_data, user_data);
                actor_data.category = user_data.category?.name || '';
                actor_data.title = user_data.title?.name || '';
                // Get default email
                const default_email = user_data.emails.find((email: any) => email.is_default);
                actor_data.email = default_email ? default_email.email : (user_data.emails[0]?.email || '');
            });
        }
    });

    const display_name = computed(() => {
        const fallback_name = props.actor_data.username || props.actor_data.name || 'Unknown User';
        if (props.actor_data.firstname && props.actor_data.realname) {
            return `${props.actor_data.firstname} ${props.actor_data.realname}`;
        } else if (props.actor_data.firstname) {
            return props.actor_data.firstname;
        } else if (props.actor_data.realname) {
            return props.actor_data.realname;
        } else {
            return fallback_name;
        }
    });
</script>

<template>
    <Card :pt="{ body: { class: 'p-0' } }">
        <template #content>
            <h3>{{ display_name }}</h3>
            <p v-if="actor_data.title"><strong>Title:</strong> {{ actor_data.title }}</p>
            <p v-if="actor_data.category"><strong>Category:</strong> {{ actor_data.category }}</p>
            <a v-if="actor_data.email" :href="`mailto:${actor_data.email}`"><strong>Email:</strong> {{ actor_data.email }}</a>
            <p v-if="actor_data.phone"><strong>Phone:</strong> {{ actor_data.phone }}</p>
            <p v-if="actor_data.phone2"><strong>Phone 2:</strong> {{ actor_data.phone2 }}</p>
            <p v-if="actor_data.mobile"><strong>Mobile:</strong> {{ actor_data.mobile }}</p>
        </template>
    </Card>
</template>

<style scoped>

</style>