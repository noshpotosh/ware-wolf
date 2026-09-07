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

function screenEffect(screen) {
  // A local rectangle projects onto the four corners of the CRT glass.
  const group = svgElement("g", { transform: screen.transform });
  group.innerHTML = `
    <defs>
      <clipPath id="crt-glass"><rect width="60" height="54" rx="2"/></clipPath>
      <pattern id="crt-lines" width="2" height="3"
        patternUnits="userSpaceOnUse">
        <rect width="2" height="0.65" fill="#102e21" opacity=".3"/>
      </pattern>
    </defs>
    <g clip-path="url(#crt-glass)">
      <rect class="crt-phosphor" width="60" height="54"
        fill="url(#crt-phosphor)"/>
      <path d="M7 10h24 M7 15h37 M7 20h17 M7 30h28"
        stroke="#bdedb0" stroke-width="1.1" opacity=".65"/>
      <rect class="crt-cursor" x="7" y="35" width="4" height="2"
        fill="#d6f7be"/>
      <rect width="60" height="54" fill="url(#crt-lines)"/>
      <rect class="crt-scan" x="0" y="-16" width="60" height="16"
        fill="url(#crt-scan)"/>
    </g>`;
  return group;
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

function steamEffect(steam) {
  const group = svgElement("g", {
    transform: `translate(${steam.x} ${steam.y})`,
    "data-pickup-effect": steam.pickupId,
  });
  for (const [x, delay] of [[-7, 0], [0, -1.6], [7, -3.2]]) {
    const wisp = svgElement("g", { transform: `translate(${x} 0)` });
    wisp.append(svgElement("path", {
      class: "coffee-steam",
      d: "M0 0 L0 -4 L2 -7 L2 -11 L-1 -14 L-1 -18 L1 -21",
      style: `animation-delay:${delay}s`,
    }));
    group.append(wisp);
  }
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
  if (effects.screen) group.append(screenEffect(effects.screen));
  if (effects.water) group.append(waterEffect(effects.water));
  if (effects.steam) group.append(steamEffect(effects.steam));
  return group;
}
