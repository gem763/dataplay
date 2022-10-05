import { fileURLToPath, URL } from "node:url";

import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),


      // https://github.com/nuxt/vite/issues/160
      // npm i --save-dev rollup-plugin-node-builtins
      fs: require.resolve('rollup-plugin-node-builtins'),
    },
  },
});
