import { inject, reactive, type ComputedRef, type InjectionKey } from 'vue';
import type { AnswerLabelResolver, FormAnswers, RenderedQuestion } from '../types';
import type { VisibilityOutput } from '../conditions/engine';

/**
 * Name of the form field holding the answer of a question (same as the GLPI end-user input name)
 */
export function questionFieldName(question: Pick<RenderedQuestion, 'id'>): string {
    return `answers_${question.id}`;
}

/**
 * Registry of display labels for answers values (actors, items, devices...) so the condition engine
 * can evaluate text-based conditions without fetching items itself.
 */
export function createLabelRegistry() {
    const labels = reactive(new Map<number, Map<string, string>>());

    function register(question_id: number, entries: Iterable<[string, string]>) {
        let question_labels = labels.get(question_id);
        if (!question_labels) {
            question_labels = new Map();
            labels.set(question_id, question_labels);
        }
        for (const [value, label] of entries) {
            question_labels.set(value, label);
        }
    }

    const resolve: AnswerLabelResolver = (question, value) => labels.get(question.id)?.get(value) ?? null;

    return { register, resolve };
}

export interface FormRendererContext {
    /** Current answers keyed by question ID */
    answers: ComputedRef<FormAnswers>;
    visibility: ComputedRef<VisibilityOutput>;
    registerLabels: (question_id: number, entries: Iterable<[string, string]>) => void;
}

export const FormRendererContextKey: InjectionKey<FormRendererContext> = Symbol('FormRendererContext');

/**
 * Get the renderer context. Question components may be rendered outside the renderer (e.g. in the editor), so it is optional.
 */
export function useFormRendererContext(): FormRendererContext | undefined {
    return inject(FormRendererContextKey, undefined);
}
