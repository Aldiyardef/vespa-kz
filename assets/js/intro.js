(function () {
  const section = document.getElementById('intro-video');
  const video = document.querySelector('[data-intro-video]');
  const loader = document.getElementById('intro-loader');
  const bar = loader && loader.querySelector('.intro-loader__bar');
  const percent = document.getElementById('intro-loader-percent');
  if (!section || !video) return;

  let duration = 0;
  let targetTime = 0;
  let seeking = false;
  let ready = false;

  document.documentElement.classList.add('intro-locked');
  document.body.classList.add('intro-locked');

  function progress(value) {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    if (bar) bar.style.width = safe + '%';
    if (percent) percent.textContent = safe + '%';
  }

  function hideLoader() {
    if (!loader) {
      document.documentElement.classList.remove('intro-locked');
      document.body.classList.remove('intro-locked');
      return;
    }
    loader.classList.add('is-hidden');
    setTimeout(function () {
      loader.setAttribute('hidden', '');
      document.documentElement.classList.remove('intro-locked');
      document.body.classList.remove('intro-locked');
    }, 700);
  }

  function seekLoop() {
    if (!ready || seeking) return;
    const t = Math.min(Math.max(targetTime, 0), Math.max(duration - 0.05, 0));
    if (Math.abs(video.currentTime - t) < 0.01) return;
    seeking = true;
    try { video.currentTime = t; } catch (e) { seeking = false; }
  }

  function update() {
    if (!ready) return;
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const value = Math.min(Math.max(-rect.top / scrollable, 0), 1);
    targetTime = value * duration;
    seekLoop();
  }

  video.addEventListener('seeked', function () {
    seeking = false;
    seekLoop();
  });

  function finish() {
    if (ready) return;
    duration = video.duration;
    if (!isFinite(duration) || duration <= 0) return;
    ready = true;
    section.classList.add('is-ready');
    progress(100);
    video.play().then(function () {
      video.pause();
      video.currentTime = 0;
      hideLoader();
      update();
    }).catch(function () {
      video.pause();
      hideLoader();
      update();
    });
  }

  function fallback() {
    video.removeAttribute('src');
    video.preload = 'auto';
    video.load();
    const timer = setTimeout(finish, 15000);
    video.addEventListener('canplaythrough', function onCanPlay() {
      clearTimeout(timer);
      finish();
    }, { once: true });
    video.addEventListener('loadedmetadata', finish, { once: true });
  }

  async function loadVideo() {
    const sources = Array.from(video.querySelectorAll('source'));
    const desktop = sources.find(function (source) {
      return !source.media || !source.media.includes('max-width');
    });
    const mobile = sources.find(function (source) {
      return source.media && source.media.includes('max-width: 768px');
    });
    let source = desktop;
    if (mobile && window.matchMedia('(max-width: 768px)').matches) {
      try {
        const check = await fetch(mobile.src, { method: 'HEAD', cache: 'no-store' });
        if (check.ok) source = mobile;
      } catch (e) {}
    }
    if (!source) return fallback();

    try {
      const response = await fetch(source.src);
      if (!response.ok || !response.body) throw new Error('video fetch failed');
      const total = Number(response.headers.get('Content-Length')) || 0;
      const reader = response.body.getReader();
      const chunks = [];
      let loaded = 0;
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        chunks.push(part.value);
        loaded += part.value.byteLength;
        if (total) progress(loaded / total * 100);
      }
      video.src = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      video.load();
      video.addEventListener('loadedmetadata', finish, { once: true });
      video.addEventListener('canplaythrough', finish, { once: true });
      setTimeout(function () {
        if (!ready) fallback();
      }, 15000);
    } catch (e) {
      fallback();
    }
  }

  loadVideo();

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', update);
})();
/* ===== Скраб второго видео по скроллу секции ===== */
(function () {
  const section = document.querySelector('[data-scroll-video]');
  if (!section) return;

  const video = section.querySelector('.scroll-video__media');
  const caption = section.querySelector('.scroll-video__caption');
  if (!video) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) {
    if (caption) caption.classList.add('is-visible');
    return;
  }

  let duration = 0;
  let targetTime = 0;
  let seeking = false;
  let ticking = false;

  function onMeta() {
    duration = video.duration || 0;
    // прогрев декодера: показать первый кадр
    try { video.currentTime = 0.001; } catch (e) {}
  }

  if (video.readyState >= 1) {
    onMeta();
  } else {
    video.addEventListener('loadedmetadata', onMeta, { once: true });
  }

  video.addEventListener('seeked', function () {
    seeking = false;
    flush();
  });

  function flush() {
    if (seeking || !duration) return;
    const t = Math.min(Math.max(targetTime, 0), duration - 0.05);
    if (Math.abs(video.currentTime - t) < 0.02) return;
    seeking = true;
    try { video.currentTime = t; } catch (e) { seeking = false; }
  }

  function update() {
    ticking = false;
    if (!duration) return;
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    let progress = -rect.top / scrollable;
    progress = Math.min(Math.max(progress, 0), 1);
    targetTime = progress * duration;
    flush();
    if (caption) caption.classList.toggle('is-visible', progress > 0.15 && progress < 0.85);
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  if (window.requestIdleCallback) {
    requestIdleCallback(function () { video.preload = 'auto'; video.load(); }, { timeout: 3000 });
  } else {
    window.addEventListener('load', function () {
      setTimeout(function () { video.preload = 'auto'; video.load(); }, 1200);
    });
  }
  onScroll();
})();
