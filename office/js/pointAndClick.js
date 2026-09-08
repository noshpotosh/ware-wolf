import {
  createRoomEffects, polygonPoints, svgElement,
} from "./roomEffects.js?v=steam-v1";
import { describeTime } from "./worldClock.js";
import { createDesktop } from "./desktopOS.js";
import { createMainMenu } from "./mainMenu.js";
import { createCompanyCreation } from "./companyCreation.js";
import {
  createScenePlane, mountSceneDebugger, validateSceneAnnotations,
} from "./sceneAnnotations.js?v=anchors-v3";
import {
  createCrtEffect, createEffectPreset, createSteamEffect,
} from "./sceneEffects.js?v=anchors-v3";
import { validateOfficeGraph } from "./officeGraph.js";
import {
  hasSavedAdventure, loadAdventure, saveAdventure, setItemCollected,
} from "./adventureState.js";

const STARTING_ROOM_ID = "founders-office";
const OFFICE_MAP_PATH = "data/office-map.json";
const ACTIVATE_KEYS = new Set(["Enter", " "]);
const room = document.getElementById("room");
const dialog = document.getElementById("inspection");
const itemAction = document.getElementById("item-action");
const officeMap = document.getElementById("office-map");
const officeMapCard = document.querySelector(".office-map-card");
const officeMapPanel = document.getElementById("office-map-popover");
const officeMapToggle = document.getElementById("toggle-office-map");
let definition;
const definitions = new Map();
let officeGraph;
let state;
let inOffice = true;
let inspectedItem = null;
let mainMenu;
let companyCreation;
let roomScenePlane;
let renderedScene;
let roomTransitioning = false;
const availableTransitions = new Set();
const desktop = createDesktop(syncMotion);

function renderClock() {
  const time = describeTime();
  const founderName = state?.company?.founderName || "Nosh";
  document.getElementById("clock-time").textContent = time.clock;
  document.getElementById("day-label").textContent = time.date.toUpperCase();
  document.getElementById("founder-state").textContent = time.mood;
  document.getElementById("founder-name").textContent = founderName;
  document.getElementById("founder-avatar").alt =
    `${founderName} · ${time.mood}`;
}

function startClock() {
  renderClock();
  setInterval(renderClock, 1000);
}

function panelOpen() {
  return Boolean(document.querySelector("dialog[open]"));
}

function syncMotion() {
  const paused = panelOpen() || document.hidden;
  document.body.classList.toggle("speaking", dialog.open);
  room.dataset.paused = String(paused);
  document.body.dataset.away = String(document.hidden);
}

function showObjectLabel(label = "", target = null) {
  const tooltip = document.getElementById("object-label");
  tooltip.textContent = label;
  tooltip.hidden = !target;
  if (!target) return;
  const bounds = target.getBoundingClientRect();
  tooltip.style.left = `${bounds.left + bounds.width / 2}px`;
  tooltip.style.top = `${bounds.bottom + 8}px`;
}

function storage() {
  // Private browsing can deny even access to the localStorage property.
  try { return window.localStorage; }
  catch { return null; }
}

function announce(message) {
  document.getElementById("game-message").textContent = message;
}

function mapRoomButton(roomDefinition) {
  const map = officeGraph.rooms.find(item => item.id === roomDefinition.id);
  const layout = map.layout;
  const button = document.createElement("button");
  const current = roomDefinition.id === definition.id;
  const shape = svgElement("svg", {
    class: "map-room-shape",
    viewBox: "0 0 100 100",
    preserveAspectRatio: "none",
    "aria-hidden": "true",
  });
  shape.append(svgElement("path", {
    d: layout.outline,
    "fill-rule": "evenodd",
  }));
  const label = document.createElement("span");
  label.textContent = map.label;
  button.type = "button";
  button.dataset.room = roomDefinition.id;
  button.style.setProperty("--map-x", `${layout.x}%`);
  button.style.setProperty("--map-y", `${layout.y}%`);
  button.style.setProperty("--map-width", `${layout.width}%`);
  button.style.setProperty("--map-height", `${layout.height}%`);
  button.setAttribute("aria-label", current
    ? `${roomDefinition.title}, current location`
    : `Go to ${roomDefinition.title}`);
  button.append(shape, label);
  if (current) {
    button.setAttribute("aria-current", "location");
    const marker = document.createElement("small");
    marker.textContent = "You are here";
    button.append(marker);
  }
  button.addEventListener("click", () => navigateFromMap(roomDefinition.id));
  return button;
}

