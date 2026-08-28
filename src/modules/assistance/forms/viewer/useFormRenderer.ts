import { useApi } from '@/common/api/useApi';
import { getQuestionTypeName } from '../conditions/handlers';
import { parseConditions } from '../conditions/engine';
import { questionFieldName } from './formRendererContext';
import type { ApiFormQuestion, ApiFormSection, FormAnswers, RenderedForm, RenderedQuestion, RenderedSection } from '../types';

function parseJSONObject(raw: unknown): Record<string, any> {
    if (raw && typeof raw === 'object') {
        return raw as Record<string, any>;
    }
    if (typeof raw !== 'string' || raw.trim() === '') {
        return {};
    }
    try {
        const parsed = JSON.parse(raw);
        return parsed && typeof parsed === 'object' ? parsed : {};
    } catch {
        return {};
    }
}

function pad(value: number): string {
    return String(value).padStart(2, '0');
}

/**
 * Format a date the same way the GLPI date/time question inputs do (`Y-m-d`, `H:i` or `Y-m-d\TH:i`)
 */
export function formatDateTimeAnswer(date: Date, is_date_enabled: boolean, is_time_enabled: boolean): string {
    const date_part = `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
    const time_part = `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    if (is_date_enabled && is_time_enabled) {
        return `${date_part}T${time_part}`;
    }
    return is_time_enabled ? time_part : date_part;
}

export function isDateEnabled(question: RenderedQuestion): boolean {
    // Date is enabled by default
    return question.extra_data.is_date_enabled === undefined ? true : !!Number(question.extra_data.is_date_enabled);
}

export function isTimeEnabled(question: RenderedQuestion): boolean {
    return !!Number(question.extra_data.is_time_enabled ?? 0);
}

export const ACTOR_ITEMTYPE_FKEYS = {
    User: 'users_id',
    Group: 'groups_id',
    Supplier: 'suppliers_id',
} as const;
export type ActorItemtype = keyof typeof ACTOR_ITEMTYPE_FKEYS;

const ALLOWED_ACTOR_TYPES: Record<string, ActorItemtype[]> = {
    QuestionTypeRequester: ['User', 'Group'],
    QuestionTypeObserver: ['User', 'Group'],
    QuestionTypeAssignee: ['User', 'Group', 'Supplier'],
};

/**
 * Actor itemtypes allowed for an actor question (intersection of the type's allowed types and the configured enabled types)
 */
export function getEnabledActorTypes(question: RenderedQuestion): ActorItemtype[] {
    const allowed = ALLOWED_ACTOR_TYPES[question.type_name] ?? [];
    const enabled = question.extra_data.enabled_types;
    if (!Array.isArray(enabled) || enabled.length === 0) {
        return allowed;
    }
    return allowed.filter((itemtype) => enabled.includes(itemtype));
}

/**
 * Convert a form field value to the answer format used by GLPI (and by the condition engine).
 * Item questions only store the item ID in the form field, but GLPI answers are `{itemtype, items_id}`.
 */
export function toAnswer(question: RenderedQuestion, value: unknown): unknown {
    if (question.type_name === 'QuestionTypeItem' || question.type_name === 'QuestionTypeItemDropdown') {
        return { itemtype: question.extra_data.itemtype ?? null, items_id: value ?? -1 };
    }
    return value;
}

/**
 * Get the initial form field value of a question from its default value.
 * Port of the `getDefaultValue` behaviors of the GLPI question types used in `renderEndUserTemplate`.
 */
export function getInitialValue(question: RenderedQuestion): unknown {
    const raw = question.default_value;
    const extra = question.extra_data;
    switch (question.type_name) {
        case 'QuestionTypeShortText':
        case 'QuestionTypeEmail':
        case 'QuestionTypeLongText':
            return raw ?? '';
        case 'QuestionTypeNumber': {
            const value = parseFloat(raw ?? '');
            return Number.isNaN(value) ? null : value;
        }
        case 'QuestionTypeDateTime':
            if (Number(extra.is_default_value_current_time ?? 0)) {
                return formatDateTimeAnswer(new Date(), isDateEnabled(question), isTimeEnabled(question));
            }
            return raw ?? '';
        case 'QuestionTypeUrgency':
        case 'QuestionTypeRequestType': {
            const value = parseInt(raw ?? '', 10);
            return Number.isNaN(value) || value <= 0 ? null : value;
        }
        case 'QuestionTypeRadio':
        case 'QuestionTypeCheckbox':
        case 'QuestionTypeDropdown': {
            const options = extra.options ?? {};
            const uuids = (raw ?? '').split(',').filter((uuid) => uuid !== '' && uuid in options);
            const multiple = question.type_name === 'QuestionTypeCheckbox'
                || (question.type_name === 'QuestionTypeDropdown' && !!extra.is_multiple_dropdown);
            return multiple ? uuids : (uuids[0] ?? null);
        }
        case 'QuestionTypeRequester':
        case 'QuestionTypeObserver':
        case 'QuestionTypeAssignee': {
            const config = parseJSONObject(raw);
            const values: string[] = [];
            for (const itemtype of getEnabledActorTypes(question)) {
                const fkey = ACTOR_ITEMTYPE_FKEYS[itemtype];
                const ids = config[`${fkey}s`] ?? [];
                if (Array.isArray(ids)) {
                    values.push(...ids.filter((id) => Number(id) > 0).map((id) => `${fkey}-${id}`));
                }
            }
            // Single actor questions keep the first defined actor among the enabled types
            return extra.is_multiple_actors ? values : values.slice(0, 1);
        }
        case 'QuestionTypeItem':
        case 'QuestionTypeItemDropdown': {
            // The form field only holds the item ID. See {@link toAnswer}.
            // -1 and 0 are both used as the empty value
            const items_id = Number(parseJSONObject(raw).items_id ?? 0);
            return items_id > 0 ? items_id : null;
        }
        case 'QuestionTypeUserDevice':
            return extra.is_multiple_devices ? [] : null;
        case 'QuestionTypeFile':
            return [];
        default:
            return raw;
    }
}

