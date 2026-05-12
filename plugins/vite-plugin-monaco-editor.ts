import type { Plugin } from 'vite';
import type { EditorFeature, EditorLanguage, IFeatureDefinition, NegatedEditorFeature } from 'monaco-editor/esm/metadata.d.ts';
import { features, languages } from 'monaco-editor/esm/metadata.js';

// Based on https://github.com/Kong/public-ui-components/blob/main/packages/core/monaco-editor/vite-plugin to reduce Monaco Editor bundle size by only including the features and languages we need

type Options = {
    languages?: EditorLanguage[],
    features?: Array<EditorFeature | NegatedEditorFeature>
}

// Languages that share workers with other languages
const WORKER_ALIASES: Record<string, string> = {
    javascript: 'typescript',
    less: 'css',
    scss: 'css',
    handlebars: 'html',
    razor: 'html',
};

const VIRTUAL_MODULE_MONACO_ID = '\0virtual:monaco-editor';

function generateImports(entries: string | string[]): string[] {
    const result = Array.isArray(entries) ? entries : [entries]
    return result.map((entry) => {
        if (entry.endsWith('monaco.contribution')) {
            const lang = entry.split('/').at(-2);
            return `export * as ${lang} from 'monaco-editor/esm/${entry}'`;
        }
        return `import 'monaco-editor/esm/${entry}'`;
    });
}

function resolveFeatures(requested: Options['features'], available: EditorFeature[]): EditorFeature[] {
    if (!requested) {
        return available;
    }
    const excluded: EditorFeature[] = requested
        .filter((f): f is NegatedEditorFeature => f.startsWith('!'))
        .map(f => f.slice(1)) as EditorFeature[];
    if (excluded.length > 0) {
        //console.log('Some features were excluded from the Monaco Editor bundle:', excluded);
        const r = available.filter(f => !excluded.includes(f));
        //console.log('Remaining features:', r);
        return r;
    }
    return requested as EditorFeature[];
}

function generateWorker(languages: string[], langDict: Record<string, IFeatureDefinition>): string[] {
    const imported = new Set<string>();
    const imports: string[] = [
        "import EditorWorker from 'monaco-editor/esm/vs/editor/editor.worker?worker';"
    ];
    const workerMap: string[] = [];

    languages.forEach(lang => {
        const workerLang = WORKER_ALIASES[lang] || lang;
        const langDef = langDict[workerLang];
        const workerEntry = langDef?.worker?.entry;

        if (!workerEntry) {
            return;
        }

        const workerVar = `${workerLang}Worker`;
        if (!imported.has(workerEntry)) {
            imports.push(`import ${workerVar} from 'monaco-editor/esm/${workerEntry}?worker';`);
            imported.add(workerLang);
            workerMap.push(`${workerLang}: ${workerVar}`);
        }
    });

    return [
        ...imports,
        'const workerMap = {',
        ...workerMap,
        '};',
        'self.MonacoEnvironment = {',
        '  getWorker(_, label) {',
        '    const Worker = workerMap[label] || EditorWorker',
        '    return new Worker()',
        '  },',
        '}',
    ];
}

export default function plugin(options?: Options): Plugin {
    return {
        name: 'vite-plugin-monaco-editor',
        enforce: 'pre',
        // config: () => {
        //     return {
        //         optimizeDeps: { exclude: ['monaco-editor'] }
        //     }
        // },
        resolveId: (id) => {
            if (id === 'monaco-editor') {
                return VIRTUAL_MODULE_MONACO_ID;
            }
        },
        load: (id) => {
            if (id !== VIRTUAL_MODULE_MONACO_ID) {
                return;
            }
            const languagesDict = Object.fromEntries(
                languages.map((lang) => [lang.label, lang]),
            );

            const featuresDict = Object.fromEntries(
                features.map((feat) => [feat.label, feat]),
            );

            const featureImports = resolveFeatures(options?.features, Object.keys(featuresDict) as EditorFeature[])
                .flatMap((featureId) => {
                    const feature = featuresDict[featureId]
                    return feature?.entry ? generateImports(feature.entry) : [];
                });

            const languageIds = options?.languages || (Object.keys(languagesDict) as EditorLanguage[])

            const languageImports = languageIds.flatMap((langId) => {
                const lang = languagesDict[langId]
                return lang?.entry ? generateImports(lang.entry) : []
            })

            const workerCode = generateWorker(languageIds, languagesDict);

            return [
                "import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';",
                ...featureImports,
                ...languageImports,
                ...workerCode,
                "export * from 'monaco-editor/esm/vs/editor/editor.api';",
                'export default monaco;',
            ].join('\n')
        }
    }
}