/// <reference types="vitest/config" />
import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv, PluginOption } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA, VitePWAOptions } from "vite-plugin-pwa";
import extractI18nPlugin from "./plugins/vite-plugin-extract-i18n.ts";
import { playwright } from "@vitest/browser-playwright";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};

    const pwaConfig: Partial<VitePWAOptions> = {
        manifestFilename: "manifest.json",
        manifest: {
            "name": "GLPI (Unofficial)",
            "short_name": "GLPI (Unofficial)",
            "scope": process.env.VITE_APP_URL,
            "icons": [
                {
                    "src": "Icon-512.png",
                    "sizes": "512x512",
                    "type": "image/png"
                },
                {
                    "src": "Icon-192.png",
                    "sizes": "192x192",
                    "type": "image/png"
                }
            ],
            "screenshots": [
                {
                    "src": "screenshots/TicketTimeline.png",
                    "sizes": "1280x720",
                    "type": "image/png",
                    "form_factor": "wide",
                    "label": "Ticket timeline view"
                },
            ],
            "shortcuts": [
                {
                    "name": "My tickets",
                    "short_name": "My tickets",
                    "description": "View your tickets",
                    "url": "/assistance/ticket",
                    "icons": [
                        {
                            "src": "Icon-96.png",
                            "sizes": "96x96",
                            "type": "image/png"
                        }
                    ],
                }
            ],
            "start_url": process.env.VITE_APP_URL,
            "background_color": "#ffffff",
            "display": "standalone",
            "theme_color": "#000000"
        },
        registerType: "autoUpdate",
        includeAssets: ["favicon.ico"],
        injectManifest: {
            globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        },
        workbox: {
            globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
        },
        devOptions: {
            enabled: true,
        }
    };

    const plugins: PluginOption[] = [
        vue(),
        tailwindcss(),

    ];

    // if not testing, add devtools plugin
    if (mode !== 'test') {
        plugins.push(vueDevTools());
        plugins.push(VitePWA(pwaConfig));
        plugins.push(extractI18nPlugin());
    }

    return {
        build: {
            // AFAIK preload doesn't really apply much here because this app uses PWA and the service worker will already handle caching all resources. So, loading times are very fast.
            modulePreload: false,
            rollupOptions: {
                output: {
                    codeSplitting: {
                        groups: [
                            {
                                name: 'chartjs',
                                test: /[\\/]node_modules[\\/]chart.js/,
                                priority: 20,
                            }
                        ],
                    },
                },
            },
        },
        plugins: plugins,
        define: {
            'globalThis.__DEV__': mode === 'development',
        },
        optimizeDeps: {
            include: ['primevue/config', '@primeuix/themes/lara', 'pinia-plugin-persistedstate', 'primevue/focustrap'],
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                '@tests': fileURLToPath(new URL('./tests', import.meta.url)),
                html2canvas: 'html2canvas-pro',
            },
        },
        test: {
            browser: {
                enabled: true,
                provider: playwright(),
                instances: [
                    {
                        browser: 'chromium',
                        viewport: { width: 1920, height: 1080 },
                    },
                    {
                        browser: 'firefox',
                        viewport: { width: 1920, height: 1080 },
                    }
                ],
                headless: true,
            },
            globals: true,
            hookTimeout: 5000,
            testTimeout: 5000,
            snapshotSerializers: ['./node_modules/vue3-snapshot-serializer/index.js'],
            screenshotDirectory: 'tests/__screenshots__',
            setupFiles: ['tests/browser-setup.ts'],
        },
    };
});
