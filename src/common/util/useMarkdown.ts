import { marked, MarkedOptions } from "marked";
import { computed, MaybeRef, unref } from "vue";

export type UseMarkdownOptions = {
    // option to offset semantic heading levels
    offsetSemanticHeadingLevels?: number;
} & MarkedOptions;

/**
 * Custom renderer for marked to apply the correct tailwind classes.
 */
const renderer = {
    heading({ tokens, depth }) {
        const text = this.parser.parseInline(tokens);
        const semanticHeadingLevel = depth + (this.options?.offsetSemanticHeadingLevels ?? 0);
        if (semanticHeadingLevel > 6) {
            return `<p class="text-heading-${depth} border-b mb-3">${text}</p>`;
        }
        return `<h${semanticHeadingLevel} class="text-heading-${depth} border-b mb-3">${text}</h${semanticHeadingLevel}>`;
    },
    paragraph({ tokens }) {
        const text = this.parser.parseInline(tokens);
        return `<p class="mb-3">${text}</p>`;
    }
}
marked.use({ renderer });

export function useMarkdown(content: MaybeRef<string>, options: UseMarkdownOptions = {}) {
    const renderedContent = computed(() => marked.parse(unref(content), options));

    return {
        renderedContent,
    };
}