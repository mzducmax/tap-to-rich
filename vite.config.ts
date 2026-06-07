import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

/** Khi VITE_API_BASE_URL="/api", proxy tới backend thật (tránh CORS trên browser). */
function getApiProxy(env: Record<string, string>) {
  const baseUrl = env.VITE_API_BASE_URL?.trim();
  if (!baseUrl?.startsWith('/')) return undefined;

  const useDev = env.VITE_USE_DEV_API === 'true';
  const target = useDev
    ? 'http://localhost:6896'
    : (env.APP_URL || 'https://play.zonee.pro/api').replace(/\/api\/?$/, '');

  return {
    '/api': {
      target,
      changeOrigin: true,
      secure: !useDev,
    },
  };
}

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '');
  const apiProxy = getApiProxy(env);

  return {
    // Relative paths — required for Electron file:// loading
    base: './',
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 4173,
      host: '0.0.0.0',
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modifyâfile watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
      proxy: apiProxy,
    },
    preview: {
      port: 4173,
      host: '0.0.0.0',
      proxy: apiProxy,
    },
  };
});
