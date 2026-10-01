// /invite/<code> on this host becomes jolt://invite/<host>/<code>, which the desktop app handles.
const code = location.pathname.split('/').filter(Boolean).pop();
if (code && /^[A-Za-z0-9]{4,32}$/.test(code)) {
  const link = `jolt://invite/${location.host}/${code}`;
  document.getElementById('open').href = link;
  document.getElementById('code').textContent = `Invite code ${code} · ${location.host}`;
  location.href = link;
}
