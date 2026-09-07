import { TILE_HEIGHT_PX, TILE_WIDTH_PX } from "./constants.js";
import { gridToScreen } from "./isoMath.js";

// ADR 010: world diamonds are 128×64; PixelLab wood field tiles
// seamless at 128×128 (tiles_pro tile_2), not diamond-cropped.
export const WOOD_FLOOR_TEXTURE_KEY = "floor-wood-field";
export const RUG_TEXTURE_KEY = "floor-rug-checkered";
export const FLOOR_TEXTURE_WIDTH = 128;
export const FLOOR_TEXTURE_HEIGHT = 128;

const WOOD_EDGE_COLOR = 0x5a4433;
const WOOD_EDGE_LINE_WIDTH = 2;
const WOOD_EDGE_ALPHA = 0.85;
const HALF_TILE_WIDTH = TILE_WIDTH_PX / 2;
const HALF_TILE_HEIGHT = TILE_HEIGHT_PX / 2;
const ACTIVE_WOOD_FOOTPRINT_KEY = "wood-footprint-active";

// Rug island leaves a wood border (mock). Span is cell count, not px.
const RUG_SPAN_CELLS_WIDE = 4;
const RUG_SPAN_CELLS_TALL = 3;

// Outer diamond tips of a grid rectangle (centers ± half tile).
export function roomFootprintTips(gridWidth, gridHeight) {
  return rectangleFootprintTips(0, 0, gridWidth, gridHeight);
}

function rectangleFootprintTips(
  originX,
  originY,
  cellWidth,
  cellHeight
) {
  const halfW = HALF_TILE_WIDTH;
  const halfH = HALF_TILE_HEIGHT;
  const endX = originX + cellWidth - 1;
  const endY = originY + cellHeight - 1;
  const north = gridToScreen(originX, originY);
  const east = gridToScreen(endX, originY);
  const south = gridToScreen(endX, endY);
  const west = gridToScreen(originX, endY);

  return {
    north: { x: north.screenX, y: north.screenY - halfH },
    east: { x: east.screenX + halfW, y: east.screenY },
    south: { x: south.screenX, y: south.screenY + halfH },
    west: { x: west.screenX - halfW, y: west.screenY },
  };
}

function footprintBounds(tips) {
  const xs = [tips.north.x, tips.east.x, tips.south.x, tips.west.x];
  const ys = [tips.north.y, tips.east.y, tips.south.y, tips.west.y];
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return { minX, maxX, minY, maxY };
}

function fillFootprintPath(graphics, tips) {
  graphics.beginPath();
  graphics.moveTo(tips.north.x, tips.north.y);
  graphics.lineTo(tips.east.x, tips.east.y);
  graphics.lineTo(tips.south.x, tips.south.y);
  graphics.lineTo(tips.west.x, tips.west.y);
  graphics.closePath();
}

// No-op when SINGLE_SPRITES preloaded the wood field.
export function ensureWoodFloorTexture(scene) {
  if (scene.textures.exists(WOOD_FLOOR_TEXTURE_KEY)) {
    return;
  }

  throw new Error(
    `Missing required texture "${WOOD_FLOOR_TEXTURE_KEY}". `
      + "Preload SINGLE_SPRITES before create()."
  );
}

function localFootprintTips(tips, originX, originY) {
  return {
    north: { x: tips.north.x - originX, y: tips.north.y - originY },
    east: { x: tips.east.x - originX, y: tips.east.y - originY },
    south: { x: tips.south.x - originX, y: tips.south.y - originY },
    west: { x: tips.west.x - originX, y: tips.west.y - originY },
  };
}

function woodFieldTileSize(scene) {
  const woodSource = scene.textures
    .get(WOOD_FLOOR_TEXTURE_KEY)
    .getSourceImage();

  return {
    width: woodSource.width,
    height: woodSource.height,
    source: woodSource,
  };
}

