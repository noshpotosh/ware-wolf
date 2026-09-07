import assert from "node:assert/strict";
import test from "node:test";
import {
  FurnitureKind,
  TILE_HEIGHT_PX,
  TILE_WIDTH_PX,
} from "../js/constants.js";
import { roomFootprintTips } from "../js/floorDraw.js";
import { findFurnitureAtScreen } from "../js/interact.js";
import {
  listBackWallRuns,
  wallRunBaseline,
} from "../js/loftDecor.js";
import { drawRoomWalls } from "../js/wallDraw.js";

const WALL_SLOPE = TILE_HEIGHT_PX / TILE_WIDTH_PX;
const FLOOR_NORTH_Y = -TILE_HEIGHT_PX / 2;

const door = { kind: FurnitureKind.DOOR, gridX: 0, gridY: 3 };
const office = { gridWidth: 10, gridHeight: 8, furniture: [door] };

test("wall planes meet exactly at the floor perimeter", () => {
  const tips = roomFootprintTips(office.gridWidth, office.gridHeight);
  const runs = listBackWallRuns(office);
  const right = runs.find((run) => run.face === "se");
  const left = runs.filter((run) => run.face === "sw");

  assert.deepEqual(wallRunBaseline(right).start, tips.north);
  assert.deepEqual(wallRunBaseline(right).end, tips.east);
  assert.deepEqual(wallRunBaseline(left[0]).start, tips.north);
  assert.deepEqual(wallRunBaseline(left.at(-1)).end, tips.west);
});

test("door edges close the wall gap without overlap", () => {
  const runs = listBackWallRuns(office)
    .filter((run) => run.face === "sw");
  const opening = wallRunBaseline({ face: "sw", start: door, end: door });

  assert.deepEqual(wallRunBaseline(runs[0]).end, opening.start);
  assert.deepEqual(wallRunBaseline(runs[1]).start, opening.end);
});

test("clicking either wall-facing door follows its sloped panel", () => {
  for (const piece of [door, { ...door, gridX: 3, gridY: 0 }]) {
    const face = piece.gridX === 0 ? "sw" : "se";
    const { start, end } = wallRunBaseline({
      face, start: piece, end: piece,
    });
    const room = { ...office, furniture: [piece] };
    const x = (start.x + end.x) / 2;
    const y = (start.y + end.y) / 2;

    assert.equal(findFurnitureAtScreen(room, x, y - 48), piece);
    assert.equal(findFurnitureAtScreen(room, x, y + 2), null);
    assert.equal(findFurnitureAtScreen(room, x, y - 100), null);
  }
});

test("walls render as joined panels without floor-covering skirts", () => {
  const polygons = [];
  const graphics = {
    fillStyle() {},
    fillRect() {},
    fillPoints(points) { polygons.push(points); },
  };
  const scene = { add: { graphics: () => graphics } };

  assert.equal(drawRoomWalls(scene, office), graphics);
  assert.ok(polygons.length > 0);

  for (const points of polygons) {
    for (const point of points) {
      const floorEdgeY = Math.abs(point.x) * WALL_SLOPE + FLOOR_NORTH_Y;

      assert.ok(point.y <= floorEdgeY);
    }
  }
});
