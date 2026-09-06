import { TILE_HEIGHT_PX, TILE_WIDTH_PX } from "./constants.js";

// Furniture draws above tile centers (monitors, bubbler bottle).
// Nudge vertical centering so the room doesn't sit too low.
export const FURNITURE_TOP_OVERHANG_PX = 192;

// Convert grid coords to canvas coords (2:1 isometric).
export function gridToScreen(gridX, gridY) {
  const screenX = (gridX - gridY) * (TILE_WIDTH_PX / 2);
  const screenY = (gridX + gridY) * (TILE_HEIGHT_PX / 2);

  return { screenX, screenY };
}

// Inverse of gridToScreen; rounds to the nearest tile center.
export function screenToGrid(screenX, screenY) {
  const halfWidth = TILE_WIDTH_PX / 2;
  const halfHeight = TILE_HEIGHT_PX / 2;

  const gridX =
    (screenX / halfWidth + screenY / halfHeight) / 2;
  const gridY =
    (screenY / halfHeight - screenX / halfWidth) / 2;

  return {
    gridX: Math.round(gridX),
    gridY: Math.round(gridY),
  };
}

// Bounds of tile *centers* for the occupied cells (0..w-1, 0..h-1).
export function measureRoomBounds(gridWidth, gridHeight) {
  const lastX = gridWidth - 1;
  const lastY = gridHeight - 1;

  const corners = [
    gridToScreen(0, 0),
    gridToScreen(lastX, 0),
    gridToScreen(0, lastY),
    gridToScreen(lastX, lastY),
  ];

  let minX = corners[0].screenX;
  let maxX = corners[0].screenX;
  let minY = corners[0].screenY;
  let maxY = corners[0].screenY;

  for (const corner of corners) {
    if (corner.screenX < minX) {
      minX = corner.screenX;
    }

    if (corner.screenX > maxX) {
      maxX = corner.screenX;
    }

    if (corner.screenY < minY) {
      minY = corner.screenY;
    }

    if (corner.screenY > maxY) {
      maxY = corner.screenY;
    }
  }

  // Diamonds extend half a tile out from each center.
  return {
    minX: minX - TILE_WIDTH_PX / 2,
    maxX: maxX + TILE_WIDTH_PX / 2,
    minY: minY - TILE_HEIGHT_PX / 2 - FURNITURE_TOP_OVERHANG_PX,
    maxY: maxY + TILE_HEIGHT_PX / 2,
    width: maxX - minX + TILE_WIDTH_PX,
    height:
      maxY
      - minY
      + TILE_HEIGHT_PX
      + FURNITURE_TOP_OVERHANG_PX,
  };
}

// Use the same transform for rendering and pointer hit testing.
export function buildRoomView(gridWidth, gridHeight, width, height) {
  const bounds = measureRoomBounds(gridWidth, gridHeight);
  const horizontalPadding = 40;
  const chromePadding = 124;
  const minimumScale = 0.1;
  const maximumScale = 2;
  const verticalOffset = 6;
  const widthFit = (width - horizontalPadding) / bounds.width;
  const heightFit = (height - chromePadding) / bounds.height;
  const scale = Math.max(minimumScale,
    Math.min(maximumScale, widthFit, heightFit));
  return {
    originX: width / 2 - (bounds.minX + bounds.maxX) / 2 * scale,
    originY: height / 2 - (bounds.minY + bounds.maxY) / 2 * scale
      + verticalOffset,
    scale,
  };
}
