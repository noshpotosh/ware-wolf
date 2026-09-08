import assert from "node:assert/strict";
import test from "node:test";
import {
  cssMatrix3d, fitScene, projectPoint, surfaceHomography,
} from "../js/sceneGeometry.js";
import { validateSceneAnnotations } from "../js/sceneAnnotations.js";

const closeTo = (actual, expected) => {
  assert.ok(Math.abs(actual - expected) < 1e-6);
};

function assertSurfaceMapsToCorners(width, height, corners) {
  const homography = surfaceHomography(width, height, corners);
  const sources = [[0, 0], [width, 0], [width, height], [0, height]];
  sources.forEach(([x, y], index) => {
    const projected = projectPoint(homography, x, y);
    closeTo(projected[0], corners[index][0]);
    closeTo(projected[1], corners[index][1]);
  });
}

test("contain and cover use one centered scene transform", () => {
  assert.deepEqual(fitScene(100, 50, 200, 200), {
    scale: 2, x: 0, y: 50, width: 200, height: 100,
  });
  assert.deepEqual(fitScene(100, 50, 200, 200, "cover"), {
    scale: 4, x: -100, y: 0, width: 400, height: 200,
  });
  assert.deepEqual(fitScene(100, 200, 400, 100), {
    scale: .5, x: 175, y: 0, width: 50, height: 100,
  });
});

test("homography maps rectangles, parallelograms, and trapezoids", () => {
  assertSurfaceMapsToCorners(100, 100, [
    [10, 20], [110, 20], [110, 120], [10, 120],
  ]);
  assertSurfaceMapsToCorners(100, 100, [
    [20, 30], [120, 10], [140, 110], [40, 130],
  ]);
  assertSurfaceMapsToCorners(100, 100, [
    [20, 20], [130, 30], [110, 120], [35, 115],
  ]);
});

test("homography rejects degenerate surfaces", () => {
  assert.throws(() => surfaceHomography(100, 100, [
    [0, 0], [10, 0], [20, 0], [30, 0],
  ]), /degenerate/);
});

test("homographies serialize into a CSS matrix3d", () => {
  const homography = surfaceHomography(100, 100, [
    [10, 20], [110, 20], [110, 120], [10, 120],
  ]);
  const values = cssMatrix3d(homography).split(",").map(Number);
  assert.equal(values.length, 16);
  assert.equal(values[12], 10);
  assert.equal(values[13], 20);
});

test("scene annotations reject crossed corners and unknown references", () => {
  const scene = {
    width: 100,
    height: 100,
    annotations: {
      screen: {
        kind: "surface",
        corners: [[10, 10], [90, 10], [10, 90], [90, 90]],
        designSize: [100, 100],
      },
    },
  };
  assert.throws(
    () => validateSceneAnnotations(scene),
    /clockwise TL, TR, BR, BL/
  );
  scene.annotations = {
    prop: {
      kind: "object",
      mask: "prop.png",
      bounds: [0, 0, 10, 10],
    },
  };
  assert.throws(
    () => validateSceneAnnotations(scene, [{
      id: "door", annotation: "missing",
    }]),
    /needs an object annotation/
  );
  assert.throws(
    () => validateSceneAnnotations(scene, [], [{
      id: "missing",
      kind: "surface",
      owner: "CRT effect",
    }]),
    /CRT effect needs a surface annotation/
  );
});
