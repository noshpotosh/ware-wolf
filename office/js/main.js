import {
  GoalEventKind,
  InteractKind,
  RoomId,
  TOAST_VISIBLE_MS,
  UpgradeId,
} from "./constants.js";
import { createAgentBus } from "./agentBus.js";
import {
  createAudioBus,
  playUiBlip,
  toggleAudioMuted,
} from "./audio.js";
import {
  createDesktopOs,
  handleDesktopOsKeydown,
  isDesktopOsOpen,
  openDesktopOs,
} from "./desktopOs.js";
import {
  createEconomy,
  formatCompanyBucks,
  ownsUpgrade,
  recordGoalEvent,
  subscribeEconomy,
} from "./economy.js";
import {
  buildInteractTargetForPiece,
  findFurnitureAt,
  findFurnitureAtScreen,
  findFurnitureById,
  findNearbyInteractable,
} from "./interact.js";
import {
  loadStarterOfficeBundle,
  staffById,
} from "./loadOfficeData.js";
import {
  isNpcAtDesk,
  updateNpcs,
} from "./npcs.js";
import { createPhaserLoft } from "./phaserLoft.js";
import {
  requestPlayerWalk,
  updatePlayer,
} from "./player.js";
import { playRoomFlash } from "./roomFlash.js";
import {
  applyRoom,
  findExitForDoor,
  isFoundersOffice,
  isSharedLoft,
  roomsById,
} from "./rooms.js";
import { loadSprites } from "./sprites.js";
import {
  findAdjacentWalkable,
  isWalkable,
} from "./walkMap.js";

function showLoadError(message) {
  const title = document.querySelector(".office-title");

  if (!title) {
    return;
  }

  title.textContent = message;
}

function setPromptText(promptEl, text) {
  if (!promptEl) {
    return;
  }

  if (!text) {
    promptEl.hidden = true;
    promptEl.textContent = "";
    return;
  }

  promptEl.hidden = false;
  promptEl.textContent = text;
}

function showToast(toastEl, text) {
  if (!toastEl || !text) {
    return null;
  }

  toastEl.hidden = false;
  toastEl.textContent = text;

  return window.setTimeout(() => {
    toastEl.hidden = true;
    toastEl.textContent = "";
  }, TOAST_VISIBLE_MS);
}

function refreshBucksHud(bucksHud, economy) {
  if (!bucksHud) {
    return;
  }

  bucksHud.textContent = formatCompanyBucks(
    economy.companyBucks
  );
}

function refreshMuteButton(muteButton, audio) {
  if (!muteButton) {
    return;
  }

  muteButton.textContent = audio.isMuted ? "Unmute" : "Mute";
  muteButton.setAttribute(
    "aria-pressed",
    audio.isMuted ? "true" : "false"
  );
}

function loftUpgradesFromEconomy(economy) {
  return {
    [UpgradeId.DESK_PLANTS]: ownsUpgrade(
      economy,
      UpgradeId.DESK_PLANTS
    ),
    [UpgradeId.DESK_LAMPS]: ownsUpgrade(
      economy,
      UpgradeId.DESK_LAMPS
    ),
    [UpgradeId.BETTER_CHAIRS]: ownsUpgrade(
      economy,
      UpgradeId.BETTER_CHAIRS
    ),
    [UpgradeId.AMBER_NEON]: ownsUpgrade(
      economy,
      UpgradeId.AMBER_NEON
    ),
  };
}

function buildOccupancyMap(npcs, desktopOpen) {
  const occupancy = {};

  for (const npc of npcs) {
    occupancy[npc.staffId] = isNpcAtDesk(npc);
  }

  occupancy.nosh = desktopOpen;

  return occupancy;
}

function announceGoalCompletions(shell, completed) {
  for (const result of completed) {
    shell.showEconomyToast(
      `+${result.rewardBucks} bucks — ${result.title}`
    );
    playUiBlip(shell.audio, "message");
  }
}

function handleGoalEvent(shell, kind, detail) {
  const completed = recordGoalEvent(
    shell.economy,
    kind,
    detail
  );

  announceGoalCompletions(shell, completed);
}

function interactOptions(shell) {
  return { allowDeskPc: isFoundersOffice(shell) };
}

function travelThroughDoor(shell, target) {
  if (shell.roomTravelPending) {
    return;
  }

  const furniture = findFurnitureById(
    shell.office,
    target.pieceId
  );
  const exit =
    findExitForDoor(shell, furniture)
    || {
      toRoomId: target.toRoomId,
      toSpawn: target.toSpawn,
    };

  if (!exit || !exit.toRoomId) {
    return;
  }

  shell.roomTravelPending = true;
  setPromptText(shell.promptEl, "");
  playUiBlip(shell.audio, "click");

  playRoomFlash(shell.stage, () => {
    applyRoom(shell, exit.toRoomId, exit.toSpawn || null);
  }).finally(() => {
    shell.roomTravelPending = false;
  });
}

