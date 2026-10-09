import { resolve } from 'node:path';
import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import { defineConfig, type Plugin } from 'vite';

// The interface is the desktop app's renderer, built straight from its source.
const renderer = resolve(import.meta.dirname, '../desktop/src/renderer/src');

// Instances can live anywhere, so the client may connect to any https/wss origin; everything else is locked down.
function contentSecurityPolicy(dev: boolean): string {
  const local = 'http://localhost:* ws://localhost:* http://127.0.0.1:* ws://127.0.0.1:*';
  return [
    "default-src 'self'",
    `script-src 'self'${dev ? " 'unsafe-inline'" : ''}`,
    "style-src 'self' 'unsafe-inline'",
    `img-src 'self' https: data: blob:${dev ? ` ${local}` : ''}`,
    "font-src 'self' data:",
    `connect-src 'self' https: wss:${dev ? ` ${local}` : ''}`,
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'none'",
  ].join('; ');
}

const csp = (dev: boolean): Plugin => ({
  name: 'jolt-csp',
  transformIndexHtml: (html) => html.replace('%CSP%', contentSecurityPolicy(dev)),
});

export default defineConfig(({ command }) => ({
  // joltapp.org/app. Absolute, so the page still finds its files when opened as /app without the slash.
  base: command === 'build' ? '/app/' : '/',
  resolve: {
    alias: { '@': renderer },
    dedupe: ['react', 'react-dom'],
  },
  plugins: [react(), tailwindcss(), csp(command === 'serve')],
  server: { port: 5173 },
  build: { target: 'es2023' },
}));
