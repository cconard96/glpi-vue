<script setup lang="ts">
    import { InputText, Listbox, ListboxChangeEvent, Message } from 'primevue';
    import {computed, onMounted, shallowRef} from "vue";
    import { useApi } from "@/common/useApi";
    import { useAuth } from "@/common/useAuth";
    import { useSessionStore } from "@/common/useSessionStore";

    const { doGraphQLRequest } = useApi();
    const { active_profile, changeProfile, getValidProfilesForEntity, getActiveEntity, getParentEntities } = useSessionStore();
    const nodes = shallowRef([]);

    Object.values(getValidProfilesForEntity(getActiveEntity.id)).forEach((profile: any) => {
        console.log(profile);
        nodes.value.push({
            key: profile.id,
            label: profile.name
        });
    });

    const searchTerm = shallowRef('');
    const filtered_nodes = computed(() => {
        return nodes.value.filter((node: any) => node.label.toLowerCase().includes(searchTerm.value.toLowerCase()));
    });
    function doChangeProfile(event: ListboxChangeEvent) {
        changeProfile({
            id: event.value,
        });
        useAuth().loadSession().then(() => {
            window.location.reload();
        });
    }
</script>

<template>
    <div>
        <Message>
            {{ $t('profile_selector.current_profile', {
                currentProfile: active_profile.name
            }, 'Current profile: {currentProfile}') }}
        </Message>
        <InputText v-model="searchTerm" class="w-full"></InputText>
        <Listbox :options="filtered_nodes" optionValue="key" optionLabel="label"
              @change="doChangeProfile($event)" class="max-h-96 overflow-auto">
        </Listbox>
    </div>
</template>

<style scoped>

</style>