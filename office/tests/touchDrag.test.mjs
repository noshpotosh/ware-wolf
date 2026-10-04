import assert from "node:assert/strict";
import test from "node:test";
import {
  moveTouch, resizePointSquare,
} from "../tools/scene-catalogue/touchDrag.js";

const sceneSize = [200, 100];

test("object and point drags stay inside the scene", () => {
  const object = {
    kind: "object",
    bounds: [10, 20, 40, 30],
    mask: "mask.png",
  };
  assert.deepEqual(moveTouch(object, 500, -50, sceneSize).bounds,
    [160, 0, 40, 30]);

  const point = { kind: "point", position: [20, 30] };
  assert.deepEqual(moveTouch(point, -50, 500, sceneSize).position,
    [0, 100]);
});

test("surface drags preserve its shape at scene edges", () => {
  const surface = {
    kind: "surface",
    corners: [[10, 10], [40, 10], [40, 30], [10, 30]],
  };
  assert.deepEqual(moveTouch(surface, -20, 90, sceneSize).corners,
    [[0, 80], [30, 80], [30, 100], [0, 100]]);
});

test("surface corner handles move only their own corner", () => {
  const surface = {
    kind: "surface",
    corners: [[10, 10], [40, 10], [40, 30], [10, 30]],
  };
  assert.deepEqual(moveTouch(surface, 5, 7, sceneSize, 2).corners,
    [[10, 10], [40, 10], [45, 37], [10, 30]]);
});

test("LED corner handles resize a square within its limits", () => {
  const led = { kind: "point", position: [50, 50] };
  assert.equal(resizePointSquare(led, 8, 6, 6, sceneSize, 2), 14);
  assert.equal(resizePointSquare(led, 8, 20, 20, sceneSize, 0), 2);
  assert.equal(resizePointSquare(led, 60, 20, 20, sceneSize, 2), 64);

  const edgeLed = { kind: "point", position: [3, 50] };
  assert.equal(resizePointSquare(edgeLed, 4, 20, 20, sceneSize, 2), 6);
});
