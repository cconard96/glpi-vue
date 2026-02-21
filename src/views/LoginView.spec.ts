import { defaultOptions } from 'primevue/config';
import { createRouter, createWebHistory } from 'vue-router';
import LoginView from './LoginView.vue';
import FocusTrap from "primevue/focustrap";
import { render } from "vitest-browser-vue";
import { nextTick } from 'vue';

vi.mock('@/composables/useAuth.ts', () => ({
    useAuth: () => ({
        login: vi.fn().mockImplementation((username, password) => {
            if (username === 'testuser' && password === 'password') {
                localStorage.setItem('jwt', JSON.stringify({
                    access_token: 'fake_access_token',
                    refresh_token: 'fake_refresh_token',
                    expires_in: 3600,
                    expiration: Date.now() + 3600 * 1000,
                }));
                return Promise.resolve();
            } else if (username === 'networkerror') {
                return Promise.reject(new Error('Network error'));
            } else {
                return Promise.resolve();
            }
        }),
        isAuthenticated: () => !!localStorage.getItem('jwt'),
    }),
}));

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
                $primevue: {
                    config: defaultOptions
                }
            },
            plugins: [router],
            directives: {
                focustrap: FocusTrap
            }
        }
    });
}

test('LoginView renders correctly', async () => {
    const { baseElement } = renderLoginView();
    expect(baseElement.getHTML()).toMatchSnapshot();
});

test('Login failure shows error message', async () => {
    // mock alert function to ensure it is called with the error message
    const alert_mock = vi.spyOn(window, 'alert').mockImplementation(() => {});
    const router_push_mock = vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve());

    const { getByRole } = renderLoginView();

    await getByRole('button', { name: 'Login' }).click();
    await nextTick();
    expect(alert_mock).toHaveBeenCalledWith('Login failed. Please check your credentials and try again.');

    // test wrong credentials
    await getByRole('textbox', { name: 'Username' }).fill('wronguser');
    await getByRole('textbox', { name: 'Password' }).fill('wrongpassword');
    await getByRole('button', { name: 'Login' }).click();
    await nextTick();
    expect(alert_mock).toHaveBeenCalledWith('Login failed. Please check your credentials and try again.');

    // test network error
    await getByRole('textbox', { name: 'Username' }).fill('networkerror');
    await getByRole('textbox', { name: 'Password' }).fill('password');
    await getByRole('button', { name: 'Login' }).click();
    await nextTick();
    expect(alert_mock).toHaveBeenCalledWith('Login failed. Please check your credentials and try again.');

    // no route changes should have been made
    expect(router_push_mock).not.toHaveBeenCalled();
});

test('Successful login redirects to home', async () => {
    const { getByRole } = renderLoginView();
    const router_push_mock = vi.spyOn(router, 'push').mockImplementation(() => Promise.resolve());

    await getByRole('textbox', { name: 'Username' }).fill('testuser');
    await getByRole('textbox', { name: 'Password' }).fill('password');
    await getByRole('button', { name: 'Login' }).click();
    await nextTick();

    expect(router_push_mock).toHaveBeenCalledWith('/');
});

afterEach(() => {
    localStorage.clear();
});