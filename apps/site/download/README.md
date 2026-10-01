# Downloads

Release builds go here. After `pnpm --filter @getjolt/desktop release`, copy everything from
`apps/desktop/release/` (installers plus `latest.yml`, `latest-mac.yml`, `latest-linux.yml`) into this
folder and deploy. The site reads the `latest*.yml` files to link to the newest installers, and the desktop
app uses the same files to update itself.
