import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  const rootEnv = loadEnv(mode, process.cwd(), "");
  const alchemyKey =
    rootEnv.VITE_ALCHEMY_API_KEY?.trim() ||
    rootEnv.ALCHEMY_API_KEY?.trim() ||
    "";

  /** Web3.bio: expose to client without requiring VITE_ prefix in .env (keys still end up in the bundle). */
  const web3bioApiKey =
    rootEnv.VITE_WEB3BIO_API_KEY?.trim() ||
    rootEnv.WEB3_BIO_API_KEY?.trim() ||
    rootEnv.WEB3BIO_API_KEY?.trim() ||
    "";
  const web3bioBearer =
    rootEnv.VITE_WEB3BIO_BEARER_TOKEN?.trim() ||
    rootEnv.WEB3_BIO_BEARER_TOKEN?.trim() ||
    rootEnv.BEARER_TOKEN?.trim() ||
    "";

  /** Must match Hono `PORT` in .env (default 3001). Hardcoding 3001 breaks the proxy if PORT differs. */
  const apiPort = rootEnv.PORT?.trim() || "3001";
  const apiTarget = `http://127.0.0.1:${apiPort}`;
  const devApiProxy = {
    "/api": { target: apiTarget, changeOrigin: true },
    "/users": { target: apiTarget, changeOrigin: true },
    "/pipeflare": { target: apiTarget, changeOrigin: true },
    "/health": { target: apiTarget, changeOrigin: true },
  } as const;

  return {
  define: {
    "import.meta.env.VITE_ALCHEMY_API_KEY": JSON.stringify(alchemyKey),
    "import.meta.env.VITE_WEB3BIO_API_KEY": JSON.stringify(web3bioApiKey),
    "import.meta.env.VITE_WEB3BIO_BEARER_TOKEN": JSON.stringify(web3bioBearer),
    /**
     * Dev / preview: call Hono directly (CORS allows localhost + 127.0.0.1). Avoids 404s when the Vite proxy
     * target mismatches PORT or preview has no proxy. Production builds: omit unless set in .env.
     */
    ...(command === "serve" && !rootEnv.VITE_API_URL?.trim()
      ? { "import.meta.env.VITE_API_URL": JSON.stringify(apiTarget) }
      : {}),
  },
  server: {
    host: "::",
    /** UI: http://localhost:8080 — proxy /api and /health to Hono on PORT (default 3001) */
    port: 8080,
    hmr: {
      overlay: false,
    },
    proxy: { ...devApiProxy },
  },
  /** Same proxy as dev — `vite preview` has no /api routes unless this is set. */
  preview: {
    port: 8080,
    proxy: { ...devApiProxy },
  },
  plugins: [
    react(),
    {
      name: "inject-site-origin",
      transformIndexHtml(html) {
        const env = loadEnv(mode, process.cwd(), "");
        const origin = env.VITE_SITE_ORIGIN?.trim() || "http://localhost:8080";
        return html.replaceAll("__SITE_ORIGIN__", origin);
      },
    },
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime", "@tanstack/react-query", "@tanstack/query-core"],
  },
};
});
