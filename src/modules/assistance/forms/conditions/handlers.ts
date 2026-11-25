/**
 * Condition handlers for the GLPI form conditions, based on `src/Glpi/Form/Condition/ConditionHandler/*`
 * and the question type specific handler lists/value transformers (`getConditionHandlers` / `transformConditionValueForComparisons`).
 *
 * The behavior follows the intent of the GLPI handlers using normal JS semantics. The server stays the authority when answers are submitted.
 */
import { ValueOperator } from './operators';
import type { AnswerLabelResolver, RenderedQuestion } from '../types';

export interface ConditionHandler {
    name: string;
    operators: readonly ValueOperator[];
    /**
     * @param a The answer (or the visibility for the visibility handler)
     * @param operator The operator
     * @param b The condition value (a string, or an array/object for choice, actor and item conditions)
     */
    apply(a: unknown, operator: ValueOperator, b: unknown): boolean;
}

/**
 * A function converting a raw answer into the value used for Regex/Empty comparisons and mandatory checks.
 * Equivalent of `ConditionValueTransformerInterface::transformConditionValueForComparisons`.
 */
export type ValueTransformer = (value: unknown) => unknown;

const SET_OPERATORS = [ValueOperator.EQUALS, ValueOperator.NOT_EQUALS, ValueOperator.CONTAINS, ValueOperator.NOT_CONTAINS] as const;
const ORDER_OPERATORS = [
    ValueOperator.EQUALS, ValueOperator.NOT_EQUALS,
    ValueOperator.GREATER_THAN, ValueOperator.GREATER_THAN_OR_EQUALS,
    ValueOperator.LESS_THAN, ValueOperator.LESS_THAN_OR_EQUALS,
] as const;

export function toText(value: unknown): string {
    return value === null || value === undefined ? '' : String(value);
}

export function isEmptyAnswer(value: unknown): boolean {
    return value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);
}

/**
 * Get the text content of an HTML string
 */
export function htmlToText(html: string): string {
    return new DOMParser().parseFromString(html, 'text/html').body.textContent ?? '';
}

/**
 * Parse a regex stored by GLPI in the `/pattern/flags` format. Returns null for invalid patterns.
 */
export function parseStoredRegex(pattern: string): RegExp | null {
    const match = pattern.match(/^\/(.*)\/([a-z]*)$/s);
    if (!match) {
        return null;
    }
    try {
        return new RegExp(match[1], match[2]);
    } catch {
        return null;
    }
}

/**
 * Apply an ordering operator to the result of a comparison function (negative, zero or positive)
 */
function compare(cmp: number, operator: ValueOperator): boolean {
    switch (operator) {
        case ValueOperator.EQUALS:
            return cmp === 0;
        case ValueOperator.NOT_EQUALS:
            return cmp !== 0;
        case ValueOperator.GREATER_THAN:
            return cmp > 0;
        case ValueOperator.GREATER_THAN_OR_EQUALS:
            return cmp >= 0;
        case ValueOperator.LESS_THAN:
            return cmp < 0;
        case ValueOperator.LESS_THAN_OR_EQUALS:
            return cmp <= 0;
        default:
            return false;
    }
}

function toStringList(value: unknown): string[] {
    if (Array.isArray(value)) {
        return value.map(toText).filter((v) => v !== '');
    }
    return typeof value === 'string' && value !== '' ? value.split(',') : [];
}

/**
 * Compare two lists of values as sets
 */
export function applySetOperator(a: unknown, operator: ValueOperator, b: unknown): boolean {
    const actual = new Set(toStringList(a));
    const expected = new Set(toStringList(b));
    const contains = [...expected].every((value) => actual.has(value));
    switch (operator) {
        case ValueOperator.EQUALS:
            return contains && actual.size === expected.size;
        case ValueOperator.NOT_EQUALS:
            return !(contains && actual.size === expected.size);
        case ValueOperator.CONTAINS:
            return contains;
        case ValueOperator.NOT_CONTAINS:
            return !contains;
        default:
            return false;
    }
}

export const VisibilityHandler: ConditionHandler = {
    name: 'visibility',
    operators: [ValueOperator.VISIBLE, ValueOperator.NOT_VISIBLE],
    apply(a, operator) {
        return operator === ValueOperator.VISIBLE ? Boolean(a) : !a;
    },
};

export function createEmptyHandler(transformer?: ValueTransformer): ConditionHandler {
    return {
        name: 'empty',
        operators: [ValueOperator.EMPTY, ValueOperator.NOT_EMPTY],
        apply(a, operator) {
            const is_empty = isEmptyAnswer(transformer ? transformer(a) : a);
            return operator === ValueOperator.EMPTY ? is_empty : !is_empty;
        },
    };
}

