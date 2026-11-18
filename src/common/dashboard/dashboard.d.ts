/**
 * GLPI dashboard widget types.
 * - summaryNumbers: Horizontal list of bigNumbers (no icons)
 * - multipleNumber: Grid view of labels and numbers (no icons)
 * - searchShowList: Search results. Not supported yet.
 * - articleList: List of "articles" with a title, author, description and date.
 */
export type WidgetTypes = 'bigNumber' | 'summaryNumbers' | 'multipleNumber' | 'pie' | 'donut' | 'halfpie' | 'halfdonut' | 'bar' | 'hbar' | 'searchShowList' | 'line' | 'area' | 'lines' | 'areas' | 'bars' | 'stackedbars' | 'hBars' | 'stackedHBars' | 'articleList' | 'markdown';

/** Pie/donut charts (full or half) */
export type PieWidgetType = 'pie' | 'donut' | 'halfpie' | 'halfdonut';
/** Bar charts with a single dataset */
export type SingleBarWidgetType = 'bar' | 'hbar';
/** Bar charts with multiple datasets */
export type MultiBarWidgetType = 'bars' | 'hBars' | 'stackedbars' | 'stackedHBars';
export type BarWidgetType = SingleBarWidgetType | MultiBarWidgetType;
/** Line/area charts with a single dataset */
export type SingleLineWidgetType = 'line' | 'area';
/** Line/area charts with multiple datasets */
export type MultiLineWidgetType = 'lines' | 'areas';
export type LineWidgetType = SingleLineWidgetType | MultiLineWidgetType;
/** Widgets rendered by SeriesChart */
export type SeriesWidgetType = BarWidgetType | LineWidgetType;

/** Widgets whose value is a single list of items (DashboardCardList) */
export type ListWidgetType = 'summaryNumbers' | 'multipleNumber' | PieWidgetType | SingleBarWidgetType | SingleLineWidgetType;
/** Widgets whose value is multiple series (DashboardCardSeries) */
export type MultiSeriesWidgetType = MultiBarWidgetType | MultiLineWidgetType;

/* ---------------------------------------------------------------------------------------------------------------- */
/* Card options                                                                                                     */
/* ---------------------------------------------------------------------------------------------------------------- */

/** Options stored by GLPI for every card (`card_options` JSON) */
export interface BaseCardOptions<T extends WidgetTypes = WidgetTypes> {
    widgettype: T;
    color: string;
    limit?: number;
    use_gradient?: 0 | 1;
}

/** Extra stored options for specific widget types. Widget types not listed here only have the base options. */
interface ExtraCardOptions {
    markdown: {
        markdown_content: string;
    };
}

type CardOptionsMap = {
    [K in WidgetTypes]: BaseCardOptions<K> & (K extends keyof ExtraCardOptions ? ExtraCardOptions[K] : unknown);
};

/**
 * Options stored by GLPI for a card of widget type `T`.
 * Without a type argument (or with a union), this is a discriminated union on `widgettype`.
 */
export type CardOptions<T extends WidgetTypes = WidgetTypes> = CardOptionsMap[T];

export type MarkdownCardOptions = CardOptions<'markdown'>;

/** Display options derived from the widget type for pie/donut widgets */
export interface PieDisplayOptions {
    displayMode: 'full' | 'half';
}

/** Display options derived from the widget type for bar/line widgets */
export interface SeriesDisplayOptions {
    /** Only applies to bars */
    orientation: 'vertical' | 'horizontal';
    stacked: boolean;
    /** Only applies to lines (renders an area chart) */
    fill: boolean;
}

/** Display options derived from the widget type, distributed over `T` */
export type DisplayOptions<T extends WidgetTypes> =
    T extends PieWidgetType ? PieDisplayOptions
    : T extends SeriesWidgetType ? SeriesDisplayOptions
    : unknown;

/**
 * Card options after the widget type has been resolved to display options (see `resolveCardOptions`).
 * This is what widget components receive.
 */
export type ResolvedCardOptions<T extends WidgetTypes = WidgetTypes> = T extends WidgetTypes ? CardOptions<T> & DisplayOptions<T> : never;

/* ---------------------------------------------------------------------------------------------------------------- */
/* Card values (match the GraphQL DashboardCard* types)                                                             */
/* ---------------------------------------------------------------------------------------------------------------- */

/** DashboardCardNumber */
export interface BigNumberCardValue {
    icon: string;
    itemtype?: string;
    label: string;
    number: number;
}

/** DashboardCardList */
export interface ListCardValue {
    distributed?: boolean;
    icon: string;
    label: string;
    items: Array<{
        color?: string;
        label: string;
        number: number;
    }>;
}

/** DashboardCardSeries */
export interface SeriesCardValue {
    icon: string;
    label: string;
    labels: string[];
    series: Array<{
        color?: string;
        name: string;
        values: Array<number | null>;
    }>;
}

/** DashboardCardArticles */
export interface ArticleListCardValue {
    articles: Array<{
        author: string;
        content: string;
        date: string;
        label: string;
    }>;
    icon: string;
    label: string;
    number: number;
}

type CardValueMap = { [K in ListWidgetType]: ListCardValue } & { [K in MultiSeriesWidgetType]: SeriesCardValue } & {
    bigNumber: BigNumberCardValue;
    articleList: ArticleListCardValue;
    /** Not supported yet */
    searchShowList: unknown;
    /** Markdown cards have no value. The content is in the card options. */
    markdown: null;
};

/** Value of a card of widget type `T` */
export type CardValue<T extends WidgetTypes = WidgetTypes> = CardValueMap[T];

/**
 * A card with resolved options and its value, discriminated by `widgettype`.
 * Unlike separate `options`/`value` variables typed by a generic, checking `card.widgettype` narrows both.
 */
export type ResolvedCard<T extends WidgetTypes = WidgetTypes> = T extends WidgetTypes ? {
    widgettype: T;
    options: ResolvedCardOptions<T>;
    value: CardValue<T> | null;
} : never;
