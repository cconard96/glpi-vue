<script setup lang="ts">
    /**
     * Devices of the current user. The answer format is `<Itemtype>_<id>` like in GLPI.
     * The official UI also lists devices of the user's groups, installed software and connected devices
     * (`CommonItilObject_Item::getMyDevices`). Only the items used by the user are available in the HL API for now.
     */
    import ValidatedFormField from "@/common/forms/ValidatedFormField.vue";
    import FieldSelect from "@/common/forms/FieldSelect.vue";
    import { ref } from "vue";
    import { useApi } from "@/common/api/useApi";
    import { questionFieldName, useFormRendererContext } from "@/modules/assistance/forms/viewer/formRendererContext";
    import type { RenderedQuestion } from "@/modules/assistance/forms/types";

    const props = defineProps<{
        question: RenderedQuestion
    }>();

    const { doApiRequest, getComponentSchema } = useApi();
    const context = useFormRendererContext();

    const options = ref<Array<{ value: string, label: string }> | null>(null);

    async function loadDevices() {
        try {
            const response = await doApiRequest('Administration/User/Me/UsedItem', { params: { limit: 1000 } });
            const items: Array<Record<string, any>> = Array.isArray(response.data) ? response.data : [];
            const itemtypes = new Map<string, string>();
            for (const schema_name of new Set(items.map((item) => item._itemtype).filter(Boolean))) {
                const schema = await getComponentSchema(schema_name).catch(() => null);
                itemtypes.set(schema_name, schema?.['x-itemtype'] ?? schema_name);
            }
            const devices = items
                .filter((item) => !item.is_deleted && !item.is_template)
                .map((item) => ({
                    value: `${itemtypes.get(item._itemtype) ?? item._itemtype}_${item.id}`,
                    name: item.name || `${item._itemtype} ${item.id}`,
                    label: `${item._itemtype} - ${item.name || item.id}`,
                }))
                .sort((a, b) => a.label.localeCompare(b.label));
            context?.registerLabels(props.question.id, devices.map((device) => [device.value, device.name]));
            options.value = devices;
        } catch {
            options.value = [];
        }
    }
    loadDevices();
</script>

<template>
    <ValidatedFormField v-if="options" :name="questionFieldName(question)" :label="question.name" :required="question.is_mandatory" :as="FieldSelect" :fieldProps="{
        optionValue: 'value',
        optionLabel: 'label',
        options: options,
        multiple: !!question.extra_data.is_multiple_devices,
    }"></ValidatedFormField>
</template>

<style scoped></style>
