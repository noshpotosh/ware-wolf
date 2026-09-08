import {
  cssMatrix3d, fitScene, surfaceHomography,
} from "./sceneGeometry.js?v=anchors-v1";

const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
const MOVE_KEYS = new Map([
  ["ArrowLeft", [-1, 0]],
  ["ArrowRight", [1, 0]],
  ["ArrowUp", [0, -1]],
  ["ArrowDown", [0, 1]],
]);

function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return element;
}

function polygonPoints(points) {
  return points.map(point => point.join(",")).join(" ");
}

function isFinitePoint(point) {
  return Array.isArray(point)
    && point.length === 2
    && point.every(Number.isFinite);
}

function crossProduct(first, second, third) {
  return (second[0] - first[0]) * (third[1] - second[1])
    - (second[1] - first[1]) * (third[0] - second[0]);
}

function validateSurface(id, annotation) {
  const { corners, designSize } = annotation;
  if (!Array.isArray(corners)
      || corners.length !== 4
      || !corners.every(isFinitePoint)) {
    throw new Error(`Surface ${id} needs four finite corners.`);
  }
  if (!Array.isArray(designSize)
      || designSize.length !== 2
      || !designSize.every(value => Number.isFinite(value) && value > 0)) {
    throw new Error(`Surface ${id} needs a positive designSize.`);
  }
  const turns = corners.map((point, index) => crossProduct(
    point,
    corners[(index + 1) % corners.length],
    corners[(index + 2) % corners.length]
  ));
  if (turns.some(turn => turn <= 0)) {
    throw new Error(
      `Surface ${id} corners must be clockwise TL, TR, BR, BL.`
    );
  }
  surfaceHomography(designSize[0], designSize[1], corners);
}

export function validateSceneAnnotations(
  scene,
  hotspots = [],
  references = []
) {
  if (scene.fit && !["contain", "cover"].includes(scene.fit)) {
    throw new Error(`Unknown scene fit: ${scene.fit}`);
  }
  if (!Number.isFinite(scene.width) || scene.width <= 0
      || !Number.isFinite(scene.height) || scene.height <= 0) {
    throw new Error("Scene dimensions must be positive numbers.");
  }
  if (!scene.annotations || Array.isArray(scene.annotations)) {
    throw new Error("Scene annotations must be a named object.");
  }
  for (const [id, annotation] of Object.entries(scene.annotations)) {
    if (annotation.kind === "surface") {
      validateSurface(id, annotation);
      if (annotation.corners.flat().some((value, index) => (
        value < 0 || value > (index % 2 === 0 ? scene.width : scene.height)
      ))) {
        throw new Error(`Surface ${id} must stay inside the scene.`);
      }
    } else if (annotation.kind === "point") {
      if (!isFinitePoint(annotation.position)
          || annotation.position[0] < 0
          || annotation.position[0] > scene.width
          || annotation.position[1] < 0
          || annotation.position[1] > scene.height) {
        throw new Error(`Point ${id} needs a finite position.`);
      }
    } else if (annotation.kind === "object") {
      const bounds = annotation.bounds;
      if (!annotation.mask || !Array.isArray(bounds)
          || bounds.length !== 4
          || !bounds.every(Number.isFinite)
          || bounds[0] < 0 || bounds[1] < 0
          || bounds[2] <= 0 || bounds[3] <= 0
          || bounds[0] + bounds[2] > scene.width
          || bounds[1] + bounds[3] > scene.height) {
        throw new Error(`Object ${id} needs a valid mask and bounds.`);
      }
    } else {
      throw new Error(`Unknown annotation kind for ${id}.`);
    }
  }
  const ids = new Set();
  for (const hotspot of hotspots) {
    if (ids.has(hotspot.id)) {
      throw new Error(`Duplicate hotspot ID: ${hotspot.id}`);
    }
    ids.add(hotspot.id);
    if (scene.annotations[hotspot.annotation]?.kind !== "object") {
      throw new Error(
        `Hotspot ${hotspot.id} needs an object annotation.`
      );
    }
  }
  for (const { id, kind, owner } of references) {
    if (scene.annotations[id]?.kind !== kind) {
      throw new Error(`${owner} needs a ${kind} annotation: ${id}`);
    }
  }
}

export function sceneDebugEnabled() {
  return new URLSearchParams(window.location.search).get("debug") === "scene";
}

