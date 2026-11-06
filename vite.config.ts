import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
    // Same-origin /api in development, like the Vercel deployment
    proxy: {
      "/api": "http://localhost:3001",
      "/uploads": "http://localhost:3001",
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  build: {
    rollupOptions: {
      output: {
        // Long-lived vendor chunks that change far less often than app code
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("/ethers/") || id.includes("/@noble/") || id.includes("/@adraffy/") || id.includes("/aes-js/")) return "ethers";
          if (id.includes("/react-router") || id.includes("/@remix-run/")) return "router";
          if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/")) return "react";
          if (id.includes("/@radix-ui/") || id.includes("/lucide-react/")) return "ui";
          return undefined;
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
