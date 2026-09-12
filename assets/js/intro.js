(function () {
  'use strict';

  // Добавляем CSS-класс блокировки скролла (инжектим один раз)
  const style = document.createElement('style');
  style.textContent = `
    html.scroll-locked,
    body.scroll-locked {
      overflow: hidden !important;
      height: 100% !important;
      touch-action: none;
    }
  `;
  document.head.appendChild(style);

  /**
   * Универсальный обработчик: видео стартует само, когда секция появляется
   * во вьюпорте, и блокирует скролл страницы до окончания видео.
   *
   * section  — контейнер, за появлением которого следим
   * video    — сам <video>
   * caption  — (опционально) подпись, которую нужно показать/скрыть
   */
  function initScrollLockedVideo(section, video, caption) {
    if (!section || !video) return;

    let hasPlayed = false; // видео уже было запущено (срабатывает один раз)
    let locked = false;

    function lockScroll() {
      if (locked) return;
      locked = true;
      document.documentElement.classList.add('scroll-locked');
      document.body.classList.add('scroll-locked');
    }

    function unlockScroll() {
      if (!locked) return;
      locked = false;
      document.documentElement.classList.remove('scroll-locked');
      document.body.classList.remove('scroll-locked');
    }

    function playVideo() {
      if (hasPlayed) return;
      hasPlayed = true;

      lockScroll();
      if (caption) caption.classList.add('is-visible');

      try {
        video.currentTime = 0;
      } catch (e) {}

      const playPromise = video.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(() => {
          // Если браузер заблокировал автозапуск (например, видео не muted),
          // не держим страницу заблокированной навсегда.
          unlockScroll();
        });
      }
    }

    function onEnded() {
      unlockScroll();
      if (caption) caption.classList.remove('is-visible');
    }

    video.addEventListener('ended', onEnded);

    // Уважаем настройку "уменьшить анимацию": не блокируем скролл и не автозапускаем
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      hasPlayed = true;
      if (caption) caption.classList.add('is-visible');
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!hasPlayed && entry.isIntersecting && entry.intersectionRatio >= 0.6) {
            playVideo();
          }
        });
      },
      { threshold: [0, 0.25, 0.5, 0.6, 0.75, 1] }
    );

    observer.observe(section);
  }

  // ===== Первое видео (intro) =====
  const introSection = document.getElementById('intro-video');
  const introVideo = document.querySelector('[data-intro-video]');
  if (introSection && introVideo) {
    introVideo.load();
    initScrollLockedVideo(introSection, introVideo);
  }

  // ===== Второе видео (scroll-video) =====
  const scrollSection = document.querySelector('[data-scroll-video]');
  if (scrollSection) {
    const scrollVideo = scrollSection.querySelector('.scroll-video__media');
    const caption = scrollSection.querySelector('.scroll-video__caption');
    if (scrollVideo) {
      scrollVideo.load();
      initScrollLockedVideo(scrollSection, scrollVideo, caption);
    }
  }
})();
