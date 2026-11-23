/**
 * Helpers for building RSQL filters for the GLPI HL API, including when they are embedded in GraphQL string literals.
 */

/** Quote a value for use in an RSQL filter. Backslashes and single quotes are escaped. */
export function rsqlQuote(value: string): string {
    return `'${value.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
}

/** Build a "contains" (case-insensitive) RSQL value. The LIKE wildcards in the value itself are not escapable, so they are removed. */
export function rsqlContains(value: string): string {
    return rsqlQuote(`*${value.replace(/[*%]/g, '')}*`);
}

/** Escape a string to be embedded in a GraphQL string literal (double-quoted) */
export function graphQLString(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}
