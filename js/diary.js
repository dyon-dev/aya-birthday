/* ==========================================================
   diary.js — Scene 03 (lock turns, cover opens) and Scene 04
   (the diary page content, filled from CONFIG).
   ========================================================== */

(function initDiary() {
  const diary = document.getElementById("diary");
  if (!diary) return;

  let opened = false;

  function open() {
    if (opened) return;
    opened = true;

    diary.classList.add("is-unlocking");

    window.setTimeout(() => {
      diary.classList.add("is-open");
    }, App.reducedMotion ? 0 : 850);

    window.setTimeout(() => {
      nextScene();
    }, App.reducedMotion ? 200 : 2300);
  }

  makeActivatable(diary, open);
  diary.setAttribute("aria-label", "Open the diary");
})();

(function initDiaryPage() {
  const dateEl = document.getElementById("diary-page-date");
  const bodyEl = document.getElementById("diary-page-body");
  const btn = document.getElementById("diary-continue");
  if (!dateEl || !bodyEl) return;

  dateEl.textContent = CONFIG.birthday;
  bodyEl.textContent = CONFIG.diaryMessage;

  btn?.addEventListener("click", () => nextScene());
})();
