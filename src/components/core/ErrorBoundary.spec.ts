import { expect, test } from 'vitest';
import { render } from 'vitest-browser-vue';
import ErrorBoundary from "@/components/core/ErrorBoundary.vue";
import { RouterLinkStub } from "@vue/test-utils";

test('ErrorBoundary catches errors and displays fallback UI', async () => {
    const ErrorThrowingComponent = {
        template: `<div>{{ throwError() }}</div>`,
        methods: {
            throwError() {
                throw new Error('Test error');
            }
        }
    };

    const { getByText } = await render(ErrorBoundary, {
        slots: {
            default: ErrorThrowingComponent
        },
        global: {
            stubs: {
                RouterLink: RouterLinkStub,
            },
        }
    });

    expect(getByText('An unexpected error occurred. Please try again later.')).toBeTruthy();
    expect(getByText('Test error')).toBeTruthy();
});