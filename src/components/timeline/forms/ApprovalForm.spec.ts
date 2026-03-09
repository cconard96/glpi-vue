import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import ApprovalForm from './ApprovalForm.vue';
import { defaultOptions } from "primevue/config";
import { setActivePinia, createPinia } from "pinia";
import { useSessionStore } from "@/composables/useSessionStore.js";
import { ConfirmationService, ToastService } from "primevue";

beforeEach(() => {
    setActivePinia(createPinia());
    const { loadSession } = useSessionStore();
    loadSession({
        user_id: 383,
        friendly_name: 'John Doe',
        name: 'jdoe',
        first_name: 'John',
        real_name: 'Doe',
    });
});

test('Renders new approval form', async () => {
    const { getByRole, getByLabelText, locator } = render(ApprovalForm, {
        global: {
            mocks: {
                $primevue: {
                    config: defaultOptions
                }
            },
            plugins: [ToastService, ConfirmationService]
        },
        props: {
            mode: 'new',
        }
    });

    await expect.element(getByLabelText('Template')).toHaveTextContent('');
    await expect.element(getByLabelText('Approval step')).toHaveTextContent('');
    //await expect.element(getByLabelText('Approver')).toHaveTextContent('');
    await expect.element(getByLabelText('Requester')).toHaveTextContent('John Doe');
    await expect.element(locator.element().querySelector('.p-fileupload') as HTMLElement).toBeDefined();
    await expect.element(getByRole('button', { name: 'Add' })).toBeDefined();
});