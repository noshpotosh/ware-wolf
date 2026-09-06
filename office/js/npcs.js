import {
  DEFAULT_NPC_JACKET_FILL,
  FurnitureKind,
  NPC_BUBBLER_DWELL_SECONDS,
  NPC_BUBBLER_VISIT_SECONDS,
  NPC_LOFT_MOTION_ENABLED,
  NPC_MOVE_TILES_PER_SECOND,
  NPC_VISIT_JITTER_BASE,
  NPC_VISIT_JITTER_SPAN,
  NpcJacketFill,
  PLAYER_STAFF_ID,
} from "./constants.js";
import { findPath } from "./pathfind.js";
import {
  findAdjacentWalkable,
  isWalkable,
} from "./walkMap.js";

function findFurnitureByKind(office, kind) {
  for (const piece of office.furniture) {
    if (piece.kind === kind) {
      return piece;
    }
  }

  return null;
}

export function createNpcs(office, staffLookup) {
  const npcs = [];

  for (const piece of office.furniture) {
    if (piece.kind !== FurnitureKind.DESK) {
      continue;
    }

    if (piece.isPlayerDesk) {
      continue;
    }

    const person = staffLookup[piece.staffId];

    if (!person || person.id === PLAYER_STAFF_ID) {
      continue;
    }

    const jacketFill =
      NpcJacketFill[person.id] || DEFAULT_NPC_JACKET_FILL;

    npcs.push({
      staffId: person.id,
      displayName: person.displayName,
      gridX: piece.gridX,
      gridY: piece.gridY,
      deskGridX: piece.gridX,
      deskGridY: piece.gridY,
      deskId: piece.id,
      jacketFill,
      path: [],
      atDesk: true,
      visitCooldown:
        NPC_BUBBLER_VISIT_SECONDS
        * (NPC_VISIT_JITTER_BASE
          + Math.random() * NPC_VISIT_JITTER_SPAN),
      dwellSeconds: 0,
      waitingAtBubbler: false,
      returningToDesk: false,
    });
  }

  return npcs;
}

export function isNpcAtDesk(npc) {
  return Boolean(npc && npc.atDesk);
}

function advanceNpcAlongPath(npc, deltaSeconds) {
  if (npc.path.length === 0) {
    return;
  }

  const nextStep = npc.path[0];
  const deltaX = nextStep.gridX - npc.gridX;
  const deltaY = nextStep.gridY - npc.gridY;
  const distance = Math.hypot(deltaX, deltaY);
  const stepBudget =
    NPC_MOVE_TILES_PER_SECOND * deltaSeconds;

  if (distance <= stepBudget) {
    npc.gridX = nextStep.gridX;
    npc.gridY = nextStep.gridY;
    npc.path.shift();
    return;
  }

  const moveRatio = stepBudget / distance;
  npc.gridX += deltaX * moveRatio;
  npc.gridY += deltaY * moveRatio;
}

function seatNpcAtDesk(npc) {
  npc.gridX = npc.deskGridX;
  npc.gridY = npc.deskGridY;
  npc.atDesk = true;
  npc.returningToDesk = false;
  npc.waitingAtBubbler = false;
  npc.path = [];
}

export function updateNpcs(npcs, office, walkMap, deltaSeconds) {
  // ADR 002 Phase B: static poses only. Bubbler walks return
  // with station-snap (Phase C).
  if (!NPC_LOFT_MOTION_ENABLED) {
    return;
  }

  const bubbler = findFurnitureByKind(
    office,
    FurnitureKind.BUBBLER
  );

  for (const npc of npcs) {
    advanceNpcAlongPath(npc, deltaSeconds);

    if (npc.path.length > 0) {
      npc.atDesk = false;
      continue;
    }

    if (npc.returningToDesk) {
      seatNpcAtDesk(npc);
      continue;
    }

    if (npc.waitingAtBubbler) {
      npc.dwellSeconds -= deltaSeconds;

      if (npc.dwellSeconds > 0) {
        continue;
      }

      const seat = findAdjacentWalkable(
        walkMap,
        npc.deskGridX,
        npc.deskGridY
      );

      if (!seat) {
        seatNpcAtDesk(npc);
        continue;
      }

      npc.waitingAtBubbler = false;
      npc.returningToDesk = true;
      npc.path = findPath(
        walkMap,
        Math.round(npc.gridX),
        Math.round(npc.gridY),
        seat.gridX,
        seat.gridY
      );

      if (npc.path.length === 0) {
        seatNpcAtDesk(npc);
      }

      continue;
    }

    const onDesk =
      Math.round(npc.gridX) === npc.deskGridX
      && Math.round(npc.gridY) === npc.deskGridY;

    if (onDesk) {
      npc.atDesk = true;
      npc.gridX = npc.deskGridX;
      npc.gridY = npc.deskGridY;
    }

    if (!bubbler || !npc.atDesk) {
      continue;
    }

    npc.visitCooldown -= deltaSeconds;

    if (npc.visitCooldown > 0) {
      continue;
    }

    const sipTile = findAdjacentWalkable(
      walkMap,
      bubbler.gridX,
      bubbler.gridY
    );

    if (!sipTile) {
      npc.visitCooldown = NPC_BUBBLER_VISIT_SECONDS;
      continue;
    }

    // Step off the blocked desk seat onto a walkable neighbor.
    let startX = Math.round(npc.gridX);
    let startY = Math.round(npc.gridY);

    if (!isWalkable(walkMap, startX, startY)) {
      const exitTile = findAdjacentWalkable(
        walkMap,
        startX,
        startY
      );

      if (!exitTile) {
        npc.visitCooldown = NPC_BUBBLER_VISIT_SECONDS;
        continue;
      }

      startX = exitTile.gridX;
      startY = exitTile.gridY;
      npc.gridX = startX;
      npc.gridY = startY;
    }

    const path = findPath(
      walkMap,
      startX,
      startY,
      sipTile.gridX,
      sipTile.gridY
    );

    if (path.length === 0) {
      seatNpcAtDesk(npc);
      npc.visitCooldown = NPC_BUBBLER_VISIT_SECONDS;
      continue;
    }

    npc.path = path;
    npc.atDesk = false;
    npc.waitingAtBubbler = true;
    npc.dwellSeconds = NPC_BUBBLER_DWELL_SECONDS;
    npc.visitCooldown =
      NPC_BUBBLER_VISIT_SECONDS
      * (NPC_VISIT_JITTER_SPAN + Math.random());
  }
}