function renderOfficeMap() {
  const rooms = officeGraph.rooms.map(({ id }) => definitions.get(id));
  officeMap.replaceChildren(...rooms.map(mapRoomButton));
}

function setOfficeMapOpen(open, returnFocus = false) {
  officeMapPanel.hidden = !open;
  officeMapToggle.setAttribute("aria-expanded", String(open));
  officeMapToggle.setAttribute("aria-label",
    open ? "Close office map" : "Open office map");
  if (returnFocus) officeMapToggle.focus();
}

function navigateFromMap(roomId) {
  setOfficeMapOpen(false);
  if (roomId === definition.id) {
    announce(`Already in ${definition.title}.`);
    officeMapToggle.focus();
    return;
  }

  inOffice = true;
  document.getElementById("leave-room").hidden = false;
  enterRoom(roomId);
  officeMapToggle.focus();
}

function createObjectHighlight(hotspot) {
  if (hotspot.highlight === false) return null;
  const annotation = renderedScene.annotations[hotspot.annotation];
  if (!annotation || annotation.kind !== "object") {
    throw new Error(`Unknown object annotation: ${hotspot.annotation}`);
  }
  const [x, y, width, height] = annotation.bounds;
  return svgElement("image", {
    href: annotation.mask,
    preserveAspectRatio: "none",
    x,
    y,
    width,
    height,
    class: "object-highlight",
    filter: "url(#object-highlight-filter)",
    "pointer-events": "none",
  });
}

function createHotspot(hotspot) {
  hotspot = { ...hotspot, ...renderedScene.hotspots[hotspot.id] };
  const polygon = svgElement("g", {
    class: "hotspot",
    tabindex: "0", role: "button",
    "aria-label": hotspot.action === "navigate"
      ? `Go through ${hotspot.label}` : `Inspect ${hotspot.label}`,
    "data-hotspot": hotspot.id,
  });
  polygon.append(svgElement("polygon", {
    points: polygonPoints(hotspot.points), class: "hotspot-target",
  }));
  const highlight = createObjectHighlight(hotspot);
  if (highlight) polygon.append(highlight);
  for (const event of ["pointerenter", "focus"]) {
    polygon.addEventListener(event, () => {
      if (hotspot.showLabel === false) showObjectLabel();
      else showObjectLabel(hotspot.label, polygon);
    });
  }
  for (const event of ["pointerleave", "blur"]) {
    polygon.addEventListener(event, () => showObjectLabel());
  }
  polygon.addEventListener("click", () => inspect(hotspot));
  polygon.addEventListener("keydown", (event) => {
    if (!ACTIVATE_KEYS.has(event.key) || event.repeat) return;
    event.preventDefault();
    inspect(hotspot);
  });
  return polygon;
}

function highlightFilter() {
  const filter = svgElement("filter", {
    id: "object-highlight-filter",
    x: "-20%",
    y: "-20%",
    width: "140%",
    height: "140%",
    "color-interpolation-filters": "sRGB",
  });
  filter.innerHTML = `
    <feMorphology in="SourceAlpha" operator="dilate" radius="4"
      result="wide"/>
    <feComposite in="wide" in2="SourceAlpha" operator="out"
      result="outer-ring"/>
    <feFlood flood-color="#624314" result="shadow-color"/>
    <feComposite in="shadow-color" in2="outer-ring" operator="in"
      result="shadow"/>
    <feMorphology in="SourceAlpha" operator="erode" radius="1.2"
      result="inside"/>
    <feComposite in="SourceAlpha" in2="inside" operator="out"
      result="inner-ring"/>
    <feFlood flood-color="#ffe1a0" result="light-color"/>
    <feComposite in="light-color" in2="inner-ring" operator="in"
      result="light"/>
    <feFlood flood-color="#d99b32" flood-opacity=".2"
      result="tint-color"/>
    <feComposite in="tint-color" in2="SourceAlpha" operator="in"
      result="tint"/>
    <feMerge><feMergeNode in="shadow"/><feMergeNode in="tint"/>
      <feMergeNode in="light"/></feMerge>`;
  return filter;
}

function backgroundImage(path, source = definition) {
  return svgElement("image", {
    href: path, width: source.width, height: source.height,
  });
}

function findPickup(id) {
  for (const roomDefinition of definitions.values()) {
    const pickup = roomDefinition.pickups.find(item => item.id === id);
    if (pickup) return { pickup, roomDefinition };
  }
  return null;
}

