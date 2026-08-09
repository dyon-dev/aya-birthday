/* ==========================================================
   envelope.js — Scene 01. Tap the seal, the envelope opens
   physically (seal shrinks, flap folds back, paper slides up),
   then the experience advances to the letter.
   ========================================================== */

(function initEnvelope() {
  const envelope = document.getElementById("envelope");
  if (!envelope) return;

  let opened = false;

  function open() {
    if (opened) return;
    opened = true;
    envelope.classList.add("is-open");

    window.setTimeout(() => {
      nextScene();
    }, App.reducedMotion ? 200 : 1300);
  }

  makeActivatable(envelope, open);
  envelope.setAttribute("aria-label", "Open the envelope");

  const particleField = document.getElementById("scene-01-particles");
  spawnParticles(particleField, 16, { color: "rgba(197, 138, 147, 0.5)" });
})();
