import { type MaybeRefOrGetter, toValue } from "vue";

/**
 * Composable function that allows using a color in several ways, including as a reactive reference for accessible (contrast) color calculations.
 * For example, a tag component may have a single user-defined color, and this composable can be used to calculate the best text color to use on top of that background color for accessibility.
 * @param color Hex color string
 */
export function useColor(color: MaybeRefOrGetter<string>) {
    const getAccessibleColorPair = () => {
        const cleanHex = toValue(color).replace(/^#/, '');
        const fullHex = cleanHex.length === 3
            ? cleanHex.split('').map(c => c + c).join('')
            : cleanHex;

        const r = parseInt(fullHex.substring(0, 2), 16);
        const g = parseInt(fullHex.substring(2, 4), 16);
        const b = parseInt(fullHex.substring(4, 6), 16);

        // relative luminance (WCAG 2.x formula)
        const getChannelLuminance = (channel) => {
            const sRGB = channel / 255;
            return sRGB <= 0.03928
                ? sRGB / 12.92
                : Math.pow((sRGB + 0.055) / 1.055, 2.4);
        };

        const luminance =
            0.2126 * getChannelLuminance(r) +
            0.7152 * getChannelLuminance(g) +
            0.0722 * getChannelLuminance(b);

        // 4. Calculate contrast against white (L = 1) and black (L = 0)
        const whiteContrast = (1.0 + 0.05) / (luminance + 0.05);
        const blackContrast = (luminance + 0.05) / (0.0 + 0.05);

        // 5. Pick whichever provides higher contrast (guaranteed >= 4.58:1)
        const useBlackText = blackContrast > whiteContrast;

        return {
            backgroundColor: `#${fullHex}`,
            color: useBlackText ? '#000000' : '#ffffff',
            contrastRatio: Number((useBlackText ? blackContrast : whiteContrast).toFixed(2))
        };
    }

    return {
        getAccessibleColorPair
    }
}