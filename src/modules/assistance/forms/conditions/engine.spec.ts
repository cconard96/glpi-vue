import { describe, expect, test } from 'vitest';
import { computeVisibility, FormConditionEngine, parseConditions } from './engine';
import { applySetOperator, getQuestionConditionHandlers, parseStoredRegex } from './handlers';
import type { ConditionData, RenderedForm, RenderedQuestion, RenderedSection } from '../types';

let next_id = 1;

function question(type_name: string, overrides: Partial<RenderedQuestion> = {}): RenderedQuestion {
    const id = next_id++;
    return {
        id,
        uuid: `q${id}`,
        name: `Question ${id}`,
        type: `Glpi\\Form\\QuestionType\\${type_name}`,
        type_name,
        is_mandatory: false,
        vertical_rank: id,
        horizontal_rank: null,
        description: '',
        default_value: null,
        extra_data: {},
        visibility_strategy: 'always_visible',
        visibility_conditions: [],
        validation_strategy: 'no_validation',
        validation_conditions: [],
        section_uuid: 's1',
        ...overrides,
    };
}

function condition(item_uuid: string, value_operator: ConditionData['value_operator'], value: unknown = null, logic_operator: 'and' | 'or' = 'and', item_type = 'question'): ConditionData {
    return { item_uuid, item_type, value_operator, value, logic_operator };
}

function form(sections: Array<Partial<RenderedSection> & { questions: RenderedQuestion[] }>, overrides: Partial<RenderedForm> = {}): RenderedForm {
    return {
        id: 1,
        name: 'Form',
        form_description: '',
        render_layout: 'single_page',
        submit_button_visibility_strategy: 'always_visible',
        submit_button_conditions: [],
        sections: sections.map((section, i) => {
            const uuid = section.uuid ?? `s${i + 1}`;
            return {
                id: i + 1,
                uuid,
                name: `Section ${i + 1}`,
                description: '',
                rank: i,
                visibility_strategy: 'always_visible',
                conditions: [],
                ...section,
                questions: section.questions.map((q) => ({ ...q, section_uuid: uuid })),
            };
        }),
        ...overrides,
    };
}

describe('parseConditions', () => {
    test('parses the item key and JSON encoded values', () => {
        const conditions = parseConditions(JSON.stringify([
            { item: 'question-abc-def', value_operator: 'equals', value: '["users_id-2"]', logic_operator: 'or' },
            { item: 'section-xyz', value_operator: 'visible', value: '42' },
            { item: '', value_operator: null, value: null },
        ]));
        expect(conditions[0]).toEqual({ item_uuid: 'abc-def', item_type: 'question', value_operator: 'equals', value: ['users_id-2'], logic_operator: 'or' });
        expect(conditions[1]).toMatchObject({ item_uuid: 'xyz', item_type: 'section', value: '42', logic_operator: 'and' });
        expect(conditions[2]).toMatchObject({ item_uuid: '', value_operator: null });
    });

    test('invalid JSON gives no conditions', () => {
        expect(parseConditions('{not json')).toEqual([]);
        expect(parseConditions(null)).toEqual([]);
        expect(parseConditions('')).toEqual([]);
    });
});

describe('Stored regex', () => {
    test('parses the /pattern/flags format', () => {
        expect(parseStoredRegex('/^abc$/i')?.test('ABC')).toBe(true);
        expect(parseStoredRegex('/^a\\/b$/')?.test('a/b')).toBe(true);
        expect(parseStoredRegex('abc')).toBeNull();
        expect(parseStoredRegex('/(/')).toBeNull();
    });
});

describe('Set condition operator', () => {
    test.each([
        [['a', 'b'], 'equals', ['b', 'a'], true],
        [['a', 'b', ''], 'equals', ['a', 'b'], true],
        [['a'], 'equals', ['a', 'b'], false],
        [['a', 'b', 'c'], 'contains', ['a', 'c'], true],
        [['a'], 'contains', ['a', 'c'], false],
        [['a'], 'not_contains', ['a', 'c'], true],
        [['a'], 'not_contains', [], false],
        ['a,b', 'equals', ['b', 'a'], true],
    ] as const)('%j %s %j => %s', (a, operator, b, expected) => {
        expect(applySetOperator(a, operator, b)).toBe(expected);
    });
});