export function createScenePlane(container, scene, fit = "contain") {
  const root = document.createElement("div");
  const plane = document.createElement("div");
  root.className = "scene-overlay-root";
  plane.className = "scene-coordinate-plane";
  plane.style.width = `${scene.width}px`;
  plane.style.height = `${scene.height}px`;
  root.append(plane);
  container.append(root);

  let currentFit;
  const surfaces = new Map();

  function updateFit() {
    const bounds = container.getBoundingClientRect();
    currentFit = fitScene(
      scene.width,
      scene.height,
      bounds.width,
      bounds.height,
      fit
    );
    const { x, y, scale } = currentFit;
    plane.style.transform = `translate(${x}px, ${y}px) scale(${scale})`;
  }

  function updateSurface(id) {
    const surface = scene.annotations[id];
    const element = surfaces.get(id);
    if (!surface || !element) return;
    const [width, height] = surface.designSize;
    const homography = surfaceHomography(width, height, surface.corners);
    element.style.width = `${width}px`;
    element.style.height = `${height}px`;
    element.style.transform = `matrix3d(${cssMatrix3d(homography)})`;
  }

  function addSurface(id, content) {
    const surface = scene.annotations[id];
    if (!surface || surface.kind !== "surface") {
      throw new Error(`Unknown surface annotation: ${id}`);
    }
    const element = document.createElement("div");
    element.className = "projective-surface";
    element.dataset.annotation = id;
    element.append(content);
    plane.append(element);
    surfaces.set(id, element);
    updateSurface(id);
    return element;
  }

  function addPoint(id, content) {
    const point = scene.annotations[id];
    if (!point || point.kind !== "point") {
      throw new Error(`Unknown point annotation: ${id}`);
    }
    const element = document.createElement("div");
    element.className = "scene-point";
    element.dataset.annotation = id;
    element.style.left = `${point.position[0]}px`;
    element.style.top = `${point.position[1]}px`;
    element.append(content);
    plane.append(element);
    return element;
  }

  function toScenePoint(clientX, clientY) {
    const bounds = container.getBoundingClientRect();
    return [
      (clientX - bounds.left - currentFit.x) / currentFit.scale,
      (clientY - bounds.top - currentFit.y) / currentFit.scale,
    ];
  }

  const resizeObserver = new ResizeObserver(updateFit);
  resizeObserver.observe(container);
  updateFit();

  return {
    addPoint,
    addSurface,
    plane,
    root,
    scene,
    toScenePoint,
    updateFit,
    updateSurface,
    destroy() {
      resizeObserver.disconnect();
      root.remove();
    },
  };
}

function addObjectDebug(svg, id, annotation) {
  const [x, y, width, height] = annotation.bounds;
  svg.append(svgElement("image", {
    href: annotation.mask,
    preserveAspectRatio: "none",
    x,
    y,
    width,
    height,
    class: "debug-object-mask",
  }));
  svg.append(svgElement("rect", {
    x, y, width, height, class: "debug-object-bounds",
  }));
  const label = svgElement("text", {
    x, y: y - 6, class: "debug-label",
  });
  label.textContent = id;
  svg.append(label);
}

function addPointDebug(svg, id, annotation) {
  const [x, y] = annotation.position;
  svg.append(svgElement("path", {
    d: `M${x - 8} ${y}H${x + 8}M${x} ${y - 8}V${y + 8}`,
    class: "debug-point",
  }));
  const label = svgElement("text", {
    x: x + 10, y: y - 10, class: "debug-label",
  });
  label.textContent = id;
  svg.append(label);
}

function moveCorner(scenePlane, id, cornerIndex, x, y) {
  const annotation = scenePlane.scene.annotations[id];
  annotation.corners[cornerIndex] = [Math.round(x), Math.round(y)];
  scenePlane.updateSurface(id);
}

