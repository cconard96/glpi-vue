import { ComponentRenderOptions, render as renderVitest } from 'vitest-browser-vue';
import { defineComponent } from "vue";
import Tooltip from "@cjdevstudios/bumblevue/tooltip";
import { useAuth } from "@/common/api/useAuth.ts";
import { i18n } from "@/common/util/i18n.ts";
import { defaultOptions } from "@cjdevstudios/bumblevue/config";
import FocusTrap from "@cjdevstudios/bumblevue/focustrap";

function getOptionsWithDefaults(options: ComponentRenderOptions<unknown, unknown> = {}): ComponentRenderOptions<unknown, unknown> {
    const mocks = options.global?.mocks || {};
    const directives = options.global?.directives || {};
    const plugins = options.global?.plugins || [];

    return {
        ...options,
        global: {
            ...options.global,
            mocks: {
                $bumblevue: {
                    config: defaultOptions
                },
                ...mocks,
            },
            directives: {
                tooltip: Tooltip,
                focustrap: FocusTrap,
                ...directives,
            },
            plugins: [
                i18n,
                ...plugins,
            ],
        },
    };
}

export async function renderAsync(component, options: ComponentRenderOptions<unknown, unknown> = {}) {
    const wrapper = defineComponent({
        components: { AsyncComponent: component },
        template: '<div><Suspense><AsyncComponent v-bind="$attrs" /></Suspense></div>',
    });
    return renderVitest(wrapper, getOptionsWithDefaults(options));
}

export async function render(component, options: ComponentRenderOptions<unknown, unknown> = {}) {
    return renderVitest(component, getOptionsWithDefaults(options));
}

export function login(username: string, entity?: number, entityRecursive?: boolean, profile?: number) {
    sessionStorage.setItem('test_user', JSON.stringify({
        username,
        entity,
        entityRecursive,
        profile,
    }));
    const { handleAuthCallback } = useAuth();
    return handleAuthCallback('');
}

export function logout() {
    sessionStorage.removeItem('test_user');
}