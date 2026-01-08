import pluginVue from 'eslint-plugin-vue';
import js from "@eslint/js";
import globals from 'globals';
import stylistic from '@stylistic/eslint-plugin';

export default [
    // add more generic rulesets here, such as:
    js.configs.recommended,
    ...pluginVue.configs['flat/recommended'],
    {
        plugins: {
            '@stylistic': stylistic,
            vue,
        },
        rules: {
            // override/add rules settings here, such as:
            // 'vue/no-unused-vars': 'error'
            '@stylistic/semi': 'error',
            "@stylistic/eol-last": ["error", "always"],
            "@stylistic/indent": [
                "error",
                4,
                {
                    "SwitchCase": 1
                }
            ],
            "@stylistic/linebreak-style": [
                "error",
                "unix"
            ],
            "no-unused-vars": "error",
            "@stylistic/quotes": ["off", "single"],
            "no-var": "error",
            "prefer-arrow-callback": "error",
            "no-eval": "error",
            "no-implied-eval": "error",
            "prefer-const": "error",
            "prefer-spread": "error",
            "prefer-template": "error",
            "vue/script-indent": ["error", 4, {
                "baseIndent": 1,
                "switchCase": 1
            }],
            "vue/html-indent": ["error", 4, {
                "baseIndent": 1,
                "switchCase": 1
            }],
            "vue/multi-word-component-names": "off",
        },
        overrides: [
            {
                "files": ["*.vue"],
                "rules": {
                    "@stylistic/indent": "off",
                }
            }
        ],
        languageOptions: {
            sourceType: 'module',
            globals: {
                ...globals.browser
            }
        },
    }
]