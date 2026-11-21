import { defineComponent, provide } from 'vue';

/**
 * Hides the BumbleVue form context from its children.
 *
 * BumbleVue inputs bind themselves to the injected form field and read/write the raw form value directly.
 * Wrap inputs whose value format differs from the form field value (e.g. TreeSelect selection keys, DatePicker Date objects)
 * and bind them through a converting model instead.
 */
export default defineComponent({
    name: 'FormContextIsolation',
    setup(_, { slots }) {
        provide('$pcForm', undefined);
        provide('$pcFormField', undefined);
        return () => slots.default?.();
    },
});
