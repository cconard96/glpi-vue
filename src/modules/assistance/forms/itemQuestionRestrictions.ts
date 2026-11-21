/**
 * Port of `QuestionTypeItem::getDropdownRestrictionParams` and `QuestionTypeItemDropdown::getDropdownRestrictionParams`
 * as RSQL conditions for the HL API.
 */
import { useApi } from '@/common/api/useApi';
import type { RenderedQuestion } from './types';

export interface ItemQuestionDropdownConfig {
    /** HL API schema name of the question itemtype, or null if the itemtype is not available in the API */
    schema_name: string | null;
    /** RSQL condition restricting the selectable items */
    condition: string;
    /** Whether the itemtype is a tree dropdown */
    is_tree: boolean;
}

const CATEGORY_FILTER_FIELDS: Record<string, string> = {
    request: 'is_request_visible',
    incident: 'is_incident_visible',
    problem: 'is_problem_visible',
    change: 'is_change_visible',
};

/**
 * Build the RSQL restrictions of an item question.
 * The result is escaped to be embedded in a GraphQL string argument.
 * @param question The question
 * @param properties The properties of the itemtype schema
 * @param root The tree root item if `root_items_id` is set
 * @param is_helpdesk Whether the user is using the simplified (helpdesk) interface
 */
export function buildItemQuestionCondition(
    question: RenderedQuestion,
    properties: string[],
    root: { id: number, completename: string, level: number } | null,
    is_helpdesk: boolean,
): string {
    const extra = question.extra_data;
    const conditions: string[] = [];
    const has = (property: string) => properties.includes(property);
    const { rsqlEscape, graphQLStringEscape } = useApi();

    if (has('is_active')) {
        conditions.push('is_active==1');
    }
    if (has('is_deleted')) {
        conditions.push('is_deleted==0');
    }
    if (has('is_template')) {
        conditions.push('is_template==0');
    }

    const is_tree = has('completename') && has('level') && has('parent');
    if (is_tree) {
        if (root) {
            // Descendants of the root (equivalent to getSonsOf), optionally including the root itself
            const descendants = `completename=like=${rsqlEscape(`${root.completename} > `)}*`;
            conditions.push(extra.selectable_tree_root ? `(${descendants},id==${root.id})` : descendants);
        }
        const subtree_depth = Number(extra.subtree_depth ?? 0);
        if (subtree_depth > 0) {
            conditions.push(`level=le=${subtree_depth + (root?.level ?? 0)}`);
        }
    }

    if (question.type_name === 'QuestionTypeItemDropdown' && question.extra_data.itemtype === 'ITILCategory') {
        if (is_helpdesk) {
            conditions.push('is_helpdesk_visible==1');
        }
        const filters: string[] = Array.isArray(extra.categories_filter) ? extra.categories_filter : [];
        const fields = filters.map((filter: string) => CATEGORY_FILTER_FIELDS[filter]).filter(Boolean);
        if (fields.length) {
            conditions.push(`(${fields.map((field: string) => `${field}==1`).join(',')})`);
        }
    }

    return graphQLStringEscape(conditions.join(';'));
}

/**
 * Get the dropdown configuration (schema name and restrictions) of an item question
 */
export async function getItemQuestionDropdownConfig(question: RenderedQuestion, is_helpdesk: boolean): Promise<ItemQuestionDropdownConfig> {
    const { getValidSchemaTypesFromItemtypes, getComponentSchema, doGraphQLRequest } = useApi();
    const itemtype = question.extra_data.itemtype;
    if (!itemtype) {
        return { schema_name: null, condition: '', is_tree: false };
    }
    const [schema_name] = await getValidSchemaTypesFromItemtypes([itemtype]);
    if (!schema_name) {
        return { schema_name: null, condition: '', is_tree: false };
    }
    const schema = await getComponentSchema(schema_name as any);
    const properties = Object.keys(schema?.properties ?? {});
    const is_tree = ['completename', 'level', 'parent'].every((property) => properties.includes(property));

    let root = null;
    const root_items_id = Number(question.extra_data.root_items_id ?? 0);
    if (is_tree && root_items_id > 0) {
        const result = await doGraphQLRequest(`query { ${schema_name}(filter: "id==${root_items_id}") { id completename level } }`);
        root = result?.data?.[schema_name]?.[0] ?? null;
    }

    return {
        schema_name,
        condition: buildItemQuestionCondition(question, properties, root, is_helpdesk),
        is_tree,
    };
}

/**
 * Get the display name of an item (completename for tree dropdowns), like `ItemAsTextConditionHandler`
 */
export async function getItemDisplayName(schema_name: string, items_id: number, is_tree: boolean): Promise<string | null> {
    const { doGraphQLRequest } = useApi();
    const result = await doGraphQLRequest(`query { ${schema_name}(filter: "id==${Number(items_id)}") { id name ${is_tree ? 'completename' : ''} } }`);
    const item = result?.data?.[schema_name]?.[0];
    if (!item) {
        return null;
    }
    return (is_tree ? item.completename : item.name) ?? item.name ?? null;
}
