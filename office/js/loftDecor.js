import {
  FloorTexture,
  FurnitureKind,
  ISLAND_INSET_TILES,
  STAFF_NAMEPLATE,
} from "./constants.js";

export function isIslandCell(office, gridX, gridY) {
  const inset = ISLAND_INSET_TILES;

  if (office.gridWidth <= inset * 2 || office.gridHeight <= inset * 2) {
    return false;
  }

  return (
    gridX >= inset
    && gridY >= inset
    && gridX < office.gridWidth - inset
    && gridY < office.gridHeight - inset
  );
}

export function floorTextureKey(office, gridX, gridY) {
  const onBorder =
    gridX === 0
    || gridY === 0
    || gridX === office.gridWidth - 1
    || gridY === office.gridHeight - 1;

  if (onBorder) {
    return FloorTexture.WOOD;
  }

  if (!isIslandCell(office, gridX, gridY)) {
    return FloorTexture.CARPET;
  }

  // Checker: island tile alternates with carpet so the rug reads.
  if ((gridX + gridY) % 2 === 0) {
    return FloorTexture.ISLAND;
  }

  return FloorTexture.CARPET;
}

export function nameplateLabel(piece, shell) {
  if (piece.staffId && STAFF_NAMEPLATE[piece.staffId]) {
    return STAFF_NAMEPLATE[piece.staffId];
  }

  if (piece.staffId && shell.staffLookup) {
    const person = shell.staffLookup[piece.staffId];

    if (person && person.displayName) {
      const [firstName] = person.displayName.split(" ");
      return firstName;
    }
  }

  if (piece.isPlayerDesk) {
    return STAFF_NAMEPLATE.nosh;
  }

  return null;
}


// Far iso edges (gridX/gridY == 0) frame the room; skip door cells.
export function isBackWallCell(office, gridX, gridY) {
  if (gridX !== 0 && gridY !== 0) {
    return false;
  }

  for (const piece of office.furniture || []) {
    if (piece.kind !== FurnitureKind.DOOR) {
      continue;
    }

    if (piece.gridX === gridX && piece.gridY === gridY) {
      return false;
    }
  }

  return true;
}

export function listBackWallCells(office) {
  const cells = [];

  for (let gridY = 0; gridY < office.gridHeight; gridY += 1) {
    for (let gridX = 0; gridX < office.gridWidth; gridX += 1) {
      if (!isBackWallCell(office, gridX, gridY)) {
        continue;
      }

      cells.push({ gridX, gridY });
    }
  }

  return cells;
}
