<script setup lang="ts">
    import { useSettings } from "@/composables/setup/useSettings.ts";
    import FormFields from "@/components/forms/FormFields.vue";
    import AdvancedForm from "@/components/forms/AdvancedForm.vue";
    import ValidatedFormField from "@/components/forms/ValidatedFormField.vue";

    const props = defineProps<{
        context: string,
        category: string,
        scope: string,
    }>();

    const { getSettingDefinitions, getSettingValues } = useSettings();
    const settingDefinitions = getSettingDefinitions(props.context, props.scope, props.category);
    const settings = await getSettingValues(props.context, props.scope, props.category);
</script>

<template>
    <section>
        <AdvancedForm schema-name="Config" :initial-values="settings">
            <FormFields :columns="1">
                <ValidatedFormField v-for="setting in settingDefinitions" :key="setting.name"
                                    :name="setting.name" :label="setting.label" :as="setting.field.component"
                                    :fieldProps="setting.field.props" :helpText="setting.field?.helpText">
                </ValidatedFormField>
            </FormFields>
        </AdvancedForm>
    </section>
</template>

<style scoped>

</style>