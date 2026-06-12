const colorThemes = {
  blush: '',
  lavender: 'theme-lavender',
  mint: 'theme-mint',
  peach: 'theme-peach',
  sky: 'theme-sky',
};

const screens = {
  landing: document.getElementById('landing'),
  letterView: document.getElementById('letterView'),
  hub: document.getElementById('hub'),
  flowers: document.getElementById('flowers'),
  cute: document.getElementById('cute'),
  video: document.getElementById('video'),
};

const introScreen = document.getElementById('intro');
const introLoader = document.getElementById('introLoader');
const openEnvelope = document.getElementById('openEnvelope');
const replayLetter = document.getElementById('replayLetter');
const closeLetter = document.getElementById('closeLetter');
const continueBtn = document.getElementById('continueBtn');
const hubHeartBtn = document.getElementById('hubHeartBtn');
const hubNav = document.getElementById('hubNav');
const hubPressZone = document.getElementById('hubPressZone');
const toast = document.getElementById('toast');

let hubUnlocked = false;
let flowerIndex = 0;
let bouquetCount = 0;

/* ===== Starfield ===== */
function createStarfield() {
  const layers = [
    { id: 'stars', count: 180, maxSize: 1, colors: ['#ffffff', '#ffe4f0', '#f0e6ff'] },
    { id: 'stars2', count: 90, maxSize: 2, colors: ['#ffffff', '#ffc8dd', '#cdb4db'] },
    { id: 'stars3', count: 45, maxSize: 3, colors: ['#ffffff', '#ffafcc', '#bde0fe'] },
  ];

  layers.forEach(({ id, count, maxSize, colors }) => {
    const el = document.getElementById(id);
    if (!el) return;

    const shadows = [];
    for (let i = 0; i < count; i++) {
      const x = Math.floor(Math.random() * 2000);
      const y = Math.floor(Math.random() * 2000);
      const color = colors[Math.floor(Math.random() * colors.length)];
      shadows.push(`${x}px ${y}px ${color}`);
    }

    const shadowValue = shadows.join(', ');
    el.style.setProperty('--star-shadow', shadowValue);
    el.style.boxShadow = shadowValue;
    el.style.width = `${maxSize}px`;
    el.style.height = `${maxSize}px`;
  });
}

/* ===== Intro loader ===== */
function buildIntroLoader(text) {
  introLoader.innerHTML = '';
  text.split('').forEach((char, i) => {
    const span = document.createElement('span');
    span.className = 'letter';
    span.textContent = char === ' ' ? '\u00a0' : char;
    span.style.animationDelay = `${i * 70}ms`;
    if (char === ' ') span.classList.add('space');
    introLoader.appendChild(span);
  });
}

function runIntro() {
  buildIntroLoader(LETTER.intro.text);
  setTimeout(() => {
    introScreen.classList.add('fade-out');
    screens.landing.classList.add('active', 'entered');
    setTimeout(() => introScreen.remove(), 800);
  }, LETTER.intro.duration);
}

/* ===== Hearts & particles ===== */
function createHearts() {
  const container = document.querySelector('.hearts-bg');
  const hearts = ['♥', '♡', '💕', '✿', '❀', '🌸'];
  for (let i = 0; i < 16; i++) {
    const heart = document.createElement('span');
    heart.className = 'heart-particle';
    heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
    heart.style.left = `${Math.random() * 100}%`;
    heart.style.animationDuration = `${12 + Math.random() * 18}s`;
    heart.style.animationDelay = `${Math.random() * 10}s`;
    heart.style.fontSize = `${0.8 + Math.random() * 1.2}rem`;
    container.appendChild(heart);
  }
}

function spawnClickHeart(x, y) {
  const el = document.createElement('span');
  el.className = 'click-heart';
  el.textContent = ['♥', '💕', '✨', '🌸'][Math.floor(Math.random() * 4)];
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  document.getElementById('clickHearts').appendChild(el);
  setTimeout(() => el.remove(), 1200);
}

function showToast(message, duration = 2800) {
  toast.textContent = message;
  toast.classList.remove('hidden');
  toast.classList.add('show');
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => toast.classList.add('hidden'), 300);
  }, duration);
}

/* ===== Navigation ===== */
function showScreen(name) {
  Object.entries(screens).forEach(([key, screen]) => {
    screen.classList.remove('active', 'exit', 'entered');
  });
  const screen = screens[name];
  if (screen) {
    screen.classList.add('active', 'entered');
    screen.scrollTop = 0;
  }
}

function transitionTo(from, to, callback) {
  if (!screens[from] || !screens[to]) return;
  screens[from].classList.add('exit');
  screens[from].classList.remove('active');
  setTimeout(() => {
    screens[from].classList.remove('exit');
    showScreen(to);
    if (callback) callback();
  }, 500);
}

