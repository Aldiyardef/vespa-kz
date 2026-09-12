/* =========================================================
   Интро-видео №1: автозапуск после загрузки страницы,
   один раз, скролл заблокирован до конца видео.
   Видео №2: запуск один раз при наведении/касании,
   скролл заблокирован до конца видео.
   ========================================================= */
(function () {

  /* ---------- общий блокировщик скролла ---------- */
  /* Не трогаем overflow/position — только гасим события,
     чтобы не ломать layout и не прыгать по странице. */
  const scrollLock = (function () {
    const owners = new Set();
    const blockedKeys = new Set([
      'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
      'PageUp', 'PageDown', 'Home', 'End', ' ', 'Spacebar'
    ]);

    function preventDefault(e) { e.preventDefault(); }
    function preventKeys(e) { if (blockedKeys.has(e.key)) e.preventDefault(); }

    function attach() {
      window.addEventListener('wheel', preventDefault, { passive: false });
      window.addEventListener('touchmove', preventDefault, { passive: false });
      window.addEventListener('keydown', preventKeys, { passive: false });
    }
    function detach() {
      window.removeEventListener('wheel', preventDefault);
      window.removeEventListener('touchmove', preventDefault);
      window.removeEventListener('keydown', preventKeys);
    }

    return {
      lock(owner) {
        const wasEmpty = owners.size === 0;
        owners.add(owner);
        if (wasEmpty) attach();
      },
      unlock(owner) {
        owners.delete(owner);
        if (owners.size === 0) detach();
      }
    };
  }());

  /* ---------- видео №1: интро ---------- */
  const introSection = document.getElementById('intro-video');
  const introVideo = introSection && introSection.querySelector('[data-intro-video]');

  if (introVideo) {
    let introFinished = false;
    let introPlayAttempted = false;

    scrollLock.lock('intro');

    function finishIntro() {
      if (introFinished) return;
      introFinished = true;
      scrollLock.unlock('intro');
    }

    function tryPlayIntro() {
      if (introPlayAttempted || introFinished) return;
      introPlayAttempted = true;

      const playPromise = introVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          // Автоплей заблокирован браузером — не держим страницу залоченной.
          finishIntro();
        });
      }
    }

    introVideo.addEventListener('ended', finishIntro);
    introVideo.addEventListener('error', finishIntro);

    // Пытаемся запустить, как только видео действительно способно играть.
    introVideo.addEventListener('canplay', tryPlayIntro);
    introVideo.addEventListener('canplaythrough', tryPlayIntro);

    // Подстраховка: пробуем запустить и после полной загрузки страницы.
    window.addEventListener('load', function () {
      setTimeout(tryPlayIntro, 50);
    });

    // На случай, если видео уже готово к моменту подписки (кеш, быстрая сеть).
    if (introVideo.readyState >= 3) {
      tryPlayIntro();
    }

    // Абсолютная страховка от вечной блокировки скролла.
    setTimeout(finishIntro, 15000);
  }

  /* ---------- видео №2: по наведению/касанию ---------- */
  const secondSection = document.querySelector('[data-scroll-video]');
  const secondVideo = secondSection && secondSection.querySelector('.scroll-video__media');

  if (secondVideo) {
    let secondStarted = false;
    let secondFinished = false;

    function finishSecond() {
      if (secondFinished) return;
      secondFinished = true;
      scrollLock.unlock('second-video');
    }

    function startSecond() {
      if (secondStarted || secondFinished) return;
      secondStarted = true;

      scrollLock.lock('second-video');

      const playPromise = secondVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          finishSecond();
        });
      }
    }

    secondVideo.addEventListener('ended', finishSecond);
    secondVideo.addEventListener('error', finishSecond);

    secondSection.addEventListener('pointerenter', startSecond, { once: true });
    secondSection.addEventListener('touchstart', startSecond, { once: true, passive: true });

    // Страховка от вечной блокировки, если видео вдруг не проиграется до конца.
    secondVideo.addEventListener('playing', function () {
      setTimeout(finishSecond, 20000);
    }, { once: true });
  }

}());