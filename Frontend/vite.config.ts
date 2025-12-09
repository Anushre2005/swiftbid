import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "/swiftbid/",
  plugins: [react()],
  build: {
    outDir: "../docs",   // build into /docs at repo root
    emptyOutDir: true,   // clear old files in /docs
  },
});
