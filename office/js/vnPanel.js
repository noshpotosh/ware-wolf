import {
  PLAYER_STAFF_ID,
  STAFF_NAMEPLATE,
} from "./constants.js";

const TYPEWRITER_MS_PER_CHAR = 28;
const BUST_PATH_PREFIX = "assets/characters/vn-busts/";
const FALLBACK_NPC_BUST_ALT = "Teammate";

function prefersReducedMotion() {
  return window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
}

function bustSrc(staffId) {
  return `${BUST_PATH_PREFIX}${staffId}.png`;
}

function bustAlt(staffId, fallback) {
  return STAFF_NAMEPLATE[staffId] || fallback;
}

function clearTypewriter(panel) {
  if (panel.typeTimerId === null) {
    return;
  }

  window.clearInterval(panel.typeTimerId);
  panel.typeTimerId = null;
}

function clearBust(imageEl) {
  imageEl.hidden = true;
  imageEl.removeAttribute("src");
  imageEl.alt = "";
}

function paintBust(imageEl, staffId, altText) {
  imageEl.hidden = true;
  imageEl.alt = altText;
  imageEl.onload = () => {
    imageEl.hidden = false;
  };
  imageEl.onerror = () => {
    clearBust(imageEl);
  };
  imageEl.src = bustSrc(staffId);
}

function showLineInstant(panel, line) {
  panel.lineEl.textContent = `“${line}”`;
}

function startTypewriter(panel, line) {
  clearTypewriter(panel);

  const quoted = `“${line}”`;

  if (prefersReducedMotion()) {
    showLineInstant(panel, line);
    return;
  }

  let charIndex = 0;
  panel.lineEl.textContent = "";

  panel.typeTimerId = window.setInterval(() => {
    charIndex += 1;
    panel.lineEl.textContent = quoted.slice(0, charIndex);

    if (charIndex >= quoted.length) {
      clearTypewriter(panel);
    }
  }, TYPEWRITER_MS_PER_CHAR);
}

export function createVnPanel(rootEl) {
  if (!rootEl) {
    throw new Error("Missing VN panel root");
  }

  return {
    rootEl,
    playerBustEl: rootEl.querySelector("[data-vn-bust='player']"),
    npcBustEl: rootEl.querySelector("[data-vn-bust='npc']"),
    nameplateEl: rootEl.querySelector("[data-vn-nameplate]"),
    lineEl: rootEl.querySelector("[data-vn-line]"),
    typeTimerId: null,
    isOpen: false,
  };
}

export function isVnPanelOpen(panel) {
  return Boolean(panel && panel.isOpen);
}

export function closeVnPanel(panel) {
  if (!panel || !panel.isOpen) {
    return;
  }

  clearTypewriter(panel);
  panel.isOpen = false;
  panel.rootEl.hidden = true;
  document.body.classList.remove("vn-open");

  if (panel.nameplateEl) {
    panel.nameplateEl.textContent = "";
  }

  if (panel.lineEl) {
    panel.lineEl.textContent = "";
  }

  if (panel.playerBustEl) {
    clearBust(panel.playerBustEl);
  }

  if (panel.npcBustEl) {
    clearBust(panel.npcBustEl);
  }
}

export function openVnPanel(panel, talk) {
  if (!panel || !talk) {
    return;
  }

  clearTypewriter(panel);
  panel.isOpen = true;
  panel.rootEl.hidden = false;
  document.body.classList.add("vn-open");

  if (panel.nameplateEl) {
    panel.nameplateEl.textContent = talk.displayName || "";
  }

  if (panel.playerBustEl) {
    paintBust(
      panel.playerBustEl,
      PLAYER_STAFF_ID,
      bustAlt(PLAYER_STAFF_ID, "Nosh")
    );
  }

  if (panel.npcBustEl) {
    paintBust(
      panel.npcBustEl,
      talk.staffId,
      talk.displayName
        || bustAlt(talk.staffId, FALLBACK_NPC_BUST_ALT)
    );
  }

  startTypewriter(panel, talk.line || "");
}

export function handleVnPanelKeydown(panel, event) {
  if (!isVnPanelOpen(panel)) {
    return false;
  }

  const isDismissKey =
    event.key === "Escape"
    || event.key === "e"
    || event.key === "E";

  // While open, swallow all keys so loft cannot re-trigger talk.
  if (!isDismissKey) {
    return true;
  }

  event.preventDefault();
  closeVnPanel(panel);
  return true;
}
