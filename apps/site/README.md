# joltapp.org

The website for Jolt, where people find out what it is and download the app. It's plain HTML, CSS and a little JavaScript with no build step, and the fonts are hosted alongside it so nothing loads from anyone else's servers.

## Previewing

```sh
node serve.mjs        # http://localhost:8080
```

`serve.mjs` is a tiny static server that also handles `/invite/...` links the same way production does.

## Downloads

The download buttons read `download/latest.yml` and `latest-linux.yml` to find the newest installers, so publishing a release means copying the files from the Desktop release workflow (or the desktop app's `release/` folder) into `download/`. macOS is marked as coming soon for now. When Mac builds arrive, swap that row back to a download link and the site will pick up `latest-mac.yml` too. The desktop app reads the same files to update itself.

## Invite links

When someone opens an invite like `https://joltapp.org/invite/abc123` without the app, they get `invite.html`. It tries to open the invite in the desktop app straight away and offers a download if they don't have it yet.

## In production

The site is served by Caddy from the [docker](../../docker) setup, on the same domain as the main instance. Caddy sends API and gateway traffic to the server and everything else here, and it makes sure the update files are never cached.

## License

MIT. See [LICENSE-MIT](../../LICENSE-MIT).
