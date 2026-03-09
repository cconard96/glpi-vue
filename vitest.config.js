import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import vue from '@vitejs/plugin-vue';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
    plugins: [vue()],
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
        resolveSnapshotPath: (testPath, snapExtension) => {
            return testPath.replace('/src/', '/tests/__snapshots__/') + snapExtension;
        },
        setupFiles: ['./tests/browser-setup.ts'],
    },
    optimizeDeps: {
        include: ['primevue/config', '@primeuix/themes/lara', 'pinia-plugin-persistedstate', 'primevue/focustrap'],
    },
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url)),
        },
    },
});
