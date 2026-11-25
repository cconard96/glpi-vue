import type { components } from '../../../../data/hlapiv2_schema';
import type { LogicOperator, ValidationStrategy, ValueOperator, VisibilityStrategy, ConditionItemType } from './conditions/operators';

export type ApiForm = components['schemas']['Form'];
export type ApiFormSection = components['schemas']['FormSection'];
export type ApiFormQuestion = components['schemas']['FormQuestion'];

/**
 * A parsed condition. Port of `Glpi\Form\Condition\ConditionData`.
 */
export interface ConditionData {
    item_uuid: string;
    item_type: ConditionItemType | string;
    value_operator: ValueOperator | null;
    value: unknown;
    logic_operator: LogicOperator;
}

/**
 * Short GLPI question type name (class name without the `Glpi\Form\QuestionType\` namespace), e.g. `QuestionTypeShortText`.
 */
export type QuestionTypeName = string;

export interface RenderedQuestion {
    id: number;
    uuid: string;
    name: string;
    /** Fully qualified GLPI question type class */
    type: string;
    /** Short question type class name */
    type_name: QuestionTypeName;
    is_mandatory: boolean;
    vertical_rank: number;
    horizontal_rank: number | null;
    description: string;
    /** Raw default value as stored by GLPI */
    default_value: string | null;
    extra_data: Record<string, any>;
    visibility_strategy: VisibilityStrategy;
    visibility_conditions: ConditionData[];
    validation_strategy: ValidationStrategy;
    validation_conditions: ConditionData[];
    section_uuid: string;
}

export interface RenderedSection {
    id: number;
    uuid: string;
    name: string;
    description: string;
    rank: number;
    visibility_strategy: VisibilityStrategy;
    conditions: ConditionData[];
    questions: RenderedQuestion[];
}

export interface RenderedForm {
    id: number;
    name: string;
    form_description: string;
    render_layout: 'single_page' | 'step_by_step';
    submit_button_visibility_strategy: VisibilityStrategy;
    submit_button_conditions: ConditionData[];
    sections: RenderedSection[];
}

/**
 * Answers keyed by question ID, using the same value shapes as the official GLPI renderer POST data.
 */
export type FormAnswers = Record<number | string, unknown>;

/**
 * Provides display labels for values that the condition engine cannot resolve by itself
 * (actors, items and devices, which GLPI loads from the database).
 */
export type AnswerLabelResolver = (question: RenderedQuestion, value: string) => string | null | undefined;
