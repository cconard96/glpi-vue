import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
    plugins: [vue()],
    test: {
        browser: {
            enabled: true,
            provider: playwright(),
            instances: [
                { browser: 'chromium' },
            ],
            //headless: true,
        },
        hookTimeout: 10000,
    },
    optimizeDeps: {
        include: ['primevue/config', '@primeuix/themes/lara', 'pinia-plugin-persistedstate', 'primevue/focustrap'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        },
    }
});