function createPickupPatch(pickup) {
  const group = svgElement("g", { "data-patch": pickup.id });
  const maskId = `pickup-${pickup.id}`;
  const defs = svgElement("defs");
  const mask = svgElement("mask", { id: maskId,
    maskUnits: "userSpaceOnUse", ...pickup.patch });
  // Soften the patch seam without changing surrounding painted geometry.
  const feather = svgElement("filter", { id: `${maskId}-feather` });
  feather.append(svgElement("feGaussianBlur", { stdDeviation: "1" }));
  defs.append(feather);
  mask.append(svgElement("polygon", {
    points: polygonPoints(pickup.maskPoints), fill: "white",
    filter: `url(#${maskId}-feather)`,
  }));
  defs.append(mask);
  const image = backgroundImage(pickup.emptyImage);
  image.setAttribute("mask", `url(#${maskId})`);
  image.setAttribute("pointer-events", "none");
  group.append(defs, image);
  return group;
}

function renderRoom() {
  renderedScene = definition;
  const art = svgElement("svg", {
    class: "room-art",
    viewBox: `0 0 ${definition.width} ${definition.height}`,
    "aria-label": definition.title,
  });
  const defs = svgElement("defs");
  const silhouette = svgElement("clipPath", { id: "room-silhouette" });
  silhouette.append(svgElement("path", { d: definition.silhouette }));
  defs.append(silhouette, highlightFilter());
  const background = backgroundImage(definition.background);
  background.setAttribute("clip-path", "url(#room-silhouette)");
  art.append(defs, background);
  for (const pickup of definition.pickups) {
    art.append(createPickupPatch(pickup));
  }
  art.append(createRoomEffects(definition.effects));
  for (const hotspot of definition.hotspots) art.append(createHotspot(hotspot));
  roomScenePlane?.destroy();
  room.replaceChildren(art);
  roomScenePlane = createScenePlane(room, definition);
  if (definition.effects.screen) {
    roomScenePlane.addSurface(
      definition.effects.screen.surface,
      createCrtEffect()
    );
  }
  if (definition.effects.steam) {
    roomScenePlane.addPoint(
      definition.effects.steam.point,
      createSteamEffect(definition.effects.steam.pickupId)
    );
  }
  for (const binding of definition.effectBindings ?? []) {
    const effect = createEffectPreset(binding.preset, binding.parameters);
    if (binding.kind === "surface") {
      roomScenePlane.addSurface(binding.annotation, effect);
    } else {
      roomScenePlane.addPoint(binding.annotation, effect);
    }
  }
  mountSceneDebugger(roomScenePlane, definition.hotspots);
  room.dataset.ready = "true";
  refreshPickupVisibility();
  renderOfficeMap();
  showObjectLabel();
  syncMotion();
}

function updateRoomChrome() {
  const heading = document.querySelector(".room-heading h1");
  const icon = heading.querySelector("svg");
  heading.replaceChildren(icon, ` ${definition.title}`);
  document.querySelector(".room-heading p").textContent =
    definition.subtitle;
  document.getElementById("room").ariaLabel = definition.title;
  document.querySelector("#journal-panel h3").textContent =
    definition.title;
  document.title = `Warewolf · ${definition.title}`;
}

function enterRoom(roomId, focusHotspot) {
  const nextRoom = definitions.get(roomId);
  if (!nextRoom) {
    announce("That room is not ready yet.");
    return;
  }

  definition = nextRoom;
  state = { ...state, roomId };
  saveAdventure(storage(), state);
  updateRoomChrome();
  renderRoom();
  renderInventory();
  room.querySelector(`[data-hotspot="${focusHotspot}"]`)?.focus();
  announce(`Entered ${definition.title}.`);
}

function refreshPickupVisibility() {
  for (const pickup of definition.pickups) {
    const collected = state.items.includes(pickup.id);
    const hotspot = room.querySelector(`[data-hotspot="${pickup.id}"]`);
    const patch = room.querySelector(`[data-patch="${pickup.id}"]`);
    const layers = room.querySelectorAll(
      `[data-pickup-layer="${pickup.id}"]`
    );
    if (hotspot) hotspot.style.display = collected ? "none" : "";
    if (patch) patch.style.display = collected ? "" : "none";
    for (const layer of layers) {
      layer.style.display = collected ? "none" : "";
    }
    for (const effect of room.querySelectorAll(
      `[data-pickup-effect="${pickup.id}"]`
    )) {
      effect.style.display = collected ? "none" : "";
    }
  }
}

