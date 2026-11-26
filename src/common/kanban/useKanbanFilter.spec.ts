import { describe, expect, test } from 'vitest';
import { cardMatchesFilter, InvalidFilterRegexError, serializeFilterTokens, tokenizeFilter } from './useKanbanFilter';
import type { KanbanCard, KanbanFilterTag, KanbanTeamMember } from './kanban';

const TAGS: Record<string, KanbanFilterTag> = {
    title: { description: '', supported_prefixes: ['!', '#'] },
    type: { description: '', supported_prefixes: ['!', '#'] },
    milestone: { description: '', supported_prefixes: ['!'] },
    deleted: { description: '', supported_prefixes: ['!'] },
    content: { description: '', supported_prefixes: ['!', '#'] },
    team: { description: '', supported_prefixes: ['!'] },
    user: { description: '', supported_prefixes: ['!'] },
    group: { description: '' },
};

function makeCard(overrides: Partial<KanbanCard> = {}): KanbanCard {
    return {
        key: 'Project-1',
        itemtype: 'Project',
        id: 1,
        column: 0,
        name: 'Website redesign',
        icon: '',
        content: 'Rebuild the marketing site',
        is_deleted: false,
        readonly: false,
        team: [],
        meta: {},
        ...overrides,
    };
}

const names: Record<string, string> = { 'User-1': 'Jane Doe', 'User-2': 'John Smith', 'Group-1': 'Web team' };
const getName = (m: KanbanTeamMember) => names[`${m.itemtype}-${m.items_id}`] ?? '';

describe('tokenizeFilter', () => {
    test('free text and tags', () => {
        const tokens = tokenizeFilter('foo title:bar', TAGS);
        expect(tokens).toMatchObject([
            { tag: null, term: 'foo', exclusion: false, prefix: null },
            { tag: 'title', term: 'bar', exclusion: false, prefix: null },
        ]);
    });

    test('quoted terms', () => {
        expect(tokenizeFilter('title:"big project"', TAGS)[0]).toMatchObject({ tag: 'title', term: 'big project' });
        expect(tokenizeFilter("title:'big project'", TAGS)[0]).toMatchObject({ tag: 'title', term: 'big project' });
    });

    test('exclusion and regex prefixes', () => {
        expect(tokenizeFilter('!type:ProjectTask', TAGS)[0]).toMatchObject({ tag: 'type', exclusion: true, prefix: null });
        expect(tokenizeFilter('#title:^Web', TAGS)[0]).toMatchObject({ tag: 'title', term: '^Web', exclusion: false, prefix: '#' });
    });

    test('prefixes are ignored when the tag does not support them', () => {
        // group doesn't support exclusion
        expect(tokenizeFilter('!group:web', TAGS)[0]).toMatchObject({ tag: 'group', exclusion: false });
        // milestone doesn't support regex, so the tag is unknown and becomes free text
        expect(tokenizeFilter('#milestone:true', TAGS)[0]).toMatchObject({ tag: null, term: '#milestone:true' });
    });

    test('unknown tags are treated as free text', () => {
        expect(tokenizeFilter('foo:bar', TAGS)[0]).toMatchObject({ tag: null, term: 'foo:bar' });
    });

    test('tag without term', () => {
        expect(tokenizeFilter('title:', TAGS)[0]).toMatchObject({ tag: 'title', term: '' });
    });

    test('serialize round trip', () => {
        const input = 'foo !type:ProjectTask #title:^Web team:"Jane Doe"';
        expect(serializeFilterTokens(tokenizeFilter(input, TAGS))).toBe(input);
    });
});

describe('cardMatchesFilter', () => {
    const match = (filter: string, card = makeCard()) => cardMatchesFilter(card, tokenizeFilter(filter, TAGS), getName);

    test('empty filter matches everything', () => {
        expect(match('')).toBe(true);
    });

    test('free text is a case insensitive regex on the title with a contains fallback', () => {
        expect(match('website')).toBe(true);
        expect(match('^web.*sign$')).toBe(true);
        expect(match('mobile')).toBe(false);
        // invalid regex falls back to contains
        expect(match('(redesign', makeCard({ name: 'A (redesign' }))).toBe(true);
    });

    test('title, content and type', () => {
        expect(match('title:redesign')).toBe(true);
        expect(match('!title:redesign')).toBe(false);
        expect(match('content:marketing')).toBe(true);
        expect(match('type:Project')).toBe(true);
        expect(match('type:Proj')).toBe(false);
        expect(match('!type:ProjectTask')).toBe(true);
    });

    test('regex tags', () => {
        expect(match('#title:^Web')).toBe(true);
        expect(match('#title:^web')).toBe(false);
        expect(() => match('#title:(')).toThrow(InvalidFilterRegexError);
    });

    test('boolean tags', () => {
        const milestone = makeCard({ meta: { is_milestone: true } });
        expect(match('milestone:true', milestone)).toBe(true);
        expect(match('milestone:false', milestone)).toBe(false);
        expect(match('milestone:no')).toBe(true);
        expect(match('deleted:true', makeCard({ is_deleted: true }))).toBe(true);
        expect(match('deleted:false', makeCard({ is_deleted: true }))).toBe(false);
    });

    test('team member tags', () => {
        const card = makeCard({ team: [{ itemtype: 'User', items_id: 1 }, { itemtype: 'Group', items_id: 1 }] });
        expect(match('team:jane', card)).toBe(true);
        expect(match('team:web', card)).toBe(true);
        expect(match('user:jane', card)).toBe(true);
        expect(match('user:web', card)).toBe(false);
        expect(match('group:web', card)).toBe(true);
        expect(match('team:john', card)).toBe(false);
        expect(match('!team:john', card)).toBe(true);
        expect(match('!team:jane', card)).toBe(false);
    });

    test('all tokens must match', () => {
        expect(match('title:website content:marketing')).toBe(true);
        expect(match('title:website content:mobile')).toBe(false);
    });

    test('tokens without a term are ignored', () => {
        expect(match('title:')).toBe(true);
    });
});
