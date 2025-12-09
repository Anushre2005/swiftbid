import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/swiftbid/",
  plugins: [react()],
  build: {
    outDir: "../docs",   // put final build in /docs at repo root
    emptyOutDir: true,   // clear old docs on each build
  },
});
