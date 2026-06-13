import InstallSoftware from "./InstallSoftware.vue";
import { render } from "@tests/utils.ts";

vi.mock('@/common/useApi', () => ({
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

test('Renders', async () => {
    const { baseElement } = await render(InstallSoftware);
    expect(baseElement).toBeDefined();
})

// test('Loads software list and displays it', async () => {
//     // data is fetched with ApolloClient, so we need to mock the response
//     const mockSoftwareList = [
//         {id: 1, name: 'Software A'},
//         {id: 2, name: 'Software B'},
//     ];
// });