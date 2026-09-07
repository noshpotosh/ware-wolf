import {
  CHAIR_DEPTH_BIAS,
  CHAIR_DISPLAY_SIZE,
  CHAIR_SCREEN_OFFSET_X,
  CHAIR_SCREEN_OFFSET_Y,
  CHAIR_TEXTURE_KEY,
  FurnitureKind,
  NAMEPLATE_BG,
  NAMEPLATE_COLOR,
  NAMEPLATE_DEPTH_BIAS,
  NAMEPLATE_FONT_PX,
  NAMEPLATE_ORIGIN_X,
  NAMEPLATE_ORIGIN_Y,
  NAMEPLATE_PAD_X,
  NAMEPLATE_PAD_Y,
  NAMEPLATE_SCREEN_OFFSET_X,
  NAMEPLATE_SCREEN_OFFSET_Y,
  NAMEPLATE_STROKE,
  NAMEPLATE_STROKE_WIDTH,
  NOSH_MAT_DEPTH_BIAS,
  NOSH_MAT_DISPLAY_SIZE,
  NOSH_MAT_SCREEN_OFFSET_X,
  NOSH_MAT_SCREEN_OFFSET_Y,
  NOSH_MAT_TEXTURE_KEY,
  SPRITE_NO_BOB_Y,
  SPRITE_ORIGIN_CENTER_X,
  SPRITE_ORIGIN_FOOT_Y,
} from "./constants.js";
import {
  clearFloorParts,
  drawContinuousFloor,
  ensureWoodFloorTexture,
} from "./floorDraw.js";
import { buildRoomView, gridToScreen, screenToGrid } from "./isoMath.js";
import { drawRoomWalls } from "./wallDraw.js";
import { isPlayerMoving } from "./player.js";
import {
  SINGLE_SPRITES,
  SPRITE_SHEETS,
  spriteAssetUrl,
} from "./sprites.js";
import { nameplateLabel } from "./loftDecor.js";

const STAGE_FILL = "#242521";
const PATH_MARKER = 0xd97706;

const CHARACTER_WIDTH = 52;
const CHARACTER_HEIGHT = 120;
const SEATED_BODY_HEIGHT = 86;
const SEATED_ORIGIN_FOOT_Y = 1;
const SEATED_OFFSET_X = -24;
const SEATED_OFFSET_Y = -28;
const SEATED_DEPTH_BIAS = -0.3;
const OCCUPIED_CHAIR_DEPTH_BIAS = -0.6;
const DESK_WIDTH = 128;
const PROP_SIZE = 128;
const PLANT_SIZE = 96;

const FURNITURE_TEXTURE = {
  [FurnitureKind.DESK]: "desk-with-monitor",
  [FurnitureKind.BUBBLER]: "bubbler-pixellab",
  [FurnitureKind.COFFEE]: "coffee-pixellab",
  [FurnitureKind.WHITEBOARD]: "whiteboard-pixellab",
  [FurnitureKind.PLANT]: "furniture/loft-props.png",
};

function requirePhaser() {
  const Phaser = window.Phaser;

  if (!Phaser) {
    throw new Error("Phaser failed to load");
  }

  return Phaser;
}

function registerAtlasFrames(textures) {
  for (const sheet of SPRITE_SHEETS) {
    if (!textures.exists(sheet.path)) {
      continue;
    }

    const texture = textures.get(sheet.path);

    for (const [frameId, crop] of Object.entries(sheet.frames)) {
      const [x, y, width, height] = crop;

      if (texture.has(frameId)) {
        continue;
      }

      texture.add(frameId, 0, x, y, width, height);
    }
  }
}

