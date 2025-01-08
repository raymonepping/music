import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import postcss from "./configurations/postcss.config.cjs";

export default defineConfig({
  plugins: [vue()],
  server: {
    host: "0.0.0.0", // Allow Vite to be accessible from outside the container
    port: 8080,
    fs: {
      allow: [".."], // Adjust if necessary
    },
    proxy: {
      "/api": {
        target: "http://springer:3000", // Proxy API requests to the backend container
        changeOrigin: true,
        secure: false,
      },
    },
  },

  preview: {
    port: 8080,
  },
});
