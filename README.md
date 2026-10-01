# Jolt

Jolt is open source chat that feels like Discord, except nobody owns it. You can use the main instance at [joltapp.org](https://joltapp.org) or run your own, and either way you can talk to everyone else. One account works on every Jolt instance.

Right now Jolt does text chat: servers, channels and categories, roles and permissions, invites, replies, mentions, markdown, typing indicators, presence, unread tracking and moderation. Voice, video and end to end encryption are next.

## Where things live

This repository ties the whole project together for development. Each part lives in its own repository and is pulled in here as a git submodule, so clone with `--recurse-submodules` (or run `git submodule update --init` in an existing clone).

The [protocol](packages/protocol) defines the wire format, permissions and federation handshake. It's on npm as `@getjolt/protocol` and on GitHub at [GetJolt/protocol](https://github.com/GetJolt/protocol).

The [SDK](packages/sdk) is what you use to build a client. The desktop app is built on it, and so can yours be. It's on npm as `@getjolt/sdk` and on GitHub at [GetJolt/sdk](https://github.com/GetJolt/sdk).

The [server](packages/server) runs an instance. If you want to host one, start with its README or [GetJolt/server](https://github.com/GetJolt/server).

The [desktop app](apps/desktop) is on GitHub at [GetJolt/DesktopClient](https://github.com/GetJolt/DesktopClient). The [website](apps/site) only lives here.

## Working on it

You'll need Node 22.12 or newer and pnpm.

```sh
pnpm install
pnpm build          # the protocol and SDK need building before anything can use them
pnpm dev:server     # an instance on localhost:4000
pnpm dev:desktop    # the desktop app, with hot reload
```

Before sending a change, run `pnpm lint && pnpm typecheck && pnpm test`. The server tests start real instances, including a pair that federate with each other, so they catch most things.

Inside this repository the packages are linked to each other, so a change to the protocol shows up in the server and desktop app straight away. Each package still declares its dependencies by version, which is what lets its own repository build on its own from npm.

A change to a package is committed in that package's folder and pushed to its repository. Then commit the folder here as well, which moves the submodule pointer along, otherwise CI here keeps testing the old version.

## Releasing

Packages have to go out in dependency order, because the split repositories install each other from npm. Bump the version and changelog in the protocol first, then the SDK, then the server.

Publishing a GitHub release in the protocol or SDK repository publishes that version to npm, and a release in the server repository builds the Docker image at `ghcr.io/getjolt/server`.

Desktop installers for Windows and Linux are built by the Desktop release workflow, because each one has to be built on its own platform. The desktop README covers installers and updates.

## Running joltapp.org

The [docker](docker) folder is the setup for the main instance, which serves the website alongside the server from one Caddy. Self hosters don't need it. The server repository has a simpler compose file for that.

## Accessibility

Jolt aims for WCAG 2.2 AA. Everything works from the keyboard: F6 moves between regions, arrow keys move through lists and messages, Ctrl+K jumps anywhere and Ctrl+? shows every shortcut. Screen readers get proper landmarks and announcements, there are dark, light and high contrast themes, and nothing relies on colour alone.

## License

The server is [AGPL-3.0](LICENSE). The protocol, SDK, desktop app and website are [MIT](LICENSE-MIT), so you're free to build on them.
