/* Scroll-linked intro video. Vanilla JS; independent from script.js. */
(() => {
  'use strict';

  const intro = document.querySelector('[data-intro-video]')?.closest('.intro-video');
  const video = document.querySelector('[data-intro-video]');
  if (!intro || !video) return;

  const placeholder = intro.querySelector('[data-intro-placeholder]');
  const skipButton = intro.querySelector('[data-intro-skip]');
  let duration = 0;
  let targetTime = 0;
  let rafId = 0;
  let completed = false;

  const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

  function updateProgress() {
    const rect = intro.getBoundingClientRect();
    const scrollable = Math.max(1, intro.offsetHeight - window.innerHeight);
    const progress = clamp(-rect.top / scrollable);
    intro.style.setProperty('--intro-progress', progress.toFixed(4));
    targetTime = duration ? duration * progress : 0;
    if (progress >= 0.999 && !completed) completeIntro();
  }

  function renderVideo() {
    rafId = 0;
    if (duration && Number.isFinite(targetTime) && Math.abs(video.currentTime - targetTime) > 0.01) {
      try { video.currentTime = targetTime; } catch (_) { /* metadata may still be settling */ }
    }
  }

  function requestRender() {
    if (!rafId) rafId = requestAnimationFrame(renderVideo);
  }

  function completeIntro() {
    completed = true;
    // Keep the section at its document coordinate while the fade runs.
    intro.style.setProperty('--intro-absolute-top', `${window.scrollY + intro.getBoundingClientRect().top}px`);
    intro.classList.add('is-complete');
    window.setTimeout(() => { video.pause(); }, 950);
  }

  function skipIntro() {
    const rect = intro.getBoundingClientRect();
    const scrollable = Math.max(1, intro.offsetHeight - window.innerHeight);
    window.scrollTo({ top: window.scrollY + rect.top + scrollable, behavior: 'smooth' });
  }

  video.addEventListener('loadedmetadata', () => {
    duration = Number.isFinite(video.duration) ? video.duration : 0;
    if (duration) intro.classList.add('is-ready');
    updateProgress();
    requestRender();
  });
  video.addEventListener('canplay', () => intro.classList.add('is-ready'), { once: true });
  video.addEventListener('error', () => { placeholder?.classList.add('is-fallback'); });
  skipButton?.addEventListener('click', skipIntro);

  const observer = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !completed) { updateProgress(); requestRender(); }
  }, { threshold: [0, 0.01, 1] });
  observer.observe(intro);

  window.addEventListener('scroll', () => { updateProgress(); requestRender(); }, { passive: true });
  window.addEventListener('resize', () => { if (!completed) { updateProgress(); requestRender(); } }, { passive: true });
  updateProgress();
})();
