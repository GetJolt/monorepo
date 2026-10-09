// The browser's version of what Electron gives the desktop app. Sign-in tokens go to localStorage, links open in
// a new tab, and jolt:// links arrive as #/ routes (#/invite/<host>/<code> is jolt://invite/<host>/<code>).

import type { JoltBridge } from '../../desktop/src/shared/bridge';
import { version } from '../package.json';

function osName(): string {
  const agent = navigator.userAgent;
  if (/Android/.test(agent)) return 'Android';
  if (/iPhone|iPad/.test(agent)) return 'iOS';
  if (/Mac/.test(agent)) return 'macOS';
  if (/Windows/.test(agent)) return 'Windows';
  if (/CrOS/.test(agent)) return 'ChromeOS';
  return 'Linux';
}

function browserName(): string {
  const agent = navigator.userAgent;
  if (/Edg\//.test(agent)) return 'Edge';
  if (/Firefox\//.test(agent)) return 'Firefox';
  if (/OPR\//.test(agent)) return 'Opera';
  if (/Chrome\//.test(agent)) return 'Chrome';
  if (/Safari\//.test(agent)) return 'Safari';
  return 'a browser';
}

/** localStorage, falling back to memory when the browser won't allow it (some private windows). */
function createStore(): JoltBridge['secureStore'] {
  const memory = new Map<string, string>();
  const key = (k: string) => `jolt:${k}`;
  return {
    async get(k) {
      try {
        return localStorage.getItem(key(k));
      } catch {
        return memory.get(k) ?? null;
      }
    },
    async set(k, value) {
      try {
        localStorage.setItem(key(k), value);
      } catch {
        memory.set(k, value);
      }
    },
    async delete(k) {
      try {
        localStorage.removeItem(key(k));
      } catch {
        memory.delete(k);
      }
    },
  };
}

/** Takes a #/ route off the address bar and turns it into the jolt:// link the app understands. */
function takeHashLink(): string | null {
  if (!location.hash.startsWith('#/')) return null;
  const link = `jolt://${location.hash.slice(2)}`;
  history.replaceState(null, '', location.pathname + location.search);
  return link;
}

const os = osName();

const bridge: JoltBridge = {
  runtime: 'web',
  platform: os === 'macOS' || os === 'iOS' ? 'darwin' : os === 'Windows' ? 'win32' : 'linux',
  // Served from an instance, that instance is the obvious one to sign in to.
  defaultInstance: import.meta.env.VITE_DEFAULT_INSTANCE ?? (import.meta.env.DEV ? undefined : location.host),
  appVersion: async () => version,
  secureStore: createStore(),
  deviceName: async () => `Jolt Web on ${browserName()}, ${os}`,
  async openExternal(url) {
    if (/^https?:\/\//i.test(url)) window.open(url, '_blank', 'noopener,noreferrer');
  },
  setTitleBarTheme({ color }) {
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  },
  onDeepLink(callback) {
    const onHash = () => {
      const link = takeHashLink();
      if (link) callback(link);
    };
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  },
  takePendingDeepLink: async () => takeHashLink(),
  updates: {
    // A page reload always gets the newest version, so there's nothing to manage.
    status: async () => ({ state: 'unsupported' }),
    check: async () => undefined,
    install: () => location.reload(),
    onStatus: () => () => undefined,
  },
};

window.jolt = bridge;
