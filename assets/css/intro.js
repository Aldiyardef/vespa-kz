/* ===== Прелоадер интро: теперь считает прогресс по ДВУМ видео =====
 * Первое видео — то, что проигрывается в секции #intro-video.
 * Второе видео — отдельный ролик, путь задаётся константой SECOND_VIDEO_* ниже.
 * Общий прогресс — взвешенная сумма вкладов (по умолчанию 50/50).
 * Даже при ошибке любого из видео лоадер гарантированно скроется.
 */
(function () {
  // Базовые ссылки на DOM
  const section = document.getElementById('intro-video');
  const video = document.querySelector('[data-intro-video]');
  const loader = document.getElementById('intro-loader');
  const bar = loader && loader.querySelector('.intro-loader__bar');
  const percent = document.getElementById('intro-loader-percent');
  const hint = document.getElementById('intro-loader-hint');
  if (!section || !video) return;

  // ===== Конфигурация второго видео =====
  // Подставьте сюда путь к нужному файлу (например, 'assets/video/2-scrub.mp4').
  // По умолчанию используется тот же ролик, что и в секции .scroll-video.
  const SECOND_VIDEO_DESKTOP = 'assets/video/2-scrub.mp4';
  const SECOND_VIDEO_MOBILE  = 'assets/video/2-scrub-mobile.mp4';
  // Веса вкладов первого и второго видео в общий прогресс (сумма = 1.0)
  const WEIGHTS = [0.5, 0.5];
  // Таймаут на каждое видео (ms) и общий предохранитель (ms)
  const PER_VIDEO_TIMEOUT = 15000;
  const OVERALL_TIMEOUT = 30000;

  let duration = 0;
  let targetTime = 0;
  let seeking = false;
  let ready = false;
  const finished = [false, false]; // первое/второе видео завершили загрузку

  // Прогресс по каждому источнику (доля 0..1)
  const progressMap = [0, 0];

  document.documentElement.classList.add('intro-locked');
  document.body.classList.add('intro-locked');

  // Пересчёт общего прогресса как взвешенной суммы
  function computeTotal() {
    const total = (progressMap[0] || 0) * WEIGHTS[0]
                + (progressMap[1] || 0) * WEIGHTS[1];
    return total * 100;
  }

  function progress(value) {
    const safe = Math.max(0, Math.min(100, Math.round(value)));
    if (bar) bar.style.width = safe + '%';
    if (percent) percent.textContent = safe + '%';
  }

  function setSourceProgress(i, p) {
    const clamped = Math.max(0, Math.min(1, p));
    if (clamped > (progressMap[i] || 0)) progressMap[i] = clamped;
    progress(computeTotal());
  }

  // ===== Скрытие лоадера и снятие блокировки прокрутки =====
  function hideLoader() {
    if (hint) hint.style.display = 'none'; // прячем подсказку вместе с лоадером
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

  // ===== Скраб первого видео по скроллу секции =====
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

  // ===== Завершение загрузки первого видео =====
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

  // Помечаем источник как загруженный и решаем, можно ли показывать интро
  function markDone(i) {
    if (finished[i]) return;
    finished[i] = true;
    if ((progressMap[i] || 0) < 0.95) setSourceProgress(i, 1);
    // Первое видео готово → можно открывать интро (даже если второе ещё качается)
    if (i === 0 && !ready) finish();
    // Оба готовы — гарантируем «100%» в баре
    if (finished[0] && finished[1]) {
      setSourceProgress(0, 1);
      setSourceProgress(1, 1);
      progress(100);
    }
  }

  // Fallback: обычная загрузка через <video>, если стриминговый fetch не сработал
  function fallback(el, i) {
    try {
      el.removeAttribute('src');
      el.preload = 'auto';
      el.load();
    } catch (e) {}
    const timer = setTimeout(function () { markDone(i); }, PER_VIDEO_TIMEOUT);
    el.addEventListener('canplaythrough', function () {
      clearTimeout(timer); markDone(i);
    }, { once: true });
    el.addEventListener('loadedmetadata', function () { markDone(i); }, { once: true });
    el.addEventListener('error', function () { markDone(i); }, { once: true });
  }

  // Выбор источника (desktop / mobile) по media-условию
  function pickSource(el) {
    const sources = Array.from(el.querySelectorAll('source'));
    const desktop = sources.find(function (source) {
      return !source.media || !source.media.includes('max-width');
    });
    const mobile = sources.find(function (source) {
      return source.media && source.media.includes('max-width: 768px');
    });
    return { desktop: desktop, mobile: mobile };
  }

  // ===== Потоковая загрузка с отслеживанием прогресса =====
  async function loadByFetch(el, src, i) {
    try {
      const response = await fetch(src);
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
        if (total) setSourceProgress(i, loaded / total);
      }
      const blobUrl = URL.createObjectURL(new Blob(chunks, { type: 'video/mp4' }));
      try { el.src = blobUrl; } catch (e) {}
      el.load();
      const timer = setTimeout(function () { markDone(i); }, PER_VIDEO_TIMEOUT);
      el.addEventListener('canplaythrough', function () { clearTimeout(timer); markDone(i); }, { once: true });
      el.addEventListener('loadedmetadata', function () { markDone(i); }, { once: true });
      el.addEventListener('error', function () { markDone(i); }, { once: true });
      el.addEventListener('progress', function () {
        try {
          if (el.buffered && el.buffered.length && el.duration) {
            setSourceProgress(i, el.buffered.end(el.buffered.length - 1) / el.duration);
          }
        } catch (e) {}
      });
    } catch (e) {
      fallback(el, i);
    }
  }

  // ===== Старт загрузки ПЕРВОГО видео =====
  function startFirst() {
    const picked = pickSource(video);
    if (!picked.desktop && !picked.mobile) { fallback(video, 0); return; }
    let source = picked.desktop;
    if (picked.mobile && window.matchMedia('(max-width: 768px)').matches) {
      // На мобильных — быстрая HEAD-проверка наличия ролика
      fetch(picked.mobile.src, { method: 'HEAD', cache: 'no-store' })
        .then(function (check) {
          if (check.ok) source = picked.mobile;
          return loadByFetch(video, source.src, 0);
        })
        .catch(function () { return loadByFetch(video, source.src, 0); });
    } else {
      loadByFetch(video, source.src, 0);
    }
  }

  // ===== Старт загрузки ВТОРОГО видео (через скрытый <video>) =====
  function startSecond() {
    const pre = document.createElement('video');
    pre.preload = 'auto';
    pre.muted = true;
    pre.playsInline = true;
    pre.disablePictureInPicture = true;
    pre.style.position = 'absolute';
    pre.style.width = '1px';
    pre.style.height = '1px';
    pre.style.opacity = '0';
    pre.style.pointerEvents = 'none';
    pre.setAttribute('aria-hidden', 'true');
    document.body.appendChild(pre);
    const isMobile = window.matchMedia('(max-width: 768px)').matches;
    const src = isMobile ? SECOND_VIDEO_MOBILE : SECOND_VIDEO_DESKTOP;
    loadByFetch(pre, src, 1);
  }

  startFirst();
  startSecond();

  // ===== Общий предохранитель: даже при любом сбое лоадер скроется =====
  setTimeout(function () {
    if (!ready) {
      setSourceProgress(0, 1);
      setSourceProgress(1, 1);
      progress(100);
      finish();
    }
  }, OVERALL_TIMEOUT);

  // ===== Обработчики скролла/ресайза =====
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
