import { render } from 'vitest-browser-vue';
import { defineComponent } from "vue";

export function renderAsync(component, options = {}) {
    const wrapper = defineComponent({
        components: { AsyncComponent: component },
        template: '<div><Suspense><AsyncComponent v-bind="$attrs" /></Suspense></div>',
    });
    return render(wrapper, options);
}