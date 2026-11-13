import { expect, test, vi } from 'vitest';
import { page } from 'vitest/browser';
import { defineComponent, h } from 'vue';
import { Form, FormField } from '@cjdevstudios/bumblevue-forms';
import Fluid from '@cjdevstudios/bumblevue/fluid';
import FieldSelect from './FieldSelect.vue';
import { render } from '@tests/utils.ts';

const flatOptions = [
    { id: 1, name: 'Option A' },
    { id: 2, name: 'Option B' },
    { id: 3, name: 'Option C' },
];

const treeOptions = [
    {
        id: 1,
        name: 'Hardware',
        children: [
            { id: 2, name: 'Laptop' },
            {
                id: 3,
                name: 'Printer',
                children: [{ id: 4, name: 'Toner' }],
            },
        ],
    },
    { id: 5, name: 'Software' },
];

/**
 * Render a FieldSelect inside a Form/FormField (required for the injected form field state).
 * The current form value is rendered as JSON in the "form-value" test element.
 * When `fluid` is set, the form is wrapped in a Fluid component like in the assistance FieldsPanel.
 */
function renderFieldSelect(fieldProps: Record<string, any>, initialValue: any = null, fluid = false) {
    const onChange = vi.fn<(event: { originalEvent: Event | null, value: any }) => void>();
    const wrapper = defineComponent({
        setup() {
            const form = () => h(Form, { initialValues: { field: initialValue } }, {
                default: ($form: any) => [
                    h(FormField, { name: 'field' }, {
                        default: () => h(FieldSelect, { label: 'My field', ...fieldProps, onChange }),
                    }),
                    h('pre', { 'data-testid': 'form-value' }, JSON.stringify($form.field?.value ?? null)),
                ],
            });
            return () => fluid ? h(Fluid, null, { default: form }) : form();
        },
    });
    return { ...render(wrapper), onChange };
}

function formValue() {
    return page.getByTestId('form-value');
}

/**
 * Get the visible root of the rendered select.
 * The accessible combobox is not always the visible element (TreeSelect uses a visually hidden input).
 */
async function field() {
    await expect.element(page.getByRole('combobox', { name: 'My field' })).toBeInTheDocument();
    return page.elementLocator(document.querySelector('.p-select, .p-multiselect, .p-treeselect')!);
}

test('Renders a flat list of options and selects a value', async () => {
    const { onChange } = renderFieldSelect({ options: flatOptions }, 1);

    const combobox = await field();
    await expect.element(combobox).toHaveTextContent('Option A');

    await combobox.click();
    await expect.element(page.getByRole('option', { name: 'Option B' })).toBeVisible();
    await expect.element(page.getByRole('option', { name: 'Option C' })).toBeVisible();
    await page.getByRole('option', { name: 'Option C' }).click();

    await expect.element(combobox).toHaveTextContent('Option C');
    await expect.element(formValue()).toHaveTextContent('3');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall![0].value).toBe(3);
    // flat options should never render a tree
    expect(document.querySelector('.p-treeselect')).toBeNull();
});

test('Shows the label of an initial object value not in the options', async () => {
    renderFieldSelect({ options: [] }, { id: 42, name: 'Not loaded yet' });
    await expect.element(await field()).toHaveTextContent('Not loaded yet');
});

test('Renders a tree of options and selects a nested value', async () => {
    const { onChange } = renderFieldSelect({ options: treeOptions }, null);

    const combobox = await field();
    expect(document.querySelector('.p-treeselect')).not.toBeNull();

    await combobox.click();
    const hardware = page.getByRole('treeitem', { name: 'Hardware' });
    await expect.element(hardware).toBeVisible();
    await expect.element(page.getByRole('treeitem', { name: 'Software' })).toBeVisible();
    // children are collapsed until the parent is expanded
    await expect.element(page.getByRole('treeitem', { name: 'Printer' })).not.toBeInTheDocument();

    await hardware.element().querySelector<HTMLButtonElement>('.p-tree-node-toggle-button')!.click();
    const printer = page.getByRole('treeitem', { name: 'Printer' });
    await expect.element(printer).toBeVisible();
    await printer.element().querySelector<HTMLButtonElement>('.p-tree-node-toggle-button')!.click();

    await page.getByRole('treeitem', { name: 'Toner' }).element().querySelector<HTMLElement>('.p-tree-node-content')!.click();

    // value is the original (numeric) option value, not the string tree key
    await expect.element(formValue()).toHaveTextContent('4');
    await expect.element(combobox).toHaveTextContent('Toner');
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.lastCall![0].value).toBe(4);
});

test('Shows the label of an initial nested tree value', async () => {
    renderFieldSelect({ options: treeOptions }, 4);
    await expect.element(await field()).toHaveTextContent('Toner');
});

test('Uses a tree when treeMode is set even with flat options', async () => {
    renderFieldSelect({ options: flatOptions, treeMode: true }, 2);
    await expect.element(await field()).toHaveTextContent('Option B');
    expect(document.querySelector('.p-treeselect')).not.toBeNull();
});

test('Supports custom option value and label fields in a tree', async () => {
    const options = [
        { key: 'a', label: 'Parent', children: [{ key: 'b', label: 'Child' }] },
    ];
    renderFieldSelect({ options, optionValue: 'key', optionLabel: 'label' }, 'b');
    await expect.element(await field()).toHaveTextContent('Child');
});

test('Selects multiple values from a tree', async () => {
    renderFieldSelect({ options: treeOptions, multiple: true }, [5]);

    const combobox = await field();
    await expect.element(combobox).toHaveTextContent('Software');

    await combobox.click();
    const hardware = page.getByRole('treeitem', { name: 'Hardware' });
    await hardware.element().querySelector<HTMLButtonElement>('.p-tree-node-toggle-button')!.click();
    await page.getByRole('treeitem', { name: 'Laptop' }).element().querySelector<HTMLElement>('.p-tree-node-content')!.click();

    await expect.element(formValue()).toHaveTextContent('[5,2]');
    await expect.element(combobox).toHaveTextContent('Software');
    await expect.element(combobox).toHaveTextContent('Laptop');
});

test.each([
    ['list', flatOptions, false],
    ['multiple list', flatOptions, true],
    ['tree', treeOptions, false],
    ['multiple tree', treeOptions, true],
])('Fills the available width inside Fluid (%s)', async (_, options, multiple) => {
    renderFieldSelect({ options, multiple, label_type: 'on' }, null, true);
    const input = (await field()).element() as HTMLElement;
    const container = input.parentElement!;
    // the input should take all the space in its container not used by the label
    const labelWidth = container.querySelector('label')?.getBoundingClientRect().width ?? 0;
    expect(input.getBoundingClientRect().width).toBeCloseTo(container.getBoundingClientRect().width - labelWidth, 0);
});
