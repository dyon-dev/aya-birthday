/* ==========================================================
   easter-eggs.js — a small hidden interaction. Not documented
   in the UI anywhere on purpose.
   ========================================================== */

(function initEasterEgg() {
  const trigger = document.querySelector("[data-secret-trigger]");
  const secretScreen = document.getElementById("secret-screen");
  const secretContinue = document.getElementById("secret-continue");
  if (!trigger || !secretScreen) return;

  let taps = 0;
  let tapTimer = null;
  let revealed = false;

  trigger.addEventListener("click", () => {
    if (revealed) return;
    taps += 1;

    window.clearTimeout(tapTimer);
    tapTimer = window.setTimeout(() => {
      taps = 0;
    }, 1400);

    if (taps >= 5) {
      revealed = true;
      revealSecret();
    }
  });

  function revealSecret() {
    // Close whatever app is open so the secret screen isn't hidden behind it.
    if (window.App?.openAppName) closeApp();

    window.setTimeout(() => {
      secretScreen.hidden = false;
      secretScreen.setAttribute("aria-hidden", "false");
      void secretScreen.offsetHeight;
      secretScreen.classList.add("is-open");
      secretContinue?.focus({ preventScroll: true });
    }, 200);
  }

  secretContinue?.addEventListener("click", () => {
    secretScreen.classList.remove("is-open");
    secretScreen.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      secretScreen.hidden = true;
      window.playFinalSequence?.();
    }, App.reducedMotion ? 0 : 420);
  });
})();
