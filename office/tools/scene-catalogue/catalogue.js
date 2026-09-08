import { moveTouch } from "./touchDrag.js";

const sceneList = document.getElementById("scene-list");
const touchList = document.getElementById("touch-list");
const touchForm = document.getElementById("touch-form");
const touchKind = document.getElementById("touch-kind");
const saveState = document.getElementById("save-state");
let workspace;
let selectedScene;
let selectedTouchId;
let dragState;
let zoom = 1;

const MINIMUM_ZOOM = 0.5;
const MAXIMUM_ZOOM = 6;
const ZOOM_STEP = 0.25;

async function responseJson(response) {
  if (response.ok) return response.json();
  throw new Error(await response.text());
}

async function post(path, value) {
  return responseJson(await fetch(path, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(value),
  }));
}

function fileDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.addEventListener("load", () => resolve(reader.result));
    reader.addEventListener("error", () => reject(reader.error));
    reader.readAsDataURL(file);
  });
}

function sceneAnnotations() {
  return selectedScene.definition.annotations ?? {};
}

function field(id) {
  return document.getElementById(id);
}

function number(id) {
  return Number(field(id).value);
}

function effectBinding(id) {
  return (selectedScene.definition.effectBindings ?? []).find(
    binding => binding.annotation === id
  );
}

function renderSceneList() {
  const buttons = workspace.scenes.map(scene => {
    const button = document.createElement("button");
    const count = Object.keys(scene.definition.annotations ?? {}).length;
    button.type = "button";
    button.dataset.scene = scene.entry.id;
    button.setAttribute("aria-pressed", String(scene === selectedScene));
    button.innerHTML = `${scene.entry.label}<small>${count} touches</small>`;
    button.addEventListener("click", () => selectScene(scene));
    return button;
  });
  sceneList.replaceChildren(...buttons);
}

