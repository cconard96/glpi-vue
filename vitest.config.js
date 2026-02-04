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
            headless: true,
        },
        globals: true,
        hookTimeout: 10000,
        snapshotSerializers: ['./node_modules/vue3-snapshot-serializer/index.js'],
        screenshotDirectory: 'tests/__screenshots__',
        resolveSnapshotPath: (testPath, snapExtension) => {
            return testPath.replace('/src/', '/tests/__snapshots__/') + snapExtension;
        }
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