import {
  createScenePlane, mountSceneDebugger, validateSceneAnnotations,
} from "./sceneAnnotations.js?v=anchors-v3";
import { createEffectPreset } from "./sceneEffects.js?v=anchors-v3";

const SETTINGS_KEY = "office.settings.v1";

async function loadMainMenuScene() {
  const response = await fetch("data/main-menu-scene.json", {
    cache: "no-cache",
  });
  if (!response.ok) {
    throw new Error(`Main menu scene failed to load: ${response.status}`);
  }
  const scene = await response.json();
  const references = scene.effectBindings.map(binding => ({
    id: binding.annotation,
    kind: binding.kind,
    owner: `Effect binding ${binding.id}`,
  }));
  validateSceneAnnotations(scene, [], references);
  return scene;
}

function loadSettings(storage) {
  try {
    const settings = JSON.parse(storage.getItem(SETTINGS_KEY));
    return { reduceMotion: settings?.reduceMotion === true };
  } catch {
    return { reduceMotion: false };
  }
}

function saveSettings(storage, settings) {
  try {
    storage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // The setting still applies for this visit when storage is unavailable.
  }
}

function applySettings(settings) {
  document.body.classList.toggle("reduce-motion", settings.reduceMotion);
}

export async function createMainMenu({
  storage,
  hasSave,
  onContinue,
  onNewCompany,
}) {
  const menu = document.getElementById("main-menu");
  const game = document.getElementById("game-shell");
  const continueButton = document.getElementById("continue-game");
  const newCompanyButton = document.getElementById("new-company");
  const confirmation = document.getElementById("new-company-panel");
  const settingsPanel = document.getElementById("settings-panel");
  const quitPanel = document.getElementById("quit-panel");
  const reduceMotion = document.getElementById("reduce-motion");
  const status = document.getElementById("main-menu-status");
  let settings = loadSettings(storage);
  const scene = await loadMainMenuScene();
  const scenePlane = createScenePlane(menu, scene, scene.fit);
  for (const binding of scene.effectBindings) {
    const effect = createEffectPreset(binding.preset, binding.parameters);
    if (binding.kind === "surface") {
      scenePlane.addSurface(binding.annotation, effect);
    } else {
      scenePlane.addPoint(binding.annotation, effect);
    }
  }
  mountSceneDebugger(scenePlane);

  function syncAnimationState() {
    menu.dataset.paused = String(document.hidden);
  }

  function refreshSaveState() {
    const canContinue = hasSave();
    continueButton.disabled = !canContinue;
    status.textContent = canContinue ? "" : "No saved company yet.";
    return canContinue;
  }

  function enterGame(action) {
    for (const panel of menu.querySelectorAll("dialog[open]")) panel.close();
    menu.hidden = true;
    game.hidden = false;
    game.inert = false;
    document.title = "Office · Bedroom Office";
    action();
  }

  function startNewCompany() {
    enterGame(onNewCompany);
  }

  function show() {
    menu.hidden = false;
    game.hidden = true;
    game.inert = true;
    document.title = "Office";
    const canContinue = refreshSaveState();
    const focusTarget = canContinue ? continueButton : newCompanyButton;
    requestAnimationFrame(() => focusTarget.focus());
  }

  continueButton.addEventListener("click", () => enterGame(onContinue));
  newCompanyButton.addEventListener("click", () => {
    if (refreshSaveState()) confirmation.showModal();
    else startNewCompany();
  });
  document.getElementById("confirm-new-company")
    .addEventListener("click", startNewCompany);
  document.getElementById("open-settings")
    .addEventListener("click", () => settingsPanel.showModal());
  document.getElementById("quit-game")
    .addEventListener("click", () => quitPanel.showModal());
  reduceMotion.addEventListener("change", () => {
    settings = { reduceMotion: reduceMotion.checked };
    applySettings(settings);
    saveSettings(storage, settings);
  });

  reduceMotion.checked = settings.reduceMotion;
  applySettings(settings);
  document.addEventListener("visibilitychange", syncAnimationState);
  syncAnimationState();
  show();

  return { show };
}
