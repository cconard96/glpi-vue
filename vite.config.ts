import { fileURLToPath, URL } from 'node:url';
import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import vueDevTools from 'vite-plugin-vue-devtools';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
    return {
        build: {
            modulePreload: false,
            rollupOptions: {
                output: {
                    manualChunks: {
                        // ECharts is a large library used only in specific parts of the app to display charts so it should be kept separate
                        echarts: ['echarts', 'vue-echarts'],
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
                    "start_url": "/",
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
