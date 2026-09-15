/* Intro video: native preload first, with a guaranteed escape hatch. */
(function () {
  'use strict';

  try {
    var section = document.getElementById('intro-video');
    var video = document.querySelector('[data-intro-video]');
    var loader = document.getElementById('intro-loader');
    if (!section || !video) return;

    var bar = loader && loader.querySelector('.intro-loader__bar');
    var percent = document.getElementById('intro-loader-percent');
    var duration = 0;
    var targetTime = 0;
    var seeking = false;
    var scrubReady = false;
    var dismissed = false;
    var timeoutId;

    function setProgress(value) {
      var safe = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
      if (bar) bar.style.width = safe + '%';
      if (percent) percent.textContent = safe + '%';
    }

    function unlock() {
      document.documentElement.classList.remove('intro-locked');
      document.body.classList.remove('intro-locked');
    }

    function dismissLoader() {
      if (dismissed) return;
      dismissed = true;
      clearTimeout(timeoutId);
      setProgress(100);
      unlock();
      if (!loader) return;
      loader.classList.add('is-hidden');
      window.setTimeout(function () {
        loader.setAttribute('hidden', '');
      }, 750);
    }

    function readProgress() {
      try {
        var bufferedEnd = video.buffered.length ? video.buffered.end(video.buffered.length - 1) : 0;
        var total = isFinite(video.duration) && video.duration > 0 ? video.duration : 0;
        if (total) setProgress((bufferedEnd / total) * 100);
      } catch (e) { /* progress is cosmetic; never block the page */ }
    }

    function markReady() {
      try {
        duration = Number(video.duration) || 0;
        if (isFinite(duration) && duration > 0) {
          scrubReady = true;
          section.classList.add('is-ready');
          try { video.pause(); video.currentTime = 0; } catch (e) {}
          updateIntro();
        }
      } catch (e) {}
      dismissLoader();
    }

    function failOpen() {
      /* A poster/first frame is preferable to a page trapped behind a loader. */
      section.classList.add('is-ready');
      dismissLoader();
    }

    function seekIntro() {
      if (!scrubReady || seeking || !duration) return;
      var t = Math.min(Math.max(targetTime, 0), Math.max(duration - 0.05, 0));
      if (Math.abs(video.currentTime - t) < 0.01) return;
      seeking = true;
      try { video.currentTime = t; } catch (e) { seeking = false; }
    }

    function updateIntro() {
      if (!scrubReady) return;
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var rect = section.getBoundingClientRect();
      targetTime = Math.min(Math.max(-rect.top / scrollable, 0), 1) * duration;
      seekIntro();
    }

    function scheduleUpdate() {
      if (window.requestAnimationFrame) window.requestAnimationFrame(updateIntro);
      else window.setTimeout(updateIntro, 0);
    }

    document.documentElement.classList.add('intro-locked');
    document.body.classList.add('intro-locked');
    setProgress(0);

    ['loadedmetadata', 'loadeddata', 'canplay', 'canplaythrough'].forEach(function (eventName) {
      video.addEventListener(eventName, function () {
        readProgress();
        markReady();
      });
    });
    video.addEventListener('progress', readProgress);
    video.addEventListener('timeupdate', readProgress);
    video.addEventListener('error', failOpen);
    video.addEventListener('stalled', function () { readProgress(); });
    video.addEventListener('seeked', function () { seeking = false; seekIntro(); });

    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', scheduleUpdate, { passive: true });

    /* Native source selection handles mobile/desktop <source> media correctly. */
    try { video.preload = 'auto'; video.load(); } catch (e) { failOpen(); }
    timeoutId = window.setTimeout(failOpen, 8000);
    scheduleUpdate();
  } catch (e) {
    /* Last-resort recovery even if a browser has an unexpected media API. */
    try {
      document.documentElement.classList.remove('intro-locked');
      document.body.classList.remove('intro-locked');
      var emergencyLoader = document.getElementById('intro-loader');
      if (emergencyLoader) emergencyLoader.setAttribute('hidden', '');
    } catch (ignored) {}
  }
})();

/* Second video: scrub its native source as the user scrolls through the section. */
(function () {
  'use strict';
  try {
    var section = document.querySelector('[data-scroll-video]');
    if (!section) return;
    var video = section.querySelector('.scroll-video__media');
    var caption = section.querySelector('.scroll-video__caption');
    if (!video || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (caption) caption.classList.add('is-visible');
      return;
    }
    var duration = 0, targetTime = 0, seeking = false, ticking = false;
    function metadata() { duration = Number(video.duration) || 0; try { video.currentTime = 0.001; } catch (e) {} schedule(); }
    function seek() {
      if (seeking || !duration) return;
      var t = Math.min(Math.max(targetTime, 0), Math.max(duration - 0.05, 0));
      if (Math.abs(video.currentTime - t) < 0.02) return;
      seeking = true;
      try { video.currentTime = t; } catch (e) { seeking = false; }
    }
    function update() {
      ticking = false;
      if (!duration) return;
      var rect = section.getBoundingClientRect();
      var scrollable = section.offsetHeight - window.innerHeight;
      if (scrollable <= 0) return;
      var progress = Math.min(Math.max(-rect.top / scrollable, 0), 1);
      targetTime = progress * duration;
      seek();
      if (caption) caption.classList.toggle('is-visible', progress > 0.15 && progress < 0.85);
    }
    function schedule() { if (!ticking) { ticking = true; (window.requestAnimationFrame || function (fn) { window.setTimeout(fn, 0); })(update); } }
    video.addEventListener('loadedmetadata', metadata, { once: true });
    video.addEventListener('seeked', function () { seeking = false; seek(); });
    if (video.readyState >= 1) metadata();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    window.setTimeout(function () { try { video.preload = 'auto'; video.load(); } catch (e) {} }, 1000);
    schedule();
  } catch (e) { /* second video is enhancement only */ }
})();
