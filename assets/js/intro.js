(function () {
  const section = document.getElementById('intro-video');
  const video = document.querySelector('[data-intro-video]');
  const secondSection = document.querySelector('[data-scroll-video]');
  const secondVideo = secondSection && secondSection.querySelector('.scroll-video__media');
  if (!section || !video) return;

  // Один общий блокировщик: несколько видео могут владеть блокировкой независимо.
  const scrollLock = (function () {
    const owners = new Set();
    const blockedKeys = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'
    ]);
    let previousOverflow = '';
    let previousBodyOverflow = '';

    function preventScroll(event) {
      event.preventDefault();
    }

    function preventKeys(event) {
      if (blockedKeys.has(event.key)) event.preventDefault();
    }

    function sync() {
      if (owners.size && owners.size === 1) {
        previousOverflow = document.documentElement.style.overflow;
        previousBodyOverflow = document.body.style.overflow;
        document.documentElement.style.overflow = 'hidden';
        document.body.style.overflow = 'hidden';
        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
        window.addEventListener('keydown', preventKeys, { passive: false });
      } else if (!owners.size) {
        document.documentElement.style.overflow = previousOverflow;
        document.body.style.overflow = previousBodyOverflow;
        window.removeEventListener('wheel', preventScroll);
        window.removeEventListener('touchmove', preventScroll);
        window.removeEventListener('keydown', preventKeys);
      }
    }

    return {
      lock(owner) {
        owners.add(owner);
        sync();
      },
      unlock(owner) {
        owners.delete(owner);
        sync();
      }
    };
  }());

  let duration = 0;
  let ready = false;
  let introStarted = false;

  function onReady() {
    if (ready) return;
    duration = video.duration;
    if (!isFinite(duration) || duration <= 0) return;
    ready = true;
    section.classList.add('is-ready');
  }

  function finishIntro() {
    video.pause();
    scrollLock.unlock('intro');
  }

  video.addEventListener('loadedmetadata', onReady);
  video.addEventListener('loadeddata', onReady);
  video.addEventListener('canplay', onReady);
  video.addEventListener('ended', finishIntro, { once: true });

  // Блокируем прокрутку уже при инициализации, а запуск оставляем на window load.
  scrollLock.lock('intro');

  // Интро запускается только после полной загрузки страницы и только один раз.
  window.addEventListener('load', function () {
    if (introStarted) return;
    introStarted = true;
    video.load();
    video.play().catch(function () {
      scrollLock.unlock('intro');
    });
  }, { once: true });

  // Второе видео запускается однократно при первом наведении, без скраббинга по scroll.
  if (secondVideo) {
    let secondStarted = false;

    function finishSecondVideo() {
      secondVideo.pause();
      scrollLock.unlock('second-video');
    }

    secondVideo.addEventListener('ended', finishSecondVideo, { once: true });
    secondSection.addEventListener('pointerenter', function () {
      if (secondStarted) return;
      secondStarted = true;
      scrollLock.lock('second-video');
      secondVideo.play().catch(function () {
        scrollLock.unlock('second-video');
      });
    }, { once: true });
  }
}());
