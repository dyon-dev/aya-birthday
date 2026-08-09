/* ==========================================================
   audio.js — music starts on the first real user interaction.
   The music control appears after that interaction.
   Missing file never breaks the page.
   ========================================================== */

const AudioControl = (() => {
  let audio;
  let button;
  let fileAvailable = false;

  const iconNote = `<path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.6" fill="none"/>`;

  const iconMuted = `<path d="M9 18V5l12-2v13" stroke="currentColor" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round" opacity="0.4"/><circle cx="6" cy="18" r="3" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.4"/><circle cx="18" cy="16" r="3" stroke="currentColor" stroke-width="1.6" fill="none" opacity="0.4"/><path d="M3 3l18 18" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>`;

  function checkFileExists(src) {
    return fetch(src, { method: "HEAD" })
      .then((res) => res.ok)
      .catch(() => false);
  }

  function updateButton(isPlaying) {
    if (!button) return;

    if (isPlaying) {
      button.classList.remove("is-muted");
      button.querySelector("svg").innerHTML = iconNote;
      button.setAttribute("aria-label", "Pause music");
    } else {
      button.classList.add("is-muted");
      button.querySelector("svg").innerHTML = iconMuted;
      button.setAttribute("aria-label", "Play music");
    }
  }

  function play() {
    if (!fileAvailable || !audio) return;

    audio
      .play()
      .then(() => {
        updateButton(true);
        button.classList.add("is-visible");
      })
      .catch(() => {
        // Browser still blocked playback.
        // The music button remains available for manual playback.
        updateButton(false);
        button.classList.add("is-visible");
      });
  }

  function toggle() {
    if (!fileAvailable || !audio) return;

    if (audio.paused) {
      play();
    } else {
      audio.pause();
      updateButton(false);
    }
  }

  async function init() {
    button = document.getElementById("audio-control");
    if (!button) return;

    audio = new Audio();
    audio.loop = true;
    audio.volume = 0.55;
    audio.src = CONFIG.song.file;
    audio.preload = "auto";

    fileAvailable = await checkFileExists(CONFIG.song.file);

    if (!fileAvailable) return;

    updateButton(false);

    button.addEventListener("click", toggle);

    /*
     * The first real interaction starts the music.
     *
     * This means Aya doesn't need to press the music button.
     * Her first action — opening the envelope — is enough.
     */
    const startMusic = () => {
      play();

      document.removeEventListener("click", startMusic);
      document.removeEventListener("touchstart", startMusic);
      document.removeEventListener("keydown", startMusic);
    };

    document.addEventListener("click", startMusic, {
      once: true,
      capture: true,
    });

    document.addEventListener("touchstart", startMusic, {
      once: true,
      capture: true,
    });

    document.addEventListener("keydown", startMusic, {
      once: true,
      capture: true,
    });
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", AudioControl.init);