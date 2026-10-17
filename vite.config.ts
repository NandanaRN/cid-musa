import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify - file watching is disabled to prevent flickering during agent edits.
      //
      // The HMR websocket port is pinned + configurable via VITE_HMR_PORT so it doesn't
      // silently collide with another local process (e.g. a leftover dev server) on the
      // default port 24678. If you still see "Port 24678 is already in use", either kill
      // the stray process holding that port, or set VITE_HMR_PORT to a free port.
      hmr:
        process.env.DISABLE_HMR === 'true'
          ? false
          : { port: Number(process.env.VITE_HMR_PORT) || 24678 },
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