function transitionKey(roomDefinition, transitionId) {
  return `${roomDefinition.id}:${transitionId}`;
}

function wait(milliseconds) {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
}

function createTransitionPatch(transition) {
  const annotation = renderedScene.annotations[transition.patch];
  const [x, y, width, height] = annotation.bounds;
  const group = svgElement("g", { class: "room-transition-layer" });
  const maskId = "room-transition-patch";
  const mask = svgElement("mask", {
    id: maskId,
    x,
    y,
    width,
    height,
    maskUnits: "userSpaceOnUse",
  });
  mask.append(svgElement("image", {
    href: annotation.mask, x, y, width, height,
    preserveAspectRatio: "none",
  }));
  const defs = svgElement("defs");
  defs.append(mask);
  const patch = backgroundImage(transition.patchImage);
  patch.setAttribute("mask", `url(#${maskId})`);
  group.append(defs, patch);
  return group;
}

function createTransitionFrame(transition) {
  const annotation = renderedScene.annotations[transition.frames.object];
  const [offsetX, offsetY] = transition.frames.offset;
  const [width, height] = transition.frames.size;
  const x = annotation.bounds[0] + offsetX;
  const y = annotation.bounds[1] + offsetY;
  return svgElement("image", {
    x,
    y,
    width,
    height,
    class: "room-transition-frame",
    "pointer-events": "none",
  });
}

