<script setup lang="ts">
    import Button from "@cjdevstudios/bumblevue/button";
    import Card from "@cjdevstudios/bumblevue/card";
    import { useDrauu } from "@vueuse/integrations/useDrauu";
    import { inject, ref, useTemplateRef } from "vue";
    import { FormSubmitEvent, Form } from "@cjdevstudios/bumblevue-forms";
    import { useAssistanceTimelineItem } from "@/modules/assistance/timeline/items/useAssistanceTimelineItem";
    import type { useAssistanceItem } from "@/modules/assistance/timeline/useAssistanceItem";

    const emits = defineEmits(['close', 'add']);

    const assistanceItemInstance = inject<ReturnType<typeof useAssistanceItem>>('assistanceItemInstance')!;
    const documentTimelineItem = useAssistanceTimelineItem('Document', ref({}));
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

    /**
     * Rasterize the signature SVG to a PNG on a white background.
     * @returns The PNG as a Blob (for upload) and as a data URL (for the optimistic timeline preview).
     */
    async function renderSignaturePNG(): Promise<{ blob: Blob, dataURL: string }> {
        const svg = signatureArea.value as SVGSVGElement;
        const { width, height } = svg.getBoundingClientRect();
        const scale = window.devicePixelRatio || 1;

        // The SVG is sized via CSS, so the serialized copy needs explicit dimensions to render correctly as an image
        const svgClone = svg.cloneNode(true) as SVGSVGElement;
        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
        svgClone.setAttribute('width', `${width}`);
        svgClone.setAttribute('height', `${height}`);
        svgClone.setAttribute('viewBox', `0 0 ${width} ${height}`);
        const svgURL = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svgClone)], { type: 'image/svg+xml' }));

        try {
            const img = new Image();
            await new Promise((resolve, reject) => {
                img.onload = resolve;
                img.onerror = reject;
                img.src = svgURL;
            });

            const canvas = document.createElement('canvas');
            canvas.width = Math.round(width * scale);
            canvas.height = Math.round(height * scale);
            const ctx = canvas.getContext('2d')!;
            // White background so the PNG isn't transparent (the eraser also draws in white)
            ctx.fillStyle = '#fff';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            const blob = await new Promise<Blob>((resolve, reject) => {
                canvas.toBlob(b => b ? resolve(b) : reject(new Error('Failed to encode signature image')), 'image/png');
            });
            return { blob, dataURL: canvas.toDataURL('image/png') };
        } finally {
            URL.revokeObjectURL(svgURL);
        }
    }

    /**
     * Build a filesystem-safe filename in the form "{itemtype}_{id}_signature_{timestamp}.png"
     */
    function getSignatureFilename(date: Date) {
        const itemtype = assistanceItemInstance.itemtype;
        const id = assistanceItemInstance.item.value.id;
        // ISO timestamps contain ":" which is not allowed in Windows filenames
        const timestamp = date.toISOString().replace(/[:.]/g, '-');
        return `signature_${timestamp}.png`.replace(/[^A-Za-z0-9._-]/g, '_');
    }

    async function onSubmit(event: FormSubmitEvent) {
        const now = new Date();
        // Render before closing since closing unmounts the signature area
        const { blob, dataURL } = await renderSignaturePNG();
        emits('close');

        const filename = getSignatureFilename(now);
        const formData = new FormData();
        formData.append('file', blob, filename);

        const optimisticItemData = {
            date_creation: now,
            mime: 'image/png',
            filepath: dataURL,
            document: { name: filename },
        };

        // addItem's typing expects JSON item data, but axios handles FormData as a multipart request
        documentTimelineItem.addItem(formData as any, optimisticItemData as any)?.then(() => {
            emits('add');
        });
    }
</script>

<template>
    <div ref="new_timeline_item" class="flex mb-4 flex-row-reverse">
        <Form @submit="onSubmit">
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
                    <Button type="submit" icon="ti ti-plus" :label="$t('item.add', 'Add')"></Button>
                </template>
            </Card>
        </Form>
    </div>
</template>

<style scoped>

</style>