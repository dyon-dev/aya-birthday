/* ==========================================================
   letter.js — Scene 02. "MULAI KEJUTAN" folds the letter away
   and advances into the diary scene.
   ========================================================== */

(function initLetter() {
  const btn = document.getElementById("letter-cta");
  const card = document.getElementById("letter-card");
  if (!btn || !card) return;

  btn.addEventListener("click", () => {
    card.style.transition = `transform var(--dur-slow) var(--ease-in-out), opacity var(--dur-base) ease`;
    card.style.transform = "translateY(-16px) scale(0.96)";
    card.style.opacity = "0";

    window.setTimeout(() => {
      nextScene();
    }, App.reducedMotion ? 100 : 520);
  });
})();
