/* Однократное автопроигрывание видео интро без привязки к прокрутке. */
(function () {
  const section = document.getElementById('intro-video');
  const video = document.querySelector('[data-intro-video]');
  const loader = document.getElementById('intro-loader');
  const bar = loader && loader.querySelector('.intro-loader__bar');
  const percent = document.getElementById('intro-loader-percent');
  const hint = document.getElementById('intro-loader-hint');
  if (!section || !video) return;

  const LOAD_TIMEOUT = 30000;
  let ready = false;
  let loaderHidden = false;
  let safetyTimer;

  video.muted = true;
  video.playsInline = true;
  video.preload = 'auto';

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
      window.setTimeout(function () { loader.setAttribute('hidden', ''); }, 700);
    }
  }

  function freezeAtEnd() {
    video.pause();
    if (Number.isFinite(video.duration) && video.duration > 0) {
      const lastFrameTime = Math.max(0, video.duration - 0.05);
      if (video.currentTime >= video.duration || video.currentTime < lastFrameTime) {
        try { video.currentTime = lastFrameTime; } catch (error) { /* Сохраняем доступный последний кадр. */ }
      }
    }
  }
  video.addEventListener('ended', freezeAtEnd);

  // Первый декодированный кадр снимает загрузочный экран и запускает видео.
  function onReady() {
    if (ready) return;
    ready = true;
    window.clearTimeout(safetyTimer);
    section.classList.add('is-ready');
    progress(100);
    unlock();
    try {
      const result = video.play();
      if (result && typeof result.catch === 'function') result.catch(function () { /* Автовоспроизведение может быть запрещено браузером. */ });
    } catch (error) { /* Сайт остаётся доступен, даже если запуск запрещён. */ }
  }

  function onError() {
    window.clearTimeout(safetyTimer);
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
    } catch (error) { /* buffered недоступен во время некоторых фаз загрузки. */ }
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

  safetyTimer = window.setTimeout(function () {
    unlock(); // Предохранитель: загрузка никогда не блокирует сайт бесконечно.
  }, LOAD_TIMEOUT);

  const source = chooseSource();
  if (source) {
    video.src = source;
    video.load();
  } else {
    onError();
  }
})();

/* Второй ролик начинает проигрываться один раз при появлении в области просмотра. */
(function () {
  const section = document.querySelector('[data-scroll-video]');
  const video = section && section.querySelector('.scroll-video__media');
  const caption = section && section.querySelector('.scroll-video__caption');
  if (!video) return;

  let ready = video.readyState >= 2;
  let inView = false;
  let playAttempted = false;
  video.muted = true;
  video.playsInline = true;

  function freezeAtEnd() {
    video.pause();
    if (Number.isFinite(video.duration) && video.duration > 0) {
      const lastFrameTime = Math.max(0, video.duration - 0.05);
      if (video.currentTime >= video.duration || video.currentTime < lastFrameTime) {
        try { video.currentTime = lastFrameTime; } catch (error) { /* Оставляем последний отрисованный кадр. */ }
      }
    }
  }
  video.addEventListener('ended', freezeAtEnd);

  function maybePlay() {
    if (!ready || !inView || playAttempted) return;
    playAttempted = true;
    try {
      const result = video.play();
      if (result && typeof result.catch === 'function') result.catch(function () { /* Не ломаем прокрутку при запрете autoplay. */ });
    } catch (error) { /* Видео остаётся доступным как постер. */ }
  }

  function onReady() {
    ready = true;
    maybePlay();
  }
  video.addEventListener('loadeddata', onReady);
  video.addEventListener('canplay', onReady);
  if (ready) onReady();

  if (window.IntersectionObserver) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          inView = true;
          if (caption) caption.classList.add('is-visible');
          if (!ready) {
            video.preload = 'auto';
            video.load();
          }
          maybePlay();
          observer.disconnect();
        }
      });
    }, { threshold: 0.15 });
    observer.observe(section);
  } else {
    inView = true;
    maybePlay();
  }
})();
