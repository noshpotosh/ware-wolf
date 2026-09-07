import {
  FloorTexture,
  FurnitureKind,
  ISLAND_INSET_TILES,
  STAFF_NAMEPLATE,
} from "./constants.js";
import { gridToScreen } from "./isoMath.js";

export const DOOR_HEIGHT = 96;

export function wallRunBaseline(run) {
  const isRightWall = run.face === "se";
  const start = gridToScreen(
    run.start.gridX - 0.5,
    run.start.gridY - 0.5
  );
  const end = gridToScreen(
    run.end.gridX + (isRightWall ? 0.5 : -0.5),
    run.end.gridY + (isRightWall ? -0.5 : 0.5)
  );

  return {
    start: { x: start.screenX, y: start.screenY },
    end: { x: end.screenX, y: end.screenY },
  };
}

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

export function wallFaceForCell(gridX, gridY) {
  if (gridX === 0 && gridY === 0) {
    return "corner";
  }

  if (gridY === 0) {
    return "se";
  }

  if (gridX === 0) {
    return "sw";
  }

  return null;
}

export function listBackWallCells(office) {
  const cells = [];

  for (let gridY = 0; gridY < office.gridHeight; gridY += 1) {
    for (let gridX = 0; gridX < office.gridWidth; gridX += 1) {
      if (!isBackWallCell(office, gridX, gridY)) {
        continue;
      }

      cells.push({
        gridX,
        gridY,
        face: wallFaceForCell(gridX, gridY),
      });
    }
  }

  return cells;
}


export function listBackWallRuns(office) {
  const cells = listBackWallCells(office);
  const seCells = cells
    .filter((cell) => cell.face === "se" || cell.face === "corner")
    .sort((a, b) => a.gridX - b.gridX);
  const swCells = cells
    .filter((cell) => cell.face === "sw" || cell.face === "corner")
    .sort((a, b) => a.gridY - b.gridY);

  return [
    ...groupContiguous(seCells, "se", "gridX"),
    ...groupContiguous(swCells, "sw", "gridY"),
  ];
}

function groupContiguous(cells, face, axisKey) {
  if (cells.length === 0) {
    return [];
  }

  const runs = [];
  let start = cells[0];
  let prev = cells[0];

  for (let index = 1; index < cells.length; index += 1) {
    const cell = cells[index];
    const expected = prev[axisKey] + 1;
    const sameCornerAxis =
      face === "se"
        ? cell.gridY === prev.gridY
        : cell.gridX === prev.gridX;

    if (cell[axisKey] === expected && sameCornerAxis) {
      prev = cell;
      continue;
    }

    runs.push({ face, start, end: prev });
    start = cell;
    prev = cell;
  }

  runs.push({ face, start, end: prev });
  return runs;
}
