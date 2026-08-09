/* ==========================================================
   final.js — Scene 09. A quiet, timed sequence: two whispered
   lines, a small final envelope, the letter inside it, then
   the UI itself fades away so only the words are left.
   ========================================================== */

const Final = (() => {
  let played = false;
  let letterOpened = false;

  function reset() {
    document.querySelectorAll("#scene-09 .final-step").forEach((el) => {
      el.classList.remove("is-visible");
    });
    document.getElementById("final-envelope")?.classList.remove("is-open");
  }

  function playWhispers() {
    if (played) return;
    played = true;
    reset();

    const whisper1 = document.querySelector('[data-step="whisper-1"]');
    const whisper2 = document.querySelector('[data-step="whisper-2"]');
    const envelopeStep = document.querySelector('[data-step="envelope"]');

    const d = App.reducedMotion ? [0, 0, 0] : [400, 2200, 4200];

    window.setTimeout(() => whisper1?.classList.add("is-visible"), d[0]);
    window.setTimeout(() => {
      whisper1?.classList.remove("is-visible");
      whisper2?.classList.add("is-visible");
    }, d[1]);
    window.setTimeout(() => {
      whisper2?.classList.remove("is-visible");
      envelopeStep?.classList.add("is-visible");
    }, d[2]);
  }

  function openLetter() {
    if (letterOpened) return;
    letterOpened = true;

    const envelope = document.getElementById("final-envelope");
    envelope?.classList.add("is-open");

    const envelopeStep = document.querySelector('[data-step="envelope"]');
    const letterStep = document.querySelector('[data-step="letter"]');

    // Quiet the interface — this is the end of the film, not a UI screen.
    document.getElementById("progress-indicator")?.classList.add("is-hidden");
    document.getElementById("audio-control")?.classList.remove("is-visible");

    window.setTimeout(() => {
      envelopeStep?.classList.remove("is-visible");
      letterStep?.classList.add("is-visible");
      revealLetterLines();
      spawnParticles(document.getElementById("scene-09-particles"), 14, {
        color: "rgba(205, 161, 92, 0.45)",
      });
    }, App.reducedMotion ? 100 : 900);
  }

  function revealLetterLines() {
    const lines = Array.from(document.querySelectorAll(".final-letter-line"));
    const delays = App.reducedMotion
      ? lines.map(() => 0)
      : lines.map((_, i) => 400 + i * 900);

    lines.forEach((line, i) => {
      window.setTimeout(() => line.classList.add("is-visible"), delays[i]);
    });
  }

  function init() {
    const envelope = document.getElementById("final-envelope");
    if (envelope) {
      makeActivatable(envelope, openLetter);
      envelope.setAttribute("aria-label", "Open the final letter");
    }

    document.querySelectorAll("[data-config='name']").forEach((el) => {
      el.textContent = CONFIG.name;
    });
    const finalMessageEl = document.getElementById("final-message-text");
    if (finalMessageEl) finalMessageEl.textContent = CONFIG.finalMessage;

    document.addEventListener("scene:changed", (e) => {
      if (e.detail.index === App.scenes.length - 1) {
        playWhispers();
      }
    });
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Final.init);
