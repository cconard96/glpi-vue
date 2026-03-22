<script setup lang="ts">
    import { Form, FormSubmitEvent } from "@primevue/forms";
    import { FormResolverOptions } from "@primevue/forms/form";
    import { useOpenAPIForm } from "@/composables/useOpenAPIForm.ts";
    import { computed } from "vue";
    import { useApi } from "@/composables/useApi.ts";
    import { SchemaName } from "@/types";

    const props = defineProps<{
        schemaName: SchemaName;
        initialValues: Record<string, any>;
        resolver?: (e: FormResolverOptions) => Promise<Record<string, any>> | Record<string, any> | undefined;
    }>();
    defineEmits<{
        (e: 'submit', event: FormSubmitEvent): void;
    }>();

    const { getComponentSchema } = useApi();
    const schema = await getComponentSchema(props.schemaName);
    const { resolveFields } = useOpenAPIForm(schema);

    const formattedInitialValues = computed(() => {
        const formatted_data = { ...props.initialValues };
        for (const [key, value] of Object.entries(formatted_data)) {
            if (typeof schema.properties === 'object' && schema.properties[key] && schema.properties[key].type === 'string' && (schema.properties[key].format === 'date' || schema.properties[key].format === 'date-time')) {
                // Convert date-time strings to Date objects for easier use with date pickers
                formatted_data[key] = value ? new Date(value as string) : null;
            }
        }
        return formatted_data;
    });
</script>

<template>
    <Form v-bind="$props" :initialValues="formattedInitialValues" :resolver="resolver ?? resolveFields" @submit="$emit('submit', $event)">
        <slot></slot>
    </Form>
</template>

<style scoped>

</style>