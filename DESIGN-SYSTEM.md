# GLPI-Vue Design Style Guide

## 1. Colors

At this point, colors are determined by the PrimeVue Lara theme and default Tailwind colors.
Only two “themes” are supported at this time; a light theme and a dark theme which are set automatically based on the user’s browser/system preference.

## 2. Typography

No custom webfont is used for text. To ensure fast load times and accessibility, the application uses the user’s default sans-serif font.

## 3. Icons

The primary source of icons is Tabler Icons.
While the webfont is used currently, it is desired to replace all of those uses with SVG components to reduce bundle size and improve performance.

## 4. Animations

Animations should be kept to a minimum and mainly used just to grab the user’s attention for important information or in response to a user action. For example, when scrolling an element into view after the user clicks on a link/button, subtle animations like “pulse” can be used to help the user identify the target element among the others.

| Animation | Use Case |
|-----------|----------|
| animate-[pulse_0.5s_linear_infinite] | Used to identify the scrolled to/focused element. |

## 5. Spacing

When possible, use of “gap-*” tailwind classes on container elements should be used over margins on individual child elements. Further, gap values should be kept to even numbers with:
- gap-2: Small gaps usually between related buttons. This could also be used for vertical spacing between form fields that use inline labels (but not floating labels).
- gap-4: Medium gaps between sections of elements. For example, the gap between breadcrumb items and breadcrumb actions. It may also be used for vertical spacing between form fields with floating (on variant) labels, and horizontal spacing between columns of fields in a fixed size form.

## 6. Forms

### 6.1 Labels

Fields within a single column display, such as the side panel for tickets, should use FloatLabels with the “over” variant to save space.
Fields within “full size” forms, such as the main asset forms, should use inline labels with the label showing to the left of the field.

## 7. Miscellaneous Layout Components

### 7.1 Breadcrumbs

Breadcrumb items should be separated by an arrow/chevron pointing from the start to end. In RTL mode, the arrow/chevron should be flipped to keep with this design.

Only the Home item, which should always appear, should have an icon. All other breadcrumb items should be text only to save space.

Breadcrumb action buttons should have the primary action listed first with the primary severity while additional actions are secondary severity and text variant.
Typically, the button to add a new item would be the primary action. If the primary action is not allowed by the current user, no other action would become the primary in its place.
