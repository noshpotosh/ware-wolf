// Source rectangles exclude atlas margins; positions are in source pixels.
export const SPRITE_SHEETS = [
  {
    path: "characters/crew-portraits.png",
    frames: {
      "nosh-portrait": [0, 0, 512, 512],
      "fabrizio-cortell-portrait": [512, 0, 512, 512],
      "maeve-quinn-portrait": [1024, 0, 512, 512],
      "dex-harlan-portrait": [0, 512, 512, 512],
      "cal-rook-portrait": [512, 512, 512, 512],
      "reed-mallory-portrait": [1024, 512, 512, 512],
    },
  },
  {
    path: "characters/crew-idle.png",
    frames: {
      nosh: [252, 3, 202, 493],
      "fabrizio-cortell": [673, 5, 205, 491],
      "maeve-quinn": [1071, 14, 216, 482],
      "dex-harlan": [240, 508, 201, 498],
      "cal-rook": [668, 507, 206, 499],
      "reed-mallory": [1071, 508, 178, 498],
    },
  },
  {
    path: "characters/nosh-motion.png",
    frames: {
      "nosh-idle": [0, 0, 48, 96],
      "nosh-run-1": [48, 0, 48, 96],
      "nosh-run-2": [96, 0, 48, 96],
      "nosh-run-3": [144, 0, 48, 96],
      "nosh-run-4": [192, 0, 48, 96],
      "nosh-run-5": [240, 0, 48, 96],
      "nosh-run-6": [288, 0, 48, 96],
    },
  },
  {
    path: "furniture/desk-crt.png",
    frames: { desk: [140, 167, 983, 934] },
  },
  {
    path: "furniture/loft-props.png",
    frames: {
      bubbler: [154, 32, 210, 458],
      coffee: [582, 61, 319, 445],
      whiteboard: [1041, 75, 382, 437],
      chair: [138, 570, 291, 415],
      plant: [588, 539, 328, 409],
      "chair-better": [1105, 514, 318, 494],
    },
  },
];

export const SINGLE_SPRITES = [
  { id: "floor-carpet", path: "tiles/floor-carpet.png" },
  { id: "floor-wood", path: "tiles/floor-wood-border.png" },
  { id: "desk-pixellab", path: "furniture/desk-basic.png" },
  { id: "chair-pixellab", path: "furniture/chair-basic.png" },
  { id: "monitor-crt", path: "furniture/monitor-crt.png" },
  { id: "bubbler-pixellab", path: "furniture/bubbler.png" },
  { id: "coffee-pixellab", path: "furniture/coffee-station.png" },
  { id: "whiteboard-pixellab", path: "furniture/whiteboard.png" },
  { id: "desk-with-monitor", path: "furniture/desk-with-monitor.png" },
  { id: "floor-island", path: "tiles/floor-island.png" },
  { id: "desk-nosh-mat", path: "furniture/desk-nosh-mat.png" },
];

const sprites = new Map();

export function spriteAssetUrl(path) {
  return new URL(`../assets/${path}`, import.meta.url).href;
}

async function loadSheet(sheet) {
  const image = new Image();
  image.src = spriteAssetUrl(sheet.path);
  await image.decode();

  for (const [id, crop] of Object.entries(sheet.frames)) {
    sprites.set(id, { image, crop });
  }
}

async function loadSingleSprite(entry) {
  const image = new Image();
  image.src = spriteAssetUrl(entry.path);
  await image.decode();
  sprites.set(entry.id, { image, crop: null });
}

export async function loadSprites() {
  await Promise.all([
    ...SPRITE_SHEETS.map(loadSheet),
    ...SINGLE_SPRITES.map(loadSingleSprite),
  ]);
}

export function drawSprite(context, id, x, y, width, height) {
  const sprite = sprites.get(id);

  if (!sprite) {
    return false;
  }

  context.imageSmoothingEnabled = false;

  if (sprite.crop) {
    context.drawImage(
      sprite.image,
      ...sprite.crop,
      Math.round(x),
      Math.round(y),
      width,
      height
    );
  } else {
    context.drawImage(
      sprite.image,
      Math.round(x),
      Math.round(y),
      width,
      height
    );
  }

  return true;
}

export function drawSpriteNative(context, id, x, y) {
  const sprite = sprites.get(id);

  if (!sprite) {
    return false;
  }

  context.imageSmoothingEnabled = false;
  context.drawImage(sprite.image, Math.round(x), Math.round(y));
  return true;
}