describe('Question handlers', () => {
    function apply(q: RenderedQuestion, answer: unknown, operator: ConditionData['value_operator'], value: unknown = null) {
        const handlers = getQuestionConditionHandlers(q, (_q, v) => `Label ${v}`).filter((h) => h.operators.includes(operator!));
        expect(handlers).toHaveLength(1);
        return handlers[0].apply(answer, operator!, value);
    }

    test('short text is case-insensitive and supports length operators', () => {
        const q = question('QuestionTypeShortText');
        expect(apply(q, 'Hello World', 'equals', 'hello world')).toBe(true);
        expect(apply(q, 'Hello World', 'contains', 'WORLD')).toBe(true);
        expect(apply(q, 'Hello', 'length_greater_than', '4')).toBe(true);
        expect(apply(q, 'Hello', 'length_less_than', '5')).toBe(false);
        expect(apply(q, 'abc123', 'match_regex', '/^[a-z]+\\d+$/')).toBe(true);
        expect(apply(q, 'abc', 'match_regex', '/(/')).toBe(false);
        expect(apply(q, 'abc', 'not_match_regex', '/^x/')).toBe(true);
        expect(apply(q, '', 'empty')).toBe(true);
        expect(apply(q, '0', 'empty')).toBe(false);
    });

    test('long text strips tags', () => {
        const q = question('QuestionTypeLongText');
        expect(apply(q, '<p>Hello</p>', 'equals', 'hello')).toBe(true);
        expect(apply(q, '<p></p>', 'empty')).toBe(true);
    });

    test('number compares numerically', () => {
        const q = question('QuestionTypeNumber');
        expect(apply(q, '10', 'greater_than', '9')).toBe(true);
        expect(apply(q, '', 'equals', '0')).toBe(false);
        expect(apply(q, 'abc', 'greater_than', '1')).toBe(false);
        expect(apply(q, 2.5, 'less_than_or_equals', '2.5')).toBe(true);
    });

    test('date and time compare as strings', () => {
        const q = question('QuestionTypeDateTime', { extra_data: { is_date_enabled: 1, is_time_enabled: 1 } });
        expect(apply(q, '2026-11-18T10:00', 'greater_than', '2026-11-18T09:59')).toBe(true);
        expect(apply(q, '', 'less_than', '2026-01-01')).toBe(true);
    });

    test('radio compares option uuids, and checkbox arrays', () => {
        const options = { u1: 'One', u2: 'Two' };
        const radio = question('QuestionTypeRadio', { extra_data: { options } });
        expect(apply(radio, ['', 'u1'], 'equals', 'U1')).toBe(true);
        expect(apply(radio, ['', 'u1'], 'match_regex', '/^One$/')).toBe(true);
        expect(apply(radio, [''], 'empty')).toBe(true);

        const checkbox = question('QuestionTypeCheckbox', { extra_data: { options } });
        expect(apply(checkbox, ['', 'u1', 'u2'], 'contains', ['u2'])).toBe(true);
        expect(apply(checkbox, ['', 'u1'], 'equals', ['u1'])).toBe(true);
        expect(apply(checkbox, 'u1,u2', 'equals', ['u2', 'u1'])).toBe(true);
    });

    test('dropdown handlers depend on is_multiple_dropdown', () => {
        const single = question('QuestionTypeDropdown', { extra_data: { options: { a: 'A' } } });
        expect(apply(single, 'a', 'equals', 'a')).toBe(true);
        const multiple = question('QuestionTypeDropdown', { extra_data: { options: { a: 'A' }, is_multiple_dropdown: true } });
        expect(apply(multiple, ['a'], 'contains', ['a'])).toBe(true);
    });

    test('actors compare fkey-id arrays and use labels for regex', () => {
        const q = question('QuestionTypeRequester');
        expect(apply(q, ['users_id-5', 'groups_id-2'], 'contains', ['groups_id-2'])).toBe(true);
        expect(apply(q, ['users_id-5'], 'match_regex', '/^Label users_id-5$/')).toBe(true);
        expect(apply(q, [], 'empty')).toBe(true);
    });

    test('items compare itemtype and id, and support text search', () => {
        const q = question('QuestionTypeItemDropdown', { extra_data: { itemtype: 'Location' } });
        expect(apply(q, { itemtype: 'Location', items_id: '3' }, 'equals', { itemtype: 'Location', items_id: 3 })).toBe(true);
        expect(apply(q, { itemtype: 'Location', items_id: '3' }, 'not_equals', { itemtype: 'Location', items_id: 4 })).toBe(true);
        expect(apply(q, { itemtype: 'Location', items_id: '3' }, 'contains', 'label 3')).toBe(true);
        expect(apply(q, { itemtype: 'Location', items_id: '-1' }, 'empty')).toBe(true);

        const no_itemtype = question('QuestionTypeItem', { extra_data: {} });
        expect(getQuestionConditionHandlers(no_itemtype).map((h) => h.name)).toEqual(['visibility', 'regex', 'empty']);
    });

    test('user devices compare itemtypes', () => {
        const single = question('QuestionTypeUserDevice', { extra_data: { is_multiple_devices: false } });
        expect(apply(single, 'Computer_12', 'is_itemtype', 'Computer')).toBe(true);
        expect(apply(single, '', 'is_not_itemtype', 'Computer')).toBe(true);
        expect(apply(single, 'Computer_12', 'contains', 'computer_12')).toBe(true);

        const multiple = question('QuestionTypeUserDevice', { extra_data: { is_multiple_devices: true } });
        expect(apply(multiple, ['Computer_1', 'Monitor_2'], 'at_least_one_item_of_itemtype', ['Monitor'])).toBe(true);
        expect(apply(multiple, ['Computer_1', 'Monitor_2'], 'all_items_of_itemtype', ['Monitor'])).toBe(false);
        expect(apply(multiple, [], 'all_items_of_itemtype', ['Monitor'])).toBe(false);
    });

    test('urgency and request type', () => {
        const urgency = question('QuestionTypeUrgency');
        expect(apply(urgency, 4, 'greater_than_or_equals', '3')).toBe(true);
        expect(apply(urgency, 0, 'empty')).toBe(true);
        const request_type = question('QuestionTypeRequestType');
        expect(apply(request_type, '2', 'equals', 2)).toBe(true);
        expect(apply(request_type, 0, 'empty')).toBe(true);
    });
});

