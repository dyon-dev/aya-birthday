/* ==========================================================
   cake.js — Scene 07. Drag/swipe across the candles to blow
   them out one by one, like blowing across a phone mic — then
   "make a wish" unlocks the continue button.
   ========================================================== */

(function initCake() {
  const cake = document.getElementById("cake");
  const candles = Array.from(document.querySelectorAll(".candle"));
  const wishText = document.getElementById("cake-wish-text");
  const continueBtn = document.getElementById("cake-continue");
  if (!cake || !candles.length) return;

  let accumulated = 0;
  let lastX = null;
  let extinguished = 0;
  let done = false;
  const THRESHOLD_PER_CANDLE = 90;

  function extinguishNext() {
    if (done || extinguished >= candles.length) return;
    candles[extinguished].classList.add("is-out");
    extinguished += 1;

    if (extinguished >= candles.length) {
      finish();
    }
  }

  function finish() {
    done = true;
    window.setTimeout(() => {
      wishText.hidden = false;
      wishText.classList.add("fade-up");
      continueBtn.classList.add("is-visible");
    }, App.reducedMotion ? 0 : 500);
  }

  function handleMove(x) {
    if (done) return;
    if (lastX === null) {
      lastX = x;
      return;
    }
    accumulated += Math.abs(x - lastX);
    lastX = x;

    while (accumulated >= THRESHOLD_PER_CANDLE && extinguished < candles.length) {
      accumulated -= THRESHOLD_PER_CANDLE;
      extinguishNext();
    }
  }

  cake.addEventListener("pointerdown", (e) => {
    lastX = e.clientX;
  });
  cake.addEventListener("pointermove", (e) => {
    if (e.buttons === 0 && e.pointerType !== "touch") return;
    handleMove(e.clientX);
  });
  cake.addEventListener("pointerup", () => {
    lastX = null;
  });
  cake.addEventListener("pointercancel", () => {
    lastX = null;
  });

  // Keyboard / accessible fallback: blow one candle out per activation.
  makeActivatable(cake, () => extinguishNext());
  cake.setAttribute("aria-label", "Swipe or press Enter to blow out the candles");

  continueBtn.addEventListener("click", () => nextScene());
})();
