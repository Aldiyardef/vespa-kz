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
    const diff = Math.abs(video.currentTime - targetTime);
    if (diff < 0.01) return;
    seeking = true;
    video.currentTime = targetTime;
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

    section.style.opacity = progress > 0.92
      ? String(1 - (progress - 0.92) / 0.08)
      : '1';

    if (progress >= 1) {
      section.classList.add('is-done');
    } else {
      section.classList.remove('is-done');
    }
  }

  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => { update(); ticking = false; });
  }, { passive: true });

  window.addEventListener('resize', update);
})();