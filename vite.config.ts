import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "JkBmsReactorCard",
      formats: ["es"],
      fileName: () => "jk-bms-reactor-card.js",
    },
    rollupOptions: {
      output: {
        inlineDynamicImports: true,
      },
    },
    outDir: "dist",
    minify: true,
    sourcemap: false,
  },
});
