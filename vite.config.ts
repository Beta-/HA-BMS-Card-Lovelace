import { defineConfig } from 'vite';

export default defineConfig({
    build: {
        lib: {
            entry: 'src/index.ts',
            name: 'JkBmsReactorCard',
            formats: ['es'],
            fileName: () => 'jk-bms-reactor-card.js',
        },
        rollupOptions: {
            output: {
                inlineDynamicImports: true,
            },
        },
        outDir: 'dist',
        emptyOutDir: true,
        minify: 'terser',
        sourcemap: false,
    },
});
