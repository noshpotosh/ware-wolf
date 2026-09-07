const ART = "assets/desktop/directory-art.png";
const NS = "http://www.w3.org/2000/svg";
let nextClip = 0;

// Local source-pixel silhouettes exclude the mockup's surrounding paper.
// Portrait rectangles deliberately retain their illustrated backdrops.
const ICONS = {
  "mail": {
    rect: [106, 81, 106, 81],
    outline: "M5 2H92L98 8V72L94 78H4L0 72V9Z",
  },
  "teams": {
    rect: [108, 239, 103, 98],
    outline: "M8 2H85L94 10V81L86 91H8L0 83V11Z",
  },
  "directory": {
    rect: [103, 399, 109, 115],
    outline: "M10 2H93L101 10V40H106V70H101V103L94 111H9L2 104V10Z",
  },
  "documents": {
    rect: [110, 590, 105, 100],
    outline: "M2 5H32L40 14H89L95 20V31H97V90L92 96H3L0 90V10Z",
  },
  "task-mail": {
    rect: [156, 849, 44, 38],
    outline: "M2 2H40V34H2Z",
  },
  "task-teams": {
    rect: [361, 844, 49, 49],
    outline: "M19 2H27L31 6V13H34V7H40L44 11V18H46V37L40 41H33L28 47H20L14 41V" +
      "37H2V13H15V7Z",
  },
  "task-directory": {
    rect: [565, 841, 47, 56],
    outline: "M7 3H36L42 8V23H46V37H42V48L36 52H7L3 48V8Z",
  },
  "title-directory": {
    rect: [365, 76, 48, 40],
    outline: "M4 2H18L24 5 30 2H43V5H47V38L29 35 24 38 19 35H0V5H4Z",
  },
  "launcher": {
    rect: [39, 838, 52, 58],
    outline: "M25 0 49 15V43L25 57 0 43V15Z",
  },
  "employees": {
    rect: [372, 224, 37, 41],
    outline: "M13 2H22L28 8V19L23 24H13L8 19V8ZM12 24H25L33 31V39H2V31Z",
  },
  "groups": {
    rect: [370, 292, 42, 39],
    outline: "M9 3H17L21 7V16L17 20H9L5 16V7ZM26 3H33L38 8V16L33 20H26L22 16V8" +
      "ZM7 21H19L24 27V37H1V27Z M27 21H34L40 27V37H25V26Z",
  },
  "locations": {
    rect: [370, 358, 42, 42],
    outline: "M5 3H28V11H34V36H40V39H0V36H5Z",
  },
  "favorites": {
    rect: [370, 426, 42, 42],
    outline: "M20 1 26 13 39 15 29 25 32 39 20 32 8 39 11 25 1 15 15 13Z",
  },
  "sound": {
    rect: [1181, 844, 46, 44],
    outline: "M2 14H11L21 5V38L11 30H2ZM27 11 30 14 32 19V26L29 32 26 30 29 24" +
      "V20L26 14ZM33 5 38 9 42 16V28L38 35 33 39 31 36 36 31 39 25V18L3" +
      "6 12 31 8Z",
  },
};

function clipImage(svg, image, rect, outline) {
  const id = `desktop-art-clip-${nextClip++}`;
  const clip = document.createElementNS(NS, "clipPath");
  clip.id = id;
  clip.setAttribute("clipPathUnits", "userSpaceOnUse");
  const path = document.createElementNS(NS, "path");
  path.setAttribute("d", outline);
  path.setAttribute("transform", `translate(${rect[0]} ${rect[1]})`);
  clip.append(path);
  const defs = document.createElementNS(NS, "defs");
  defs.append(clip);
  svg.append(defs);
  image.setAttribute("clip-path", `url(#${id})`);
}

export function sprite(asset, className = "") {
  const definition = typeof asset === "string" ? ICONS[asset] : { rect: asset };
  if (!definition) throw new Error(`Unknown desktop icon: ${asset}`);
  const { rect, outline } = definition;
  const svg = document.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", rect.join(" "));
  svg.setAttribute("class", `desktop-art ${className}`);
  svg.setAttribute("aria-hidden", "true");
  const image = document.createElementNS(NS, "image");
  image.setAttribute("href", ART);
  image.setAttribute("width", "1672");
  image.setAttribute("height", "941");
  if (outline) clipImage(svg, image, rect, outline);
  svg.append(image);
  return svg;
}
