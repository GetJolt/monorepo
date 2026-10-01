# joltapp.org

The website for Jolt, where people find out what it is and download the app. It's plain HTML, CSS and a little JavaScript with no build step, and the fonts are hosted alongside it so nothing loads from anyone else's servers.

## Previewing

```sh
node serve.mjs        # http://localhost:8080
```

`serve.mjs` is a tiny static server that also handles `/invite/...` links the same way production does.

## Downloads

The download buttons ask GitHub for the newest `desktop-v*` release of [GetJolt/monorepo](https://github.com/GetJolt/monorepo/releases) and link straight to its installers, so there's nothing to copy here when a version ships. If GitHub can't be reached, or nothing has been released yet, the buttons open the releases page instead. macOS is marked as coming soon for now. When Mac builds arrive, swap that row back to a download link and add `.dmg` to the release.

## Invite links

When someone opens an invite like `https://joltapp.org/invite/abc123` without the app, they get `invite.html`. It tries to open the invite in the desktop app straight away and offers a download if they don't have it yet.

## In production

The site is served by Caddy from the [docker](../../docker) setup, on the same domain as the main instance. Caddy sends API and gateway traffic to the server and everything else here.

## License

MIT. See [LICENSE-MIT](../../LICENSE-MIT).
