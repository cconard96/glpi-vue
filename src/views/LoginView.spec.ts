import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './LoginView.vue';
import { render } from "@tests/utils.ts";


const router = createRouter({
    history: createWebHistory(),
    routes: [{ path: '/', component: { template: '<div>Home</div>' } }],
});

function renderLoginView() {
    return render(LoginView, {
        global: {
            mocks: {
                $route: {
                    query: {}
                },
            },
            plugins: [router],
        }
    });
}

test('LoginView renders correctly', async () => {
    const { getByRole } = await renderLoginView();
    expect(getByRole('button', { name: 'Login' })).toBeVisible();
});

afterEach(() => {
    localStorage.clear();
});