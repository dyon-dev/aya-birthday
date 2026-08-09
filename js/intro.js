/* ==========================================================
   intro.js — swipe-to-unlock on the lock screen.
   Works with touch, mouse drag, and keyboard (Enter/Space).
   ========================================================== */

(function initLockSwipe() {
  const track = document.getElementById("lock-swipe-track");
  const handle = document.getElementById("lock-swipe-handle");
  if (!track || !handle) return;

  const TRAVEL = 72; // px the handle can travel upward
  const UNLOCK_THRESHOLD = 0.62; // fraction of travel required to unlock

  let dragging = false;
  let startY = 0;
  let currentY = 0;
  let unlocked = false;

  function setHandlePosition(offset) {
    const clamped = Math.max(-TRAVEL, Math.min(0, offset));
    handle.style.transform = `translateY(${clamped}px)`;
    const progress = Math.min(1, Math.abs(clamped) / TRAVEL);
    handle.style.opacity = String(1 - progress * 0.15);
  }

  function resetHandle() {
    handle.style.transition = `transform var(--dur-base) var(--ease-spring)`;
    setHandlePosition(0);
    window.setTimeout(() => {
      handle.style.transition = "";
    }, 320);
  }

  function completeUnlock() {
    if (unlocked) return;
    unlocked = true;
    handle.style.transition = `transform var(--dur-base) var(--ease-out-quart)`;
    setHandlePosition(-TRAVEL);
    unlockToHome();
  }

  function onPointerDown(e) {
    if (unlocked) return;
    dragging = true;
    startY = e.clientY;
    currentY = 0;
    handle.setPointerCapture?.(e.pointerId);
  }

  function onPointerMove(e) {
    if (!dragging || unlocked) return;
    currentY = e.clientY - startY;
    setHandlePosition(currentY);
  }

  function onPointerUp() {
    if (!dragging || unlocked) return;
    dragging = false;

    const progress = Math.abs(Math.min(0, currentY)) / TRAVEL;
    if (progress >= UNLOCK_THRESHOLD) {
      completeUnlock();
    } else {
      resetHandle();
    }
  }

  handle.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("pointermove", onPointerMove);
  window.addEventListener("pointerup", onPointerUp);
  window.addEventListener("pointercancel", onPointerUp);

  // Keyboard fallback — Enter or Space unlocks directly.
  handle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      completeUnlock();
    }
  });

  // Also allow a tap anywhere on the track as a gentle nudge upward,
  // building toward unlock rather than unlocking instantly — keeps
  // the gesture feeling intentional rather than accidental.
  let tapNudges = 0;
  track.addEventListener("click", (e) => {
    if (e.target === handle || unlocked) return;
    tapNudges += 1;
    if (tapNudges >= 3) {
      completeUnlock();
    }
  });
})();
