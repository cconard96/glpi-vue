import { afterEach, beforeEach, describe, expect, test } from 'vitest';
import { page } from 'vitest/browser';
import { http, HttpResponse } from 'msw';
import ToastService from '@cjdevstudios/bumblevue/toastservice';
import VueDOMPurifyHTML from 'vue-dompurify-html';
import FormViewer from './FormViewer.vue';
import { buildAnswersPayload, getInitialValue, getAnswersFromValues, getInitialValues, toRenderedForm } from './useFormRenderer';
import { validateAnswers } from './formValidation';
import { computeVisibility } from '../conditions/engine';
import { renderAsync } from '@tests/utils.ts';
import { mswServer, startMockServer, stopMockServer } from '@tests/request-mocks.ts';

const NS = 'Glpi\\Form\\QuestionType\\';

function apiQuestion(id: number, type: string, name: string, overrides: Record<string, unknown> = {}) {
    return {
        id,
        uuid: `q${id}`,
        name,
        type: `${NS}${type}`,
        is_mandatory: false,
        vertical_rank: id,
        horizontal_rank: null,
        description: null,
        default_value: null,
        extra_data: null,
        visibility_strategy: 'always_visible',
        visibility_conditions: '[]',
        validation_strategy: 'no_validation',
        validation_conditions: '[]',
        ...overrides,
    };
}

const apiForm = {
    id: 1,
    name: 'Request a laptop',
    form_description: '<p>Fill this form</p>',
    render_layout: 'step_by_step',
    submit_button_visibility_strategy: 'always_visible',
    submit_button_conditions: '[]',
    sections: [
        {
            id: 10,
            uuid: 's1',
            name: 'First step',
            description: null,
            rank: 0,
            visibility_strategy: 'always_visible',
            conditions: '[]',
            questions: [
                apiQuestion(1, 'QuestionTypeShortText', 'Your name', { is_mandatory: true }),
                apiQuestion(2, 'QuestionTypeRadio', 'Need accessories', {
                    extra_data: JSON.stringify({ options: { a: 'Yes', b: 'No' } }),
                    default_value: 'b',
                }),
                apiQuestion(3, 'QuestionTypeNumber', 'How many', {
                    visibility_strategy: 'visible_if',
                    visibility_conditions: JSON.stringify([{ item: 'question-q2', value_operator: 'equals', value: 'a', logic_operator: 'and' }]),
                    validation_strategy: 'valid_if',
                    validation_conditions: JSON.stringify([{ item: 'question-q3', value_operator: 'less_than', value: '5' }]),
                }),
            ],
        },
        {
            id: 20,
            uuid: 's2',
            name: 'Second step',
            description: null,
            rank: 1,
            visibility_strategy: 'always_visible',
            conditions: '[]',
            questions: [
                apiQuestion(4, 'QuestionTypeEmail', 'Contact email'),
            ],
        },
    ],
};

