/* ==========================================================
   gallery.js — Photos app grid + fullscreen viewer.
   Falls back to an elegant placeholder if an image is missing,
   never throws, never shows a broken-image icon.
   ========================================================== */

const Gallery = (() => {
  let photos = [];
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

  async function renderGrid() {
    const grid = document.getElementById("photo-grid");
    if (!grid) return;
    grid.innerHTML = "";

    photos = CONFIG.photos || [];

    for (let i = 0; i < photos.length; i++) {
      const thumb = document.createElement("button");
      thumb.type = "button";
      thumb.className = "photo-thumb";
      thumb.setAttribute("aria-label", `Open photo ${i + 1} of ${photos.length}`);
      thumb.dataset.index = String(i);

      const exists = await checkImageExists(photos[i].src);
      if (exists) {
        const img = document.createElement("img");
        img.src = photos[i].src;
        img.alt = "";
        img.loading = "lazy";
        thumb.appendChild(img);
      } else {
        const fallback = document.createElement("div");
        fallback.className = "photo-thumb__fallback";
        fallback.innerHTML = placeholderSVG;
        thumb.appendChild(fallback);
      }

      thumb.addEventListener("click", () => openViewer(i));
      grid.appendChild(thumb);
    }
  }

  async function renderViewerSlide(index) {
    const stage = document.getElementById("photo-viewer-stage");
    if (!stage) return;
    stage.innerHTML = "";

    const wrap = document.createElement("div");
    wrap.className = "photo-viewer__img-wrap";

    const exists = await checkImageExists(photos[index].src);
    if (exists) {
      const img = document.createElement("img");
      img.src = photos[index].src;
      img.alt = photos[index].caption || "";
      wrap.appendChild(img);
    } else {
      const fallback = document.createElement("div");
      fallback.className = "photo-viewer__fallback";
      fallback.innerHTML = placeholderSVG;
      wrap.appendChild(fallback);
    }

    stage.appendChild(wrap);
    requestAnimationFrame(() => wrap.classList.add("is-active"));

    document.getElementById("photo-viewer-caption").textContent = photos[index].caption || "";
    renderDots(index);
  }

  function renderDots(index) {
    const dotsEl = document.getElementById("photo-viewer-dots");
    if (!dotsEl) return;
    dotsEl.innerHTML = "";
    photos.forEach((_, i) => {
      const dot = document.createElement("span");
      dot.className = "photo-viewer__dot" + (i === index ? " is-active" : "");
      dotsEl.appendChild(dot);
    });
  }

  function openViewer(index) {
    activeIndex = index;
    const viewer = document.getElementById("photo-viewer");
    viewer.hidden = false;
    viewer.setAttribute("aria-hidden", "false");
    void viewer.offsetHeight;
    viewer.classList.add("is-open");
    renderViewerSlide(activeIndex);
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
    if (activeIndex < photos.length - 1) {
      activeIndex += 1;
      renderViewerSlide(activeIndex);
    }
  }

  function prev() {
    if (activeIndex > 0) {
      activeIndex -= 1;
      renderViewerSlide(activeIndex);
    }
  }

  function bindViewerControls() {
    document.querySelector("[data-close-viewer]").addEventListener("click", closeViewer);
    document.addEventListener("viewer:close", closeViewer);

    const stage = document.getElementById("photo-viewer-stage");

    stage.addEventListener("pointerdown", (e) => {
      touchStartX = e.clientX;
      touchDeltaX = 0;
    });
    stage.addEventListener("pointermove", (e) => {
      if (touchStartX === 0) return;
      touchDeltaX = e.clientX - touchStartX;
    });
    stage.addEventListener("pointerup", () => {
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
    });
  }

  function init() {
    renderGrid();
    bindViewerControls();
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", Gallery.init);
