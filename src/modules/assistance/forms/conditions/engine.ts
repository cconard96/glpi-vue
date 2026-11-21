/**
 * Client-side port of the GLPI form condition engine (`src/Glpi/Form/Condition/Engine.php`).
 *
 * The HL API does not expose an endpoint to evaluate conditions, so visibility and validation are computed here
 * from the condition data returned with the form. The server remains the authority when answers are submitted.
 */
import {
    ConditionItemType, isValueOperator, LogicOperator, mustBeValidated, mustBeVisible, ValueOperator, VisibilityStrategy,
    type ValidationStrategy,
} from './operators';
import { getQuestionConditionHandlers, getSelectableOptions, type ConditionHandler, SingleChoiceHandler, VisibilityHandler } from './handlers';
import type { AnswerLabelResolver, ConditionData, FormAnswers, RenderedForm, RenderedQuestion, RenderedSection } from '../types';

const MAX_FIXED_POINT_ITERATIONS = 100;

/**
 * Parse the raw conditions JSON stored by GLPI (see `FormData::parseRawConditionsData`).
 * Conditions are kept even if they are incomplete; invalid ones are skipped by the engine.
 */
export function parseConditions(raw: unknown): ConditionData[] {
    let data: unknown = raw;
    if (typeof raw === 'string') {
        try {
            data = raw.trim() === '' ? [] : JSON.parse(raw);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(data)) {
        return [];
    }
    return data.filter((condition) => typeof condition === 'object' && condition !== null).map((condition: any) => {
        let item_type = condition.item_type ?? '';
        let item_uuid = condition.item_uuid ?? '';
        const item_key: string = condition.item ?? '';
        if (item_key !== '') {
            const parts = item_key.split('-');
            item_type = parts.shift() ?? '';
            item_uuid = parts.join('-');
        }

        let value = condition.value ?? null;
        // Array/object values (choices, actors, items) may be stored JSON encoded
        if (typeof value === 'string' && /^\s*[[{]/.test(value)) {
            try {
                value = JSON.parse(value);
            } catch {
                // not JSON, keep the raw string
            }
        }

        return {
            item_uuid,
            item_type,
            value_operator: isValueOperator(condition.value_operator) ? condition.value_operator : null,
            value,
            logic_operator: condition.logic_operator === LogicOperator.OR ? LogicOperator.OR : LogicOperator.AND,
        };
    });
}

export interface EngineInput {
    form: RenderedForm;
    answers: FormAnswers;
    /** Provides labels for actor/item/device answers */
    resolveLabel?: AnswerLabelResolver;
    /** Whether the user is authenticated. Actor and device questions are hidden for anonymous users. */
    isAuthenticated?: boolean;
}

export interface VisibilityOutput {
    /** Visibility of the submit button */
    form: boolean;
    /** Section visibility keyed by section ID */
    sections: Record<number, boolean>;
    /** Question visibility keyed by question ID */
    questions: Record<number, boolean>;
}

type ConditionableItem =
    | { kind: 'form'; uuid: string; strategy: VisibilityStrategy; conditions: ConditionData[] }
    | { kind: 'section'; uuid: string; strategy: VisibilityStrategy; conditions: ConditionData[]; section: RenderedSection }
    | { kind: 'question'; uuid: string; strategy: VisibilityStrategy; conditions: ConditionData[]; question: RenderedQuestion };

/** Question types that are not allowed for unauthenticated access */
const AUTH_ONLY_TYPES = [
    'QuestionTypeRequester', 'QuestionTypeObserver', 'QuestionTypeAssignee', 'QuestionTypeItem', 'QuestionTypeItemDropdown',
    'QuestionTypeUserDevice',
];

export class FormConditionEngine {
    private readonly questions_by_uuid = new Map<string, RenderedQuestion>();
    private readonly sections_by_uuid = new Map<string, RenderedSection>();
    private readonly handlers_cache = new Map<string, ConditionHandler[]>();
    private visibility_cache: Record<string, boolean> = {};
    private visibility_computed = false;

    constructor(private readonly input: EngineInput) {
        for (const section of input.form.sections) {
            this.sections_by_uuid.set(section.uuid, section);
            for (const question of section.questions) {
                this.questions_by_uuid.set(question.uuid, question);
            }
        }
    }

    computeVisibility(): VisibilityOutput {
        this.computeVisibilitiesWithFixedPoint();
        const output: VisibilityOutput = {
            form: this.visibility_cache[this.formUuid()] ?? true,
            sections: {},
            questions: {},
        };
        for (const question of this.questions_by_uuid.values()) {
            output.questions[question.id] = this.visibility_cache[question.uuid] ?? true;
        }
        this.input.form.sections.forEach((section, index) => {
            if (index === 0) {
                // First section must always be visible
                output.sections[section.id] = true;
                return;
            }
            let is_visible = this.visibility_cache[section.uuid] ?? true;
            // Hide sections without any visible child
            if (is_visible) {
                is_visible = section.questions.some((question) => output.questions[question.id]);
            }
            output.sections[section.id] = is_visible;
        });
        return output;
    }

    /**
     * Get the validation conditions that are not met by a question's answer.
     * Port of `Engine::computeItemValidation`. An empty array means the answer is valid.
     */
    computeQuestionValidation(question: RenderedQuestion): ConditionData[] {
        this.computeVisibilitiesWithFixedPoint();
        const strategy = question.validation_strategy as ValidationStrategy;
        if (strategy === 'no_validation' || !strategy) {
            return [];
        }
        const conditions = this.validConditions(question.validation_conditions);
        const results = new Map<ConditionData, boolean>();
        const conditions_result = this.computeConditions(conditions, results);
        if (mustBeValidated(strategy, conditions_result)) {
            return [];
        }
        return conditions.filter((condition) => !mustBeValidated(strategy, results.get(condition) ?? false));
    }

    private formUuid(): string {
        return `form-${this.input.form.id}`;
    }

    private getConditionableItems(): ConditionableItem[] {
        const form = this.input.form;
        const items: ConditionableItem[] = [{
            kind: 'form', uuid: this.formUuid(),
            strategy: form.submit_button_visibility_strategy ?? VisibilityStrategy.ALWAYS_VISIBLE,
            conditions: form.submit_button_conditions,
        }];
        for (const question of this.questions_by_uuid.values()) {
            items.push({ kind: 'question', uuid: question.uuid, strategy: question.visibility_strategy, conditions: question.visibility_conditions, question });
        }
        for (const section of form.sections) {
            items.push({ kind: 'section', uuid: section.uuid, strategy: section.visibility_strategy, conditions: section.conditions, section });
        }
        return items;
    }

    private computeVisibilitiesWithFixedPoint(): void {
        if (this.visibility_computed) {
            return;
        }
        const items = this.getConditionableItems().map((item) => ({ ...item, conditions: this.validConditions(item.conditions) }));
        for (const item of items) {
            this.visibility_cache[item.uuid] = (item.strategy ?? VisibilityStrategy.ALWAYS_VISIBLE) === VisibilityStrategy.ALWAYS_VISIBLE;
        }
        for (let iteration = 0; iteration < MAX_FIXED_POINT_ITERATIONS; iteration++) {
            let changed = false;
            for (const item of items) {
                const visible = this.evaluateItemVisibility(item);
                if (this.visibility_cache[item.uuid] !== visible) {
                    this.visibility_cache[item.uuid] = visible;
                    changed = true;
                }
            }
            if (!changed) {
                break;
            }
        }
        this.visibility_computed = true;
    }

    private evaluateItemVisibility(item: ConditionableItem): boolean {
        if (item.kind === 'question') {
            const parent_visible = this.visibility_cache[item.question.section_uuid] ?? true;
            if (!parent_visible) {
                return false;
            }
        }
        const strategy = item.strategy ?? VisibilityStrategy.ALWAYS_VISIBLE;
        let result = strategy === VisibilityStrategy.ALWAYS_VISIBLE
            ? true
            : mustBeVisible(strategy, this.computeConditions(item.conditions));

        if (result && item.kind === 'question' && this.input.isAuthenticated === false && AUTH_ONLY_TYPES.includes(item.question.type_name)) {
            result = false;
        }
        return result;
    }

    private getHandlers(condition: ConditionData): ConditionHandler[] | null {
        switch (condition.item_type) {
            case ConditionItemType.QUESTION: {
                const question = this.questions_by_uuid.get(condition.item_uuid);
                if (!question) {
                    return null;
                }
                let handlers = this.handlers_cache.get(question.uuid);
                if (!handlers) {
                    handlers = getQuestionConditionHandlers(question, this.input.resolveLabel);
                    this.handlers_cache.set(question.uuid, handlers);
                }
                return handlers;
            }
            case ConditionItemType.SECTION:
                return this.sections_by_uuid.has(condition.item_uuid) ? [VisibilityHandler] : null;
            case ConditionItemType.COMMENT:
                // Comments are not available in the API yet. They are considered as always visible.
                return [VisibilityHandler];
            default:
                return null;
        }
    }

    /**
     * Port of `ConditionData::isValid`: drop incomplete conditions and conditions using unsupported operators
     */
    private validConditions(conditions: ConditionData[] | undefined): ConditionData[] {
        return (conditions ?? []).filter((condition) => {
            if (!condition.item_uuid || !condition.value_operator) {
                return false;
            }
            const handlers = this.getHandlers(condition);
            return handlers !== null && handlers.some((handler) => handler.operators.includes(condition.value_operator!));
        });
    }

    /**
     * Port of `Engine::computeConditions` (AND has precedence over OR)
     */
    private computeConditions(conditions: ConditionData[], results?: Map<ConditionData, boolean>): boolean {
        const evaluated: boolean[] = [];
        const operators: LogicOperator[] = [];
        for (const condition of conditions) {
            if (!condition.item_uuid) {
                continue;
            }
            const result = this.computeCondition(condition);
            results?.set(condition, result);
            evaluated.push(result);
            operators.push(condition.logic_operator ?? LogicOperator.AND);
        }
        if (evaluated.length === 0) {
            return false;
        }
        const groups: boolean[][] = [];
        let current = [evaluated[0]];
        for (let i = 1; i < evaluated.length; i++) {
            if (operators[i] === LogicOperator.OR) {
                groups.push(current);
                current = [evaluated[i]];
            } else {
                current.push(evaluated[i]);
            }
        }
        groups.push(current);
        return groups.some((group) => group.every(Boolean));
    }

    private computeCondition(condition: ConditionData): boolean {
        const operator = condition.value_operator!;
        let answer: unknown = null;
        let question: RenderedQuestion | undefined;

        switch (condition.item_type) {
            case ConditionItemType.QUESTION: {
                question = this.questions_by_uuid.get(condition.item_uuid);
                if (!question) {
                    return false;
                }
                const source_visible = this.visibility_cache[question.uuid] ?? true;
                answer = this.input.answers[question.id] ?? null;
                if (operator === ValueOperator.VISIBLE || operator === ValueOperator.NOT_VISIBLE) {
                    answer = source_visible;
                } else if (operator === ValueOperator.EMPTY) {
                    if (!source_visible) {
                        return true;
                    }
                } else if (!source_visible) {
                    return false;
                }
                break;
            }
            case ConditionItemType.SECTION:
                answer = this.visibility_cache[condition.item_uuid] ?? true;
                break;
            case ConditionItemType.COMMENT:
                answer = true;
                break;
            default:
                return false;
        }

        const handlers = (this.getHandlers(condition) ?? []).filter((handler) => handler.operators.includes(operator));
        if (handlers.length !== 1) {
            return false;
        }
        const handler = handlers[0];
        let condition_value = condition.value;

        // Ordering operators on single choice questions compare the option labels
        if (
            handler === SingleChoiceHandler && question
            && ([ValueOperator.LESS_THAN, ValueOperator.LESS_THAN_OR_EQUALS, ValueOperator.GREATER_THAN, ValueOperator.GREATER_THAN_OR_EQUALS] as ValueOperator[]).includes(operator)
        ) {
            const options = getSelectableOptions(question);
            const last = (value: unknown) => String((Array.isArray(value) ? value.at(-1) : value) ?? '');
            const a = last(answer);
            const b = last(condition_value);
            answer = options[a] ?? a;
            condition_value = options[b] ?? b;
        }

        return handler.apply(answer, operator, condition_value);
    }
}

export function computeVisibility(input: EngineInput): VisibilityOutput {
    return new FormConditionEngine(input).computeVisibility();
}
