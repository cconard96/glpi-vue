import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
    return {
        build: {
            rollupOptions: {
                output: {
                    manualChunks: {
                        // ECharts is a large library used only in specific parts of the app to display charts so it should be kept separate
                        echarts: ['echarts', 'vue-echarts'],
                    }
                }
            }
        },
        plugins: [
            vue(),
            vueDevTools(),
            tailwindcss(),
        ],
        define: {
            "globalThis.__DEV__": mode === 'development',
        },
        resolve: {
            alias: {
                '@': fileURLToPath(new URL('./src', import.meta.url))
            },
        },
    };
});