function setupNavigation() {
  document.querySelectorAll('[data-go]').forEach((el) => {
    el.addEventListener('click', () => {
      const target = el.dataset.go;
      const current = Object.entries(screens).find(([, s]) => s.classList.contains('active'))?.[0];
      if (current && screens[target]) transitionTo(current, target);
    });
  });
}

/* ===== Config ===== */
function applyColorTheme(color) {
  document.body.classList.remove('theme-lavender', 'theme-mint', 'theme-peach', 'theme-sky');
  const theme = colorThemes[color];
  if (theme) document.body.classList.add(theme);
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function setupFromConfig() {
  document.title = LETTER.pageTitle;

  document.getElementById('landingEyebrow').textContent = LETTER.landing.eyebrow;
  document.getElementById('landingTitle').textContent = LETTER.landing.title;
  document.getElementById('landingHighlight').textContent = LETTER.landing.highlight;
  document.getElementById('landingSubtitle').textContent = LETTER.landing.subtitle;

  document.getElementById('recipientName').textContent = LETTER.to;
  document.getElementById('signOff').textContent = LETTER.signOff;
  document.getElementById('senderName').textContent = LETTER.from || '—';

  document.getElementById('letterBody').innerHTML = LETTER.message
    .map((p, i) => `<p style="animation-delay: ${0.5 + i * 0.3}s">${escapeHtml(p)}</p>`)
    .join('');

  document.getElementById('hubEyebrow').textContent = LETTER.hub.eyebrow;
  document.getElementById('hubTitle').textContent = LETTER.hub.title;
  document.getElementById('hubHighlight').textContent = LETTER.hub.highlight;
  document.getElementById('hubSubtitle').textContent = LETTER.hub.subtitle;
  hubHeartBtn.textContent = LETTER.hub.pressLabel;
  document.getElementById('pressHint').textContent = 'press me';

  document.getElementById('flowersTitle').textContent = LETTER.flowers.title;
  document.getElementById('flowersHighlight').textContent = LETTER.flowers.highlight;
  document.getElementById('flowersSubtitle').textContent = LETTER.flowers.subtitle;
  document.getElementById('bouquetLabel').textContent = LETTER.flowers.bouquetLabel;

  document.getElementById('videoTitle').textContent = LETTER.youtube.title;
  document.getElementById('videoCaption').textContent = LETTER.youtube.caption;

  applyColorTheme(LETTER.envelopeColor);
  buildFlowerMeadow();
  buildCuteGrid();
  setupYoutube();
}

/* ===== Letter ===== */
function openEnvelopeAnimation() {
  openEnvelope.classList.add('opening');
  burstConfetti(openEnvelope.getBoundingClientRect());
  setTimeout(() => {
    transitionTo('landing', 'letterView', () => {
      const stack = document.querySelector('.letter-stack');
      stack.classList.remove('revealed');
      stack.offsetHeight;
      stack.classList.add('revealed');
    });
  }, 1400);
}

function resetEnvelope() {
  openEnvelope.classList.remove('opening');
  document.querySelector('.letter-stack')?.classList.remove('revealed');
}

function replayLetterAnimation() {
  const stack = document.querySelector('.letter-stack');
  stack.classList.remove('revealed');
  stack.offsetHeight;
  stack.classList.add('revealed');
  document.querySelectorAll('.letter-body p').forEach((p) => {
    p.style.animation = 'none';
    p.offsetHeight;
    p.style.animation = '';
  });
}

/* ===== Hub 3D heart (uiverse: chintu_2484/fat-moose-56) ===== */
function unlockHub() {
  const rect = hubHeartBtn.getBoundingClientRect();
  hubHeartBtn.classList.add('pressed');
  setTimeout(() => hubHeartBtn.classList.remove('pressed'), 150);

  burstConfetti(rect, hubUnlocked ? 18 : 45);
  spawnClickHeart(rect.left + rect.width / 2, rect.top);

  if (hubUnlocked) {
    showToast('I still like you. A lot. ♥', 2200);
    return;
  }

  hubUnlocked = true;
  showToast('I like you so much… you\'ll know it ♥', 3500);

  setTimeout(() => {
    hubPressZone.classList.add('unlocked');
    hubNav.classList.remove('hidden');
    hubNav.classList.add('animate-pop');
  }, 400);
}

/* ===== Virtual flowers ===== */
function buildFlowerMeadow() {
  const meadow = document.getElementById('flowerMeadow');
  meadow.innerHTML = '';
  for (let i = 0; i < 12; i++) {
    const plot = document.createElement('button');
    plot.type = 'button';
    plot.className = 'flower-plot';
    plot.setAttribute('aria-label', 'Plant a flower');
    plot.innerHTML = '<span class="soil"></span><span class="flower-bloom"></span>';
    plot.addEventListener('click', () => handlePlotClick(plot));
    meadow.appendChild(plot);
  }
}

function handlePlotClick(plot) {
  const bloom = plot.querySelector('.flower-bloom');

  if (!plot.classList.contains('planted')) {
    const type = LETTER.flowers.types[flowerIndex % LETTER.flowers.types.length];
    flowerIndex++;
    bloom.textContent = type;
    plot.classList.add('planted', 'growing');
    spawnClickHeart(
      plot.getBoundingClientRect().left + plot.offsetWidth / 2,
      plot.getBoundingClientRect().top
    );
    setTimeout(() => plot.classList.remove('growing'), 800);
    return;
  }

  if (plot.classList.contains('picked')) return;

  const flower = bloom.textContent;
  plot.classList.add('picked');
  bloom.classList.add('flying');

  const bouquet = document.getElementById('bouquet');
  const petal = document.createElement('span');
  petal.className = 'bouquet-flower';
  petal.textContent = flower;
  bouquet.appendChild(petal);
  bouquetCount++;
  document.getElementById('bouquetCount').textContent = bouquetCount;

  setTimeout(() => {
    bloom.textContent = '';
    plot.classList.remove('planted', 'picked');
    bloom.classList.remove('flying');
  }, 600);

  if (bouquetCount === 1) showToast('A bouquet, just for you 🌸');
  if (bouquetCount >= 5) showToast('This garden is all yours ♥');
}

/* ===== Cute grid ===== */
function buildCuteGrid() {
  const grid = document.getElementById('cuteGrid');
  grid.innerHTML = '';
  LETTER.cuteThings.forEach((item, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cute-item';
    btn.style.animationDelay = `${i * 0.06}s`;
    btn.innerHTML = `<span class="cute-emoji">${item.emoji}</span><span class="cute-label">${item.label}</span>`;
    btn.addEventListener('click', () => revealCute(item, btn));
    grid.appendChild(btn);
  });
}

function revealCute(item, btn) {
  btn.classList.add('tapped');
  setTimeout(() => btn.classList.remove('tapped'), 500);

  document.getElementById('cuteRevealEmoji').textContent = item.emoji;
  document.getElementById('cuteRevealText').textContent = item.text;
  document.getElementById('cuteReveal').classList.add('visible');

  const rect = btn.getBoundingClientRect();
  spawnClickHeart(rect.left + rect.width / 2, rect.top);
  burstConfetti(rect, 20);
}

/* ===== YouTube ===== */
function setupYoutube() {
  const wrap = document.getElementById('videoWrap');
  const placeholder = document.getElementById('videoPlaceholder');
  const id = LETTER.youtube.videoId?.trim();

  if (!id) return;

  placeholder.remove();
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.youtube.com/embed/${id}?rel=0`;
  iframe.title = LETTER.youtube.title;
  iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
  iframe.allowFullscreen = true;
  wrap.appendChild(iframe);
}

/* ===== Confetti ===== */
function burstConfetti(rect, count = 40) {
  const colors = ['#ffc8dd', '#cdb4db', '#bde0fe', '#ffd6a5', '#ffafcc', '#a2d2ff'];
  const centerX = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const centerY = rect ? rect.top + rect.height / 2 : window.innerHeight / 2;

  for (let i = 0; i < count; i++) {
    const confetti = document.createElement('div');
    confetti.className = 'confetti';
    confetti.style.left = `${centerX + (Math.random() - 0.5) * 100}px`;
    confetti.style.top = `${centerY}px`;
    confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
    confetti.style.borderRadius = Math.random() > 0.5 ? '50%' : '2px';
    confetti.style.width = `${6 + Math.random() * 8}px`;
    confetti.style.height = confetti.style.width;
    confetti.style.animationDuration = `${1.5 + Math.random() * 1.5}s`;
    document.body.appendChild(confetti);
    setTimeout(() => confetti.remove(), 3000);
  }
}

/* ===== Events ===== */
openEnvelope.addEventListener('click', openEnvelopeAnimation);
replayLetter.addEventListener('click', replayLetterAnimation);
closeLetter.addEventListener('click', () => transitionTo('letterView', 'landing', resetEnvelope));
continueBtn.addEventListener('click', () => transitionTo('letterView', 'hub'));
hubHeartBtn.addEventListener('click', unlockHub);

document.addEventListener('click', (e) => {
  const interactive = e.target.closest('button, a, .flower-plot, .cute-item, .envelope, iframe');
  const onInteractiveScreen = ['hub', 'flowers', 'cute', 'video', 'letterView'].some(
    (name) => screens[name]?.classList.contains('active')
  );
  if (!interactive && onInteractiveScreen && hubUnlocked) {
    spawnClickHeart(e.clientX, e.clientY);
  }
});

/* ===== Init ===== */
createStarfield();
createHearts();
setupFromConfig();
setupNavigation();
runIntro();
