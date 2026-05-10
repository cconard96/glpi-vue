import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    process.env = {...process.env, ...loadEnv(mode, process.cwd())};
    return {
        build: {
            // AFAIK preload doesn't really apply much here because this app uses PWA and the service worker will already handle caching all resources. So, loading times are very fast.
            modulePreload: false,
            rollupOptions: {
                output: {
                    codeSplitting: {
                        groups: [
                            {
                                // ECharts is a large library used only in specific parts of the app to display charts so it should be kept separate
                                name: 'echarts',
                                test: /[\\/]node_modules[\\/](echarts|vue-echarts)[\\/]/,
                                priority: 20,
                            }
                        ],
                    },
                },
            },
        },
        plugins: [
            vue(), vueDevTools(), tailwindcss(),
            VitePWA({
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
            }),
        ],
        define: {
            'globalThis.__DEV__': mode === 'development',
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url)),
                html2canvas: 'html2canvas-pro',
            },
        },
    };
});