function toRenderedQuestion(question: ApiFormQuestion & Record<string, any>, section_uuid: string): RenderedQuestion {
    return {
        id: question.id!,
        uuid: question.uuid!,
        name: question.name ?? '',
        type: question.type ?? '',
        type_name: getQuestionTypeName(question.type),
        is_mandatory: !!question.is_mandatory,
        vertical_rank: question.vertical_rank ?? 0,
        horizontal_rank: question.horizontal_rank ?? null,
        description: question.description ?? '',
        default_value: question.default_value ?? null,
        extra_data: parseJSONObject(question.extra_data),
        visibility_strategy: question.visibility_strategy ?? 'always_visible',
        visibility_conditions: parseConditions(question.visibility_conditions),
        validation_strategy: question.validation_strategy ?? 'no_validation',
        validation_conditions: parseConditions(question.validation_conditions),
        section_uuid,
    };
}

function toRenderedSection(section: ApiFormSection & Record<string, any>): RenderedSection {
    const uuid = section.uuid!;
    return {
        id: section.id!,
        uuid,
        name: section.name ?? '',
        description: section.description ?? '',
        rank: section.rank ?? 0,
        visibility_strategy: section.visibility_strategy ?? 'always_visible',
        conditions: parseConditions(section.conditions),
        questions: ((section.questions ?? []) as ApiFormQuestion[])
            .map((question) => toRenderedQuestion(question, uuid))
            .sort((a, b) => (a.vertical_rank - b.vertical_rank) || ((a.horizontal_rank ?? 0) - (b.horizontal_rank ?? 0))),
    };
}

/**
 * Convert the GraphQL Form result to the structure used by the renderer
 */
export function toRenderedForm(form: Record<string, any>): RenderedForm {
    return {
        id: form.id,
        name: form.name ?? '',
        form_description: form.form_description ?? '',
        render_layout: form.render_layout === 'single_page' ? 'single_page' : 'step_by_step',
        submit_button_visibility_strategy: form.submit_button_visibility_strategy ?? 'always_visible',
        submit_button_conditions: parseConditions(form.submit_button_conditions),
        sections: ((form.sections ?? []) as ApiFormSection[])
            .map(toRenderedSection)
            .sort((a, b) => a.rank - b.rank),
    };
}

/**
 * Get the initial form field values of all questions, keyed by field name
 */
export function getInitialValues(form: RenderedForm): Record<string, unknown> {
    const values: Record<string, unknown> = {};
    for (const section of form.sections) {
        for (const question of section.questions) {
            values[questionFieldName(question)] = getInitialValue(question);
        }
    }
    return values;
}

/**
 * Get the answers keyed by question ID from the form values keyed by field name
 */
export function getAnswersFromValues(form: RenderedForm, values: Record<string, unknown>): FormAnswers {
    const answers: FormAnswers = {};
    for (const section of form.sections) {
        for (const question of section.questions) {
            answers[question.id] = toAnswer(question, values[questionFieldName(question)] ?? null);
        }
    }
    return answers;
}

/**
 * Group the questions of a section in rows by vertical rank, each row being ordered by horizontal rank
 */
export function getQuestionRows(section: RenderedSection): RenderedQuestion[][] {
    const rows = new Map<number, RenderedQuestion[]>();
    for (const question of section.questions) {
        const row = rows.get(question.vertical_rank) ?? [];
        row.push(question);
        rows.set(question.vertical_rank, row);
    }
    return [...rows.entries()]
        .sort(([a], [b]) => a - b)
        .map(([, questions]) => questions.sort((a, b) => (a.horizontal_rank ?? 0) - (b.horizontal_rank ?? 0)));
}

/**
 * Build the answers payload to submit, excluding questions hidden by conditions (like `AnswersHandler::removeUnusedAnswers`)
 */
export function buildAnswersPayload(form: RenderedForm, answers: FormAnswers, visible_questions: Record<number, boolean>) {
    const payload: Record<number, unknown> = {};
    for (const section of form.sections) {
        for (const question of section.questions) {
            if (visible_questions[question.id] === false) {
                continue;
            }
            payload[question.id] = answers[question.id] ?? null;
        }
    }
    return { forms_id: form.id, answers: payload };
}

export async function loadForm(form_id: number): Promise<RenderedForm | null> {
    const { doGraphQLRequest } = useApi();
    const result = await doGraphQLRequest(`
        query {
            Form(filter: "id==${Number(form_id)}") {
                id name form_description render_layout submit_button_visibility_strategy submit_button_conditions
                sections {
                    id uuid name description rank visibility_strategy conditions
                    questions {
                        id uuid name type is_mandatory vertical_rank horizontal_rank description default_value extra_data
                        visibility_strategy visibility_conditions validation_strategy validation_conditions
                    }
                }
            }
        }
    `);
    const form = (result as any)?.data?.Form?.[0];
    return form ? toRenderedForm(form) : null;
}

export class FormSubmissionNotSupportedError extends Error {
    constructor() {
        super('Submitting form answers is not supported by the API yet');
        this.name = 'FormSubmissionNotSupportedError';
    }
}

/**
 * Submit the answers of a form.
 * TODO The HL API does not provide an endpoint to submit form answers yet (the official UI uses the session-based `POST /Form/SubmitAnswers` route).
 */
export async function submitFormAnswers(payload: ReturnType<typeof buildAnswersPayload>): Promise<never> {
    void payload;
    throw new FormSubmissionNotSupportedError();
}
