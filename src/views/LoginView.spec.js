import { mount } from '@vue/test-utils';
import { defaultOptions } from 'primevue/config';
import LoginView from './LoginView.vue';

test('LoginView renders correctly', async () => {
    const wrapper = await mount(LoginView, {
        global: {
            mocks: {
                $route: {
                    query: {}
                },
                $primevue: {
                    config: defaultOptions
                }
            }
        }
    });
    expect(wrapper.html()).toMatchSnapshot();
});