describe('Form renderer helpers', () => {
    const form = toRenderedForm(apiForm);

    test('initial values use the GLPI default value formats', () => {
        const values = getInitialValues(form);
        expect(values).toEqual({ answers_1: '', answers_2: 'b', answers_3: null, answers_4: '' });

        const checkbox = toRenderedForm({ ...apiForm, sections: [{ ...apiForm.sections[0], questions: [
            apiQuestion(5, 'QuestionTypeCheckbox', 'Checkbox', { extra_data: JSON.stringify({ options: { a: 'A', b: 'B' } }), default_value: 'a,b,missing' }),
            apiQuestion(6, 'QuestionTypeRequester', 'Requester', {
                extra_data: JSON.stringify({ is_multiple_actors: true, enabled_types: ['User', 'Group'] }),
                default_value: JSON.stringify({ users_ids: [3], groups_ids: [7] }),
            }),
            apiQuestion(7, 'QuestionTypeObserver', 'Observer', { default_value: JSON.stringify({ users_ids: [], groups_ids: [7, 8] }) }),
            apiQuestion(8, 'QuestionTypeItemDropdown', 'Location', { extra_data: JSON.stringify({ itemtype: 'Location' }), default_value: JSON.stringify({ items_id: -1 }) }),
            apiQuestion(9, 'QuestionTypeDateTime', 'Date', { extra_data: JSON.stringify({ is_default_value_current_time: 1, is_date_enabled: 1, is_time_enabled: 0 }) }),
            apiQuestion(10, 'QuestionTypeUrgency', 'Urgency', { default_value: '0' }),
        ] }] }).sections[0].questions;
        expect(getInitialValue(checkbox[0])).toEqual(['a', 'b']);
        expect(getInitialValue(checkbox[1])).toEqual(['users_id-3', 'groups_id-7']);
        expect(getInitialValue(checkbox[2])).toEqual(['groups_id-7']);
        expect(getInitialValue(checkbox[3])).toBeNull();
        expect(getInitialValue(checkbox[4])).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(getInitialValue(checkbox[5])).toBeNull();
    });

    test('validation reports mandatory and validation condition errors for visible questions only', () => {
        const $t = (_key: string, named: any, fallback?: string) => (fallback ?? named).replace('{value}', named?.value ?? '');
        const answers = (values: Record<string, unknown>) => getAnswersFromValues(form, { ...getInitialValues(form), ...values });

        expect(validateAnswers(form, answers({}), $t)).toEqual({ answers_1: [{ message: 'This field is mandatory' }] });
        // Hidden question: validation is skipped
        expect(validateAnswers(form, answers({ answers_1: 'John', answers_3: 10 }), $t)).toEqual({});
        expect(validateAnswers(form, answers({ answers_1: 'John', answers_2: 'a', answers_3: 10 }), $t))
            .toEqual({ answers_3: [{ message: 'The value must be less than 5' }] });
        expect(validateAnswers(form, answers({ answers_1: 'John', answers_4: 'not an email' }), $t))
            .toEqual({ answers_4: [{ message: 'Please enter a valid email' }] });
    });

    test('hidden questions are excluded from the payload', () => {
        const answers = getAnswersFromValues(form, { ...getInitialValues(form), answers_1: 'John', answers_3: 3 });
        const visibility = computeVisibility({ form, answers });
        expect(buildAnswersPayload(form, answers, visibility.questions)).toEqual({
            forms_id: 1,
            answers: { 1: 'John', 2: 'b', 4: '' },
        });
    });
});

describe('FormViewer', () => {
    beforeEach(async () => {
        await startMockServer();
        mswServer.use(http.post(`${import.meta.env.VITE_GLPI_URL}/api.php/GraphQL`, () => HttpResponse.json({ data: { Form: [apiForm] } })));
        // Valid token so API requests do not trigger a refresh/login
        localStorage.setItem('jwt', JSON.stringify({ access_token: 'TEST_ACCESS_TOKEN', refresh_token: 'TEST_REFRESH_TOKEN', expiration: Date.now() + 3600 * 1000 }));
    });

    afterEach(() => {
        localStorage.removeItem('jwt');
        stopMockServer();
    });

    async function renderViewer() {
        return renderAsync(FormViewer, {
            props: { form_id: 1 },
            global: { plugins: [ToastService, VueDOMPurifyHTML] },
        });
    }

    test('applies visibility conditions', async () => {
        await renderViewer();
        await expect.element(page.getByRole('heading', { name: 'Request a laptop' })).toBeVisible();
        await expect.element(page.getByRole('radio', { name: 'No' })).toBeChecked();
        await expect.element(page.getByText('How many')).not.toBeVisible();

        await page.getByRole('radio', { name: 'Yes' }).click();
        await expect.element(page.getByText('How many')).toBeVisible();
    });

    test('step by step navigation validates the current section', async () => {
        await renderViewer();
        await expect.element(page.getByText('Step 1 of 2')).toBeVisible();
        await expect.element(page.getByRole('button', { name: 'Submit' })).not.toBeInTheDocument();

        await page.getByRole('button', { name: 'Continue' }).click();
        await expect.element(page.getByText('This field is mandatory')).toBeVisible();
        await expect.element(page.getByText('Step 1 of 2')).toBeVisible();

        await page.getByLabelText('Your name').fill('John');
        await page.getByRole('button', { name: 'Continue' }).click();
        await expect.element(page.getByText('Step 2 of 2')).toBeVisible();
        await expect.element(page.getByText('Contact email')).toBeVisible();
        await expect.element(page.getByText('Your name')).not.toBeVisible();
        await expect.element(page.getByRole('button', { name: 'Submit' })).toBeVisible();

        await page.getByRole('button', { name: 'Back' }).click();
        await expect.element(page.getByText('Step 1 of 2')).toBeVisible();
        await expect.element(page.getByLabelText('Your name')).toHaveValue('John');
    });
});