function reducedMotionEnabled() {
  return document.body.classList.contains("reduce-motion")
    || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

async function playTransition(hotspot, transition) {
  roomTransitioning = true;
  room.dataset.transitioning = "true";
  showObjectLabel();
  const art = room.querySelector(".room-art");
  const layer = createTransitionPatch(transition);
  const frame = createTransitionFrame(transition);
  layer.append(frame);
  art.append(layer);

  try {
    const frames = transition.frames.items
      ?? Array.from({ length: transition.frames.count }, (_, index) => ({
        path: `${transition.frames.directory}/frame-${index + 1}.png`,
        durationMs: transition.frames.duration,
      }));
    for (const item of frames) {
      frame.setAttribute(
        "href",
        item.path
      );
      await wait(item.durationMs);
    }
    await wait(transition.frames.finalHold);
  } finally {
    roomTransitioning = false;
    delete room.dataset.transitioning;
  }
}

async function navigateThrough(hotspot) {
  if (roomTransitioning) return;
  const transition = definition.transitions?.[hotspot.transition];
  const key = transitionKey(definition, hotspot.transition);
  const canAnimate = transition
    && availableTransitions.has(key)
    && !reducedMotionEnabled();

  if (canAnimate) {
    try {
      await playTransition(hotspot, transition);
    } catch (error) {
      console.warn("Door transition failed; navigating immediately.", error);
    }
  }
  enterRoom(hotspot.targetRoom, hotspot.targetHotspot);
}

function inspect(hotspot) {
  if (hotspot.action === "navigate") {
    navigateThrough(hotspot);
    return;
  }
  if (hotspot.id === "computer") {
    showObjectLabel();
    desktop.open();
    return;
  }
  inspectedItem = findPickup(hotspot.id)?.pickup ?? null;
  const collected = state.items.includes(hotspot.id);
  const pickupBelongsHere = definition.pickups.some(
    item => item.id === hotspot.id
  );
  const inventoryDescription = pickupBelongsHere
    ? "Your green coffee mug. You can put it back on the desk."
    : "Your green coffee mug. Return to the bedroom to put it back.";
  document.getElementById("inspection-title").textContent =
    state.company?.founderName || "Nosh";
  document.getElementById("inspection-description").textContent = collected
    ? inventoryDescription
    : hotspot.description;
  itemAction.hidden = !inspectedItem || !inOffice || !pickupBelongsHere;
  itemAction.textContent = collected ? "Put back on desk" : "Pick up mug";
  dialog.showModal();
  syncMotion();
}

function renderInventory() {
  const inventory = document.getElementById("inventory");
  const label = document.createElement("span");
  label.className = "inventory-empty";
  label.textContent = "";
  inventory.replaceChildren(label);
  for (const id of state.items) {
    const item = findPickup(id);
    if (!item) continue;
    const { pickup, roomDefinition } = item;
    const button = document.createElement("button");
    button.type = "button";
    const icon = svgElement("svg", {
      class: "inventory-icon", "aria-hidden": "true",
      viewBox: pickup.iconViewBox.join(" "),
    });
    icon.append(backgroundImage(roomDefinition.background, roomDefinition));
    const text = document.createElement("span");
    text.textContent = pickup.label;
    button.append(icon, text);
    button.addEventListener("click", () => inspect(pickup));
    inventory.append(button);
  }
  for (let slot = state.items.length; slot < 5; slot += 1) {
    const empty = document.createElement("span");
    empty.className = "empty-slot";
    empty.setAttribute("aria-hidden", "true");
    inventory.append(empty);
  }

}

function changeItem() {
  if (!inspectedItem || !inOffice) return;
  const pickupBelongsHere = definition.pickups.some(
    item => item.id === inspectedItem.id
  );
  if (!pickupBelongsHere) return;
  const collected = !state.items.includes(inspectedItem.id);
  state = setItemCollected(state, inspectedItem.id, collected);
  const saved = saveAdventure(storage(), state);
  dialog.close();
  syncMotion();
  refreshPickupVisibility();
  renderInventory();
  const message = collected ? "Coffee mug added to inventory."
    : "Coffee mug returned to the desk.";
  const saveWarning = "Progress cannot save in this browser.";
  announce(saved ? message : `${message} ${saveWarning}`);
  // The previous focused hotspot disappears when its item is collected.
  const focusTarget = collected
    ? document.querySelector("#inventory button")
    : room.querySelector('[data-hotspot="coffee"]');
  focusTarget?.focus();
}

function leaveRoom() {
  document.getElementById("menu-panel").close();
  inOffice = false;
  showObjectLabel("Away from the office");
  document.getElementById("leave-room").hidden = true;

  const menu = document.createElement("section");
  menu.className = "room-menu";
  const heading = document.createElement("h2");
  heading.textContent = `You stepped away from ${definition.title}.`;
  const enter = document.createElement("button");
  enter.textContent = `Return to ${definition.title}`;
  enter.addEventListener("click", () => {
    inOffice = true;
    renderRoom();
    document.getElementById("leave-room").hidden = false;

    room.querySelector("[data-hotspot]")?.focus();
    announce("Welcome back.");
  });
  menu.append(heading, enter);
  room.replaceChildren(menu);
  enter.focus();
}

function enterOffice() {
  inOffice = true;
  updateRoomChrome();
  renderClock();
  renderRoom();
  renderInventory();
  const focusTarget = room.querySelector('[data-hotspot="computer"]')
    ?? room.querySelector("[data-hotspot]");
  focusTarget?.focus();
}

function startNewCompany(company) {
  state = { items: [], roomId: STARTING_ROOM_ID, company };
  definition = definitions.get(STARTING_ROOM_ID);
  updateRoomChrome();
  saveAdventure(storage(), state);
  enterOffice();
  announce(`${company.companyName} begins here.`);
}

function openMainMenu() {
  document.getElementById("menu-panel").close();
  showObjectLabel();
  syncMotion();
  mainMenu.show();
}

async function preloadSizedImage(path, width, height) {
  const image = new Image();
  image.src = path;
  await image.decode();
  if (image.naturalWidth !== width || image.naturalHeight !== height) {
    throw new Error(`Image dimensions do not match: ${path}`);
  }
}

async function preloadImage(path) {
  const image = new Image();
  image.src = path;
  await image.decode();
}

function preloadAnnotation(annotation) {
  if (annotation.kind !== "object") return Promise.resolve();
  return preloadImage(annotation.mask);
}

async function preloadTransition(roomDefinition, id, transition) {
  const patch = roomDefinition.annotations[transition.patch];
  const [, , patchWidth, patchHeight] = patch.bounds;
  const [frameWidth, frameHeight] = transition.frames.size;
  const frames = transition.frames.items?.map(frame => frame.path)
    ?? Array.from(
      { length: transition.frames.count },
      (_, index) => `${transition.frames.directory}/frame-${index + 1}.png`
    );
  try {
    await Promise.all([
      preloadSizedImage(
        transition.patchImage,
        roomDefinition.width,
        roomDefinition.height
      ),
      preloadSizedImage(patch.mask, patchWidth, patchHeight),
      ...frames.map(path => (
        preloadSizedImage(path, frameWidth, frameHeight)
      )),
    ]);
    availableTransitions.add(transitionKey(roomDefinition, id));
  } catch (error) {
    console.warn(`Transition assets unavailable: ${id}`, error);
  }
}

async function preloadTransitions(roomDefinition) {
  const transitions = Object.entries(roomDefinition.transitions ?? {});
  await Promise.all(transitions.map(([id, transition]) => (
    preloadTransition(roomDefinition, id, transition)
  )));
}

async function loadRoom(path) {
  const response = await fetch(path, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Room failed to load: ${response.status}`);
  const roomDefinition = await response.json();
  const references = [];
  if (roomDefinition.effects.screen) references.push({
    id: roomDefinition.effects.screen.surface,
    kind: "surface",
    owner: "CRT effect",
  });
  if (roomDefinition.effects.steam) references.push({
    id: roomDefinition.effects.steam.point,
    kind: "point",
    owner: "Steam effect",
  });
  for (const binding of roomDefinition.effectBindings ?? []) {
    references.push({
      id: binding.annotation,
      kind: binding.kind,
      owner: `Effect binding ${binding.id}`,
    });
  }
  for (const [id, transition] of Object.entries(
    roomDefinition.transitions ?? {}
  )) {
    references.push({
      id: transition.patch,
      kind: "object",
      owner: `Transition ${id} patch`,
    }, {
      id: transition.frames.object,
      kind: "object",
      owner: `Transition ${id} frames`,
    });
  }
  validateSceneAnnotations(
    roomDefinition,
    roomDefinition.hotspots,
    references
  );
  definitions.set(roomDefinition.id, roomDefinition);
  await Promise.all([
    preloadSizedImage(
      roomDefinition.background,
      roomDefinition.width,
      roomDefinition.height
    ),
    ...roomDefinition.pickups.map(item => (
      preloadSizedImage(
        item.emptyImage,
        roomDefinition.width,
        roomDefinition.height
      )
    )),
    ...Object.values(roomDefinition.annotations).map(preloadAnnotation),
  ]);
  await preloadTransitions(roomDefinition);
}

async function startRoom() {
  const mapResponse = await fetch(OFFICE_MAP_PATH, { cache: "no-cache" });
  if (!mapResponse.ok) {
    throw new Error(`Office map failed to load: ${mapResponse.status}`);
  }
  officeGraph = validateOfficeGraph(await mapResponse.json());
  await Promise.all(officeGraph.rooms.map(roomNode => (
    loadRoom(roomNode.definition)
  )));
  state = loadAdventure(storage());
  definition = definitions.get(state.roomId);
  updateRoomChrome();
  renderRoom();
  renderInventory();
  startClock();
  itemAction.addEventListener("click", changeItem);
  dialog.addEventListener("close", syncMotion);
  officeMapToggle.addEventListener("click", () => {
    setOfficeMapOpen(officeMapPanel.hidden);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || officeMapPanel.hidden) return;
    event.preventDefault();
    setOfficeMapOpen(false, true);
  });
  document.addEventListener("pointerdown", (event) => {
    const clickedOutsideMap = !officeMapCard.contains(event.target);
    if (officeMapPanel.hidden || !clickedOutsideMap) return;
    setOfficeMapOpen(false);
  });
  document.getElementById("leave-room").addEventListener("click", leaveRoom);
  document.addEventListener("visibilitychange", () => {
    syncMotion();
    renderClock();
  });
  for (const id of ["journal", "menu"]) {
    const panel = document.getElementById(`${id}-panel`);
    document.getElementById(`open-${id}`).addEventListener("click", () => {
      if (id === "journal") {
        document.getElementById("journal-note").textContent =
          state.items.includes("coffee")
            ? `${definition.journal} My coffee mug is in my inventory.`
            : definition.journal;
      }
      panel.showModal();
      syncMotion();
    });
    panel.addEventListener("close", syncMotion);
  }
}

async function startGame() {
  await startRoom();
  const browserStorage = storage();
  mainMenu = await createMainMenu({
    storage: browserStorage,
    hasSave: () => hasSavedAdventure(browserStorage),
    onContinue: enterOffice,
    onNewCompany: () => companyCreation.show(),
  });
  companyCreation = createCompanyCreation({
    onCancel: mainMenu.show,
    onComplete: startNewCompany,
  });
  document.getElementById("return-main-menu")
    .addEventListener("click", openMainMenu);
}

startGame().catch((error) => {
  console.error(error);
  room.textContent = "The office could not load. Refresh to try again.";
  const status = document.getElementById("main-menu-status");
  status.textContent = "The office could not load. Refresh to try again.";
});