function triggerInteract(shell, target) {
  if (!target) {
    return;
  }

  if (target.kind === InteractKind.USE_DOOR) {
    travelThroughDoor(shell, target);
    return;
  }

  if (target.kind === InteractKind.USE_PC) {
    if (!isFoundersOffice(shell)) {
      return;
    }

    openDesktopOs(shell.desktop);
    playUiBlip(shell.audio, "click");
    handleGoalEvent(
      shell,
      GoalEventKind.OPEN_DESKTOP
    );
    return;
  }

  if (shell.toastTimerId !== null) {
    window.clearTimeout(shell.toastTimerId);
  }

  let toastText = target.toastText;

  if (target.kind === InteractKind.READ_BOARD) {
    toastText = target.readNote();
  }

  shell.toastTimerId = showToast(shell.toastEl, toastText);

  const drinkLike =
    target.kind === InteractKind.DRINK
    || target.kind === InteractKind.SIP_COFFEE;

  playUiBlip(shell.audio, drinkLike ? "drink" : "click");

  if (target.kind === InteractKind.TALK) {
    handleGoalEvent(shell, GoalEventKind.TALK, {
      staffId: target.staffId,
    });
  }

  if (target.kind === InteractKind.DRINK) {
    handleGoalEvent(shell, GoalEventKind.DRINK);
  }

  if (target.kind === InteractKind.SIP_COFFEE) {
    handleGoalEvent(shell, GoalEventKind.SIP_COFFEE);
  }

  if (target.kind === InteractKind.READ_BOARD) {
    handleGoalEvent(shell, GoalEventKind.READ_BOARD);
  }
}

function handleLoftPointer(shell, gridX, gridY, localX, localY) {
  if (shell.roomTravelPending) {
    return;
  }

  const furniture = findFurnitureAtScreen(
    shell.office,
    localX,
    localY
  ) || findFurnitureAt(shell.office, gridX, gridY);

  if (furniture) {
    const target = buildInteractTargetForPiece(
      furniture,
      shell.staffLookup,
      interactOptions(shell)
    );

    if (!target) {
      return;
    }

    const standTile = findAdjacentWalkable(
      shell.walkMap,
      furniture.gridX,
      furniture.gridY
    );

    if (!standTile) {
      return;
    }

    requestPlayerWalk(
      shell.player,
      shell.walkMap,
      standTile.gridX,
      standTile.gridY,
      () => {
        triggerInteract(shell, target);
      }
    );
    return;
  }

  if (!isWalkable(shell.walkMap, gridX, gridY)) {
    return;
  }

  requestPlayerWalk(
    shell.player,
    shell.walkMap,
    gridX,
    gridY
  );
}

function handleOfficeKeydown(event, shell) {
  if (handleDesktopOsKeydown(shell.desktop, event)) {
    return;
  }

  if (event.key === "m" || event.key === "M") {
    toggleAudioMuted(shell.audio);
    refreshMuteButton(shell.muteButton, shell.audio);
    return;
  }

  if (event.key !== "e" && event.key !== "E") {
    return;
  }

  if (shell.roomTravelPending || !shell.nearbyTarget) {
    return;
  }

  triggerInteract(shell, shell.nearbyTarget);
}

function tickShell(shell, deltaSeconds) {
  if (isDesktopOsOpen(shell.desktop) || shell.roomTravelPending) {
    shell.nearbyTarget = null;
    setPromptText(shell.promptEl, "");
    return;
  }

  updatePlayer(shell.player, deltaSeconds);
  updateNpcs(
    shell.npcs,
    shell.office,
    shell.walkMap,
    deltaSeconds
  );
  shell.nearbyTarget = findNearbyInteractable(
    shell.player,
    shell.office,
    shell.staffLookup,
    interactOptions(shell)
  );
  setPromptText(
    shell.promptEl,
    shell.nearbyTarget ? shell.nearbyTarget.prompt : ""
  );

  // Keep upgrade map warm for later Phaser art parity.
  shell.loftUpgrades = loftUpgradesFromEconomy(shell.economy);
}

