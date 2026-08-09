/* ==========================================================
   music.js — minimal Apple-Music-style player.
   Never autoplays. Never throws if the song file is missing.
   ========================================================== */

const MusicPlayer = (() => {
  let audio;
  let playBtn;
  let playIcon;
  let progressBar;
  let progressFill;
  let elapsedEl;
  let durationEl;
  let missingEl;
  let volumeSlider;
  let fileAvailable = false;
  let seeking = false;

  const iconPlay = `<path d="M8 5v14l11-7z"/>`;
  const iconPause = `<path d="M6 5h4v14H6zM14 5h4v14h-4z"/>`;

  function formatTime(seconds) {
    if (!isFinite(seconds) || seconds < 0) return "0:00";
    const m = Math.floor(seconds / 60);
    const s = Math.floor(seconds % 60);
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  function checkFileExists(src) {
    return fetch(src, { method: "HEAD" })
      .then((res) => res.ok)
      .catch(() => false);
  }

  async function init() {
    audio = document.getElementById("music-audio");
    playBtn = document.getElementById("music-play");
    playIcon = document.getElementById("music-play-icon");
    progressBar = document.getElementById("music-progress-bar");
    progressFill = document.getElementById("music-progress-fill");
    elapsedEl = document.getElementById("music-elapsed");
    durationEl = document.getElementById("music-duration");
    missingEl = document.getElementById("music-missing");
    volumeSlider = document.getElementById("music-volume-slider");

    if (!audio) return;

    audio.volume = 0.7;
    audio.src = CONFIG.song.file;

    fileAvailable = await checkFileExists(CONFIG.song.file);
    if (!fileAvailable) {
      missingEl.hidden = false;
      playBtn.setAttribute("aria-disabled", "true");
    }

    bindEvents();
  }

  function togglePlay() {
    if (!fileAvailable) return;

    if (audio.paused) {
      audio.play().catch(() => {
        // Playback can still fail (codec, browser policy) — fail quietly.
        missingEl.hidden = false;
        missingEl.textContent = "Couldn't play this file — check the format.";
      });
    } else {
      audio.pause();
    }
  }

  function updatePlayIcon() {
    playIcon.innerHTML = audio.paused ? iconPlay : iconPause;
    playBtn.setAttribute("aria-label", audio.paused ? "Play" : "Pause");
  }

  function updateProgress() {
    if (seeking || !audio.duration) return;
    const pct = (audio.currentTime / audio.duration) * 100;
    progressFill.style.width = `${pct}%`;
    progressBar.setAttribute("aria-valuenow", String(Math.round(pct)));
    elapsedEl.textContent = formatTime(audio.currentTime);
  }

  function seekFromEvent(e) {
    if (!audio.duration) return;
    const rect = progressBar.getBoundingClientRect();
    const x = (e.clientX ?? e.touches?.[0]?.clientX ?? 0) - rect.left;
    const pct = Math.min(1, Math.max(0, x / rect.width));
    audio.currentTime = pct * audio.duration;
    progressFill.style.width = `${pct * 100}%`;
  }

  function bindEvents() {
    playBtn.addEventListener("click", togglePlay);
    audio.addEventListener("play", updatePlayIcon);
    audio.addEventListener("pause", updatePlayIcon);
    audio.addEventListener("timeupdate", updateProgress);

    audio.addEventListener("loadedmetadata", () => {
      durationEl.textContent = formatTime(audio.duration);
    });

    progressBar.addEventListener("pointerdown", (e) => {
      seeking = true;
      seekFromEvent(e);
    });
    window.addEventListener("pointermove", (e) => {
      if (seeking) seekFromEvent(e);
    });
    window.addEventListener("pointerup", () => {
      seeking = false;
    });

    progressBar.addEventListener("keydown", (e) => {
      if (!audio.duration) return;
      if (e.key === "ArrowRight") audio.currentTime = Math.min(audio.duration, audio.currentTime + 5);
      if (e.key === "ArrowLeft") audio.currentTime = Math.max(0, audio.currentTime - 5);
    });

    volumeSlider.addEventListener("input", () => {
      audio.volume = Number(volumeSlider.value) / 100;
    });

    // Pause playback when the Music app closes, so it doesn't run
    // silently in the background.
    document.addEventListener("app:closed", (e) => {
      if (e.detail?.name === "music" && audio && !audio.paused) {
        audio.pause();
      }
    });
  }

  return { init };
})();

document.addEventListener("DOMContentLoaded", MusicPlayer.init);
