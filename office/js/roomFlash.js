import {
  ROOM_FLASH_FADE_OUT_MIN_MS,
  ROOM_FLASH_MS,
  ROOM_FLASH_REDUCED_MS,
} from "./constants.js";

const FLASH_CLASS = "room-flash";

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function flashDurationMs() {
  if (prefersReducedMotion()) {
    return ROOM_FLASH_REDUCED_MS;
  }

  return ROOM_FLASH_MS;
}

// Opaque mid-flash is when the room swap should land.
export function playRoomFlash(stageEl, onMidFlash) {
  return new Promise((resolve) => {
    if (!stageEl) {
      onMidFlash();
      resolve();
      return;
    }

    const duration = flashDurationMs();
    const midFlashMs = duration / 2;
    const overlay = document.createElement("div");

    overlay.className = FLASH_CLASS;
    overlay.setAttribute("aria-hidden", "true");
    stageEl.appendChild(overlay);

    // Force paint so the opacity transition runs.
    overlay.getBoundingClientRect();
    overlay.classList.add("is-on");

    let swapped = false;

    window.setTimeout(() => {
      swapped = true;
      onMidFlash();
    }, midFlashMs);

    window.setTimeout(() => {
      if (!swapped) {
        onMidFlash();
      }

      overlay.classList.remove("is-on");
      overlay.classList.add("is-off");

      window.setTimeout(() => {
        overlay.remove();
        resolve();
      }, Math.max(ROOM_FLASH_FADE_OUT_MIN_MS, midFlashMs));
    }, duration);
  });
}