function wireDesktopCallbacks(shell) {
  return {
    getOccupancy() {
      return buildOccupancyMap(shell.npcs, true);
    },
    onClose() {
      setPromptText(shell.promptEl, "");
    },
    onGoalComplete(result) {
      shell.showEconomyToast(
        `+${result.rewardBucks} bucks — ${result.title}`
      );
      playUiBlip(shell.audio, "message");
    },
    onUpgradePurchase(result) {
      shell.showEconomyToast(
        `Installed ${result.title} (−${result.costBucks})`
      );
      playUiBlip(shell.audio, "click");
    },
    onOfficeChange(result) {
      const rebuilt = shell.applyOfficeLayout(result.officeId);

      if (rebuilt) {
        shell.showEconomyToast(`Moved into ${result.title}`);
      } else {
        shell.showEconomyToast(
          `${result.title} ready — exit to loft.`
        );
      }

      playUiBlip(shell.audio, "click");
    },
    onMessageSent() {
      playUiBlip(shell.audio, "message");
    },
    onGoalEvent(kind, detail) {
      handleGoalEvent(shell, kind, detail);
    },
  };
}

function roomDisplayName(shell) {
  const room = shell.roomsLookup[shell.currentRoomId];

  if (room && room.displayName) {
    return room.displayName;
  }

  return shell.office.displayName || "Office";
}

async function startOfficeShell() {
  const stage = document.getElementById("office-stage");
  const phaserHost = document.getElementById("office-phaser");
  const promptEl = document.getElementById("interact-prompt");
  const toastEl = document.getElementById("office-toast");
  const desktopRoot = document.getElementById("desktop-os");
  const bucksHud = document.getElementById("bucks-hud");
  const muteButton = document.getElementById("mute-button");

  if (!stage || !phaserHost || !desktopRoot) {
    throw new Error("Missing office stage, Phaser host, or desktop");
  }

  const bundle = await loadStarterOfficeBundle();
  await loadSprites();
  await document.fonts.ready;
  const staffLookup = staffById(bundle.staff);
  const roomsLookup = roomsById(bundle.rooms.rooms);
  const economy = createEconomy(
    bundle.goals,
    bundle.upgrades,
    bundle.offices
  );
  const agentBus = createAgentBus(bundle.agentPersonas);
  const audio = createAudioBus();
  const title = document.querySelector(".office-title");

  const shell = {
    stage,
    phaserHost,
    promptEl,
    toastEl,
    bucksHud,
    muteButton,
    staffLookup,
    roomsLookup,
    bundle,
    economy,
    audio,
    currentRoomId: null,
    office: null,
    walkMap: null,
    player: null,
    npcs: [],
    desktop: null,
    loft: null,
    toastTimerId: null,
    nearbyTarget: null,
    loftUpgrades: {},
    roomTravelPending: false,
    showEconomyToast: null,
    applyOfficeLayout: null,
    syncOfficeTitle: null,
  };

  shell.syncOfficeTitle = function syncOfficeTitle() {
    if (!title) {
      return;
    }

    title.textContent = `Warewolf · ${roomDisplayName(shell)}`;
  };

  shell.showEconomyToast = function showEconomyToast(text) {
    if (shell.toastTimerId !== null) {
      window.clearTimeout(shell.toastTimerId);
    }

    shell.toastTimerId = showToast(toastEl, text);
  };

  // Economy loft size upgrade — rebuild only if already in the loft.
  shell.applyOfficeLayout = function applyOfficeLayout(
    _officeId
  ) {
    if (!isSharedLoft(shell)) {
      return false;
    }

    applyRoom(shell, RoomId.SHARED_LOFT, {
      gridX: Math.round(shell.player.gridX),
      gridY: Math.round(shell.player.gridY),
    });

    return true;
  };

  applyRoom(
    shell,
    bundle.rooms.startRoomId || RoomId.FOUNDERS_OFFICE
  );

  refreshBucksHud(bucksHud, economy);
  refreshMuteButton(muteButton, audio);
  subscribeEconomy(economy, () => {
    refreshBucksHud(bucksHud, economy);
  });

  shell.desktop = createDesktopOs({
    root: desktopRoot,
    staffList: bundle.staff,
    economy,
    agentBus,
    ...wireDesktopCallbacks(shell),
  });

  shell.loft = createPhaserLoft({
    parentEl: phaserHost,
    getShell: () => shell,
    isDesktopOpen: () => isDesktopOsOpen(shell.desktop),
    onTilePointer: (gridX, gridY, localX, localY) => {
      handleLoftPointer(shell, gridX, gridY, localX, localY);
    },
    tick: (deltaSeconds) => {
      tickShell(shell, deltaSeconds);
    },
  });

  window.addEventListener("keydown", (event) => {
    handleOfficeKeydown(event, shell);
  });

  if (muteButton) {
    muteButton.addEventListener("click", () => {
      toggleAudioMuted(audio);
      refreshMuteButton(muteButton, audio);
    });
  }
}

startOfficeShell().catch((error) => {
  console.error(error);
  showLoadError("Failed to load loft");
});
