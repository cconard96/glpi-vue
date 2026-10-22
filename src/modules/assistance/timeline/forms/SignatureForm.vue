<script setup lang="ts">
    import { Avatar, Button, Card } from "primevue";
    import { useSessionStore } from "@/common/useSessionStore.ts";
    import { useDrauu } from "@vueuse/integrations/useDrauu";
    import { toRefs, useTemplateRef } from "vue";

    const { getFriendlyName } = useSessionStore();
    const signatureArea = useTemplateRef('signatureArea');
    const { undo, redo, canUndo, canRedo, brush, clear } = useDrauu(signatureArea, {
        brush: {
            mode: 'stylus',
            color: '#000',
            size: 2,
            stylusOptions: {
                smoothing: 1,
            }
        }
    });

    function selectEraser() {
        brush.value.color = '#fff';
        brush.value.size = 20;
    }

    function selectPen() {
        brush.value.color = '#000';
        brush.value.size = 2;
    }

    function clearSignature() {
        clear();
        selectPen();
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Avatar icon="ti ti-user" class="ms-2" :title="getFriendlyName" size="large"></Avatar>
        <Card class="grow" :pt="{
            body: {
                class: `p-4`,
                style: 'border-radius: 0.5rem;'
            }
        }">
            <template #header>
                <div class="flex flex-row-reverse">
                    <Button icon="ti ti-x" class="p-button-text p-button-plain" title="Close"
                            aria-label="Close" @click="$emit('close')"></Button>
                </div>
            </template>
            <template #content>
                <div class="mb-2">
                    <Button icon="ti ti-trash" class="p-button-text p-button-plain" title="Clear"
                            aria-label="Clear" @click="clearSignature"></Button>
                    <Button icon="ti ti-eraser" class="p-button-text p-button-plain" title="Eraser"
                            aria-label="Eraser" @click="selectEraser"></Button>
                    <Button icon="ti ti-pencil" class="p-button-text p-button-plain" title="Pen"
                            aria-label="Pen" @click="selectPen"></Button>
                    <Button icon="ti ti-arrow-back-up" class="p-button-text p-button-plain" title="Undo"
                            aria-label="Undo" :disabled="!canUndo" @click="undo()"></Button>
                    <Button icon="ti ti-arrow-forward-up" class="p-button-text p-button-plain" title="Redo"
                            aria-label="Redo" :disabled="!canRedo" @click="redo()"></Button>
                </div>
                <svg ref="signatureArea" class="bg-white w-full min-h-36"></svg>
            </template>
            <template #footer>
                <Button type="submit" icon="ti ti-plus" label="Add"></Button>
            </template>
        </Card>
    </div>
</template>

<style scoped>

</style>