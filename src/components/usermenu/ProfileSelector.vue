<script setup lang="ts">
    import { InputText, Tree, Message } from 'primevue';
    import {computed, onMounted, shallowRef} from "vue";
    import { useApi } from "@/composables/useApi";
    import { useAuth } from "@/composables/useAuth";
    import { useSessionStore } from "@/composables/useSessionStore";

    const { doGraphQLRequest } = useApi();
    const { profiles, active_profile, changeProfile } = useSessionStore();
    const nodes = shallowRef([]);

    // profiles.forEach((profile: any, profile_id: number) => {
    //     nodes.value.push({
    //         key: profile_id,
    //         label: profile.name
    //     });
    // });
    Object.entries(profiles).forEach(([profile_id, profile]: any) => {
        nodes.value.push({
            key: profile_id,
            label: profile.name
        });
    });

    const searchTerm = shallowRef('');
    const filtered_nodes = computed(() => {
        return nodes.value.filter((node: any) => node.label.toLowerCase().includes(searchTerm.value.toLowerCase()));
    });
    function doChangeProfile(node: any) {
        changeProfile({
            id: node.key,
        });
        useAuth().loadSession().then(() => {
            window.location.reload();
        });
    }
</script>

<template>
    <div>
        <Message>Current profile: {{ active_profile.name }}. This UI is not finalized.</Message>
        <InputText v-model="searchTerm" class="w-full"></InputText>
        <Tree :value="filtered_nodes" :selection-keys="active_profile.id" selection-mode="single"
              @nodeSelect="doChangeProfile($event)">

        </Tree>
    </div>
</template>

<style scoped>

</style>