<script setup lang="ts">
    /**
     * Actor selection bound to a form field holding a list of GLPI actor keys (`users_id-5`, `groups_id-2`, `suppliers_id-3`),
     * like the official end-user renderer.
     */
    import Select from "@cjdevstudios/bumblevue/select";
    import MultiSelect from "@cjdevstudios/bumblevue/multiselect";
    import { computed, inject, watch } from "vue";
    import FormContextIsolation from "@/common/forms/FormContextIsolation";
    import { useDataHelper } from "@/common/useDataHelper";
    import { getActorKey, parseActorKey, useActorSearch, type ActorOption, type ActorRole, type ActorType } from "@/common/actor/useActorSearch";
    import { ACTOR_ITEMTYPE_FKEYS } from "@/modules/assistance/forms/viewer/useFormRenderer";
    import { useFormRendererContext } from "@/modules/assistance/forms/viewer/formRendererContext";

    const props = defineProps<{
        questionId: number;
        role: ActorRole;
        types: ActorType[];
        multiple: boolean;
    }>();

    const formField = inject('$pcFormField') as any;
    const context = useFormRendererContext();
    const { formatUsername } = useDataHelper();
    const { options, loading, search, loadKeys } = useActorSearch(props.role);

    const FKEY_TYPES = Object.fromEntries(Object.entries(ACTOR_ITEMTYPE_FKEYS).map(([type, fkey]) => [fkey, type])) as Record<string, ActorType>;

    /** Convert a GLPI answer key (`users_id-5`) to an actor option key (`User-5`) */
    function toOptionKey(answer_key: string): string | null {
        const match = answer_key.match(/^(users_id|groups_id|suppliers_id)-(\d+)$/);
        return match ? getActorKey(FKEY_TYPES[match[1]], match[2]) : null;
    }

    /** Convert an actor option key (`User-5`) to a GLPI answer key (`users_id-5`) */
    function toAnswerKey(option_key: string): string | null {
        const parsed = parseActorKey(option_key);
        return parsed ? `${ACTOR_ITEMTYPE_FKEYS[parsed.type]}-${parsed.id}` : null;
    }

    const selectedKeys = computed<string[]>(() => {
        const value = formField?.field.states.value;
        const keys = Array.isArray(value) ? value : (typeof value === 'string' && value !== '' ? [value] : []);
        return keys.map(toOptionKey).filter((key): key is string => key !== null);
    });

    function setSelectedKeys(keys: string[]) {
        formField.field.states.value = keys.map(toAnswerKey).filter((key): key is string => key !== null);
    }

    const multipleModel = computed({
        get: () => selectedKeys.value,
        set: (keys: string[] | null) => setSelectedKeys(keys ?? []),
    });
    const singleModel = computed({
        get: () => selectedKeys.value[0] ?? null,
        set: (key: string | null) => setSelectedKeys(key ? [key] : []),
    });

    const fieldProps = computed(() => {
        const { onChange, onInput, ...rest } = formField?.field.props ?? {};
        return rest;
    });

    const actorTypeIcons: Record<ActorType, string> = {
        User: 'ti ti-user',
        Group: 'ti ti-users',
        Supplier: 'ti ti-package',
    };

    function getLabel(option: ActorOption): string {
        return formatUsername(option.member);
    }

    function onFilter(event: { value: string }) {
        search(props.types, event.value ?? '', selectedKeys.value);
    }

    let loaded = false;
    function onShow() {
        if (!loaded) {
            loaded = true;
            search(props.types, '', selectedKeys.value);
        }
    }

    // Load the default actors so they are displayed with their names
    loadKeys(selectedKeys.value);

    // Register the actor names so conditions based on the actors names can be evaluated
    watch(options, (current) => {
        context?.registerLabels(props.questionId, current
            .map((option) => [toAnswerKey(option.key), getLabel(option)] as [string | null, string])
            .filter((entry): entry is [string, string] => entry[0] !== null));
    }, { immediate: true });
</script>

<template>
    <FormContextIsolation>
        <MultiSelect v-if="multiple" v-bind="fieldProps" v-model="multipleModel" :options="options" optionValue="key" :optionLabel="getLabel"
                     :invalid="formField?.field.states.invalid" :loading="loading" display="chip" removeTokenIcon="ti ti-circle-x"
                     :showToggleAll="false" filter autoFilterFocus resetFilterOnHide fluid @filter="onFilter" @show="onShow">
            <template #option="{ option }">
                <i :class="actorTypeIcons[option.type as ActorType]" class="me-2" aria-hidden="true"></i>{{ getLabel(option) }}
            </template>
        </MultiSelect>
        <Select v-else v-bind="fieldProps" v-model="singleModel" :options="options" optionValue="key" :optionLabel="getLabel"
                :invalid="formField?.field.states.invalid" :loading="loading" showClear filter autoFilterFocus resetFilterOnHide fluid
                @filter="onFilter" @show="onShow">
            <template #option="{ option }">
                <i :class="actorTypeIcons[option.type as ActorType]" class="me-2" aria-hidden="true"></i>{{ getLabel(option) }}
            </template>
        </Select>
    </FormContextIsolation>
</template>
