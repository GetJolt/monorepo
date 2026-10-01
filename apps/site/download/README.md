# Downloads

Release builds go here. Download the artifacts from the Desktop release workflow (or run
`pnpm --filter @getjolt/desktop release` on each platform) and copy the installers plus `latest.yml` and
`latest-linux.yml` into this folder, then deploy. The site reads the `latest*.yml` files to link to the
newest installers, and the desktop app uses the same files to update itself.
