/* ==========================================================
   memories.js — Scene 05. Exactly three overlapping photo
   cards. Tapping one opens a fullscreen viewer with prev/next,
   swipe, and arrow-key navigation. Falls back gracefully if a
   photo file hasn't been added yet.
   ========================================================== */

const Memories = (() => {
  let activeIndex = 0;
  let touchStartX = 0;
  let touchDeltaX = 0;

  const placeholderSVG = `
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <rect x="3" y="4" width="18" height="16" rx="3"/>
      <circle cx="9" cy="10" r="2"/>
      <path d="m21 16-5-5-4 4-2-2-5 5"/>
    </svg>`;

  function checkImageExists(src) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = src;
    });
  }

  async function renderCards() {
    const stage = document.getElementById("memories-stage");
    if (!stage) return;
    stage.innerHTML = "";

    const items = CONFIG.memories || [];
    for (let i = 0; i < items.length; i++) {
      const card = document.createElement("button");
      card.type = "button";
      card.className = `memory-card memory-card--${i + 1}`;
      card.setAttribute("aria-label", `Open memory ${i + 1} of ${items.length}`);

      const photo = document.createElement("div");
      photo.className = "memory-card__photo";

      const exists = await checkImageExists(items[i].image);
      if (exists) {
        const img = document.createElement("img");
        img.src = items[i].image;
        img.alt = "";
        img.loading = "lazy";
        photo.appendChild(img);
      } else {
        photo.innerHTML = placeholderSVG;
      }
      card.appendChild(photo);

      const caption = document.createElement("span");
      caption.className = "memory-card__caption";
      caption.textContent = items[i].caption || "";
      card.appendChild(caption);

      card.addEventListener("click", () => openViewer(i));
      stage.appendChild(card);
    }
  }

  async function renderViewerFrame(index) {
    const frameHost = document.getElementById("photo-viewer-frame");
    if (!frameHost) return;
    frameHost.innerHTML = "";
    frameHost.classList.remove("is-active");

    const item = CONFIG.memories[index];
    const exists = await checkImageExists(item.image);
    if (exists) {
      const img = document.createElement("img");
      img.src = item.image;
      img.alt = item.caption || "";
      frameHost.appendChild(img);
    } else {
      const fb = document.createElement("div");
      fb.className = "photo-viewer__frame-fallback";
      fb.innerHTML = placeholderSVG;
      frameHost.appendChild(fb);
    }

    requestAnimationFrame(() => frameHost.classList.add("is-active"));
    document.getElementById("photo-viewer-caption").textContent = item.caption || "";
  }

  function openViewer(index) {
    activeIndex = index;
    const viewer = document.getElementById("photo-viewer");
    viewer.hidden = false;
    viewer.setAttribute("aria-hidden", "false");
    void viewer.offsetHeight;
    viewer.classList.add("is-open");
    renderViewerFrame(activeIndex);
  }

  function closeViewer() {
    const viewer = document.getElementById("photo-viewer");
    viewer.classList.remove("is-open");
    viewer.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      viewer.hidden = true;
    }, App.reducedMotion ? 0 : 320);
  }

  function next() {
    if (activeIndex < CONFIG.memories.length - 1) {
      activeIndex += 1;
      renderViewerFrame(activeIndex);
    }
  }
  function prev() {
    if (activeIndex > 0) {
      activeIndex -= 1;
      renderViewerFrame(activeIndex);
    }
  }

  function bindViewer() {
    document.getElementById("photo-viewer-close")?.addEventListener("click", closeViewer);
    document.getElementById("photo-viewer-next")?.addEventListener("click", next);
    document.getElementById("photo-viewer-prev")?.addEventListener("click", prev);

    const stage = document.getElementById("photo-viewer-stage-hit");
    stage?.addEventListener("pointerdown", (e) => {
      touchStartX = e.clientX;
      touchDeltaX = 0;
    });
    stage?.addEventListener("pointermove", (e) => {
      if (touchStartX === 0) return;
      touchDeltaX = e.clientX - touchStartX;
    });
    stage?.addEventListener("pointerup", () => {
      if (Math.abs(touchDeltaX) > 60) {
        touchDeltaX < 0 ? next() : prev();
      }
      touchStartX = 0;
      touchDeltaX = 0;
    });

    document.addEventListener("keydown", (e) => {
      const viewer = document.getElementById("photo-viewer");
      if (!viewer.classList.contains("is-open")) return;
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "Escape") closeViewer();
    });
  }

  function bindContinue() {
    document.getElementById("memories-continue")?.addEventListener("click", () => nextScene());
  }

  function init() {
    renderCards();
    bindViewer();
    bindContinue();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Memories.init);
