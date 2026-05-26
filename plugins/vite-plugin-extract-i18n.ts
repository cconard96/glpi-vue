// Custom vue-i18n extractor plugin for Vite
// Unlike vue-i18n-extract, this plugin is designed to use the defined defaultMsg option in the locale files when the translation key is missing.

// Currently, only the function calls are supported

import fs from 'node:fs';
import { Plugin } from 'vite';
import { Program, Node, CallExpression, Argument } from '@oxc-project/types';

interface ParseContext {
    previousNode?: Node
}

export default function extractI18nPlugin(): Plugin {
    let projectRoot = null;
    const fileExtensions = ['.vue', '.ts', '.js'];
    const calleeNames = ['$t', 't'];
    const translations = new Map<string, string>();
    let parseContext: ParseContext = {};

    function extractTranslations(node: Node|Array<Argument>) {
        if (parseContext.previousNode !== undefined && Array.isArray(node)) {
            addTranslationFromArguments(node);
        }

        if (!Array.isArray(node) && node.type === 'CallExpression') {
            parseCallExpression(node);
        }
        for (const key in node) {
            if (node[key] && typeof node[key] === 'object') {
                extractTranslations(node[key]);
            }
        }

        if (!Array.isArray(node) && node.type === 'CallExpression' && node.callee.name === '_unref' && calleeNames.includes(node.arguments[0].name)) {
            parseContext = {
                previousNode: node,
            };
        } else {
            parseContext = {};
        }
    }

    function addTranslation(key: string, defaultMsg: string | null) {
        if (translations.has(key) && translations.get(key) !== key) {
            // A default message already exists. We should warn if the new default message is different, but skip.
            if (defaultMsg && translations.get(key) !== defaultMsg) {
                console.warn(`Warning: Translation key "${key}" already exists with a different default message. Skipping new default message.`);
            }
            return;
        }
        translations.set(key, defaultMsg ?? key);
    }

    function addTranslationFromArguments(nodeArgs: Array<Argument>) {
        if (nodeArgs.length === 0) {
            return;
        }
        const keyArg = nodeArgs[0];
        let defaultMsgArg = null;

        if (nodeArgs.length > 1 && typeof nodeArgs[nodeArgs.length - 1].value === 'string') {
            defaultMsgArg = nodeArgs[nodeArgs.length - 1];
        } else if (nodeArgs.length > 1 && nodeArgs[nodeArgs.length - 1].type === 'ObjectExpression') {
            // should be a plural translation with the default message in the "default" property
            const defaultMsgProperty = nodeArgs[nodeArgs.length - 1].properties.find(prop => prop.key.type === 'Identifier' && prop.key.name === 'default');
            if (defaultMsgProperty && defaultMsgProperty.value.type === 'Literal' && typeof defaultMsgProperty.value.value === 'string') {
                defaultMsgArg = defaultMsgProperty.value;
            }
        }

        if (keyArg.type === 'Literal' && typeof keyArg.value === 'string') {
            const translationKey = keyArg.value;
            const defaultMsg = defaultMsgArg ? defaultMsgArg.value : null;
            addTranslation(translationKey, defaultMsg);
        }
    }

    function parseCallExpression(node: CallExpression,) {
        if (node.callee.type === 'Identifier' && calleeNames.includes(node.callee.name)) {
            addTranslationFromArguments(node.arguments);
        } else if (node.callee.type === 'MemberExpression' && node.callee.object.type === 'Identifier' && node.callee.object.name === '_ctx' && calleeNames.includes(node.callee.property.name)) {
            addTranslationFromArguments(node.arguments);
        }
    }

    function flattenObject(obj: Record<string, any>, prefix = ''): Record<string, string> {
        const result: Record<string, string> = {};
        for (const key in obj) {
            const value = obj[key];
            const newKey = prefix ? `${prefix}.${key}` : key;
            if (typeof value === 'object' && value !== null) {
                Object.assign(result, flattenObject(value, newKey));
            } else {
                result[newKey] = value;
            }
        }
        return result;
    }

    function unflattenObject(obj: Record<string, string>, prefix = ''): Record<string, any> {
        const result: Record<string, any> = {};
        for (const key in obj) {
            const value = obj[key];
            const fullKey = prefix ? `${prefix}.${key}` : key;
            const parts = fullKey.split('.');
            let current = result;
            for (let i = 0; i < parts.length; i++) {
                const part = parts[i];
                if (i === parts.length - 1) {
                    current[part] = value;
                } else {
                    current[part] = current[part] || {};
                    current = current[part];
                }
            }
        }
        return result;
    }

    function updateLocaleFiles() {
        // get list of all JSON files in the locales folder
        const localeFiles = fs.readdirSync(`${projectRoot}/locales`).filter(file => file.endsWith('.json'));

        // Translations found in locale files but not extracted from source code
        const unusedTranslations = new Set<string>();

        console.log(`Updating locale files: ${localeFiles.join(', ')}`);
        console.log(`Found ${translations.size} translations to add/update.`);

        for (const file of localeFiles) {
            const filePath = `${projectRoot}/locales/${file}`;
            const localeData = flattenObject(JSON.parse(fs.readFileSync(filePath, 'utf-8')));

            // We always use the nested JSON format for strings
            const updatedLocaleData = { ...localeData, ...Object.fromEntries(translations.entries()) };

            // track unused translations
            for (const key in updatedLocaleData) {
                if (!translations.has(key)) {
                    unusedTranslations.add(key);
                }
            }

            fs.writeFileSync(filePath, JSON.stringify(unflattenObject(updatedLocaleData), null, 2), 'utf-8');
        }

        if (unusedTranslations.size > 0) {
            console.warn(`Warning: The following translations were found in locale files but not extracted from source code. Consider removing them if they are no longer used:\n${Array.from(unusedTranslations).join('\n')}`);
        }
    }

    return {
        name: 'vite-plugin-extract-i18n',
        configResolved(resolvedConfig) {
            projectRoot = resolvedConfig.root;
        },
        transform(code, id) {
            // Ignore all files not in the src directory
            if (!id.includes(`${projectRoot}/src/`) || !fileExtensions.some(ext => id.endsWith(ext))) {
                return;
            }

            const ast: Program = this.parse(code);

            extractTranslations(ast);
        },
        buildEnd() {
            updateLocaleFiles();
        }
    };
}