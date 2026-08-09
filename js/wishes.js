/* ==========================================================
   wishes.js — Scene 08. Wishes float gently in space. Tapping
   one opens a small card with its own message. Once enough
   have been opened, the continue button appears.
   ========================================================== */

const Wishes = (() => {
  const OPEN_THRESHOLD_FRACTION = 0.65; // fraction of wishes needed to unlock continue
  let openedCount = 0;
  let threshold = 0;

  // Hand-placed positions so bubbles feel scattered, not gridded.
  const positions = [
    { left: "10%", top: "8%" },
    { left: "58%", top: "4%" },
    { left: "4%", top: "48%" },
    { left: "66%", top: "42%" },
    { left: "30%", top: "70%" },
    { left: "72%", top: "76%" },
  ];

  function render() {
    const field = document.getElementById("wishes-field");
    if (!field) return;
    field.innerHTML = "";

    const items = CONFIG.wishes || [];
    threshold = Math.max(1, Math.ceil(items.length * OPEN_THRESHOLD_FRACTION));

    items.forEach((wish, i) => {
      const bubble = document.createElement("button");
      bubble.type = "button";
      bubble.className = "wish-bubble";
      bubble.textContent = wish.title;
      const pos = positions[i % positions.length];
      bubble.style.left = pos.left;
      bubble.style.top = pos.top;
      bubble.style.setProperty("--float-dur", `${6 + Math.random() * 3}s`);
      bubble.style.setProperty("--float-delay", `${Math.random() * 3}s`);
      bubble.style.setProperty("--float-x", `${(Math.random() - 0.5) * 18}px`);
      bubble.style.setProperty("--float-y", `${-10 - Math.random() * 12}px`);
      bubble.dataset.index = String(i);
      bubble.addEventListener("click", () => openWish(i, bubble));
      field.appendChild(bubble);
    });
  }

  function openWish(index, bubble) {
    const wish = CONFIG.wishes[index];
    const card = document.getElementById("wish-card");
    const titleEl = document.getElementById("wish-card-title");
    const messageEl = document.getElementById("wish-card-message");

    titleEl.textContent = wish.title;
    messageEl.textContent = wish.message;

    card.hidden = false;
    card.setAttribute("aria-hidden", "false");
    void card.offsetHeight;
    card.classList.add("is-open");

    if (!bubble.classList.contains("is-opened")) {
      bubble.classList.add("is-opened");
      openedCount += 1;
      maybeUnlockContinue();
    }
  }

  function closeCard() {
    const card = document.getElementById("wish-card");
    card.classList.remove("is-open");
    card.setAttribute("aria-hidden", "true");
    window.setTimeout(() => {
      card.hidden = true;
    }, App.reducedMotion ? 0 : 320);
  }

  function maybeUnlockContinue() {
    if (openedCount >= threshold) {
      document.getElementById("wishes-continue")?.classList.add("is-visible");
    }
  }

  function bind() {
    render();
    document.getElementById("wish-card-close")?.addEventListener("click", closeCard);
    document.getElementById("wishes-continue")?.addEventListener("click", () => nextScene());
    document.addEventListener("keydown", (e) => {
      const card = document.getElementById("wish-card");
      if (e.key === "Escape" && card && !card.hidden) closeCard();
    });
  }

  return { bind };
})();

document.addEventListener("DOMContentLoaded", Wishes.bind);
