# Jolt for the web

This is Jolt in a browser tab. It isn't a separate app: it builds the desktop app's interface straight from [apps/desktop](../desktop/src/renderer), so anything added there shows up here too. That's why it only lives in this repository, where the desktop source is always next to it.

The desktop app only reaches Electron through one small bridge (`window.jolt`, described in [bridge.ts](../desktop/src/shared/bridge.ts)). [src/bridge.ts](src/bridge.ts) is the browser's version of it:

- Sign-in tokens are kept in localStorage instead of the system keychain.
- Links open in a new tab.
- `jolt://` links become routes after a `#/`, so `https://joltapp.org/app/#/invite/joltapp.org/abc123` opens that invite.
- There's no title bar or updater, because the browser has its own and a reload always gets the newest version.

When the renderer needs to behave differently on the web, check `window.jolt.runtime`.

## Developing

```sh
pnpm dev:server     # from the repository root: an instance on localhost:4000
pnpm dev:web        # the web client on localhost:5173
```

## Building and hosting

From the repository root, `pnpm build:web` builds the protocol and SDK and then the web client, into a static site in `dist` made to be served at `/app` on joltapp.org. Building only this package reuses whatever SDK build is lying around, which breaks the app when the SDK has changed since. Then `pnpm serve:web` serves it on port 8081, or whichever port you pass, at `/app/`. Point your reverse proxy's `/app` and `/app/*` at it. The [docker](../../docker) setup serves `dist` straight from Caddy instead.

When it's served from an instance, the sign-in screen suggests that instance. To suggest a different one, set `VITE_DEFAULT_INSTANCE` when building. People can still sign in anywhere, because every instance accepts requests from other origins.

## License

MIT. See [LICENSE-MIT](../../LICENSE-MIT).
