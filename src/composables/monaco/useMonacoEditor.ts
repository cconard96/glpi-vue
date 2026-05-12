import * as monaco from 'monaco-editor';
import { onMounted, ref } from "vue";

export function useMonacoEditor(element: HTMLElement | string, options: Record<string, any>) {
    const editor = ref(null);

    onMounted(() => {
        element = typeof element === 'string' ? document.getElementById(element) : element;
        editor.value = monaco.editor.create(element, {
            value: '',
            language: 'css',
            theme: 'vs-dark',
            automaticLayout: true, //TODO see if we can remove this to prevent possible performance issues
            ...options,
        });
    });

    return {
        editor
    };
}