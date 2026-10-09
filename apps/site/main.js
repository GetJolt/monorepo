// Picks the right download for the visitor, finds the newest installers on the GitHub releases page, and runs
// the little animated app in the hero.

document.documentElement.classList.add('js');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const REPO = 'GetJolt/monorepo';
const RELEASES_PAGE = `https://github.com/${REPO}/releases/latest`;

const PLATFORMS = {
  windows: { match: /\.exe$/i, label: 'Download for Windows' },
  mac: { match: /\.dmg$/i, label: 'macOS is coming soon' },
  linux: { match: /\.AppImage$/i, label: 'Download for Linux' },
  deb: { match: /\.deb$/i },
};

function detectPlatform() {
  const platform = (
    navigator.userAgentData?.platform ||
    navigator.platform ||
    navigator.userAgent
  ).toLowerCase();
  if (platform.includes('win')) return 'windows';
  if (platform.includes('mac')) return 'mac';
  if (platform.includes('linux') || platform.includes('x11')) return 'linux';
  return null;
}

/**
 * The newest published desktop release. Other tags in the repository are skipped, and the answer is kept for a
 * few minutes because GitHub only allows 60 unauthenticated API calls an hour per visitor.
 */
async function latestRelease() {
  const cacheKey = 'jolt:release';
  try {
    const cached = JSON.parse(sessionStorage.getItem(cacheKey) ?? 'null');
    if (cached && Date.now() - cached.at < 10 * 60_000) return cached.release;
  } catch {
    // Storage can be unavailable; just ask GitHub.
  }
  try {
    const response = await fetch(`https://api.github.com/repos/${REPO}/releases?per_page=20`, {
      headers: { accept: 'application/vnd.github+json' },
    });
    if (!response.ok) return null;
    const releases = await response.json();
    const found = releases.find((r) => !r.draft && !r.prerelease && r.tag_name.startsWith('desktop-v'));
    const release = found
      ? {
          version: found.tag_name.replace(/^desktop-v/, ''),
          assets: found.assets.map((a) => [a.name, a.browser_download_url]),
        }
      : null;
    try {
      sessionStorage.setItem(cacheKey, JSON.stringify({ at: Date.now(), release }));
    } catch {
      // Not worth failing over.
    }
    return release;
  } catch {
    return null;
  }
}

async function resolveDownloads() {
  const release = await latestRelease();
  const links = {};
  for (const [key, { match }] of Object.entries(PLATFORMS)) {
    links[key] = release?.assets.find(([name]) => match.test(name))?.[1] ?? null;
  }

  // Without a release to point at, every button still leads somewhere useful.
  for (const anchor of document.querySelectorAll('[data-file]')) {
    anchor.href = links[anchor.dataset.file] ?? RELEASES_PAGE;
  }

  if (release) {
    for (const line of document.querySelectorAll('[data-version-line]')) {
      line.textContent = `Version ${release.version}. Free, and it keeps itself up to date.`;
    }
    const tag = document.querySelector('[data-version-tag]');
    if (tag) tag.textContent = `v${release.version} · early days`;
  }
  return links;
}

const platform = detectPlatform();
if (platform) {
  document.querySelector(`[data-platform="${platform}"]`)?.classList.add('is-current');
  const label = document.querySelector('[data-primary-label]');
  if (label) label.textContent = PLATFORMS[platform].label;
}

resolveDownloads().then((links) => {
  const primary = document.querySelector('[data-primary-download]');
  if (primary && platform && links[platform]) primary.href = links[platform];
});

// Let the marker swipe draw in once fonts have settled.
document.fonts.ready.then(() =>
  requestAnimationFrame(() => document.documentElement.classList.add('is-loaded')),
);

// Fade sections in as they scroll into view.
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px' },
  );
  const targets = '.section__head, .shot, .split, .steps, .note, .downloads';
  for (const el of document.querySelectorAll(targets)) {
    el.classList.add('reveal');
    observer.observe(el);
  }
}

/* Visit three communities hosted in different places, and post a reply in each from the same account. */
const mini = document.querySelector('[data-mini]');
if (mini) {
  const servers = [...mini.querySelectorAll('[data-server]')];
  const views = [...mini.querySelectorAll('[data-view]')];
  const field = (name) => mini.querySelector(`[data-${name}]`);
  const composer = mini.querySelector('.mini__composer');
  const draft = mini.querySelector('[data-draft]');
  const communities = [
    { name: 'Weekend Hikers', host: 'hosted on joltapp.org', channel: 'trail-talk' },
    { name: 'Northwind Studio', host: 'hosted by the studio', channel: 'design' },
    { name: 'Family', host: 'hosted on a PC at home', channel: 'sunday-lunch' },
  ];
  let current = 0;
  let timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));

  function show(index) {
    current = index;
    const { name, host, channel } = communities[index];
    servers.forEach((s, i) => s.classList.toggle('is-on', i === index));
    views.forEach((v, i) => v.classList.toggle('is-on', i === index));
    views[index].classList.remove('is-sent');
    field('name').textContent = name;
    field('channel').textContent = channel;
    field('host').textContent = host;
    draft.textContent = `Message #${channel}`;
  }

  function play(index) {
    timers = [];
    show(index);
    const reply = views[index].querySelector('.msg--late .msg__text').textContent;
    const start = 1100;
    const perChar = 38;
    later(() => {
      composer.classList.add('is-typing');
      draft.textContent = '';
    }, start);
    for (let i = 1; i <= reply.length; i++)
      later(() => (draft.textContent = reply.slice(0, i)), start + i * perChar);
    const sent = start + reply.length * perChar + 450;
    later(() => {
      composer.classList.remove('is-typing');
      draft.textContent = `Message #${communities[index].channel}`;
      views[index].classList.add('is-sent');
    }, sent);
    later(() => play((index + 1) % views.length), sent + 3200);
  }

  const settle = () => {
    timers.forEach(clearTimeout);
    timers = [];
    composer.classList.remove('is-typing');
    show(current);
    views[current].classList.add('is-sent');
  };

  if (reducedMotion) {
    settle();
  } else {
    let running = false;
    const run = () => !running && ((running = true), play(current));
    const stop = () => running && ((running = false), settle());
    // Only animate while the figure is on screen and the tab is visible.
    new IntersectionObserver(([entry]) => (entry.isIntersecting ? run() : stop())).observe(mini);
    document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()));
  }
}
