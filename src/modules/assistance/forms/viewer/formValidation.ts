import { FormConditionEngine } from '../conditions/engine';
import { getValueTransformer, isEmptyAnswer } from '../conditions/handlers';
import { ValidationStrategy, ValueOperator } from '../conditions/operators';
import { questionFieldName } from './formRendererContext';
import { getAnswersFromValues } from './useFormRenderer';

export { getAnswersFromValues };
import type { AnswerLabelResolver, ConditionData, FormAnswers, RenderedForm, RenderedQuestion } from '../types';

/**
 * Translation function with the vue-i18n signatures used in this project: `$t(key, fallback)` or `$t(key, named, fallback)`
 */
export type Translate = (key: string, named_or_fallback: string | Record<string, unknown>, fallback?: string) => string;

/**
 * Whether an answer must be considered empty for the mandatory check (see `AnswersHandler::validateAnswers`).
 * The answer is first converted to its comparable value (text of HTML answers, labels of choices...).
 */
export function isAnswerEmpty(question: RenderedQuestion, answer: unknown): boolean {
    const transformer = getValueTransformer(question);
    const value = transformer ? transformer(answer) : answer;
    return isEmptyAnswer(typeof value === 'string' ? value.trim() : value);
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Port of `ValueOperator::getErrorMessageForValidation`
 */
export function getValidationErrorMessage(strategy: ValidationStrategy, condition: ConditionData, $t: Translate): string {
    const value = condition.value;
    if (strategy === ValidationStrategy.VALID_IF) {
        switch (condition.value_operator) {
            case ValueOperator.GREATER_THAN:
                return $t('form.validation.must.greater_than', { value }, 'The value must be greater than {value}');
            case ValueOperator.GREATER_THAN_OR_EQUALS:
                return $t('form.validation.must.greater_than_or_equals', { value }, 'The value must be greater than or equal to {value}');
            case ValueOperator.LESS_THAN:
                return $t('form.validation.must.less_than', { value }, 'The value must be less than {value}');
            case ValueOperator.LESS_THAN_OR_EQUALS:
                return $t('form.validation.must.less_than_or_equals', { value }, 'The value must be less than or equal to {value}');
            case ValueOperator.MATCH_REGEX:
                return $t('form.validation.must.match_regex', 'The value must match the requested format');
            case ValueOperator.NOT_MATCH_REGEX:
                return $t('form.validation.must_not.match_regex', 'The value must not match the requested format');
            case ValueOperator.LENGTH_GREATER_THAN:
                return $t('form.validation.must.length_greater_than', { value }, 'The length must be greater than {value}');
            case ValueOperator.LENGTH_GREATER_THAN_OR_EQUALS:
                return $t('form.validation.must.length_greater_than_or_equals', { value }, 'The length must be greater than or equal to {value}');
            case ValueOperator.LENGTH_LESS_THAN:
                return $t('form.validation.must.length_less_than', { value }, 'The length must be less than {value}');
            case ValueOperator.LENGTH_LESS_THAN_OR_EQUALS:
                return $t('form.validation.must.length_less_than_or_equals', { value }, 'The length must be less than or equal to {value}');
        }
    } else if (strategy === ValidationStrategy.INVALID_IF) {
        switch (condition.value_operator) {
            case ValueOperator.GREATER_THAN:
                return $t('form.validation.must_not.greater_than', { value }, 'The value must not be greater than {value}');
            case ValueOperator.GREATER_THAN_OR_EQUALS:
                return $t('form.validation.must_not.greater_than_or_equals', { value }, 'The value must not be greater than or equal to {value}');
            case ValueOperator.LESS_THAN:
                return $t('form.validation.must_not.less_than', { value }, 'The value must not be less than {value}');
            case ValueOperator.LESS_THAN_OR_EQUALS:
                return $t('form.validation.must_not.less_than_or_equals', { value }, 'The value must not be less than or equal to {value}');
            case ValueOperator.MATCH_REGEX:
                return $t('form.validation.must_not.match_regex', 'The value must not match the requested format');
            case ValueOperator.NOT_MATCH_REGEX:
                return $t('form.validation.must.match_regex', 'The value must match the requested format');
            case ValueOperator.LENGTH_GREATER_THAN:
                return $t('form.validation.must_not.length_greater_than', { value }, 'The length must not be greater than {value}');
            case ValueOperator.LENGTH_GREATER_THAN_OR_EQUALS:
                return $t('form.validation.must_not.length_greater_than_or_equals', { value }, 'The length must not be greater than or equal to {value}');
            case ValueOperator.LENGTH_LESS_THAN:
                return $t('form.validation.must_not.length_less_than', { value }, 'The length must not be less than {value}');
            case ValueOperator.LENGTH_LESS_THAN_OR_EQUALS:
                return $t('form.validation.must_not.length_less_than_or_equals', { value }, 'The length must not be less than or equal to {value}');
        }
    }
    return $t('form.validation.invalid', 'The value is not valid');
}

/**
 * Validate the answers of the visible questions. Port of `AnswersHandler::validateAnswers`.
 * @returns Errors keyed by field name, in the format expected by the BumbleVue Form resolver
 */
export function validateAnswers(
    form: RenderedForm,
    answers: FormAnswers,
    $t: Translate,
    options: { resolveLabel?: AnswerLabelResolver; fields?: string[] } = {},
): Record<string, Array<{ message: string }>> {
    const engine = new FormConditionEngine({ form, answers, resolveLabel: options.resolveLabel });
    const visibility = engine.computeVisibility();
    const errors: Record<string, Array<{ message: string }>> = {};

    for (const section of form.sections) {
        for (const question of section.questions) {
            const field = questionFieldName(question);
            if ((options.fields && !options.fields.includes(field)) || visibility.questions[question.id] === false) {
                continue;
            }
            const answer = answers[question.id];
            const field_errors: Array<{ message: string }> = [];

            if (question.is_mandatory && isAnswerEmpty(question, answer)) {
                field_errors.push({
                    message: question.type_name === 'QuestionTypeNumber'
                        ? $t('form.validation.valid_number', 'Please enter a valid number')
                        : $t('form.validation.mandatory', 'This field is mandatory'),
                });
            } else if (!isAnswerEmpty(question, answer)) {
                // Like GLPI, validation conditions are only checked for answered questions
                for (const condition of engine.computeQuestionValidation(question)) {
                    field_errors.push({ message: getValidationErrorMessage(question.validation_strategy, condition, $t) });
                }
                if (question.type_name === 'QuestionTypeEmail' && (typeof answer !== 'string' || !EMAIL_REGEX.test(answer))) {
                    field_errors.push({ message: $t('form.validation.email', 'Please enter a valid email') });
                }
            }

            if (field_errors.length) {
                errors[field] = field_errors;
            }
        }
    }
    return errors;
}
