import { createRoomEffects, polygonPoints, svgElement } from "./roomEffects.js?v=steam-v1";
import { describeTime } from "./worldClock.js";
import { createDesktop } from "./desktopOS.js";
import {
  loadAdventure, saveAdventure, setItemCollected,
} from "./adventureState.js";

const ROOM_PATH = "data/founders-office-adventure.json";
const ACTIVATE_KEYS = new Set(["Enter", " "]);
const room = document.getElementById("room");
const dialog = document.getElementById("inspection");
const itemAction = document.getElementById("item-action");
let definition;
let state;
let inOffice = true;
let inspectedItem = null;
const desktop = createDesktop(syncMotion);

function renderClock() {
  const time = describeTime();
  document.getElementById("clock-time").textContent = time.clock;
  document.getElementById("day-label").textContent = time.date.toUpperCase();
  document.getElementById("founder-state").textContent = time.mood;
  document.getElementById("founder-avatar").alt = `Nosh · ${time.mood}`;
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

function createHotspot(hotspot) {
  const polygon = svgElement("g", {
    class: "hotspot",
    tabindex: "0", role: "button",
    "aria-label": hotspot.action === "exit"
      ? hotspot.label : `Inspect ${hotspot.label}`,
    "data-hotspot": hotspot.id,
  });
  polygon.append(svgElement("polygon", {
    points: polygonPoints(hotspot.points), class: "hotspot-target",
  }));
  const outlineEdges = hotspot.highlight === false ? []
    : ["outline-shadow", "outline-amber", "outline-light"];
  for (const edge of outlineEdges) {
    polygon.append(svgElement("path", {
      d: hotspot.outline, class: `object-outline ${edge}`,
      "fill-rule": "evenodd",
    }));
  }
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

function backgroundImage(path) {
  return svgElement("image", {
    href: path, width: definition.width, height: definition.height,
  });
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
  const art = svgElement("svg", {
    class: "room-art",
    viewBox: `0 0 ${definition.width} ${definition.height}`,
    "aria-label": definition.title,
  });
  const defs = svgElement("defs");
  const silhouette = svgElement("clipPath", { id: "room-silhouette" });
  silhouette.append(svgElement("path", { d: definition.silhouette }));
  defs.append(silhouette);
  const background = backgroundImage(definition.background);
  background.setAttribute("clip-path", "url(#room-silhouette)");
  art.append(defs, background);
  for (const pickup of definition.pickups) {
    art.append(createPickupPatch(pickup));
  }
  art.append(createRoomEffects(definition.effects));
  for (const hotspot of definition.hotspots) art.append(createHotspot(hotspot));
  room.replaceChildren(art);
  room.dataset.ready = "true";
  refreshPickupVisibility();
  showObjectLabel();
  syncMotion();
}

function refreshPickupVisibility() {
  for (const pickup of definition.pickups) {
    const collected = state.items.includes(pickup.id);
    const hotspot = room.querySelector(`[data-hotspot="${pickup.id}"]`);
    const patch = room.querySelector(`[data-patch="${pickup.id}"]`);
    if (hotspot) hotspot.style.display = collected ? "none" : "";
    if (patch) patch.style.display = collected ? "" : "none";
    for (const effect of room.querySelectorAll(
      `[data-pickup-effect="${pickup.id}"]`
    )) {
      effect.style.display = collected ? "none" : "";
    }
  }
}

function inspect(hotspot) {
  if (hotspot.action === "exit") {
    leaveRoom();
    return;
  }
  if (hotspot.id === "computer") {
    showObjectLabel();
    desktop.open();
    return;
  }
  inspectedItem = definition.pickups.find(item => item.id === hotspot.id);
  const collected = state.items.includes(hotspot.id);
  const inventoryDescription = inOffice
    ? "Your green coffee mug. You can put it back on the desk."
    : "Your green coffee mug. Return to the office to put it back.";
  document.getElementById("inspection-title").textContent =
    "Nosh";
  document.getElementById("inspection-description").textContent = collected
    ? inventoryDescription
    : hotspot.description;
  itemAction.hidden = !inspectedItem || !inOffice;
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
    const pickup = definition.pickups.find(item => item.id === id);
    if (!pickup) continue;
    const button = document.createElement("button");
    button.type = "button";
    const icon = svgElement("svg", {
      class: "inventory-icon", "aria-hidden": "true",
      viewBox: pickup.iconViewBox.join(" "),
    });
    icon.append(backgroundImage(definition.background));
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
  heading.textContent = "You stepped out of the bedroom.";
  const enter = document.createElement("button");
  enter.textContent = "Return to Bedroom Office";
  enter.addEventListener("click", () => {
    inOffice = true;
    renderRoom();
    document.getElementById("leave-room").hidden = false;

    room.querySelector('[data-hotspot="door"]').focus();
    announce("Welcome back.");
  });
  menu.append(heading, enter);
  room.replaceChildren(menu);
  enter.focus();
}

async function preloadImage(path) {
  const image = new Image();
  image.src = path;
  await image.decode();
  if (image.naturalWidth !== definition.width
      || image.naturalHeight !== definition.height) {
    throw new Error(`Room image dimensions do not match: ${path}`);
  }
}

async function startRoom() {
  const response = await fetch(ROOM_PATH, { cache: "no-cache" });
  if (!response.ok) throw new Error(`Room failed to load: ${response.status}`);
  definition = await response.json();
  await Promise.all([
    preloadImage(definition.background),
    ...definition.pickups.map(item => preloadImage(item.emptyImage)),
  ]);
  state = loadAdventure(storage());
  renderRoom();
  renderInventory();
  startClock();
  itemAction.addEventListener("click", changeItem);
  dialog.addEventListener("close", syncMotion);
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
            ? "The house is quiet. I picked up my coffee mug."
            : "My bedroom, my first office. A borrowed corner of the house and an idea.";
      }
      panel.showModal();
      syncMotion();
    });
    panel.addEventListener("close", syncMotion);
  }
}

startRoom().catch((error) => {
  console.error(error);
  room.textContent = "The office could not load. Refresh to try again.";
});
