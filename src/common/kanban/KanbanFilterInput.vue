<script setup lang="ts">
    import { computed, inject, ref, useId, useTemplateRef } from "vue";
    import { useI18n } from "vue-i18n";
    import InputText from "@cjdevstudios/bumblevue/inputtext";
    import IconField from "@cjdevstudios/bumblevue/iconfield";
    import InputIcon from "@cjdevstudios/bumblevue/inputicon";
    import Chip from "@cjdevstudios/bumblevue/chip";
    import Button from "@cjdevstudios/bumblevue/button";
    import Popover from "@cjdevstudios/bumblevue/popover";
    import { EXCLUSION_PREFIX, REGEX_PREFIX, serializeFilterTokens, type KanbanFilterToken } from "@/common/kanban/useKanbanFilter";
    import type { KanbanInstance } from "@/common/kanban/useKanban";

    interface Suggestion {
        key: string;
        label: string;
        description?: string;
        /** Text which replaces the current word */
        value: string;
    }

    const TEAM_TAGS: Record<string, string | null> = { team: null, user: 'User', group: 'Group', supplier: 'Supplier', contact: 'Contact' };
    const MAX_SUGGESTIONS = 10;

    const kanban = inject('kanban') as KanbanInstance;
    const { t: $t } = useI18n();
    const id = useId();
    const input_el = useTemplateRef<{ $el: HTMLInputElement }>('input');
    const help_el = useTemplateRef('help');
    const open = ref(false);
    const active_index = ref(0);

    const tags = computed(() => kanban.adapter.filterTags);
    const tag_tokens = computed(() => kanban.filterTokens.value.filter(t => t.tag !== null && t.term !== ''));

    /** The word currently being typed (the text after the last whitespace) */
    const current_word = computed(() => {
        const text = kanban.filterText.value;
        if (text === '' || /\s$/.test(text)) {
            return '';
        }
        return text.split(/\s+/).pop() ?? '';
    });

    function getTagValues(tag: string): string[] {
        if (tag in TEAM_TAGS) {
            const itemtype = TEAM_TAGS[tag];
            const names = new Set<string>();
            for (const card of kanban.cards.value) {
                for (const member of card.team) {
                    if (itemtype === null || member.itemtype === itemtype) {
                        const name = kanban.getMemberName(member);
                        if (name) {
                            names.add(name);
                        }
                    }
                }
            }
            return [...names].sort();
        }
        const values = tags.value[tag]?.autocomplete_values;
        return (typeof values === 'function' ? values() : values) ?? [];
    }

    const suggestions = computed<Suggestion[]>(() => {
        const word = current_word.value;
        const match = word.match(/^([!#]?)(\w*)(:?)(.*)$/);
        if (!match) {
            return [];
        }
        const [, prefix, tag, separator, partial] = match;
        if (separator === '') {
            // Suggest tags
            return Object.entries(tags.value)
                .filter(([name, def]) => name.startsWith(tag.toLowerCase()) && (prefix === '' || def.supported_prefixes?.includes(prefix as '!' | '#')))
                .map(([name, def]) => ({ key: `tag-${name}`, label: `${prefix}${name}:`, description: def.description, value: `${prefix}${name}:` }));
        }
        if (!(tag in tags.value)) {
            return [];
        }
        const term = partial.replace(/^["']/, '').toLowerCase();
        return getTagValues(tag)
            .filter(v => v.toLowerCase().includes(term) && v.toLowerCase() !== term)
            .slice(0, MAX_SUGGESTIONS)
            .map(v => {
                const quoted = /\s/.test(v) ? `"${v}"` : v;
                return { key: `value-${v}`, label: v, value: `${prefix}${tag}:${quoted} ` };
            });
    });
    const show_suggestions = computed(() => open.value && suggestions.value.length > 0);

    function applySuggestion(suggestion: Suggestion) {
        const text = kanban.filterText.value;
        const word = current_word.value;
        kanban.filterText.value = text.slice(0, text.length - word.length) + suggestion.value;
        active_index.value = 0;
        input_el.value?.$el.focus();
    }

    function onKeydown(e: KeyboardEvent) {
        if (!show_suggestions.value) {
            if (e.key === 'ArrowDown') {
                open.value = true;
                e.preventDefault();
            }
            return;
        }
        switch (e.key) {
            case 'ArrowDown':
                active_index.value = (active_index.value + 1) % suggestions.value.length;
                e.preventDefault();
                break;
            case 'ArrowUp':
                active_index.value = (active_index.value - 1 + suggestions.value.length) % suggestions.value.length;
                e.preventDefault();
                break;
            case 'Enter':
            case 'Tab':
                if (current_word.value !== '') {
                    applySuggestion(suggestions.value[Math.min(active_index.value, suggestions.value.length - 1)]);
                    e.preventDefault();
                }
                break;
            case 'Escape':
                open.value = false;
                e.preventDefault();
                break;
        }
    }

    function onInput() {
        open.value = true;
        active_index.value = 0;
    }

    function removeToken(token: KanbanFilterToken) {
        kanban.filterText.value = serializeFilterTokens(kanban.filterTokens.value.filter(t => t !== token));
    }

    function tokenLabel(token: KanbanFilterToken) {
        return `${token.tag}: ${token.term}`;
    }
</script>

<template>
    <div class="flex flex-col gap-1 relative">
        <div class="flex gap-2 items-center">
            <IconField class="grow">
                <InputIcon class="ti ti-filter" />
                <InputText ref="input" v-model="kanban.filterText.value" fluid :id="`${id}-input`"
                           role="combobox" autocomplete="off" aria-autocomplete="list"
                           :aria-expanded="show_suggestions" :aria-controls="`${id}-listbox`"
                           :aria-activedescendant="show_suggestions ? `${id}-option-${active_index}` : undefined"
                           :aria-label="$t('kanban.filter.label', 'Filter items')"
                           :placeholder="$t('kanban.filter.placeholder', 'Filter… (Ex: title:foo team:jane !type:ProjectTask)')"
                           :invalid="!!kanban.filterError.value"
                           @input="onInput" @focus="open = true" @blur="open = false" @keydown="onKeydown"></InputText>
            </IconField>
            <Button severity="secondary" variant="text" icon="ti ti-help" :aria-label="$t('kanban.filter.help', 'Filter help')"
                    @click="help_el?.toggle($event)"></Button>
        </div>
        <ul v-show="show_suggestions" :id="`${id}-listbox`" role="listbox"
            class="absolute top-full start-0 z-10 mt-1 w-full max-w-lg max-h-72 overflow-y-auto rounded border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900 shadow p-1">
            <li v-for="(suggestion, index) in suggestions" :key="suggestion.key" :id="`${id}-option-${index}`" role="option"
                :aria-selected="index === active_index"
                class="flex flex-col px-2 py-1 rounded cursor-pointer"
                :class="index === active_index ? 'bg-highlight' : 'hover:bg-emphasis'"
                @mousedown.prevent="applySuggestion(suggestion)">
                <span class="font-mono">{{ suggestion.label }}</span>
                <span v-if="suggestion.description" class="text-sm text-muted-color">{{ suggestion.description }}</span>
            </li>
        </ul>
        <div v-if="tag_tokens.length" class="flex flex-wrap gap-2">
            <Chip v-for="token in tag_tokens" :key="`${token.raw}-${token.tag}`" removable
                  :class="{ 'bg-red-100! dark:bg-red-900!': token.exclusion, 'bg-green-100! dark:bg-green-900!': token.prefix === REGEX_PREFIX }"
                  @remove="removeToken(token)">
                <span class="text-sm">
                    <i v-if="token.exclusion" class="ti ti-ban" :title="$t('kanban.filter.exclusion', 'Exclusion')"></i>
                    <i v-if="token.prefix === REGEX_PREFIX" class="ti ti-regex" :title="$t('kanban.filter.regex', 'Regular expression')"></i>
                    {{ tokenLabel(token) }}
                </span>
            </Chip>
        </div>
        <small v-if="kanban.filterError.value" class="text-red-600 dark:text-red-400" role="alert">{{ kanban.filterError.value }}</small>
        <Popover ref="help">
            <div class="flex flex-col gap-2 max-w-md">
                <p class="text-sm">{{ $t('kanban.filter.help_text', 'Type text to filter by title, or use the tags below. Values with spaces must be quoted.') }}</p>
                <dl class="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 text-sm">
                    <template v-for="(def, name) in tags" :key="name">
                        <dt class="font-mono">{{ name }}:</dt>
                        <dd>{{ def.description }}</dd>
                    </template>
                    <dt class="font-mono">{{ EXCLUSION_PREFIX }}tag:</dt>
                    <dd>{{ $t('kanban.filter.help_exclusion', 'Exclude items matching the filter') }}</dd>
                    <dt class="font-mono">{{ REGEX_PREFIX }}tag:</dt>
                    <dd>{{ $t('kanban.filter.help_regex', 'Match using a regular expression') }}</dd>
                </dl>
            </div>
        </Popover>
    </div>
</template>
