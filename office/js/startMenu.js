const REDUCED_MOTION = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
);
const LEAVE_MS = 280;

export function createStartMenu({ onEnter }) {
  const root = document.getElementById("start-menu");
  const enterButton = document.getElementById("enter-office");

  if (!root || !enterButton) {
    throw new Error("Start menu markup is missing.");
  }

  let leaving = false;

  function finishLeave() {
    document.body.classList.remove("at-title");
    root.hidden = true;
    root.classList.remove("is-leaving");
    onEnter();
  }

  function dismiss() {
    if (root.hidden || leaving) {
      return;
    }

    leaving = true;

    if (REDUCED_MOTION.matches) {
      finishLeave();
      return;
    }

    root.classList.add("is-leaving");
    window.setTimeout(finishLeave, LEAVE_MS);
  }

  return {
    enterButton,
    open() {
      document.body.classList.add("at-title");
      root.hidden = false;
      leaving = false;
      enterButton.focus();
    },
    dismiss,
  };
}
