/* ==========================================================
   app.js — scene manager, shared helpers, viewport fix,
   config injection, progress indicator, particles.
   ========================================================== */

const App = {
  reducedMotion: window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  scenes: [],
  index: 0,
  previousIndex: 0,
};

/* ---- mobile viewport height fix ---- */
function setViewportHeight() {
  document.documentElement.style.setProperty("--vh", `${window.innerHeight * 0.01}px`);
}
setViewportHeight();
window.addEventListener("resize", setViewportHeight);
window.addEventListener("orientationchange", setViewportHeight);

/* ---- scene registry + transitions ---- */
function initScenes() {
  App.scenes = Array.from(document.querySelectorAll(".scene"));
  App.scenes.forEach((s, i) => {
    s.classList.toggle("is-active", i === 0);
  });
  updateProgress();
}

function renderScenes() {
  App.scenes.forEach((scene, i) => {
    scene.classList.toggle("is-active", i === App.index);
    scene.classList.toggle("is-prev", i === App.previousIndex && i !== App.index);
  });

  window.setTimeout(() => {
    App.scenes.forEach((s) => s.classList.remove("is-prev"));
  }, App.reducedMotion ? 0 : 1600);

  updateProgress();
  document.dispatchEvent(new CustomEvent("scene:changed", { detail: { index: App.index } }));
}

function goToScene(index) {
  const clamped = Math.max(0, Math.min(App.scenes.length - 1, index));
  if (clamped === App.index) return;
  App.previousIndex = App.index;
  App.index = clamped;
  renderScenes();
}

function nextScene() {
  goToScene(App.index + 1);
}

function prevScene() {
  goToScene(App.index - 1);
}

function updateProgress() {
  const fill = document.getElementById("progress-fill");
  const label = document.getElementById("progress-label");
  const wrap = document.getElementById("progress-indicator");
  if (!fill || !label || !App.scenes.length) return;

  const total = App.scenes.length;
  const current = App.index + 1;
  fill.style.width = `${(current / total) * 100}%`;
  label.textContent = `${String(current).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;

  const activeScene = App.scenes[App.index];
  const isDark = activeScene && getComputedStyle(activeScene).color !== "";
  wrap.classList.toggle("on-dark", activeScene?.classList.contains("is-dark-text"));
}

/* ---- keyboard: Escape closes overlays handled per-module via
   custom events; Enter/Space activates any focused "activatable" ---- */
function makeActivatable(el, handler) {
  if (!el) return;
  el.setAttribute("role", el.getAttribute("role") || "button");
  el.setAttribute("tabindex", "0");
  el.addEventListener("click", handler);
  el.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handler(e);
    }
  });
}

/* ---- subtle floating particles for a given container ---- */
function spawnParticles(container, count, options = {}) {
  if (!container || App.reducedMotion) return;
  const frag = document.createDocumentFragment();
  for (let i = 0; i < count; i++) {
    const p = document.createElement("span");
    p.className = "particle";
    const size = options.size || (2 + Math.random() * 3);
    p.style.setProperty("--size", `${size}px`);
    p.style.setProperty("--dur", `${10 + Math.random() * 10}s`);
    p.style.setProperty("--delay", `${Math.random() * 10}s`);
    p.style.setProperty("--drift", `${(Math.random() - 0.5) * 40}px`);
    if (options.color) p.style.setProperty("--particle-color", options.color);
    p.style.left = `${Math.random() * 100}%`;
    p.style.top = `${40 + Math.random() * 55}%`;
    frag.appendChild(p);
  }
  container.appendChild(frag);
}

/* ---- inject CONFIG-driven copy ---- */
function applyConfig() {
  const c = CONFIG;
  document.querySelectorAll("[data-config='name']").forEach((el) => (el.textContent = c.name));
  document.querySelectorAll("[data-config='birthday']").forEach((el) => (el.textContent = c.birthday));
  document.title = `Happy Birthday, ${c.name}`;
}

/* ---- Scene 06 is a passive cinematic beat: it plays itself
   out and advances on its own, or on a single tap to skip. ---- */
function initTransitionScene() {
  const TRANSITION_INDEX = 5;
  let timer = null;
  let advanced = false;

  const scene = document.getElementById("scene-06");
  if (!scene) return;

  function playOut() {
    advanced = false;
    window.clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (!advanced && App.index === TRANSITION_INDEX) {
        advanced = true;
        nextScene();
      }
    }, App.reducedMotion ? 400 : 4600);
  }

  scene.addEventListener("click", () => {
    if (App.index !== TRANSITION_INDEX || advanced) return;
    advanced = true;
    window.clearTimeout(timer);
    nextScene();
  });

  document.addEventListener("scene:changed", (e) => {
    if (e.detail.index === TRANSITION_INDEX) playOut();
  });
}

document.addEventListener("DOMContentLoaded", () => {
  applyConfig();
  initScenes();
  initTransitionScene();
});

window.App = App;
window.goToScene = goToScene;
window.nextScene = nextScene;
window.prevScene = prevScene;
window.makeActivatable = makeActivatable;
window.spawnParticles = spawnParticles;
