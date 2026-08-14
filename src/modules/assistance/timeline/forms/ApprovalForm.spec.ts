import { expect, test } from 'vitest';
import ApprovalForm from './ApprovalForm.vue';
import { defaultOptions } from "@cjdevstudios/bumblevue/config";
import { ConfirmationService, ToastService } from "@cjdevstudios/bumblevue";
import { useAssistanceItem } from "@/modules/assistance/timeline/useAssistanceItem.ts";
import { login, renderAsync } from "@tests/utils.ts";
import { ref } from "vue";
import { startMockServer, stopMockServer } from '@tests/request-mocks.ts';

beforeEach(async () => {
    await startMockServer();
    await login('jdoe', 0, true, 4);
});

afterEach(async () => {
    stopMockServer();
});

test('Renders new approval form', async () => {
    const { getByRole, getByLabelText, locator } = await renderAsync(ApprovalForm, {
        global: {
            mocks: {
                $@cjdevstudios/bumblevue: {
                    config: defaultOptions
                },
            },
            plugins: [ToastService, ConfirmationService],
            provide: {
                assistanceItemInstance: useAssistanceItem('Ticket', ref({
                    id: 1
                })),
            }
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