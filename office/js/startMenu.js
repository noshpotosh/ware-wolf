const DISMISS_MS = 280;
const REDUCED_DISMISS_MS = 1;
const ENTER_LABEL = "Enter office";
const OPENING_LABEL = "Opening…";

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

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

/**
 * Cold-boot title gate. Resolves after Enter office dismisses.
 */
export function openStartMenu({
  untilReady = Promise.resolve(),
} = {}) {
  const menu = document.getElementById("start-menu");
  const enterButton = document.getElementById("enter-office");

  if (!menu || !enterButton) {
    return Promise.resolve();
  }

  let entered = false;

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

      if (event.key !== "Tab") {
        return;
      }

      // Single CTA: keep focus on Enter office.
      event.preventDefault();
      enterButton.focus();
    };

    const tearDown = () => {
      document.removeEventListener("keydown", onKeyDown, true);
      enterButton.removeEventListener("click", onEnter);
    };

    const finishEnter = async () => {
      if (entered) {
        return;
      }

      entered = true;
      tearDown();
      enterButton.disabled = true;
      enterButton.textContent = OPENING_LABEL;
      await untilReady;
      enterButton.textContent = ENTER_LABEL;
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
    enterButton.addEventListener("click", onEnter);
  });
}
