(function () {
  const section = document.getElementById('intro-video');
  const video = document.querySelector('[data-intro-video]');
  if (!section || !video) return;

  let duration = 0;
  let targetTime = 0;
  let seeking = false;
  let ready = false;

  // Принудительно инициируем загрузку и «разблокируем» декодер
  video.load();

  function onReady() {
    if (ready) return;
    duration = video.duration;
    if (!isFinite(duration) || duration <= 0) return;
    ready = true;
    section.classList.add('is-ready');
    update();
  }

  video.addEventListener('loadedmetadata', onReady);
  video.addEventListener('loadeddata', onReady);
  video.addEventListener('canplay', onReady);

  // Трюк: короткий play/pause «прогревает» декодер в Safari/iOS
  video.play().then(() => video.pause()).catch(() => {});

  // Очередь перемотки: ждём seeked перед следующим запросом
 function seekLoop() {
    if (!ready || seeking) return;
    const t = Math.min(Math.max(targetTime, 0), duration - 0.05);
    const diff = Math.abs(video.currentTime - t);
    if (diff < 0.01) return;
    seeking = true;
    video.currentTime = t;
  }

  video.addEventListener('seeked', () => {
    seeking = false;
    seekLoop();
  });

  function update() {
    if (!ready) return;
    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    const progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);

    targetTime = progress * duration;
    seekLoop();
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
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
    try {
      video.currentTime = t;
    } catch (e) {
      seeking = false;
    }
  }

  function update() {
    ticking = false;
    if (!duration) return;

    const rect = section.getBoundingClientRect();
    const scrollable = section.offsetHeight - window.innerHeight;
    if (scrollable <= 0) return;

    // progress: 0 когда верх секции коснулся верха окна, 1 — когда низ дошёл
    let progress = -rect.top / scrollable;
    progress = Math.min(Math.max(progress, 0), 1);

    targetTime = progress * duration;
    flush();

    if (caption) {
      caption.classList.toggle('is-visible', progress > 0.15 && progress < 0.85);
    }
  }

  function onScroll() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });

  // подгружаем видео заранее, когда секция приближается
  if ('IntersectionObserver' in window) {
    const preload = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          video.preload = 'auto';
          video.load();
          preload.disconnect();
        }
      });
    }, { rootMargin: '200% 0px' });
    preload.observe(section);
  }

  onScroll();
})();