const SVG_NAMESPACE = "http://www.w3.org/2000/svg";

export function svgElement(tag, attributes = {}) {
  const element = document.createElementNS(SVG_NAMESPACE, tag);
  for (const [name, value] of Object.entries(attributes)) {
    element.setAttribute(name, value);
  }
  return element;
}

export function polygonPoints(points) {
  return points.map(point => point.join(",")).join(" ");
}

function gradient(id, stops) {
  const element = svgElement("linearGradient", {
    id, x1: "0", y1: "0", x2: "0", y2: "1",
  });
  for (const [offset, color, opacity] of stops) {
    element.append(svgElement("stop", {
      offset, "stop-color": color, "stop-opacity": opacity,
    }));
  }
  return element;
}

function windowEffect(window) {
  const group = svgElement("g", { class: "sunlight" });
  for (const points of window.panes) {
    group.append(svgElement("polygon", {
      points: polygonPoints(points), class: "sun-pane",
    }));
  }
  // Thin bands follow the slats; only illumination moves, not the artwork.
  for (const points of window.slats) {
    group.append(svgElement("polygon", {
      points: polygonPoints(points), class: "sun-slat",
    }));
  }
  for (const points of window.rays) {
    group.append(svgElement("polygon", {
      points: polygonPoints(points), fill: "url(#sun-ray)",
      class: "sun-ray",
    }));
  }
  return group;
}

function waterEffect(water) {
  const clip = svgElement("clipPath", { id: "bottle-interior" });
  clip.append(svgElement("polygon", { points: polygonPoints(water.bounds) }));
  const group = svgElement("g");
  const defs = svgElement("defs");
  defs.append(clip);
  group.append(defs);
  const bubbles = svgElement("g", { "clip-path": "url(#bottle-interior)" });
  for (const bubble of water.bubbles) {
    const rise = svgElement("g", {
      class: "water-bubble",
      style: `animation-delay:${bubble.delay}s`,
    });
    rise.append(svgElement("ellipse", {
      cx: bubble.x, cy: water.bottom, rx: bubble.radius,
      ry: bubble.radius * 1.15,
    }));
    bubbles.append(rise);
  }
  group.append(bubbles);
  return group;
}

export function createRoomEffects(effects) {
  const group = svgElement("g", {
    class: "ambient-effects", "aria-hidden": "true",
  });
  const defs = svgElement("defs");
  defs.append(
    gradient("crt-phosphor", [[0, "#76aa73", .9], [1, "#204c38", .9]]),
    gradient("crt-scan", [[0, "#d5ffb7", 0], [.7, "#d5ffb7", .14],
      [1, "#d5ffb7", 0]]),
    gradient("sun-ray", [[0, "#fff0b6", .17], [1, "#fff0b6", 0]])
  );
  group.append(defs);
  if (effects.window) group.append(windowEffect(effects.window));
  if (effects.water) group.append(waterEffect(effects.water));
  return group;
}
