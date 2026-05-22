import { createI18n } from "vue-i18n";
import { useLocalStorage } from "@vueuse/core";
import { computed } from "vue";

const currentLang = useLocalStorage('lang', navigator.language || 'en');

const supportedAppLocales = {
    'en_GB': 'English (UK)',
    'en_US': 'English (US)',
    'fr_FR': 'Français (France)',
    'pt_BR': 'Português (Brasil)',
}

const fallbackMap = {
    'en': 'en_GB',
    'fr': 'fr_FR',
    'pt': 'pt_BR',
    'default': 'en_GB',
};

const userLang = computed({
    get() {
        return resolveLocale(currentLang.value);
    },
    set(value) {
        currentLang.value = value;
        const resolvedLocale = resolveLocale(value);

        // Dynamically load the new locale messages when the language changes
        import(`../../../locales/${resolvedLocale}.json`)
            .then(module => {
                i18n.global.setLocaleMessage(resolvedLocale, module.default);
                i18n.global.locale.value = resolvedLocale;
            })
            .catch(error => {
                console.error(`Failed to load locale ${resolvedLocale}:`, error);
            });
        // update html document lang attribute
        document.documentElement.lang = resolvedLocale.replace('_', '-');
    }
});

function resolveLocale(locale) {
    const normalizedLocale = locale.replace('-', '_');
    const supportedLocales = ['en_GB', 'en_US', 'fr_FR', 'pt_BR'];

    if (supportedLocales.includes(normalizedLocale)) {
        return normalizedLocale;
    }
    return fallbackMap[normalizedLocale] || fallbackMap[normalizedLocale.split('_')[0]] || fallbackMap['default'];
}

const i18n = createI18n({
    legacy: false,
    locale: resolveLocale(currentLang.value),
});

try {
    i18n.global.setLocaleMessage(i18n.global.locale.value, (await import(`../../../locales/${i18n.global.locale.value}.json`)).default);
    // set html document lang attribute
    document.documentElement.lang = i18n.global.locale.value.replace('_', '-');
} catch (error) {
    console.error(`Failed to load locale ${i18n.global.locale.value}:`, error);
}

export {
    i18n,
    supportedAppLocales,
    userLang,
}