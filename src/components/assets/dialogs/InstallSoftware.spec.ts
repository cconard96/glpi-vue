import InstallSoftware from "@/components/assets/dialogs/InstallSoftware.vue";
import { render } from "vitest-browser-vue";
import { defaultOptions } from "primevue/config";

vi.mock('@/composables/useApi', () => ({
    useApi: () => ({
        doGraphQLRequest: vi.fn().mockResolvedValue({
            data: {
                Software: [
                    {id: 1, name: 'Software A'},
                    {id: 2, name: 'Software B'},
                ],
            },
        }),
    }),
}));

test('Renders', () => {
    const { baseElement } = render(InstallSoftware, {
        global: {
            mocks: {
                $primevue: {
                    config: defaultOptions
                }
            }
        }
    });
    expect(baseElement).toBeDefined();
})

// test('Loads software list and displays it', async () => {
//     // data is fetched with ApolloClient, so we need to mock the response
//     const mockSoftwareList = [
//         {id: 1, name: 'Software A'},
//         {id: 2, name: 'Software B'},
//     ];
// });