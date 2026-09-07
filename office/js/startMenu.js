import {
  isAudioMuted,
  playUiBlip,
  toggleAudioMuted,
} from "./audio.js";

const DISMISS_MS = 280;
const REDUCED_DISMISS_MS = 1;

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function dismissDelayMs() {
  return prefersReducedMotion()
    ? REDUCED_DISMISS_MS
    : DISMISS_MS;
}

function refreshMuteButton(button, audio) {
  if (!button) {
    return;
  }

  const muted = isAudioMuted(audio);

  button.textContent = muted ? "Unmute" : "Mute";
  button.setAttribute(
    "aria-pressed",
    muted ? "true" : "false"
  );
  button.setAttribute(
    "aria-label",
    muted ? "Unmute audio" : "Mute audio"
  );
}

function focusableControls(menu) {
  return [
    menu.querySelector("#enter-office"),
    menu.querySelector("#start-menu-mute"),
  ].filter(Boolean);
}

function trapFocus(event, menu) {
  if (event.key !== "Tab") {
    return;
  }

  const controls = focusableControls(menu);

  if (controls.length === 0) {
    return;
  }

  const first = controls[0];
  const last = controls[controls.length - 1];
  const active = document.activeElement;

  if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

export function paintMuteButtons(audio, buttons) {
  for (const button of buttons) {
    refreshMuteButton(button, audio);
  }
}

// Cold-boot title gate. Resolves after Enter office dismisses.
export function openStartMenu({ audio, onMuteChange, untilReady }) {
  const menu = document.getElementById("start-menu");
  const enterButton = document.getElementById("enter-office");
  const muteButton = document.getElementById("start-menu-mute");

  if (!menu || !enterButton) {
    return Promise.resolve();
  }

  const syncMute = () => {
    refreshMuteButton(muteButton, audio);
    onMuteChange?.();
  };

  let entered = false;
  const officeReady = untilReady
    ? untilReady.then(() => true)
    : Promise.resolve(true);

  syncMute();
  menu.hidden = false;
  menu.classList.add("is-open");
  menu.classList.remove("is-leaving");
  document.body.classList.add("at-title");
  enterButton.focus();

  return new Promise((resolve) => {
    const onKeyDown = (event) => {
      if (event.key === "Escape") {
        // First boot: Esc must not dismiss or leak into the room.
        event.preventDefault();
        event.stopPropagation();
        return;
      }

      if (event.key === "m" || event.key === "M") {
        if (event.target?.tagName === "INPUT") {
          return;
        }

        event.preventDefault();
        toggleAudioMuted(audio);
        syncMute();
        return;
      }

      trapFocus(event, menu);
    };

    const tearDown = () => {
      document.removeEventListener("keydown", onKeyDown, true);
      muteButton?.removeEventListener("click", onMuteClick);
      enterButton.removeEventListener("click", onEnter);
    };

    const onMuteClick = () => {
      toggleAudioMuted(audio);
      syncMute();
    };

    const finishEnter = async () => {
      if (entered) {
        return;
      }

      entered = true;
      enterButton.textContent = "Opening…";
      tearDown();
      await officeReady;
      enterButton.textContent = "Enter office";
      playUiBlip(audio, "ui");
      menu.classList.add("is-leaving");
      menu.classList.remove("is-open");
      await wait(dismissDelayMs());
      menu.hidden = true;
      menu.classList.remove("is-leaving");
      document.body.classList.remove("at-title");
      resolve();
    };

    const onEnter = (event) => {
      event.preventDefault();
      finishEnter();
    };

    document.addEventListener("keydown", onKeyDown, true);
    muteButton?.addEventListener("click", onMuteClick);
    enterButton.addEventListener("click", onEnter);
  });
}
