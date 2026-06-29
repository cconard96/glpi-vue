<script setup lang="ts">
    import type { SelectProps, InputTextProps, ListboxProps } from "primevue";
    import { Select, InputText, Listbox, Chip, Button } from "primevue";
    import { components } from "../../../data/hlapiv2_schema";
    import { inject, type Ref, ref, toRaw, watch } from "vue";
    import { useDebounceFn } from "@vueuse/core";
    import { useApi } from "@/common/api/useApi.ts";
    import type { DynamicDialogInstance } from "primevue/dynamicdialogoptions";

    const emit = defineEmits<{
        (e: 'save', addedItems: Record<keyof components['schemas'], { id: string; name: string }[]>, removedItems: Record<keyof components['schemas'], { id: string; name: string }[]>): void;
    }>();

    const { doGraphQLRequest } = useApi();
    const { allowedItemtypes, selectedItems, itemtypeSelectProps, searchInputProps, resultsListboxProps, searchResultLimit = 100 } = inject<Ref<DynamicDialogInstance>>('dialogRef').value.data as {
        allowedItemtypes: Array<keyof components['schemas']>,
        selectedItems: Record<keyof components['schemas'], { id: string; name: string }[]>,
        itemtypeSelectProps?: SelectProps,
        searchInputProps?: InputTextProps,
        resultsListboxProps?: ListboxProps,
        searchResultLimit?: number,
    };
    const originalSelectedItems = JSON.parse(JSON.stringify(toRaw(selectedItems))) as Record<keyof components['schemas'], { id: string; name: string }[]>;
    const selectedItemtype = ref(null);
    const searchTerm = ref('');
    const results = ref([]);
    const allowedItemtypeOptions = allowedItemtypes.map(it => ({ label: it, value: it }));

    const loadResults = useDebounceFn(() => {
        if (!selectedItemtype.value) {
            results.value = [];
            return;
        }
        const usedIDs = (selectedItems[selectedItemtype.value] || []).map(r => r.id);
        const notUsedFilter = usedIDs.length > 0 ? `;id=out=(${usedIDs.join(',')})` : '';
        const filter = (searchTerm.value ? `;name=ilike='*${searchTerm.value}*'` : '') + notUsedFilter;

        doGraphQLRequest<{
            [key: string]: { id: string, name: string, is_deleted: boolean }[]
        }>(`
            query { ${selectedItemtype.value}(filter: "${filter}", limit: ${searchResultLimit}, sort: "name") { id name } }
        `, {} , searchTerm.value ? 'network-only' : 'cache-first').then(res => {
            results.value = res.data[selectedItemtype.value];
        });
    }, 200, { maxWait: 1000 });

    watch(selectedItemtype, () => {
        searchTerm.value = '';
        loadResults();
    });

    function selectResult(id) {
        const item = results.value.find(r => r.id === id);
        if (item && !selectedItems[selectedItemtype.value].some(i => i.id === id)) {
            selectedItems[selectedItemtype.value].push(item);
        }
    }

    function save() {
        const addedItems: Record<string, { id: string; name: string }[]> = {};
        const removedItems: Record<string, { id: string; name: string }[]> = {};

        for (const itemtype of allowedItemtypes) {
            const original = originalSelectedItems[itemtype] || [];
            const current = selectedItems[itemtype] || [];

            addedItems[itemtype] = current.filter(i => !original.some(o => o.id === i.id));
            removedItems[itemtype] = original.filter(o => !current.some(i => i.id === o.id));
        }

        emit('save', addedItems, removedItems);
    }
</script>

<template>
    <div class="grid grid-rows-[1fr_auto] gap-3 h-full">
        <div>
            <Select v-model="selectedItemtype" :options="allowedItemtypeOptions" optionLabel="label" optionValue="value" v-bind="itemtypeSelectProps" fluid></Select>
            <InputText v-if="selectedItemtype" v-model="searchTerm" :placeholder="$t('search.placeholder')" class="mb-3" v-bind="searchInputProps" fluid @input="loadResults"></InputText>
            <Listbox v-if="selectedItemtype" :options="results" optionLabel="name" optionValue="id" v-bind="resultsListboxProps" fluid @valueChange="selectResult"></Listbox>
        </div>
        <div class="flex flex-wrap gap-2">
            <template v-for="(items, itemtype) in selectedItems" :key="itemtype">
                <Chip v-for="item in items" :key="item.id" :label="`${allowedItemtypeOptions.find(t => t.value === itemtype).label} - ${item.name}`"
                      removable @remove="selectedItems[itemtype] = selectedItems[itemtype].filter(r => r.id !== item.id)"
                      removeIcon="ti ti-circle-x">
                </Chip>
            </template>
        </div>
        <div class="flex justify-end">
            <Button :label="$t('button.save', 'Save')" class="mt-2" @click="save"></Button>
        </div>
    </div>
</template>

<style scoped>

</style>