export function createRegexHandler(transformer?: ValueTransformer): ConditionHandler {
    return {
        name: 'regex',
        operators: [ValueOperator.MATCH_REGEX, ValueOperator.NOT_MATCH_REGEX],
        apply(a, operator, b) {
            const value = transformer ? transformer(a) : a;
            const values = Array.isArray(value) ? value : [value];
            const regex = parseStoredRegex(toText(b));
            const matches = values.map((v) => regex?.test(toText(v)) ?? false);
            // Every value must match / no value may match
            return operator === ValueOperator.MATCH_REGEX
                ? matches.length > 0 && matches.every(Boolean)
                : !matches.some(Boolean);
        },
    };
}

export const StringHandler: ConditionHandler = {
    name: 'string',
    operators: [
        ValueOperator.EQUALS, ValueOperator.NOT_EQUALS, ValueOperator.CONTAINS, ValueOperator.NOT_CONTAINS,
        ValueOperator.LENGTH_GREATER_THAN, ValueOperator.LENGTH_GREATER_THAN_OR_EQUALS,
        ValueOperator.LENGTH_LESS_THAN, ValueOperator.LENGTH_LESS_THAN_OR_EQUALS,
    ],
    apply(a, operator, b) {
        const text = toText(a).toLowerCase();
        const expected = toText(b).toLowerCase();
        switch (operator) {
            case ValueOperator.EQUALS:
                return text === expected;
            case ValueOperator.NOT_EQUALS:
                return text !== expected;
            case ValueOperator.CONTAINS:
                return text.includes(expected);
            case ValueOperator.NOT_CONTAINS:
                return !text.includes(expected);
            case ValueOperator.LENGTH_GREATER_THAN:
                return text.length > Number(expected);
            case ValueOperator.LENGTH_GREATER_THAN_OR_EQUALS:
                return text.length >= Number(expected);
            case ValueOperator.LENGTH_LESS_THAN:
                return text.length < Number(expected);
            case ValueOperator.LENGTH_LESS_THAN_OR_EQUALS:
                return text.length <= Number(expected);
            default:
                return false;
        }
    },
};

export const RichTextHandler: ConditionHandler = {
    name: 'rich_text',
    operators: StringHandler.operators,
    apply(a, operator, b) {
        return StringHandler.apply(htmlToText(toText(a)), operator, htmlToText(toText(b)));
    },
};

export const NumberHandler: ConditionHandler = {
    name: 'number',
    operators: ORDER_OPERATORS,
    apply(a, operator, b) {
        if (isEmptyAnswer(a)) {
            return false;
        }
        const actual = Number(a);
        const expected = Number(b);
        if (Number.isNaN(actual) || Number.isNaN(expected)) {
            return false;
        }
        return compare(actual - expected, operator);
    },
};

export const RequestTypeHandler: ConditionHandler = {
    name: 'request_type',
    operators: [ValueOperator.EQUALS, ValueOperator.NOT_EQUALS],
    apply(a, operator, b) {
        const equals = Number(a) === Number(b);
        return operator === ValueOperator.EQUALS ? equals : !equals;
    },
};

/**
 * Date, time and date/time answers are compared as strings. Their formats (`Y-m-d`, `H:i` or `Y-m-d\TH:i`) sort chronologically.
 */
export const DateTimeHandler: ConditionHandler = {
    name: 'datetime',
    operators: ORDER_OPERATORS,
    apply(a, operator, b) {
        const actual = toText(a);
        const expected = toText(b);
        return compare(actual < expected ? -1 : (actual > expected ? 1 : 0), operator);
    },
};

/**
 * Equality compares the option UUIDs. The engine maps UUIDs to labels before calling this handler for ordering operators.
 */
export const SingleChoiceHandler: ConditionHandler = {
    name: 'single_choice',
    operators: ORDER_OPERATORS,
    apply(a, operator, b) {
        const actual = toText(Array.isArray(a) ? a.at(-1) : a);
        const expected = toText(Array.isArray(b) ? b.at(-1) : b);
        if (operator === ValueOperator.EQUALS || operator === ValueOperator.NOT_EQUALS) {
            const equals = actual.toLowerCase() === expected.toLowerCase();
            return operator === ValueOperator.EQUALS ? equals : !equals;
        }
        return compare(actual.localeCompare(expected, undefined, { numeric: true, sensitivity: 'base' }), operator);
    },
};

