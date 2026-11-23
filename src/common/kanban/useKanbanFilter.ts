import type { KanbanCard, KanbanFilterTag, KanbanTeamMember } from "@/common/kanban/kanban";

export const EXCLUSION_PREFIX = '!';
export const REGEX_PREFIX = '#';

export interface KanbanFilterToken {
    /** Tag name or null for free text */
    tag: string | null;
    term: string;
    exclusion: boolean;
    /** Custom prefix (only `#` for regex currently) */
    prefix: string | null;
    /** The raw text of the token */
    raw: string;
}

const TOKEN_PATTERN = /([^\s"']?\w+:)?("[^"]*"|'[^']*'|[^\s]+)/g;
const CUSTOM_PREFIXES = [REGEX_PREFIX];

/**
 * Tokenize a filter string such as `title:"Big project" !type:ProjectTask #content:^foo some text`.
 * This follows the same rules as the GLPI Kanban SearchTokenizer:
 * - Tags not in the allowed tags list are treated as plain text.
 * - The exclusion prefix and custom prefixes are ignored if the tag doesn't support them.
 */
export function tokenizeFilter(input: string, allowed_tags: Record<string, KanbanFilterTag>): KanbanFilterToken[] {
    const tokens: KanbanFilterToken[] = [];
    input = (input || '').trim();
    for (const match of input.matchAll(TOKEN_PATTERN)) {
        let tag: string | null = match[1] ? match[1].slice(0, -1) : null;
        let term = match[2].trim();
        let exclusion = false;
        let prefix: string | null = null;

        if (tag === null && term.endsWith(':') && term.length > 1) {
            tag = term.slice(0, -1);
            term = '';
        }

        if (tag !== null && tag.length > 1) {
            const first_char = tag.charAt(0);
            if (first_char === EXCLUSION_PREFIX) {
                exclusion = true;
                tag = tag.slice(1);
            } else if (CUSTOM_PREFIXES.includes(first_char)) {
                const new_tag = tag.slice(1);
                if (allowed_tags[new_tag]?.supported_prefixes?.includes(first_char as '#')) {
                    prefix = first_char;
                    tag = new_tag;
                }
            }
        }

        if (tag !== null && !(allowed_tags[tag]?.supported_prefixes ?? []).includes(EXCLUSION_PREFIX)) {
            exclusion = false;
        }

        if (/^".+"$/.test(term) || /^'.+'$/.test(term)) {
            term = term.slice(1, -1).trim();
        }

        if (tag === null || tag in allowed_tags) {
            tokens.push({ tag, term, exclusion, prefix, raw: match[0] });
        } else {
            tokens.push({ tag: null, term: match[0], exclusion: false, prefix: null, raw: match[0] });
        }
    }
    return tokens;
}

/** Serialize tokens back into a filter string */
export function serializeFilterTokens(tokens: KanbanFilterToken[]): string {
    return tokens.map(t => {
        if (t.tag === null) {
            return t.term;
        }
        const term = /\s/.test(t.term) ? `"${t.term}"` : t.term;
        return `${t.exclusion ? EXCLUSION_PREFIX : ''}${t.prefix ?? ''}${t.tag}:${term}`;
    }).join(' ');
}

export class InvalidFilterRegexError extends Error {}

function matchRegex(token: KanbanFilterToken, target: string): boolean {
    let regex: RegExp;
    try {
        regex = new RegExp(token.term);
    } catch {
        throw new InvalidFilterRegexError(token.term);
    }
    return regex.test(target.trim()) !== token.exclusion;
}

function matchInclude(token: KanbanFilterToken, target: string): boolean {
    return target.toLowerCase().includes(token.term.toLowerCase()) !== token.exclusion;
}

function matchEqual(token: KanbanFilterToken, target: string): boolean {
    return (target === token.term) !== token.exclusion;
}

function matchText(token: KanbanFilterToken, target: string, mode: 'include' | 'equal' = 'include'): boolean {
    if (token.prefix === REGEX_PREFIX) {
        return matchRegex(token, target);
    }
    return mode === 'include' ? matchInclude(token, target) : matchEqual(token, target);
}

const NEGATIVE_VALUES = ['false', 'no', '0', '', 'undefined'];
function isNegative(value: unknown): boolean {
    return value === undefined || value === null || value === false || value === 0 || NEGATIVE_VALUES.includes(String(value).toLowerCase());
}

function matchBoolean(token: KanbanFilterToken, target: unknown): boolean {
    return (isNegative(target) === isNegative(token.term)) !== token.exclusion;
}

function matchTeamMember(token: KanbanFilterToken, team: KanbanTeamMember[], itemtype: string | null, getMemberName: (m: KanbanTeamMember) => string): boolean {
    const members = itemtype === null ? team : team.filter(m => m.itemtype === itemtype);
    const has_match = members.some(m => getMemberName(m).toLowerCase().includes(token.term.toLowerCase()));
    return has_match !== token.exclusion;
}

function matchFreeText(text: string, target: string): boolean {
    try {
        return new RegExp(text, 'i').test(target);
    } catch {
        return target.toLowerCase().includes(text.toLowerCase());
    }
}

export type KanbanCardMatcher = (token: KanbanFilterToken, card: KanbanCard, getMemberName: (m: KanbanTeamMember) => string) => boolean;

/** Default matchers for tags. Adapters can declare additional tags, but must provide matchers for them in `extra_matchers`. */
export const DEFAULT_MATCHERS: Record<string, KanbanCardMatcher> = {
    title: (token, card) => matchText(token, card.name),
    type: (token, card) => matchText(token, card.itemtype, 'equal'),
    milestone: (token, card) => matchBoolean(token, card.meta.is_milestone),
    deleted: (token, card) => matchBoolean(token, card.is_deleted),
    content: (token, card) => matchText(token, card.content ?? ''),
    team: (token, card, getName) => matchTeamMember(token, card.team, null, getName),
    user: (token, card, getName) => matchTeamMember(token, card.team, 'User', getName),
    group: (token, card, getName) => matchTeamMember(token, card.team, 'Group', getName),
    supplier: (token, card, getName) => matchTeamMember(token, card.team, 'Supplier', getName),
    contact: (token, card, getName) => matchTeamMember(token, card.team, 'Contact', getName),
};

/**
 * Check if a card matches all the filter tokens.
 * Free text tokens are joined together and matched against the card title (regex with a fallback to "contains").
 * Tokens with an empty term are ignored (the user is still typing).
 * @throws InvalidFilterRegexError if a regex token is invalid
 */
export function cardMatchesFilter(
    card: KanbanCard,
    tokens: KanbanFilterToken[],
    getMemberName: (m: KanbanTeamMember) => string,
    extra_matchers: Record<string, KanbanCardMatcher> = {},
): boolean {
    const free_text = tokens.filter(t => t.tag === null).map(t => t.term).join(' ').trim();
    if (free_text !== '' && !matchFreeText(free_text, card.name)) {
        return false;
    }
    for (const token of tokens) {
        if (token.tag === null || token.term === '') {
            continue;
        }
        const matcher = extra_matchers[token.tag] ?? DEFAULT_MATCHERS[token.tag];
        if (matcher && !matcher(token, card, getMemberName)) {
            return false;
        }
    }
    return true;
}
