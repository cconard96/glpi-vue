<script setup lang="ts">
    import MonacoEditor from "@/components/monaco/MonacoEditor.vue";
    import { ToggleSwitch} from "primevue";
    import { useApi } from "@/composables/useApi.ts";

    const { doGraphQLRequest } = useApi();
    const config = await doGraphQLRequest(`
        query {
            Entity {
                enable_custom_css
                custom_css_code
            }
        }
    `).then((response) => {
        return response.data['Entity'][0];
    });
</script>

<template>
    <div class="flex flex-col gap-2">
        <div>
            <label>Enable CSS customization</label>
            <ToggleSwitch v-model="config.enable_custom_css" label="Enable Custom CSS"></ToggleSwitch>
        </div>
        <MonacoEditor class="h-[400px]" :value="config.custom_css_code"></MonacoEditor>
    </div>
</template>

<style scoped>

</style>