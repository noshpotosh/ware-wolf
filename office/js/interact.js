import { gridToScreen } from "./isoMath.js";
import {
  BUBBLER_DRINK_LINE,
  COFFEE_SIP_LINE,
  FurnitureKind,
  INTERACT_RANGE_TILES,
  InteractKind,
  StaffTalkLine,
  WHITEBOARD_NOTES,
} from "./constants.js";

let whiteboardNoteIndex = 0;

function chebyshevDistance(ax, ay, bx, by) {
  return Math.max(Math.abs(ax - bx), Math.abs(ay - by));
}

function nextWhiteboardNote() {
  const note = WHITEBOARD_NOTES[whiteboardNoteIndex];
  whiteboardNoteIndex =
    (whiteboardNoteIndex + 1) % WHITEBOARD_NOTES.length;

  return note;
}

function buildTalkTarget(piece, person) {
  const line =
    StaffTalkLine[person.id] || person.about;

  return {
    kind: InteractKind.TALK,
    pieceId: piece.id,
    staffId: person.id,
    prompt: `Press E to talk to ${person.displayName}`,
    toastText: `${person.displayName}: “${line}”`,
  };
}

function buildDrinkTarget(piece) {
  return {
    kind: InteractKind.DRINK,
    pieceId: piece.id,
    staffId: null,
    prompt: "Press E to drink from the bubbler",
    toastText: BUBBLER_DRINK_LINE,
  };
}

function buildCoffeeTarget(piece) {
  return {
    kind: InteractKind.SIP_COFFEE,
    pieceId: piece.id,
    staffId: null,
    prompt: "Press E to pour a coffee",
    toastText: COFFEE_SIP_LINE,
  };
}

function buildWhiteboardTarget(piece) {
  return {
    kind: InteractKind.READ_BOARD,
    pieceId: piece.id,
    staffId: null,
    prompt: "Press E to read the whiteboard",
    toastText: null,
    readNote: nextWhiteboardNote,
  };
}

function buildUsePcTarget(piece) {
  return {
    kind: InteractKind.USE_PC,
    pieceId: piece.id,
    staffId: null,
    prompt: "Press E to use your desk PC",
    toastText: null,
  };
}

function buildDoorTarget(piece) {
  const label = piece.exitLabel || "Use the door";

  return {
    kind: InteractKind.USE_DOOR,
    pieceId: piece.id,
    staffId: null,
    prompt: `Press E — ${label}`,
    toastText: null,
    toRoomId: piece.toRoomId,
    toSpawn: piece.toSpawn || null,
    exitLabel: piece.exitLabel || null,
  };
}

export function findNearbyInteractable(
  player,
  office,
  staffLookup,
  options = {}
) {
  const allowDeskPc = options.allowDeskPc !== false;
  const playerX = Math.round(player.gridX);
  const playerY = Math.round(player.gridY);
  let bestTarget = null;
  let bestDistance = Infinity;

  for (const piece of office.furniture) {
    const distance = chebyshevDistance(
      playerX,
      playerY,
      piece.gridX,
      piece.gridY
    );

    if (distance < 1 || distance > INTERACT_RANGE_TILES) {
      continue;
    }

    const target = buildInteractTargetForPiece(
      piece,
      staffLookup,
      { allowDeskPc }
    );

    if (!target) {
      continue;
    }

    if (distance < bestDistance) {
      bestTarget = target;
      bestDistance = distance;
    }
  }

  return bestTarget;
}

export function findFurnitureById(office, pieceId) {
  for (const piece of office.furniture) {
    if (piece.id === pieceId) {
      return piece;
    }
  }

  return null;
}

export function findFurnitureAt(office, gridX, gridY) {
  for (const piece of office.furniture) {
    if (piece.gridX === gridX && piece.gridY === gridY) {
      return piece;
    }
  }

  return null;
}

export function buildInteractTargetForPiece(
  piece,
  staffLookup,
  options = {}
) {
  const allowDeskPc = options.allowDeskPc !== false;

  if (piece.kind === FurnitureKind.BUBBLER) {
    return buildDrinkTarget(piece);
  }

  if (piece.kind === FurnitureKind.COFFEE) {
    return buildCoffeeTarget(piece);
  }

  if (piece.kind === FurnitureKind.WHITEBOARD) {
    return buildWhiteboardTarget(piece);
  }

  if (piece.kind === FurnitureKind.DOOR) {
    return buildDoorTarget(piece);
  }

  if (piece.kind !== FurnitureKind.DESK) {
    return null;
  }

  if (piece.isPlayerDesk) {
    if (!allowDeskPc) {
      return null;
    }

    return buildUsePcTarget(piece);
  }

  if (!piece.staffId) {
    return null;
  }

  const person = staffLookup[piece.staffId];

  if (!person) {
    return null;
  }

  return buildTalkTarget(piece, person);
}

// Raised CRTs must select their desk rather than the floor behind them.
const FURNITURE_HIT_BOUNDS = {
  desk: { left: -49, right: 49, top: -70, bottom: 26 },
  bubbler: { left: -13, right: 17, top: -65, bottom: 3 },
  coffee: { left: -22, right: 27, top: -48, bottom: 8 },
  whiteboard: { left: -30, right: 30, top: -61, bottom: 5 },
  door: { left: -28, right: 28, top: -70, bottom: 10 },
};

export function findFurnitureAtScreen(office, screenX, screenY) {
  const frontToBack = [...office.furniture].sort((left, right) =>
    right.gridX + right.gridY - left.gridX - left.gridY);
  return frontToBack.find(piece => {
    const bounds = FURNITURE_HIT_BOUNDS[piece.kind];
    if (!bounds) return false;
    const point = gridToScreen(piece.gridX, piece.gridY);
    const x = screenX - point.screenX;
    const y = screenY - point.screenY;
    return x >= bounds.left && x <= bounds.right
      && y >= bounds.top && y <= bounds.bottom;
  }) || null;
}
