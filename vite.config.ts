import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src/render"), // 路径别名
      "&": resolve(__dirname, "src/libs"),
    },
  },
  server: {
    strictPort: true, // * 固定端口(如果端口被占用则中止)
    host: true,
    port: 3000,
    proxy: {
      "/api": "http://localhost:4000",
    },
  },
  build: {
    outDir: "dist/.vue",
  },
});
