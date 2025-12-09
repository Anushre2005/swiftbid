import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// import { viteStaticCopy } from "vite-plugin-static-copy";

export default defineConfig({
  base: "/swiftbid/",
  plugins: [
    react(),
  ],
  optimizeDeps: {
    include: ["../demo-database/*.json"]
  }
});