function createLoftScene(Phaser, host) {
  return class LoftScene extends Phaser.Scene {
    constructor() {
      super("loft");
      this.host = host;
      this.roomView = { originX: 0, originY: 0, scale: 1 };
      this.lastWidth = 0;
      this.lastHeight = 0;
    }

    preload() {
      for (const sheet of SPRITE_SHEETS) {
        this.load.image(sheet.path, spriteAssetUrl(sheet.path));
      }

      for (const entry of SINGLE_SPRITES) {
        this.load.image(entry.id, spriteAssetUrl(entry.path));
      }
    }

    create() {
      registerAtlasFrames(this.textures);
      ensureWoodFloorTexture(this);
      this.cameras.main.setBackgroundColor(STAGE_FILL);
      this.worldRoot = this.add.container(0, 0);
      this.floorLayer = this.add.container(0, 0);
      this.worldRoot.add(this.floorLayer);
      this.wallLayer = this.add.container(0, 0);
      this.worldRoot.add(this.wallLayer);
      this.wallSprites = [];
      this.pathMarker = this.add.graphics();
      this.worldRoot.add(this.pathMarker);
      this.entityLayer = this.add.container(0, 0);
      this.worldRoot.add(this.entityLayer);
      this.entitySprites = new Map();
      this.floorParts = [];

      this.input.on("pointerdown", (pointer) => {
        this.handlePointer(pointer);
      });

      this.rebuildFromShell();
    }

    handlePointer(pointer) {
      const shell = this.host.getShell();

      if (!shell || this.host.isLoftPaused()) {
        return;
      }

      const localX =
        (pointer.x - this.roomView.originX) / this.roomView.scale;
      const localY =
        (pointer.y - this.roomView.originY) / this.roomView.scale;
      const tile = screenToGrid(localX, localY);

      this.host.onTilePointer(
        tile.gridX,
        tile.gridY,
        localX,
        localY
      );
    }

    rebuildFromShell() {
      const shell = this.host.getShell();

      if (!shell) {
        return;
      }

      this.drawFloor(shell.office);
      this.drawWalls(shell.office);
      this.syncEntities(shell);
      this.fitCamera(shell.office);
    }

    drawFloor(office) {
      clearFloorParts(this.floorParts);
      this.floorParts = drawContinuousFloor(
        this,
        this.floorLayer,
        office
      );
    }

    drawWalls(office) {
      for (const wall of this.wallSprites) {
        wall.destroy();
      }

      const walls = drawRoomWalls(this, office);

      this.wallLayer.add(walls);
      this.wallSprites = [walls];
    }

    fitCamera(office) {
      const view = buildRoomView(
        office.gridWidth,
        office.gridHeight,
        this.scale.width,
        this.scale.height
      );

      this.roomView = view;
      this.worldRoot.setPosition(view.originX, view.originY);
      this.worldRoot.setScale(view.scale);
    }

    syncEntities(shell) {
      const wantedIds = new Set();
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      for (const piece of shell.office.furniture) {
        const id = `furniture:${piece.id}`;
        const textureKey = FURNITURE_TEXTURE[piece.kind];

        if (!textureKey) {
          continue;
        }

        let size = PROP_SIZE;

        if (piece.kind === FurnitureKind.DESK) {
          size = DESK_WIDTH;
        }

        const isPlant = piece.kind === FurnitureKind.PLANT;

        if (isPlant) {
          size = PLANT_SIZE;
        }

        wantedIds.add(id);
        this.upsertImage(
          id,
          piece.gridX,
          piece.gridY,
          textureKey,
          isPlant ? "plant" : null,
          size,
          size
        );

        if (piece.kind !== FurnitureKind.DESK) {
          continue;
        }

        const occupant = shell.npcs.find(
          (npc) => npc.deskId === piece.id && npc.atDesk
        );

        this.syncDeskKit(piece, shell, wantedIds, Boolean(occupant));

        if (!occupant) {
          continue;
        }

        const seatedId = `npc-seated:${occupant.staffId}`;

        wantedIds.add(seatedId);
        this.upsertImage(
          seatedId,
          piece.gridX,
          piece.gridY,
          "characters/crew-idle.png",
          occupant.staffId,
          CHARACTER_WIDTH,
          CHARACTER_HEIGHT,
          SPRITE_ORIGIN_CENTER_X,
          SEATED_ORIGIN_FOOT_Y,
          SPRITE_NO_BOB_Y,
          SEATED_OFFSET_X,
          SEATED_OFFSET_Y,
          SEATED_DEPTH_BIAS
        );

        const seated = this.entitySprites.get(seatedId);
        const cropHeight = seated.frame.height
          * SEATED_BODY_HEIGHT / CHARACTER_HEIGHT;

        seated.setCrop(0, 0, seated.frame.width, cropHeight);
        seated.setFlipX(true);
      }

      for (const npc of shell.npcs) {
        if (npc.atDesk) {
          continue;
        }

        const id = `npc-walk:${npc.staffId}`;

        wantedIds.add(id);
        this.upsertImage(
          id,
          npc.gridX,
          npc.gridY,
          "characters/crew-idle.png",
          npc.staffId,
          CHARACTER_WIDTH,
          CHARACTER_HEIGHT
        );
      }

      const bob =
        isPlayerMoving(shell.player) && !reduced
          ? Math.sin(shell.player.walkBobPhase) * 3
          : 0;

      wantedIds.add("player:nosh");
      this.upsertImage(
        "player:nosh",
        shell.player.gridX,
        shell.player.gridY,
        "characters/crew-idle.png",
        "nosh",
        CHARACTER_WIDTH,
        CHARACTER_HEIGHT,
        0.5,
        0.95,
        bob
      );

      this.drawPathMarker(shell, reduced);

      for (const [id, sprite] of this.entitySprites) {
        if (wantedIds.has(id)) {
          continue;
        }

        sprite.destroy();
        this.entitySprites.delete(id);
      }

      this.sortEntities();
    }

    drawPathMarker(shell, reduced) {
      this.pathMarker.clear();

      if (reduced || !isPlayerMoving(shell.player)) {
        return;
      }

      const target = shell.player.path[shell.player.path.length - 1];

      if (!target) {
        return;
      }

      const point = gridToScreen(target.gridX, target.gridY);

      this.pathMarker.fillStyle(PATH_MARKER, 0.2);
      this.pathMarker.lineStyle(2, 0xd7ae67, 1);
      this.pathMarker.beginPath();
      this.pathMarker.moveTo(point.screenX, point.screenY - 22);
      this.pathMarker.lineTo(point.screenX + 44, point.screenY);
      this.pathMarker.lineTo(point.screenX, point.screenY + 22);
      this.pathMarker.lineTo(point.screenX - 44, point.screenY);
      this.pathMarker.closePath();
      this.pathMarker.fillPath();
      this.pathMarker.strokePath();
    }

    syncDeskKit(piece, shell, wantedIds, occupied) {
      const chairId = `chair:${piece.id}`;
      wantedIds.add(chairId);
      this.upsertImage(
        chairId,
        piece.gridX,
        piece.gridY,
        CHAIR_TEXTURE_KEY,
        null,
        CHAIR_DISPLAY_SIZE,
        CHAIR_DISPLAY_SIZE,
        SPRITE_ORIGIN_CENTER_X,
        SPRITE_ORIGIN_FOOT_Y,
        SPRITE_NO_BOB_Y,
        occupied ? SEATED_OFFSET_X : CHAIR_SCREEN_OFFSET_X,
        occupied ? SEATED_OFFSET_Y : CHAIR_SCREEN_OFFSET_Y,
        occupied ? OCCUPIED_CHAIR_DEPTH_BIAS : CHAIR_DEPTH_BIAS
      );

      if (piece.isPlayerDesk) {
        const matId = `nosh-mat:${piece.id}`;
        wantedIds.add(matId);
        this.upsertImage(
          matId,
          piece.gridX,
          piece.gridY,
          NOSH_MAT_TEXTURE_KEY,
          null,
          NOSH_MAT_DISPLAY_SIZE,
          NOSH_MAT_DISPLAY_SIZE,
          SPRITE_ORIGIN_CENTER_X,
          SPRITE_ORIGIN_FOOT_Y,
          SPRITE_NO_BOB_Y,
          NOSH_MAT_SCREEN_OFFSET_X,
          NOSH_MAT_SCREEN_OFFSET_Y,
          NOSH_MAT_DEPTH_BIAS
        );
      }

      const plateLabel = nameplateLabel(piece, shell);

      if (!plateLabel) {
        return;
      }

      const plateId = `nameplate:${piece.id}`;
      wantedIds.add(plateId);
      this.upsertNameplate(
        plateId,
        piece.gridX,
        piece.gridY,
        plateLabel
      );
    }

    upsertImage(
      id,
      gridX,
      gridY,
      textureKey,
      frame,
      width,
      height,
      originX = 0.5,
      originY = 0.92,
      bobY = 0,
      offsetX = 0,
      offsetY = 0,
      depthBias = 0
    ) {
      let sprite = this.entitySprites.get(id);
      const point = gridToScreen(gridX, gridY);

      if (!sprite) {
        sprite = frame
          ? this.add.image(0, 0, textureKey, frame)
          : this.add.image(0, 0, textureKey);
        sprite.setOrigin(originX, originY);
        this.entityLayer.add(sprite);
        this.entitySprites.set(id, sprite);
      }

      sprite.setDisplaySize(width, height);
      sprite.setPosition(
        point.screenX + offsetX,
        point.screenY + offsetY + bobY
      );
      sprite.setData("depth", gridX + gridY + depthBias);
    }

    upsertNameplate(id, gridX, gridY, label) {
      let plate = this.entitySprites.get(id);
      const point = gridToScreen(gridX, gridY);
      const x = point.screenX + NAMEPLATE_SCREEN_OFFSET_X;
      const y = point.screenY + NAMEPLATE_SCREEN_OFFSET_Y;

      if (!plate) {
        plate = this.add.text(x, y, label, {
          fontFamily: '"Pixelify Sans", monospace',
          fontSize: `${NAMEPLATE_FONT_PX}px`,
          color: NAMEPLATE_COLOR,
          backgroundColor: NAMEPLATE_BG,
          padding: { x: NAMEPLATE_PAD_X, y: NAMEPLATE_PAD_Y },
          align: "center",
        });
        plate.setOrigin(NAMEPLATE_ORIGIN_X, NAMEPLATE_ORIGIN_Y);
        plate.setStroke(NAMEPLATE_STROKE, NAMEPLATE_STROKE_WIDTH);
        plate.setDepth(0);
        this.entityLayer.add(plate);
        this.entitySprites.set(id, plate);
      } else {
        plate.setText(label);
        plate.setPosition(x, y);
      }

      plate.setData("depth", gridX + gridY + NAMEPLATE_DEPTH_BIAS);
    }

    sortEntities() {
      const children = [...this.entitySprites.values()];

      children.sort((left, right) =>
        left.getData("depth") - right.getData("depth"));

      children.forEach((sprite, index) => {
        this.entityLayer.moveTo(sprite, index);
      });
    }

    update(_time, deltaMs) {
      const shell = this.host.getShell();

      if (!shell) {
        return;
      }

      this.host.tick(deltaMs / 1000);
      this.syncEntities(shell);

      const widthChanged = this.scale.width !== this.lastWidth;
      const heightChanged = this.scale.height !== this.lastHeight;

      if (widthChanged || heightChanged) {
        this.lastWidth = this.scale.width;
        this.lastHeight = this.scale.height;
        this.fitCamera(shell.office);
      }
    }
  };
}

export function createPhaserLoft({
  parentEl,
  getShell,
  isLoftPaused,
  onTilePointer,
  tick,
}) {
  const Phaser = requirePhaser();
  const host = {
    getShell,
    isLoftPaused,
    onTilePointer,
    tick,
  };

  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent: parentEl,
    backgroundColor: STAGE_FILL,
    scale: {
      mode: Phaser.Scale.RESIZE,
      width: parentEl.clientWidth || 1280,
      height: parentEl.clientHeight || 720,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    render: {
      pixelArt: true,
      antialias: false,
    },
    scene: [createLoftScene(Phaser, host)],
    banner: false,
  });

  return {
    rebuild() {
      const scene = game.scene.getScene("loft");

      if (scene && scene.rebuildFromShell) {
        scene.rebuildFromShell();
      }
    },
    destroy() {
      game.destroy(true);
    },
  };
}
