/* ==========================================================
   interactions.js — home screen navigation, the Messages
   progressive-reveal flow, Memories scroll reveal, and the
   final-screen sequence.
   ========================================================== */

/* ---- home screen -> apps ---- */
document.querySelectorAll(".app-tile[data-app]").forEach((tile) => {
  tile.addEventListener("click", () => openApp(tile.dataset.app));
});

document.querySelectorAll("[data-close-app]").forEach((btn) => {
  btn.addEventListener("click", closeApp);
});

/* ---- Messages app: reveal one bubble at a time ---- */
const Messages = (() => {
  let index = 0;
  let playing = false;

  function reset() {
    index = 0;
    playing = false;
    const thread = document.getElementById("messages-thread");
    if (thread) thread.innerHTML = "";
    const continueBtn = document.getElementById("messages-continue");
    if (continueBtn) {
      continueBtn.hidden = false;
      continueBtn.textContent = "Continue";
    }
  }

  function appendTyping(from) {
    const thread = document.getElementById("messages-thread");
    const row = document.createElement("div");
    row.className = `msg-row msg-row--${from} is-in`;
    row.id = "typing-indicator";
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble msg-typing";
    bubble.innerHTML = "<span></span><span></span><span></span>";
    row.appendChild(bubble);
    thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
  }

  function removeTyping() {
    document.getElementById("typing-indicator")?.remove();
  }

  function appendMessage(msg) {
    const thread = document.getElementById("messages-thread");
    const row = document.createElement("div");
    row.className = `msg-row msg-row--${msg.from} is-in`;
    const bubble = document.createElement("div");
    bubble.className = "msg-bubble";
    bubble.textContent = msg.text;
    row.appendChild(bubble);
    thread.appendChild(row);
    thread.scrollTop = thread.scrollHeight;
  }

  async function playNext() {
    if (playing) return;
    const list = CONFIG.messages || [];
    if (index >= list.length) return;

    playing = true;
    const continueBtn = document.getElementById("messages-continue");

    const msg = list[index];
    appendTyping(msg.from);
    await wait(App.reducedMotion ? 60 : 500 + Math.random() * 400);
    removeTyping();
    appendMessage(msg);
    index += 1;
    playing = false;

    if (index >= list.length) {
      continueBtn.textContent = "That's it.";
      window.setTimeout(() => {
        continueBtn.hidden = true;
      }, 900);
    }
  }

  function wait(ms) {
    return new Promise((resolve) => window.setTimeout(resolve, ms));
  }

  function bind() {
    document.getElementById("messages-continue")?.addEventListener("click", playNext);
    document.addEventListener("app:opened", (e) => {
      if (e.detail.name === "messages") reset();
    });
  }

  return { bind };
})();
Messages.bind();

/* ---- Memories app: build timeline + scroll reveal ---- */
const Memories = (() => {
  let observer;

  function render() {
    const line = document.getElementById("memory-line");
    if (!line) return;
    line.innerHTML = "";

    (CONFIG.memories || []).forEach((m) => {
      const item = document.createElement("div");
      item.className = "memory-item";
      item.innerHTML = `
        <div class="memory-index">${m.index}</div>
        <div class="memory-title">${m.title}</div>
        <p class="memory-text">${m.text}</p>
        ${m.date ? `<div class="memory-date">${m.date}</div>` : ""}
      `;
      line.appendChild(item);
    });
  }

  function observeItems() {
    const body = document.querySelector("#modal-memories .app-modal__body");
    const items = document.querySelectorAll(".memory-item");
    if (!body || !items.length) return;

    if (observer) observer.disconnect();
    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { root: body, threshold: 0.35 }
    );
    items.forEach((item) => observer.observe(item));
  }

  function bind() {
    render();
    document.addEventListener("app:opened", (e) => {
      if (e.detail.name === "memories") observeItems();
    });
  }

  return { bind };
})();
Memories.bind();

/* ---- final screen: unlocked either by exploring enough apps
   or by finding the easter egg. Plays a quiet, timed sequence. ---- */
const FinalScreen = (() => {
  let played = false;

  function playSequence() {
    const screen = document.getElementById("final-screen");
    if (!screen || played) return;
    played = true;

    screen.hidden = false;
    screen.setAttribute("aria-hidden", "false");
    void screen.offsetHeight;
    screen.classList.add("is-open");

    const lines = Array.from(document.querySelectorAll(".final-line"));
    const delays = App.reducedMotion ? [0, 0, 0, 0] : [0, 1800, 3600, 5600];

    lines.forEach((line, i) => {
      window.setTimeout(() => {
        lines.forEach((l) => l.classList.remove("is-visible"));
        line.classList.add("is-visible");
      }, delays[i]);
    });
  }

  function bind() {
    document.addEventListener("app:ready-for-finale", enableHomeAffordance, { once: true });
  }

  function enableHomeAffordance() {
    const dot = document.querySelector(".home-footer__dot");
    const footer = document.querySelector(".home-footer");
    if (!dot || !footer) return;

    footer.removeAttribute("aria-hidden");
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "secret-continue";
    btn.style.marginTop = "10px";
    btn.style.fontSize = "var(--fs-caption)";
    btn.style.padding = "10px 22px";
    btn.style.border = "1px solid rgba(0,0,0,0.1)";
    btn.style.color = "var(--color-ink)";
    btn.textContent = "one more thing";
    btn.addEventListener("click", playSequence);
    footer.appendChild(btn);
  }

  return { bind, playSequence };
})();
FinalScreen.bind();

window.playFinalSequence = FinalScreen.playSequence;