describe('Visibility', () => {
    test('AND has precedence over OR', () => {
        const a = question('QuestionTypeShortText');
        const b = question('QuestionTypeShortText');
        const c = question('QuestionTypeShortText');
        // a == x AND b == x OR c == x
        const target = question('QuestionTypeShortText', {
            visibility_strategy: 'visible_if',
            visibility_conditions: [
                condition(a.uuid, 'equals', 'x'),
                condition(b.uuid, 'equals', 'x', 'and'),
                condition(c.uuid, 'equals', 'x', 'or'),
            ],
        });
        const f = form([{ questions: [a, b, c, target] }]);
        const visible = (answers: Record<number, string>) => computeVisibility({ form: f, answers }).questions[target.id];
        expect(visible({ [a.id]: 'x', [b.id]: 'y', [c.id]: 'y' })).toBe(false);
        expect(visible({ [a.id]: 'x', [b.id]: 'x', [c.id]: 'y' })).toBe(true);
        expect(visible({ [a.id]: 'y', [b.id]: 'y', [c.id]: 'x' })).toBe(true);
    });

    test('hidden_if and conditions without valid items', () => {
        const a = question('QuestionTypeShortText');
        const hidden = question('QuestionTypeShortText', { visibility_strategy: 'hidden_if', visibility_conditions: [condition(a.uuid, 'not_empty')] });
        const no_conditions = question('QuestionTypeShortText', { visibility_strategy: 'visible_if', visibility_conditions: [condition('missing', 'equals', 'x')] });
        const f = form([{ questions: [a, hidden, no_conditions] }]);
        expect(computeVisibility({ form: f, answers: {} }).questions[hidden.id]).toBe(true);
        expect(computeVisibility({ form: f, answers: { [a.id]: 'x' } }).questions[hidden.id]).toBe(false);
        expect(computeVisibility({ form: f, answers: {} }).questions[no_conditions.id]).toBe(false);
    });

    test('hidden sources: empty is true, other operators false, chained visibility is resolved', () => {
        const a = question('QuestionTypeShortText');
        const b = question('QuestionTypeShortText', { visibility_strategy: 'visible_if', visibility_conditions: [condition(a.uuid, 'equals', 'show')] });
        const if_b_empty = question('QuestionTypeShortText', { visibility_strategy: 'visible_if', visibility_conditions: [condition(b.uuid, 'empty')] });
        const if_b_filled = question('QuestionTypeShortText', { visibility_strategy: 'visible_if', visibility_conditions: [condition(b.uuid, 'not_empty')] });
        const if_b_visible = question('QuestionTypeShortText', { visibility_strategy: 'visible_if', visibility_conditions: [condition(b.uuid, 'visible')] });
        const f = form([{ questions: [a, b, if_b_empty, if_b_filled, if_b_visible] }]);

        const hidden = computeVisibility({ form: f, answers: { [a.id]: 'nope', [b.id]: 'value' } }).questions;
        expect(hidden[b.id]).toBe(false);
        expect(hidden[if_b_empty.id]).toBe(true);
        expect(hidden[if_b_filled.id]).toBe(false);
        expect(hidden[if_b_visible.id]).toBe(false);

        const shown = computeVisibility({ form: f, answers: { [a.id]: 'show', [b.id]: 'value' } }).questions;
        expect(shown[b.id]).toBe(true);
        expect(shown[if_b_empty.id]).toBe(false);
        expect(shown[if_b_filled.id]).toBe(true);
        expect(shown[if_b_visible.id]).toBe(true);
    });

    test('sections: first always visible, hidden sections hide their questions, empty sections are hidden', () => {
        const a = question('QuestionTypeShortText');
        const in_s2 = question('QuestionTypeShortText');
        const in_s3 = question('QuestionTypeShortText', { visibility_strategy: 'visible_if', visibility_conditions: [condition(a.uuid, 'equals', 'never')] });
        const f = form([
            { questions: [a] },
            { questions: [in_s2], visibility_strategy: 'visible_if', conditions: [condition(a.uuid, 'equals', 'yes')] },
            { questions: [in_s3] },
        ]);
        const result = computeVisibility({ form: f, answers: { [a.id]: '' } });
        expect(result.sections[1]).toBe(true);
        expect(result.sections[2]).toBe(false);
        expect(result.questions[in_s2.id]).toBe(false);
        expect(result.sections[3]).toBe(false);

        expect(computeVisibility({ form: f, answers: { [a.id]: 'yes' } }).sections[2]).toBe(true);

        // The first section is always reported visible, even when its conditions say otherwise
        const b = question('QuestionTypeShortText');
        const f2 = form([{ questions: [b], visibility_strategy: 'visible_if', conditions: [condition('missing', 'visible', null, 'and', 'section')] }]);
        expect(computeVisibility({ form: f2, answers: {} }).sections[1]).toBe(true);
    });

    test('submit button visibility', () => {
        const a = question('QuestionTypeShortText');
        const f = form([{ questions: [a] }], {
            submit_button_visibility_strategy: 'visible_if',
            submit_button_conditions: [condition(a.uuid, 'not_empty')],
        });
        expect(computeVisibility({ form: f, answers: {} }).form).toBe(false);
        expect(computeVisibility({ form: f, answers: { [a.id]: 'x' } }).form).toBe(true);
    });

    test('actor questions are hidden for anonymous users', () => {
        const actor = question('QuestionTypeObserver');
        const f = form([{ questions: [actor] }]);
        expect(computeVisibility({ form: f, answers: {}, isAuthenticated: false }).questions[actor.id]).toBe(false);
        expect(computeVisibility({ form: f, answers: {} }).questions[actor.id]).toBe(true);
    });

    test('single choice ordering compares labels', () => {
        const radio = question('QuestionTypeRadio', { extra_data: { options: { u1: '10', u2: '9' } } });
        const target = question('QuestionTypeShortText', { visibility_strategy: 'visible_if', visibility_conditions: [condition(radio.uuid, 'greater_than', 'u2')] });
        const f = form([{ questions: [radio, target] }]);
        expect(computeVisibility({ form: f, answers: { [radio.id]: ['', 'u1'] } }).questions[target.id]).toBe(true);
    });
});

describe('Validation', () => {
    test('returns failing conditions', () => {
        const q = question('QuestionTypeNumber', {
            validation_strategy: 'valid_if',
            validation_conditions: [],
        });
        q.validation_conditions = [condition(q.uuid, 'greater_than', '5'), condition(q.uuid, 'less_than', '10')];
        const f = form([{ questions: [q] }]);
        const validate = (value: string) => new FormConditionEngine({ form: f, answers: { [q.id]: value } }).computeQuestionValidation(q);
        expect(validate('7')).toEqual([]);
        expect(validate('3').map((c) => c.value_operator)).toEqual(['greater_than']);

        const invalid_if = { ...q, validation_strategy: 'invalid_if' as const };
        const f2 = form([{ questions: [invalid_if] }]);
        expect(new FormConditionEngine({ form: f2, answers: { [q.id]: '7' } }).computeQuestionValidation(invalid_if).length).toBe(2);
    });
});