function svgElement(tag, attributes) {
  const element = document.createElementNS("http://www.w3.org/2000/svg", tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return element;
}

function renderOverlay() {
  const overlay = field("touch-overlay");
  const [width, height] = selectedScene.entry.dimensions;
  overlay.setAttribute("viewBox", `0 0 ${width} ${height}`);
  overlay.replaceChildren();

  for (const [id, touch] of Object.entries(sceneAnnotations())) {
    let shape;
    if (touch.kind === "object") {
      const [x, y, objectWidth, objectHeight] = touch.bounds;
      shape = svgElement("rect", {
        x, y, width: objectWidth, height: objectHeight,
        class: "touch-shape touch-object",
      });
    } else if (touch.kind === "surface") {
      const points = touch.corners.map(point => point.join(",")).join(" ");
      shape = svgElement("polygon", {
        points,
        class: "touch-shape touch-surface",
      });
    } else if (effectBinding(id)?.preset === "led") {
      shape = svgElement("rect", {
        x: touch.position[0] - 10,
        y: touch.position[1] - 10,
        width: 20,
        height: 20,
        class: "touch-shape touch-point touch-led",
      });
    } else {
      shape = svgElement("circle", {
        cx: touch.position[0], cy: touch.position[1], r: 10,
        class: "touch-shape touch-point",
      });
    }
    shape.dataset.touch = id;
    shape.dataset.selected = String(id === selectedTouchId);
    overlay.append(shape);

    if (id === selectedTouchId && touch.kind === "surface") {
      touch.corners.forEach(([x, y], index) => {
        const handle = svgElement("circle", {
          cx: x,
          cy: y,
          r: 9,
          class: "touch-handle",
        });
        handle.dataset.touch = id;
        handle.dataset.handle = index;
        overlay.append(handle);
      });
    }
  }
}

function scenePoint(event) {
  const overlay = field("touch-overlay");
  const point = overlay.createSVGPoint();
  point.x = event.clientX;
  point.y = event.clientY;
  const scene = point.matrixTransform(overlay.getScreenCTM().inverse());
  return [scene.x, scene.y];
}

function syncTouchForm(touch) {
  if (touch.kind === "object") {
    const [x, y, width, height] = touch.bounds;
    field("object-x").value = x;
    field("object-y").value = y;
    field("object-width").value = width;
    field("object-height").value = height;
  } else if (touch.kind === "surface") {
    field("surface-corners").value = JSON.stringify(touch.corners);
  } else {
    field("point-x").value = touch.position[0];
    field("point-y").value = touch.position[1];
  }
}

function startTouchDrag(event) {
  const target = event.target.closest("[data-touch]");
  if (!target) return;

  const id = target.dataset.touch;
  if (id !== selectedTouchId) editTouch(id);
  const handle = target.dataset.handle;
  dragState = {
    id,
    cornerIndex: handle === undefined ? null : Number(handle),
    start: scenePoint(event),
    touch: structuredClone(sceneAnnotations()[id]),
  };
  event.preventDefault();
}

function dragTouch(event) {
  if (!dragState) return;
  const current = scenePoint(event);
  const deltaX = Math.round(current[0] - dragState.start[0]);
  const deltaY = Math.round(current[1] - dragState.start[1]);
  const touch = moveTouch(
    dragState.touch,
    deltaX,
    deltaY,
    selectedScene.entry.dimensions,
    dragState.cornerIndex
  );
  selectedScene.definition.annotations[dragState.id] = touch;
  syncTouchForm(touch);
  saveState.textContent = "Unsaved drag";
  renderOverlay();
}

function finishTouchDrag() {
  dragState = null;
}

function renderTouchList() {
  const buttons = Object.entries(sceneAnnotations()).map(([id, touch]) => {
    const button = document.createElement("button");
    const binding = effectBinding(id);
    const detail = binding ? `${touch.kind} · ${binding.preset}` : touch.kind;
    button.type = "button";
    button.setAttribute("aria-pressed", String(id === selectedTouchId));
    button.innerHTML = `${id}<small>${detail}</small>`;
    button.addEventListener("click", () => editTouch(id));
    return button;
  });
  touchList.replaceChildren(...buttons);
}

function renderScene() {
  const { entry } = selectedScene;
  field("scene-kind").textContent = entry.kind;
  field("scene-title").textContent = entry.label;
  field("scene-image").src = `/${entry.image}`;
  field("scene-image").alt = `${entry.label} painting`;
  field("scene-path").textContent = `${entry.image} · ${entry.definition}`;
  const [width, height] = entry.dimensions;
  field("scene-canvas").style.aspectRatio = `${width} / ${height}`;
  renderSceneList();
  renderTouchList();
  renderOverlay();
}

function selectScene(scene) {
  selectedScene = scene;
  selectedTouchId = null;
  setZoom(1);
  touchForm.hidden = true;
  renderScene();
}

function setZoom(nextZoom) {
  zoom = Math.min(Math.max(nextZoom, MINIMUM_ZOOM), MAXIMUM_ZOOM);
  field("scene-canvas").style.width = `${zoom * 100}%`;
  field("zoom-level").value = String(zoom * 100);
  field("zoom-value").value = `${Math.round(zoom * 100)}%`;
  field("zoom-out").disabled = zoom === MINIMUM_ZOOM;
  field("zoom-in").disabled = zoom === MAXIMUM_ZOOM;
}

function showKindFields() {
  const kind = touchKind.value;
  field("object-fields").hidden = kind !== "object";
  field("surface-fields").hidden = kind !== "surface";
  field("point-fields").hidden = kind !== "point";
}

function clearForm() {
  touchForm.reset();
  field("surface-corners").value = "[[0,0],[100,0],[100,100],[0,100]]";
  showKindFields();
}

function editTouch(id) {
  selectedTouchId = id;
  const touch = sceneAnnotations()[id];
  const binding = effectBinding(id);
  clearForm();
  field("touch-id").value = id;
  field("touch-id").disabled = true;
  touchKind.value = touch.kind;
  touchKind.disabled = true;
  if (touch.kind === "object") {
    const [x, y, width, height] = touch.bounds;
    field("object-x").value = x;
    field("object-y").value = y;
    field("object-width").value = width;
    field("object-height").value = height;
  } else if (touch.kind === "surface") {
    field("surface-corners").value = JSON.stringify(touch.corners);
    field("surface-effect").value = binding?.preset ?? "";
  } else {
    field("point-x").value = touch.position[0];
    field("point-y").value = touch.position[1];
    field("point-effect").value = binding?.preset ?? "";
  }
  syncTouchForm(touch);
  showKindFields();
  touchForm.hidden = false;
  renderTouchList();
  renderOverlay();
}

function setEffect(id, kind, preset) {
  const bindings = selectedScene.definition.effectBindings ?? [];
  const current = bindings.find(binding => binding.annotation === id);
  selectedScene.definition.effectBindings = bindings.filter(
    binding => binding.annotation !== id
  );
  if (!preset) return;
  const defaults = {
    led: {
      color: "green",
      size: 8,
      durationSeconds: 2.6,
      delaySeconds: 0,
    },
    steam: { pickupId: "coffee" },
  };
  selectedScene.definition.effectBindings.push({
    id: `${id}-${preset}`,
    preset,
    kind,
    annotation: id,
    parameters: current?.preset === preset
      ? current.parameters
      : (defaults[preset] ?? {}),
  });
}

async function saveDefinition() {
  saveState.textContent = "Saving…";
  await post("/api/scene", {
    sceneId: selectedScene.entry.id,
    definition: selectedScene.definition,
  });
  saveState.textContent = "Saved";
}

async function saveObject(id) {
  const bounds = [
    number("object-x"), number("object-y"),
    number("object-width"), number("object-height"),
  ];
  const file = field("mask-file").files[0];
  if (file) {
    const result = await post("/api/mask", {
      sceneId: selectedScene.entry.id,
      annotationId: id,
      bounds,
      image: await fileDataUrl(file),
    });
    selectedScene.definition = result.definition;
    return;
  }
  const current = sceneAnnotations()[id];
  if (!current?.mask) throw new Error("Choose a mask PNG for a new object.");
  selectedScene.definition.annotations[id] = { ...current, bounds };
  await saveDefinition();
}

async function saveTouch(event) {
  event.preventDefault();
  const id = field("touch-id").value;
  const kind = touchKind.value;
  saveState.textContent = "Saving…";
  try {
    selectedScene.definition.annotations ??= {};
    if (kind === "object") {
      await saveObject(id);
    } else if (kind === "surface") {
      selectedScene.definition.annotations[id] = {
        kind,
        corners: JSON.parse(field("surface-corners").value),
        designSize: [100, 100],
      };
      setEffect(id, kind, field("surface-effect").value);
      await saveDefinition();
    } else {
      selectedScene.definition.annotations[id] = {
        kind,
        position: [number("point-x"), number("point-y")],
      };
      setEffect(id, kind, field("point-effect").value);
      await saveDefinition();
    }
    selectedTouchId = id;
    touchForm.hidden = true;
    saveState.textContent = "Saved";
    renderScene();
  } catch (error) {
    saveState.textContent = error.message;
  }
}

field("add-touch").addEventListener("click", () => {
  selectedTouchId = null;
  clearForm();
  field("touch-id").disabled = false;
  touchKind.disabled = false;
  touchForm.hidden = false;
  field("touch-id").focus();
});
field("cancel-touch").addEventListener("click", () => {
  touchForm.hidden = true;
});
touchKind.addEventListener("change", showKindFields);
touchForm.addEventListener("submit", saveTouch);
field("touch-overlay").addEventListener("pointerdown", startTouchDrag);
field("zoom-out").addEventListener("click", () => {
  setZoom(zoom - ZOOM_STEP);
});
field("zoom-fit").addEventListener("click", () => setZoom(1));
field("zoom-in").addEventListener("click", () => {
  setZoom(zoom + ZOOM_STEP);
});
field("zoom-level").addEventListener("input", event => {
  setZoom(Number(event.target.value) / 100);
});
window.addEventListener("pointermove", dragTouch);
window.addEventListener("pointerup", finishTouchDrag);
window.addEventListener("pointercancel", finishTouchDrag);

responseJson(await fetch("/api/workspace"))
  .then(value => {
    workspace = value;
    selectScene(workspace.scenes[0]);
  })
  .catch(error => { saveState.textContent = error.message; });