function draggableCorner(scenePlane, svg, id, cornerIndex, point) {
  const handle = svgElement("circle", {
    cx: point[0],
    cy: point[1],
    r: 8,
    tabindex: 0,
    role: "button",
    "aria-label": `${id} corner ${cornerIndex + 1}`,
    class: "debug-surface-handle",
  });

  function updateHandle() {
    const [x, y] = scenePlane.scene.annotations[id].corners[cornerIndex];
    handle.setAttribute("cx", x);
    handle.setAttribute("cy", y);
    const polygon = svg.querySelector(
      `[data-surface-outline="${id}"]`
    );
    polygon.setAttribute(
      "points",
      polygonPoints(scenePlane.scene.annotations[id].corners)
    );
    updateSurfaceAxes(svg, id, scenePlane.scene.annotations[id]);
  }

  handle.addEventListener("pointerdown", event => {
    handle.setPointerCapture(event.pointerId);
  });
  handle.addEventListener("pointermove", event => {
    if (!handle.hasPointerCapture(event.pointerId)) return;
    const [x, y] = scenePlane.toScenePoint(event.clientX, event.clientY);
    moveCorner(scenePlane, id, cornerIndex, x, y);
    updateHandle();
  });
  handle.addEventListener("keydown", event => {
    const movement = MOVE_KEYS.get(event.key);
    if (!movement) return;
    event.preventDefault();
    const step = event.shiftKey ? 10 : 1;
    const [x, y] = scenePlane.scene.annotations[id].corners[cornerIndex];
    moveCorner(
      scenePlane,
      id,
      cornerIndex,
      x + movement[0] * step,
      y + movement[1] * step
    );
    updateHandle();
  });
  return handle;
}

function updateSurfaceAxes(svg, id, annotation) {
  const [origin, xEnd, , yEnd] = annotation.corners;
  const xAxis = svg.querySelector(`[data-surface-x-axis="${id}"]`);
  const yAxis = svg.querySelector(`[data-surface-y-axis="${id}"]`);
  xAxis.setAttribute("d", `M${origin.join(" ")}L${xEnd.join(" ")}`);
  yAxis.setAttribute("d", `M${origin.join(" ")}L${yEnd.join(" ")}`);
}

function addSurfaceDebug(scenePlane, svg, id, annotation) {
  svg.append(svgElement("polygon", {
    points: polygonPoints(annotation.corners),
    class: "debug-surface-outline",
    "data-surface-outline": id,
  }));
  svg.append(svgElement("path", {
    class: "debug-surface-axis debug-surface-x-axis",
    "data-surface-x-axis": id,
  }));
  svg.append(svgElement("path", {
    class: "debug-surface-axis debug-surface-y-axis",
    "data-surface-y-axis": id,
  }));
  updateSurfaceAxes(svg, id, annotation);
  annotation.corners.forEach((point, index) => {
    svg.append(draggableCorner(scenePlane, svg, id, index, point));
  });
  const [x, y] = annotation.corners[0];
  const label = svgElement("text", {
    x, y: y - 10, class: "debug-label",
  });
  label.textContent = id;
  svg.append(label);
}

function addHitAreas(svg, hotspots) {
  for (const hotspot of hotspots) {
    svg.append(svgElement("polygon", {
      points: polygonPoints(hotspot.points),
      class: "debug-hit-area",
    }));
  }
}

export function mountSceneDebugger(scenePlane, hotspots = []) {
  if (!sceneDebugEnabled()) return;
  scenePlane.root.classList.add("scene-debug-active");
  const svg = svgElement("svg", {
    class: "scene-debug-overlay",
    viewBox: `0 0 ${scenePlane.scene.width} ${scenePlane.scene.height}`,
  });
  addHitAreas(svg, hotspots);
  for (const [id, annotation] of Object.entries(
    scenePlane.scene.annotations
  )) {
    if (annotation.kind === "object") addObjectDebug(svg, id, annotation);
    if (annotation.kind === "point") addPointDebug(svg, id, annotation);
    if (annotation.kind === "surface") {
      addSurfaceDebug(scenePlane, svg, id, annotation);
    }
  }
  scenePlane.plane.append(svg);

  const toolbar = document.createElement("aside");
  const copyButton = document.createElement("button");
  const catalogueLink = document.createElement("a");
  toolbar.className = "scene-debug-toolbar";
  copyButton.type = "button";
  copyButton.textContent = "Copy diagnostic JSON";
  copyButton.addEventListener("click", async () => {
    const json = JSON.stringify(scenePlane.scene.annotations, null, 2);
    await navigator.clipboard.writeText(json);
    copyButton.textContent = "Copied";
    setTimeout(() => {
      copyButton.textContent = "Copy diagnostic JSON";
    }, 1200);
  });
  catalogueLink.href = "http://127.0.0.1:8766/";
  catalogueLink.target = "_blank";
  catalogueLink.rel = "noreferrer";
  catalogueLink.textContent = "Open scene catalogue";
  toolbar.append(copyButton, catalogueLink);
  scenePlane.root.append(toolbar);
}
