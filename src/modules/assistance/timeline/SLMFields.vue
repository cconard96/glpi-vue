<script setup lang="ts">
    import { Button, DatePicker, FloatLabel, InputGroup, InputGroupAddon, Tag } from "primevue";
    import { FormField } from "@primevue/forms";

    defineProps<{
        fields: {
            field: string,
            label: string,
            type: 'SLA' | 'OLA',
            assignedLevel: {id: number, name: string}|null
        }[];
    }>();
</script>

<template>
    <FormField v-for="field in fields" :name="field.field" :key="field.field">
        <FloatLabel variant="on">
            <InputGroup>
                <DatePicker :inputId="field.field" show-time showIcon showButtonBar></DatePicker>
                <InputGroupAddon>
                    <Button icon="ti ti-stopwatch" :title="field.type === 'SLA' ? 'Assign SLA' : 'Assign OLA'"
                            :aria-label="field.type === 'SLA' ? 'Assign SLA' : 'Assign OLA'" severity="secondary"
                            variant="text" @click.prevent.stop="() => {}"></Button>
                </InputGroupAddon>
            </InputGroup>
            <Tag v-if="field.assignedLevel">
                <i class="ti ti-stopwatch me-1"></i>
                {{ field.assignedLevel.name }}
            </Tag>
            <label :for="field.field">{{ field.label }}</label>
        </FloatLabel>
    </FormField>
</template>

<style scoped>

</style>