function bakeWoodFootprintTexture(scene, tips) {
  const bounds = footprintBounds(tips);
  const width = Math.ceil(bounds.maxX - bounds.minX);
  const height = Math.ceil(bounds.maxY - bounds.minY);
  const textureKey = ACTIVE_WOOD_FOOTPRINT_KEY;

  if (scene.textures.exists(textureKey)) {
    const existing = scene.textures.get(textureKey);
    const source = existing.getSourceImage();
    const sameSize =
      source.width === width && source.height === height;

    if (sameSize) {
      return { textureKey, bounds, width, height };
    }

    // Drop the previous room size so switches do not pile up
    // footprint canvases in the texture cache.
    scene.textures.remove(textureKey);
  }

  ensureWoodFloorTexture(scene);

  const canvas = document.createElement("canvas");

  canvas.width = width;
  canvas.height = height;

  const context = canvas.getContext("2d");

  context.imageSmoothingEnabled = false;

  const localTips = localFootprintTips(
    tips,
    bounds.minX,
    bounds.minY
  );

  context.beginPath();
  context.moveTo(localTips.north.x, localTips.north.y);
  context.lineTo(localTips.east.x, localTips.east.y);
  context.lineTo(localTips.south.x, localTips.south.y);
  context.lineTo(localTips.west.x, localTips.west.y);
  context.closePath();
  context.clip();

  const wood = woodFieldTileSize(scene);

  for (let tileY = 0; tileY < height; tileY += wood.height) {
    for (let tileX = 0; tileX < width; tileX += wood.width) {
      context.drawImage(wood.source, tileX, tileY);
    }
  }

  scene.textures.addCanvas(textureKey, canvas);

  return { textureKey, bounds, width, height };
}

function drawWoodField(scene, floorLayer, tips, parts) {
  // Bake a clipped footprint so we can tile the 128×128 wood
  // field without geometry masks (those skip worldRoot fit).
  const baked = bakeWoodFootprintTexture(scene, tips);
  const centerX = (baked.bounds.minX + baked.bounds.maxX) / 2;
  const centerY = (baked.bounds.minY + baked.bounds.maxY) / 2;
  const wood = scene.add.image(centerX, centerY, baked.textureKey);

  wood.setDisplaySize(baked.width, baked.height);
  floorLayer.add(wood);
  parts.push(wood);
}

function drawWoodEdge(scene, floorLayer, tips, parts) {
  const edge = scene.add.graphics();

  edge.lineStyle(
    WOOD_EDGE_LINE_WIDTH,
    WOOD_EDGE_COLOR,
    WOOD_EDGE_ALPHA
  );
  fillFootprintPath(edge, tips);
  edge.strokePath();
  floorLayer.add(edge);
  parts.push(edge);
}

function centeredRugOrigin(gridWidth, gridHeight) {
  const originX = Math.floor(
    (gridWidth - RUG_SPAN_CELLS_WIDE) / 2
  );
  const originY = Math.floor(
    (gridHeight - RUG_SPAN_CELLS_TALL) / 2
  );

  return { originX, originY };
}

function drawWovenRug(scene, floorLayer, office, parts) {
  if (!scene.textures.exists(RUG_TEXTURE_KEY)) {
    throw new Error(
      `Missing required texture "${RUG_TEXTURE_KEY}". `
        + "Preload SINGLE_SPRITES before create()."
    );
  }

  const { originX, originY } = centeredRugOrigin(
    office.gridWidth,
    office.gridHeight
  );
  const tips = rectangleFootprintTips(
    originX,
    originY,
    RUG_SPAN_CELLS_WIDE,
    RUG_SPAN_CELLS_TALL
  );
  const bounds = footprintBounds(tips);
  const displayWidth = bounds.maxX - bounds.minX;
  const displayHeight = bounds.maxY - bounds.minY;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const rug = scene.add.image(centerX, centerY, RUG_TEXTURE_KEY);

  rug.setDisplaySize(displayWidth, displayHeight);
  floorLayer.add(rug);
  parts.push(rug);
}

export function clearFloorParts(floorParts) {
  for (const part of floorParts) {
    part.destroy();
  }
}

// Continuous wood field + centered rug island. Walk grid unchanged.
export function drawContinuousFloor(scene, floorLayer, office) {
  ensureWoodFloorTexture(scene);

  const tips = roomFootprintTips(office.gridWidth, office.gridHeight);
  const parts = [];

  drawWoodField(scene, floorLayer, tips, parts);
  drawWovenRug(scene, floorLayer, office, parts);
  drawWoodEdge(scene, floorLayer, tips, parts);

  return parts;
}
