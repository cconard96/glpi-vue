import { createI18n } from "vue-i18n";

const user_lang = localStorage.getItem('lang') || navigator.language || 'en';

function resolveLocale(locale) {
    const normalizedLocale = locale.replace('-', '_');
    const supportedLocales = ['en_GB', 'fr_FR', 'pt_BR'];
    const fallbackMap = {
        'en': 'en_GB',
        'fr': 'fr_FR',
        'pt': 'pt_BR',
        'default': 'en_GB',
    };
    if (supportedLocales.includes(normalizedLocale)) {
        return normalizedLocale;
    }
    return fallbackMap[normalizedLocale] || fallbackMap[normalizedLocale.split('_')[0]] || fallbackMap['default'];
}

const i18n = createI18n({
    legacy: false,
    locale: resolveLocale(user_lang),
});

i18n.global.setLocaleMessage(i18n.global.locale.value, (await import(`../../locales/${i18n.global.locale.value}.json`)).default);

export {
    i18n,
}