/**
 * Enumerations used by GLPI form conditions.
 * Port of the PHP enums in `src/Glpi/Form/Condition/` (ValueOperator, LogicOperator, Type, VisibilityStrategy, ValidationStrategy).
 */

export const ValueOperator = {
    EQUALS: 'equals',
    NOT_EQUALS: 'not_equals',
    CONTAINS: 'contains',
    NOT_CONTAINS: 'not_contains',
    GREATER_THAN: 'greater_than',
    GREATER_THAN_OR_EQUALS: 'greater_than_or_equals',
    LESS_THAN: 'less_than',
    LESS_THAN_OR_EQUALS: 'less_than_or_equals',
    IS_ITEMTYPE: 'is_itemtype',
    IS_NOT_ITEMTYPE: 'is_not_itemtype',
    AT_LEAST_ONE_ITEM_OF_ITEMTYPE: 'at_least_one_item_of_itemtype',
    ALL_ITEMS_OF_ITEMTYPE: 'all_items_of_itemtype',
    MATCH_REGEX: 'match_regex',
    NOT_MATCH_REGEX: 'not_match_regex',
    LENGTH_GREATER_THAN: 'length_greater_than',
    LENGTH_GREATER_THAN_OR_EQUALS: 'length_greater_than_or_equals',
    LENGTH_LESS_THAN: 'length_less_than',
    LENGTH_LESS_THAN_OR_EQUALS: 'length_less_than_or_equals',
    VISIBLE: 'visible',
    NOT_VISIBLE: 'not_visible',
    EMPTY: 'empty',
    NOT_EMPTY: 'not_empty',
} as const;
export type ValueOperator = typeof ValueOperator[keyof typeof ValueOperator];

export const LogicOperator = {
    AND: 'and',
    OR: 'or',
} as const;
export type LogicOperator = typeof LogicOperator[keyof typeof LogicOperator];

export const ConditionItemType = {
    QUESTION: 'question',
    SECTION: 'section',
    COMMENT: 'comment',
} as const;
export type ConditionItemType = typeof ConditionItemType[keyof typeof ConditionItemType];

export const VisibilityStrategy = {
    ALWAYS_VISIBLE: 'always_visible',
    VISIBLE_IF: 'visible_if',
    HIDDEN_IF: 'hidden_if',
} as const;
export type VisibilityStrategy = typeof VisibilityStrategy[keyof typeof VisibilityStrategy];

export const ValidationStrategy = {
    NO_VALIDATION: 'no_validation',
    VALID_IF: 'valid_if',
    INVALID_IF: 'invalid_if',
} as const;
export type ValidationStrategy = typeof ValidationStrategy[keyof typeof ValidationStrategy];

const all_value_operators = new Set<string>(Object.values(ValueOperator));

export function isValueOperator(value: unknown): value is ValueOperator {
    return typeof value === 'string' && all_value_operators.has(value);
}

/**
 * Port of `VisibilityStrategy::mustBeVisible`
 */
export function mustBeVisible(strategy: VisibilityStrategy, conditions_result: boolean): boolean {
    switch (strategy) {
        case VisibilityStrategy.VISIBLE_IF:
            return conditions_result;
        case VisibilityStrategy.HIDDEN_IF:
            return !conditions_result;
        default:
            return true;
    }
}

/**
 * Port of `ValidationStrategy::mustBeValidated`
 */
export function mustBeValidated(strategy: ValidationStrategy, conditions_result: boolean): boolean {
    switch (strategy) {
        case ValidationStrategy.VALID_IF:
            return conditions_result;
        case ValidationStrategy.INVALID_IF:
            return !conditions_result;
        default:
            return true;
    }
}
