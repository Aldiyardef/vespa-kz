/* Прелоадер первого видео и синхронизация скраб-видео с прокруткой. */
(function () {
  const section = document.getElementById('intro-video');
  const video = document.querySelector('[data-intro-video]');
  const loader = document.getElementById('intro-loader');
  const bar = loader && loader.querySelector('.intro-loader__bar');
  const percent = document.getElementById('intro-loader-percent');
  const hint = document.getElementById('intro-loader-hint');
  if (!section || !video) return;

  const LOAD_TIMEOUT = 30000;
  let duration = 0;
  let targetTime = 0;
  let seeking = false;
  let ready = false;
  let loaderHidden = false;

  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';
  document.documentElement.classList.add('intro-locked');
  document.body.classList.add('intro-locked');

  function progress(value) {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    if (bar) bar.style.width = safe + '%';
    if (percent) percent.textContent = safe + '%';
  }

  function unlock() {
    if (loaderHidden) return;
    loaderHidden = true;
    if (hint) hint.style.display = 'none';
    if (loader) {
      loader.classList.add('is-hidden');
      window.setTimeout(function () {
        loader.setAttribute('hidden', '');
        document.documentElement.classList.remove('intro-locked');
        document.body.classList.remove('intro-locked');
      }, 700);
    } else {
      document.documentElement.classList.remove('intro-locked');
      document.body.classList.remove('intro-locked');
    }
  }

  function seekLoop() {
    if (!ready || seeking || !duration) return;
    const t = Math.min(Math.max(targetTime, 0), Math.max(duration - 0.05, 0));
    if (Math.abs(video.currentTime - t) < 0.01) return;
    seeking = true;
    try { video.currentTime = t; } catch (error) { seeking = false; }
  }

  function update() {
    if (!ready || !duration) return;
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    targetTime = Math.min(Math.max(-rect.top / scrollable, 0), 1) * duration;
    seekLoop();
  }

  video.addEventListener('seeked', function () {
    seeking = false;
    seekLoop();
  });

  // Показать сайт, когда у браузера уже есть первый декодированный кадр.
  function onReady() {
    if (ready) return;
    ready = true;
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    section.classList.add('is-ready');
    progress(100);

    // Сначала пробуем стартовать уже загруженное беззвучное видео; только
    // после resolve/reject play() скрываем экран загрузки и открываем прокрутку.
    function finishIntro() {
      video.pause();
      try { video.currentTime = 0; } catch (error) { /* Источник мог завершиться. */ }
      unlock();
      update();
    }
    try {
      const playResult = video.play();
      if (playResult && typeof playResult.then === 'function') {
        playResult.then(finishIntro).catch(finishIntro);
      } else {
        finishIntro();
      }
    } catch (error) {
      finishIntro();
    }
  }

  function onError() {
    // Ошибка файла не должна навсегда блокировать прокрутку сайта.
    unlock();
  }

  video.addEventListener('loadeddata', onReady);
  video.addEventListener('canplay', onReady);
  video.addEventListener('error', onError);
  video.addEventListener('progress', function () {
    try {
      if (video.duration > 0 && video.buffered.length) {
        const buffered = video.buffered.end(video.buffered.length - 1);
        progress(100 * buffered / video.duration);
      }
    } catch (error) { /* Не все браузеры отдают buffered во время загрузки. */ }
  });

  function chooseSource() {
    const sources = Array.from(video.querySelectorAll('source'));
    const mobile = sources.find(function (source) {
      return source.media && source.media.includes('max-width: 768px');
    });
    const desktop = sources.find(function (source) {
      return !source.media || !source.media.includes('max-width');
    });
    return window.matchMedia('(max-width: 768px)').matches && mobile ? mobile.src : (desktop && desktop.src);
  }

  // Нативная загрузка позволяет браузеру декодировать видео напрямую, без
  // полного накопления файла в памяти и повторного назначения blob-URL.
  const source = chooseSource();
  if (source) {
    video.src = source;
    video.load();
  } else {
    onError();
  }

  const safetyTimer = window.setTimeout(function () {
    // Деградация без зависшего экрана; если кадра нет, сайт всё равно доступен.
    unlock();
  }, LOAD_TIMEOUT);

  video.addEventListener('loadeddata', function () { window.clearTimeout(safetyTimer); }, { once: true });
  video.addEventListener('error', function () { window.clearTimeout(safetyTimer); }, { once: true });

  let ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { update(); ticking = false; });
  }, { passive: true });
  window.addEventListener('resize', update);
})();

/* Скраб второго видео по прокрутке соответствующей секции. */
(function () {
  const section = document.querySelector('[data-scroll-video]');
  if (!section) return;
  const video = section.querySelector('.scroll-video__media');
  const caption = section.querySelector('.scroll-video__caption');
  if (!video) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    if (caption) caption.classList.add('is-visible');
    return;
  }

  let duration = 0;
  let targetTime = 0;
  let seeking = false;
  let ticking = false;

  function onMeta() {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (duration) {
      try { video.currentTime = 0.001; } catch (error) { /* Метаданные загружены позже. */ }
    }
  }
  if (video.readyState >= 1) onMeta();
  else video.addEventListener('loadedmetadata', onMeta, { once: true });

  function flush() {
    if (seeking || !duration) return;
    const t = Math.min(Math.max(targetTime, 0), Math.max(duration - 0.05, 0));
    if (Math.abs(video.currentTime - t) < 0.02) return;
    seeking = true;
    try { video.currentTime = t; } catch (error) { seeking = false; }
  }
  video.addEventListener('seeked', function () { seeking = false; flush(); });

  function update() {
    ticking = false;
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;
    const amount = Math.min(Math.max(-rect.top / scrollable, 0), 1);
    if (duration) {
      targetTime = amount * duration;
      flush();
    }
    if (caption) caption.classList.toggle('is-visible', amount > 0.15 && amount < 0.85);
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
    window.requestIdleCallback(function () { video.preload = 'auto'; video.load(); }, { timeout: 3000 });
  } else {
    window.addEventListener('load', function () {
      window.setTimeout(function () { video.preload = 'auto'; video.load(); }, 1200);
    });
  }
  onScroll();
})();
