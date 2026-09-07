import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const OFFICE_ROOT = new URL("../", import.meta.url);
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const read = (path) => readFile(new URL(path, OFFICE_ROOT));
const room = JSON.parse(await read("data/founders-office-adventure.json"));
const source = JSON.parse(
  await read("art-source/founders-office-background.json")
);
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

// A resized replacement can look plausible while every hotspot drifts.
test("accepted background keeps its dimensions and bytes", async () => {
  const png = await read(room.background);
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(PNG_WIDTH_OFFSET), room.width);
  assert.equal(png.readUInt32BE(PNG_HEIGHT_OFFSET), room.height);
  assert.equal(hash(png), source.runtimeSha256);
  assert.equal(hash(await read(source.source)), source.sourceSha256);
  assert.notEqual(room.background, source.source);
});

test("hit polygons have unique action IDs and stay inside the image", () => {
  const ids = room.hotspots.map((hotspot) => hotspot.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(ids.includes("computer"));
  for (const hotspot of room.hotspots) {
    assert.ok(hotspot.label.trim());
    assert.ok(hotspot.description.trim());
    assert.ok(hotspot.points.length >= 3);
    for (const [x, y] of hotspot.points) {
      assert.ok(Number.isFinite(x) && Number.isFinite(y));
      assert.ok(x >= 0 && x <= room.width);
      assert.ok(y >= 0 && y <= room.height);
    }
  }
});


test("outline paths are separate and preserve the mug handle opening", () => {
  for (const hotspot of room.hotspots) {
    assert.equal(typeof hotspot.outline, "string");
    assert.match(hotspot.outline, /^M/);
    assert.match(hotspot.outline, /Z$/);
    assert.ok(Array.isArray(hotspot.points));
  }
  const mug = room.hotspots.find(({ id }) => id === "coffee");
  const closedContours = mug.outline.match(/M[^M]+Z/g);
  assert.equal(closedContours.length, 2, "mug needs outer and handle paths");
});
