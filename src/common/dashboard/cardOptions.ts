import type {
    BarWidgetType, BaseCardOptions, CardOptions, CardValue, LineWidgetType, PieDisplayOptions, PieWidgetType, ResolvedCard, ResolvedCardOptions,
    SeriesDisplayOptions, SeriesWidgetType, WidgetTypes,
} from "@/common/dashboard/dashboard";

// Records (rather than arrays) so the compiler enforces that every member of each type is listed
const PIE_TYPES: Record<PieWidgetType, true> = { pie: true, donut: true, halfpie: true, halfdonut: true };
const BAR_TYPES: Record<BarWidgetType, true> = { bar: true, hbar: true, bars: true, hBars: true, stackedbars: true, stackedHBars: true };
const LINE_TYPES: Record<LineWidgetType, true> = { line: true, area: true, lines: true, areas: true };

export const isPieWidgetType = (type: WidgetTypes): type is PieWidgetType => Object.hasOwn(PIE_TYPES, type);
export const isBarWidgetType = (type: WidgetTypes): type is BarWidgetType => Object.hasOwn(BAR_TYPES, type);
export const isLineWidgetType = (type: WidgetTypes): type is LineWidgetType => Object.hasOwn(LINE_TYPES, type);
export const isSeriesWidgetType = (type: WidgetTypes): type is SeriesWidgetType => isBarWidgetType(type) || isLineWidgetType(type);

// Card guards narrow the whole card (options and value), not only the widget type
export const isPieCard = (card: ResolvedCard): card is ResolvedCard<PieWidgetType> => isPieWidgetType(card.widgettype);
export const isSeriesCard = (card: ResolvedCard): card is ResolvedCard<SeriesWidgetType> => isSeriesWidgetType(card.widgettype);

/**
 * Add the display options implied by the widget type (half pies, horizontal/stacked bars, areas...).
 * Returns a copy. The given options are not mutated.
 */
export function resolveCardOptions<T extends WidgetTypes>(options: BaseCardOptions<T> & CardOptions<T>): ResolvedCardOptions<T> {
    const type: WidgetTypes = options.widgettype;
    let display: PieDisplayOptions | SeriesDisplayOptions | null = null;
    if (isPieWidgetType(type)) {
        display = { displayMode: type === 'halfpie' || type === 'halfdonut' ? 'half' : 'full' };
    } else if (isSeriesWidgetType(type)) {
        display = {
            orientation: type === 'hbar' || type === 'hBars' || type === 'stackedHBars' ? 'horizontal' : 'vertical',
            stacked: type === 'stackedbars' || type === 'stackedHBars',
            fill: type === 'area' || type === 'areas',
        };
    }
    return { ...options, ...display } as ResolvedCardOptions<T>;
}

export function resolveCard<T extends WidgetTypes>(options: BaseCardOptions<T> & CardOptions<T>, value: CardValue<T> | null): ResolvedCard<T> {
    return { widgettype: options.widgettype, options: resolveCardOptions(options), value } as ResolvedCard<T>;
}
