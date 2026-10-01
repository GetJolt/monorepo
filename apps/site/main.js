// Picks the right download for the visitor, resolves the newest installer names from the update feed
// (latest.yml and friends, written by electron-builder next to the installers in /download), and runs the
// little federation schematic on the cover.

document.documentElement.classList.add('js');
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const FEEDS = {
  windows: { feed: 'latest.yml', match: /\.exe$/, label: 'Download for Windows' },
  mac: { feed: 'latest-mac.yml', match: /\.dmg$/, label: 'macOS is coming soon' },
  linux: { feed: 'latest-linux.yml', match: /\.AppImage$/, label: 'Download for Linux' },
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

/** Just enough YAML for electron-builder's feed: the version and the list of file urls. */
function parseFeed(text) {
  const version = /^version:\s*(.+)$/m.exec(text)?.[1]?.trim();
  const files = [...text.matchAll(/^\s*-\s*url:\s*(.+)$/gm)].map((m) => m[1].trim());
  return { version, files };
}

async function loadFeed(name) {
  try {
    const response = await fetch(`download/${name}`, { cache: 'no-cache' });
    return response.ok ? parseFeed(await response.text()) : null;
  } catch {
    return null;
  }
}

async function resolveDownloads() {
  const [windows, mac, linux] = await Promise.all(Object.values(FEEDS).map((f) => loadFeed(f.feed)));
  const feeds = { windows, mac, linux };
  const pick = (key) => feeds[key]?.files.find((f) => FEEDS[key].match.test(f));

  const links = { windows: pick('windows'), mac: pick('mac'), linux: pick('linux'), deb: null };
  // The .deb isn't in the update feed; it shares the AppImage's version.
  if (feeds.linux?.version) links.deb = `jolt_${feeds.linux.version}_amd64.deb`;

  for (const anchor of document.querySelectorAll('[data-file]')) {
    const file = links[anchor.dataset.file];
    if (file) anchor.href = `download/${encodeURIComponent(file)}`;
  }

  const version = windows?.version || mac?.version || linux?.version;
  if (version) {
    for (const line of document.querySelectorAll('[data-version-line]')) {
      line.textContent = `Version ${version} · Windows & Linux, macOS soon · Free and open source`;
    }
  }
  return links;
}

const platform = detectPlatform();
if (platform) {
  document.querySelector(`[data-platform="${platform}"]`)?.classList.add('is-current');
  const label = document.querySelector('[data-primary-label]');
  if (label) label.textContent = FEEDS[platform].label;
}

resolveDownloads().then((links) => {
  const primary = document.querySelector('[data-primary-download]');
  if (primary && platform && links[platform])
    primary.href = `download/${encodeURIComponent(links[platform])}`;
});

// Let the highlighter swipe draw in once fonts have settled.
document.fonts.ready.then(() =>
  requestAnimationFrame(() => document.documentElement.classList.add('is-loaded')),
);

// Fade chapters in as they scroll into view.
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
  const targets =
    '.chapter__head, .ledger-wrap, .anatomy, .steps, .manifesto, .datasheet, .listing-wrap, .parts';
  for (const el of document.querySelectorAll(targets)) {
    el.classList.add('reveal');
    observer.observe(el);
  }
}

/* The schematic: messages travel along traces between instances, and a line of chat pops up on arrival. */
const map = document.querySelector('[data-grid-map]');
if (map && !reducedMotion) {
  const NS = 'http://www.w3.org/2000/svg';
  const pulses = map.querySelector('[data-pulses]');
  const bubbles = map.querySelector('[data-bubbles]');
  const node = (name) => map.querySelector(`[data-node="${name}"]`);

  // Each trace joins two instances; `from` is the start of the path.
  const routes = [
    { path: 't-home', from: 'home', to: 'hub' },
    { path: 't-studio', from: 'studio', to: 'hub' },
    { path: 't-cafe', from: 'cafe', to: 'hub' },
    { path: 't-lab', from: 'lab', to: 'hub' },
    { path: 't-direct', from: 'home', to: 'studio' },
  ];
  const lines = {
    home: ['bob: pushed the fix ⚡', 'bob: anyone around?', 'bob: brb, coffee'],
    studio: ['mira: new mockups up', 'mira: love this palette', 'mira: shipping friday'],
    hub: ['alice: standup in 5', 'alice: welcome, everyone!', 'alice: invite sent'],
    cafe: ['kai: gg, rematch?', 'kai: raid at 9', 'kai: who has the map'],
    lab: ['dr.osei: results are in', 'dr.osei: seminar moved', 'dr.osei: great question'],
  };
  const anchors = {
    home: [24, 58],
    studio: [404, 58],
    hub: [196, 206],
    cafe: [24, 380],
    lab: [404, 380],
  };

  function showBubble(target) {
    const text = lines[target][Math.floor(Math.random() * lines[target].length)];
    const [x, y] = anchors[target];
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('class', 'bubble');
    const label = document.createElementNS(NS, 'text');
    label.textContent = text;
    label.setAttribute('x', String(x + 10));
    label.setAttribute('y', String(y - 9));
    const box = document.createElementNS(NS, 'rect');
    box.setAttribute('x', String(x));
    box.setAttribute('y', String(y - 24));
    box.setAttribute('height', '22');
    box.setAttribute('rx', '6');
    g.append(box, label);
    bubbles.append(g);
    box.setAttribute('width', String(label.getComputedTextLength() + 20));
    setTimeout(() => g.remove(), 2700);
  }

  function send() {
    const route = routes[Math.floor(Math.random() * routes.length)];
    const forward = Math.random() > 0.5;
    const path = map.querySelector(`#${route.path}`);
    const length = path.getTotalLength();
    const target = forward ? route.to : route.from;
    const dot = document.createElementNS(NS, 'circle');
    dot.setAttribute('r', '5');
    dot.setAttribute('class', 'pulse');
    pulses.append(dot);

    const duration = 500 + length * 3.2;
    const start = performance.now();
    function frame(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2;
      const point = path.getPointAtLength((forward ? eased : 1 - eased) * length);
      dot.setAttribute('cx', String(point.x));
      dot.setAttribute('cy', String(point.y));
      if (t < 1) return requestAnimationFrame(frame);
      dot.remove();
      const hit = node(target);
      hit.classList.add('is-hit');
      setTimeout(() => hit.classList.remove('is-hit'), 500);
      if (Math.random() > 0.35) showBubble(target);
    }
    requestAnimationFrame(frame);
  }

  let timer = null;
  const run = () => {
    if (timer) return;
    send();
    timer = setInterval(send, 1100);
  };
  const stop = () => {
    clearInterval(timer);
    timer = null;
  };
  // Only animate while the schematic is on screen and the tab is visible.
  new IntersectionObserver(([entry]) => (entry.isIntersecting ? run() : stop())).observe(map);
  document.addEventListener('visibilitychange', () => (document.hidden ? stop() : run()));
}
