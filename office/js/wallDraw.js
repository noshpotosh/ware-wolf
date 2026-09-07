import {
  FurnitureKind,
  WALL_BONE_COLOR,
  WALL_BONE_DIM_COLOR,
  WALL_CLAY_COLOR,
  WALL_CLAY_DARK_COLOR,
  WALL_HEIGHT_PX,
} from "./constants.js";
import {
  DOOR_HEIGHT,
  listBackWallRuns,
  wallFaceForCell,
  wallRunBaseline,
} from "./loftDecor.js";

const BASEBOARD_HEIGHT = 7;
const BASEBOARD_HIGHLIGHT_HEIGHT = 2;
const TOP_TRIM_HEIGHT = 4;
const DOOR_FRAME_INSET = 0.08;
const DOOR_FRAME_HEIGHT = 5;
const DOOR_COLOR = 0x82644b;
const DOOR_PANEL_COLOR = 0x947458;
const DOOR_UPPER_PANEL_BOUNDS = [0.2, 0.8, 49, 80];
const DOOR_LOWER_PANEL_BOUNDS = [0.2, 0.8, 12, 38];
const DOOR_HANDLE_FRACTION = 0.78;
const DOOR_HANDLE_HEIGHT = 44;
const DOOR_HANDLE_SIZE = 4;
const BRASS_COLOR = 0xd7ae67;
const WINDOW_GLASS_COLOR = 0xaac1bd;
const WINDOW_LIGHT_COLOR = 0xd4dfd3;
const WINDOW_BOTTOM = 38;
const WINDOW_TOP = 91;
const WINDOW_MIN_ROOM_WIDTH = 5;
const WINDOW_FRAME_BOUNDS = [0, 1, WINDOW_BOTTOM, WINDOW_TOP];
const WINDOW_PANE_BOUNDS = [
  0.04, 0.96, WINDOW_BOTTOM + 5, WINDOW_TOP - 5,
];
const WINDOW_REFLECTION_BOUNDS = [0.04, 0.96, 67, WINDOW_TOP - 5];
const WINDOW_MULLION_BOUNDS = [0.48, 0.52, WINDOW_BOTTOM, WINDOW_TOP];
const WINDOW_SILL_BOUNDS = [0, 1, WINDOW_BOTTOM, WINDOW_BOTTOM + 4];

function pointOnWall(baseline, fraction, height) {
  const { start, end } = baseline;

  return {
    x: start.x + (end.x - start.x) * fraction,
    y: start.y + (end.y - start.y) * fraction - height,
  };
}

function fillWallPanel(graphics, baseline, color, bounds) {
  const [left, right, bottom, top] = bounds;
  const points = [
    pointOnWall(baseline, left, bottom),
    pointOnWall(baseline, right, bottom),
    pointOnWall(baseline, right, top),
    pointOnWall(baseline, left, top),
  ];

  graphics.fillStyle(color, 1);
  graphics.fillPoints(points, true);
}

function drawWallRun(graphics, run) {
  const baseline = wallRunBaseline(run);
  const color = run.face === "se"
    ? WALL_BONE_COLOR
    : WALL_BONE_DIM_COLOR;

  fillWallPanel(graphics, baseline, color, [0, 1, 0, WALL_HEIGHT_PX]);
  fillWallPanel(graphics, baseline, WALL_CLAY_DARK_COLOR,
    [0, 1, 0, BASEBOARD_HEIGHT]);
  fillWallPanel(graphics, baseline, WALL_CLAY_COLOR,
    [
      0, 1, BASEBOARD_HEIGHT - BASEBOARD_HIGHLIGHT_HEIGHT, BASEBOARD_HEIGHT,
    ]);
  fillWallPanel(graphics, baseline, WALL_CLAY_COLOR,
    [0, 1, WALL_HEIGHT_PX - TOP_TRIM_HEIGHT, WALL_HEIGHT_PX]);
}

function drawDoor(graphics, door) {
  const face = wallFaceForCell(door.gridX, door.gridY);

  if (!face || face === "corner") {
    return;
  }

  const baseline = wallRunBaseline({ face, start: door, end: door });
  const color = face === "se" ? WALL_BONE_COLOR : WALL_BONE_DIM_COLOR;
  const inset = DOOR_FRAME_INSET;

  fillWallPanel(graphics, baseline, color,
    [0, 1, DOOR_HEIGHT, WALL_HEIGHT_PX]);
  fillWallPanel(graphics, baseline, WALL_CLAY_COLOR,
    [0, 1, WALL_HEIGHT_PX - TOP_TRIM_HEIGHT, WALL_HEIGHT_PX]);
  fillWallPanel(graphics, baseline, WALL_CLAY_DARK_COLOR,
    [0, 1, 0, DOOR_HEIGHT]);
  fillWallPanel(graphics, baseline, DOOR_COLOR,
    [inset, 1 - inset, 0, DOOR_HEIGHT - DOOR_FRAME_HEIGHT]);
  fillWallPanel(graphics, baseline, DOOR_PANEL_COLOR,
    DOOR_UPPER_PANEL_BOUNDS);
  fillWallPanel(graphics, baseline, DOOR_PANEL_COLOR,
    DOOR_LOWER_PANEL_BOUNDS);

  const handle = pointOnWall(
    baseline, DOOR_HANDLE_FRACTION, DOOR_HANDLE_HEIGHT
  );
  const halfHandle = DOOR_HANDLE_SIZE / 2;

  graphics.fillStyle(BRASS_COLOR, 1);
  graphics.fillRect(
    handle.x - halfHandle,
    handle.y - halfHandle,
    DOOR_HANDLE_SIZE,
    DOOR_HANDLE_SIZE
  );
}

function drawWindow(graphics, office) {
  const center = Math.floor(office.gridWidth / 2);
  const hasDoor = office.furniture.some((piece) =>
    piece.kind === FurnitureKind.DOOR
    && piece.gridY === 0
    && Math.abs(piece.gridX - center) <= 1);

  if (hasDoor || office.gridWidth < WINDOW_MIN_ROOM_WIDTH) {
    return;
  }

  const baseline = wallRunBaseline({
    face: "se",
    start: { gridX: center - 1, gridY: 0 },
    end: { gridX: center, gridY: 0 },
  });

  fillWallPanel(graphics, baseline, WALL_CLAY_DARK_COLOR,
    WINDOW_FRAME_BOUNDS);
  fillWallPanel(graphics, baseline, WINDOW_GLASS_COLOR,
    WINDOW_PANE_BOUNDS);
  fillWallPanel(graphics, baseline, WINDOW_LIGHT_COLOR,
    WINDOW_REFLECTION_BOUNDS);
  fillWallPanel(graphics, baseline, WALL_CLAY_COLOR,
    WINDOW_MULLION_BOUNDS);
  fillWallPanel(graphics, baseline, WALL_CLAY_COLOR,
    WINDOW_SILL_BOUNDS);
}

export function drawRoomWalls(scene, office) {
  const graphics = scene.add.graphics();

  for (const run of listBackWallRuns(office)) {
    drawWallRun(graphics, run);
  }

  for (const piece of office.furniture) {
    if (piece.kind === FurnitureKind.DOOR) {
      drawDoor(graphics, piece);
    }
  }

  drawWindow(graphics, office);
  return graphics;
}