export const MultipleChoiceHandler: ConditionHandler = {
    name: 'multiple_choice',
    operators: SET_OPERATORS,
    apply: applySetOperator,
};

/**
 * Actors are compared as sets of `users_id-5` / `groups_id-2` / `suppliers_id-3` keys
 */
export const ActorHandler: ConditionHandler = {
    name: 'actor',
    operators: SET_OPERATORS,
    apply: applySetOperator,
};

interface ItemValue {
    itemtype?: unknown;
    items_id?: unknown;
}

function isItemValue(value: unknown): value is ItemValue {
    return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function createItemHandler(itemtype: string): ConditionHandler {
    return {
        name: 'item',
        operators: [ValueOperator.EQUALS, ValueOperator.NOT_EQUALS],
        apply(a, operator, b) {
            if (!isItemValue(a) || !isItemValue(b)) {
                return false;
            }
            const equals = toText(a.items_id) === toText(b.items_id) && toText(a.itemtype ?? itemtype) === toText(b.itemtype ?? itemtype);
            return operator === ValueOperator.EQUALS ? equals : !equals;
        },
    };
}

/**
 * `getName` returns the display name of the selected item (completename for tree dropdowns)
 */
export function createItemAsTextHandler(getName: (items_id: string) => string | null | undefined): ConditionHandler {
    return {
        name: 'item_as_text',
        operators: [ValueOperator.CONTAINS, ValueOperator.NOT_CONTAINS],
        apply(a, operator, b) {
            if (!isItemValue(a) || isEmptyAnswer(a.items_id)) {
                return false;
            }
            const name = getName(toText(a.items_id));
            if (name === null || name === undefined) {
                return false;
            }
            const contains = name.toLowerCase().includes(toText(b).toLowerCase());
            return operator === ValueOperator.CONTAINS ? contains : !contains;
        },
    };
}

/** Extracts the itemtype of a device answer (`Computer_12`) */
const DEVICE_ITEMTYPE = /^([A-Za-z]+)_\d+$/;

function getDeviceItemtype(device: unknown): string | null {
    return toText(device).match(DEVICE_ITEMTYPE)?.[1] ?? null;
}

export function createUserDevicesHandler(is_multiple: boolean): ConditionHandler {
    if (is_multiple) {
        return {
            name: 'user_devices',
            operators: [ValueOperator.AT_LEAST_ONE_ITEM_OF_ITEMTYPE, ValueOperator.ALL_ITEMS_OF_ITEMTYPE],
            apply(a, operator, b) {
                if (!Array.isArray(a) || !Array.isArray(b)) {
                    return false;
                }
                const itemtypes = a.map(getDeviceItemtype).filter((itemtype): itemtype is string => itemtype !== null);
                if (operator === ValueOperator.AT_LEAST_ONE_ITEM_OF_ITEMTYPE) {
                    return itemtypes.some((itemtype) => b.includes(itemtype));
                }
                return itemtypes.length > 0 && itemtypes.every((itemtype) => b.includes(itemtype));
            },
        };
    }
    return {
        name: 'user_devices',
        operators: [ValueOperator.IS_ITEMTYPE, ValueOperator.IS_NOT_ITEMTYPE],
        apply(a, operator, b) {
            const is_itemtype = getDeviceItemtype(a) === toText(b);
            return operator === ValueOperator.IS_ITEMTYPE ? is_itemtype : !is_itemtype;
        },
    };
}

export function createUserDevicesAsTextHandler(getNames: ValueTransformer): ConditionHandler {
    return {
        name: 'user_devices_as_text',
        operators: [ValueOperator.CONTAINS, ValueOperator.NOT_CONTAINS],
        apply(a, operator, b) {
            const names = getNames(a);
            const needle = toText(b).toLowerCase();
            const contains = Array.isArray(names) && names.some((name) => toText(name).toLowerCase().includes(needle));
            return operator === ValueOperator.CONTAINS ? contains : !contains;
        },
    };
}

/**
 * Get the short type name from the fully qualified question type class
 */
export function getQuestionTypeName(type: string | null | undefined): string {
    return type ? type.split('\\').at(-1) ?? '' : '';
}

const SELECTABLE_TYPES = ['QuestionTypeRadio', 'QuestionTypeCheckbox', 'QuestionTypeDropdown'];
const ACTOR_TYPES = ['QuestionTypeRequester', 'QuestionTypeObserver', 'QuestionTypeAssignee'];
const ITEM_TYPES = ['QuestionTypeItem', 'QuestionTypeItemDropdown'];

export function isSelectableQuestion(question: RenderedQuestion): boolean {
    return SELECTABLE_TYPES.includes(question.type_name);
}

export function isActorQuestion(question: RenderedQuestion): boolean {
    return ACTOR_TYPES.includes(question.type_name);
}

export function isItemQuestion(question: RenderedQuestion): boolean {
    return ITEM_TYPES.includes(question.type_name);
}

/**
 * Get the options (uuid => label) of a selectable question
 */
export function getSelectableOptions(question: RenderedQuestion): Record<string, string> {
    const options = question.extra_data?.options;
    return options && typeof options === 'object' ? options : {};
}

/**
 * Get the function converting an answer to the value used by the Regex/Empty handlers and the mandatory check
 * (labels instead of IDs, text instead of HTML...). Returns undefined for types without a transformer.
 */
export function getValueTransformer(question: RenderedQuestion, resolveLabel?: AnswerLabelResolver): ValueTransformer | undefined {
    // Fall back to the raw value while the label is not loaded so emptiness checks stay correct
    const label = (value: unknown) => resolveLabel?.(question, toText(value)) ?? toText(value);
    const toList = (value: unknown): unknown[] => Array.isArray(value) ? value : (isEmptyAnswer(value) ? [] : [value]);

    switch (question.type_name) {
        case 'QuestionTypeLongText':
            return (value) => htmlToText(toText(value)).trim();
        case 'QuestionTypeUrgency':
        case 'QuestionTypeRequestType':
            // 0 is the empty value
            return (value) => (isEmptyAnswer(value) || Number(value) === 0) ? '' : toText(value);
        case 'QuestionTypeRadio':
        case 'QuestionTypeCheckbox':
        case 'QuestionTypeDropdown': {
            const options = getSelectableOptions(question);
            return (value) => toStringList(value).map((uuid) => options[uuid]).filter((option) => !!option);
        }
        case 'QuestionTypeRequester':
        case 'QuestionTypeObserver':
        case 'QuestionTypeAssignee':
            return (value) => toStringList(value).map(label);
        case 'QuestionTypeItem':
        case 'QuestionTypeItemDropdown':
            return (value) => {
                const items_id = isItemValue(value) ? value.items_id : value;
                return isEmptyAnswer(items_id) || Number(items_id) <= 0 ? '' : label(items_id);
            };
        case 'QuestionTypeUserDevice':
            return (value) => toList(value).filter((device) => getDeviceItemtype(device) !== null).map(label);
        default:
            return undefined;
    }
}

/**
 * Get the condition handlers supported by a question, like `getConditionHandlers()` of each question type
 */
export function getQuestionConditionHandlers(question: RenderedQuestion, resolveLabel?: AnswerLabelResolver): ConditionHandler[] {
    const transformer = getValueTransformer(question, resolveLabel);
    const handlers: ConditionHandler[] = [VisibilityHandler, createRegexHandler(transformer), createEmptyHandler(transformer)];
    const extra = question.extra_data ?? {};

    switch (question.type_name) {
        case 'QuestionTypeShortText':
        case 'QuestionTypeEmail':
            handlers.push(StringHandler);
            break;
        case 'QuestionTypeLongText':
            handlers.push(RichTextHandler);
            break;
        case 'QuestionTypeNumber':
        case 'QuestionTypeUrgency':
            handlers.push(NumberHandler);
            break;
        case 'QuestionTypeRequestType':
            handlers.push(RequestTypeHandler);
            break;
        case 'QuestionTypeDateTime':
            handlers.push(DateTimeHandler);
            break;
        case 'QuestionTypeRadio':
            handlers.push(SingleChoiceHandler);
            break;
        case 'QuestionTypeCheckbox':
            handlers.push(MultipleChoiceHandler);
            break;
        case 'QuestionTypeDropdown':
            handlers.push(extra.is_multiple_dropdown ? MultipleChoiceHandler : SingleChoiceHandler);
            break;
        case 'QuestionTypeRequester':
        case 'QuestionTypeObserver':
        case 'QuestionTypeAssignee':
            handlers.push(ActorHandler);
            break;
        case 'QuestionTypeItem':
        case 'QuestionTypeItemDropdown':
            if (extra.itemtype) {
                handlers.push(createItemHandler(extra.itemtype));
                handlers.push(createItemAsTextHandler((items_id) => resolveLabel?.(question, items_id)));
            }
            break;
        case 'QuestionTypeUserDevice':
            handlers.push(createUserDevicesHandler(!!extra.is_multiple_devices));
            handlers.push(createUserDevicesAsTextHandler(transformer!));
            break;
    }
    return handlers;
}
