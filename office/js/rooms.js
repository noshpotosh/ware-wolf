import {
  FurnitureKind,
  LayoutSource,
  RoomId,
} from "./constants.js";
import { createNpcs } from "./npcs.js";
import { createPlayer } from "./player.js";
import {
  buildWalkMap,
  findSpawnNearPlayerDesk,
  isWalkable,
} from "./walkMap.js";

export function roomsById(roomsList) {
  const byId = {};

  for (const room of roomsList) {
    byId[room.id] = room;
  }

  return byId;
}

export function resolveRoomLayout(
  room,
  bundle,
  economyOfficeId
) {
  if (!room) {
    return null;
  }

  if (room.layoutSource === LayoutSource.FIXED) {
    return bundle.layouts[room.layoutId] || null;
  }

  if (room.layoutSource === LayoutSource.ECONOMY) {
    return (
      bundle.layouts[economyOfficeId]
      || bundle.layouts[bundle.office.id]
      || null
    );
  }

  return null;
}

function resolveSpawn(layout, spawnOverride) {
  const walkMap = buildWalkMap(layout);

  if (spawnOverride) {
    const spawnX = spawnOverride.gridX;
    const spawnY = spawnOverride.gridY;

    if (isWalkable(walkMap, spawnX, spawnY)) {
      return { gridX: spawnX, gridY: spawnY, walkMap };
    }
  }

  const nearDesk = findSpawnNearPlayerDesk(layout, walkMap);

  return {
    gridX: nearDesk.gridX,
    gridY: nearDesk.gridY,
    walkMap,
  };
}

export function applyRoom(
  shell,
  roomId,
  spawnOverride
) {
  const room = shell.roomsLookup[roomId];

  if (!room) {
    return;
  }

  const layout = resolveRoomLayout(
    room,
    shell.bundle,
    shell.economy.currentOfficeId
  );

  if (!layout) {
    return;
  }

  const spawn = resolveSpawn(layout, spawnOverride);

  shell.currentRoomId = roomId;
  shell.office = layout;
  shell.walkMap = spawn.walkMap;
  shell.player = createPlayer(spawn.gridX, spawn.gridY);
  shell.npcs = createNpcs(layout, shell.staffLookup);
  shell.nearbyTarget = null;

  if (shell.syncOfficeTitle) {
    shell.syncOfficeTitle();
  }

  if (shell.loft) {
    shell.loft.rebuild();
  }
}

export function isFoundersOffice(shell) {
  return shell.currentRoomId === RoomId.FOUNDERS_OFFICE;
}

export function isSharedLoft(shell) {
  return shell.currentRoomId === RoomId.SHARED_LOFT;
}

function exitMatchingDoor(room, doorPiece) {
  if (!room) {
    return null;
  }

  for (const exit of room.exits || []) {
    if (exit.doorId === doorPiece.id) {
      return exit;
    }
  }

  return null;
}

export function findExitForDoor(shell, doorPiece) {
  if (!doorPiece || doorPiece.kind !== FurnitureKind.DOOR) {
    return null;
  }

  const room = shell.roomsLookup[shell.currentRoomId];
  const roomExit = exitMatchingDoor(room, doorPiece);

  // Room graph wins; furniture fields are the fallback copy.
  if (roomExit) {
    return {
      toRoomId: roomExit.toRoomId || doorPiece.toRoomId,
      toSpawn: roomExit.toSpawn || doorPiece.toSpawn,
      exitLabel:
        roomExit.exitLabel || doorPiece.exitLabel || null,
    };
  }

  if (!doorPiece.toRoomId) {
    return null;
  }

  return {
    toRoomId: doorPiece.toRoomId,
    toSpawn: doorPiece.toSpawn || null,
    exitLabel: doorPiece.exitLabel || null,
  };
}
