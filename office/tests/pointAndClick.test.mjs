import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const OFFICE_ROOT = new URL("../", import.meta.url);
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const read = (path) => readFile(new URL(path, OFFICE_ROOT));
const bedroom = JSON.parse(
  await read("data/founders-office-adventure.json")
);
const kitchen = JSON.parse(
  await read("data/house-kitchen-adventure.json")
);
const rooms = [bedroom, kitchen];
const officeGraph = JSON.parse(await read("data/office-map.json"));
const room = bedroom;
const source = JSON.parse(await read(room.provenance));
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

test("room hit polygons have unique IDs and stay inside each image", () => {
  for (const roomDefinition of rooms) {
    const ids = roomDefinition.hotspots.map((hotspot) => hotspot.id);
    assert.equal(new Set(ids).size, ids.length);
    for (const hotspot of roomDefinition.hotspots) {
      assert.ok(hotspot.label.trim());
      assert.ok(hotspot.description.trim());
      assert.ok(hotspot.points.length >= 3);
      for (const [x, y] of hotspot.points) {
        assert.ok(Number.isFinite(x) && Number.isFinite(y));
        assert.ok(x >= 0 && x <= roomDefinition.width);
        assert.ok(y >= 0 && y <= roomDefinition.height);
      }
    }
  }
  assert.ok(bedroom.hotspots.some(({ id }) => id === "computer"));
});

test("room silhouettes retain detailed traces on both exterior edges", () => {
  const exteriorSides = 2;
  for (const roomDefinition of rooms) {
    assert.match(roomDefinition.silhouette, /^M/);
    assert.match(roomDefinition.silhouette, /Z$/);
    const edgeCommands = roomDefinition.silhouette.match(/L/g) ?? [];
    assert.ok(edgeCommands.length > roomDefinition.height * exteriorSides);
  }
});

test("bedroom keeps its objects and navigates to the kitchen", () => {
  const door = room.hotspots.find(item => item.id === "door");
  assert.equal(door.action, "navigate");
  assert.equal(door.targetRoom, kitchen.id);
  assert.ok(kitchen.hotspots.some(item => item.id === door.targetHotspot));
  assert.ok(!room.hotspots.some(item => item.id === "bed"));
  assert.ok(!room.hotspots.some(item => item.id === "water-cooler"));
  assert.equal(room.effects.water, undefined);
  for (const pickup of room.pickups) {
    const [x, y, width, height] = pickup.iconViewBox;
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0);
    assert.ok(x + width <= room.width && y + height <= room.height);
    const object = room.hotspots.find(item => item.id === pickup.id);
    for (const [px, py] of object.points) {
      assert.ok(px >= x && px <= x + width);
      assert.ok(py >= y && py <= y + height);
    }
  }
});

test("kitchen returns to the bedroom and prepares one future exit", () => {
  const returnDoor = kitchen.hotspots.find(
    item => item.id === "bedroom-door"
  );
  assert.equal(returnDoor.action, "navigate");
  assert.equal(returnDoor.targetRoom, bedroom.id);
  assert.ok(bedroom.hotspots.some(
    item => item.id === returnDoor.targetHotspot
  ));

  const futureDoor = kitchen.hotspots.find(item => item.id === "future-door");
  assert.equal(futureDoor.action, undefined);
  assert.deepEqual(kitchen.pickups, []);
  for (const id of ["shared-worktable", "counter-workspace", "kettle"]) {
    assert.ok(kitchen.hotspots.some(hotspot => hotspot.id === id));
  }
});

test("office map includes every playable room", () => {
  const roomIds = new Set(rooms.map(roomDefinition => roomDefinition.id));

  for (const roomNode of officeGraph.rooms) {
    assert.ok(roomIds.has(roomNode.id));
    assert.ok(roomNode.label.trim());
    assert.match(roomNode.layout.outline, /^M/);
    assert.match(roomNode.layout.outline, /Z$/);
    assert.doesNotMatch(roomNode.layout.outline, /[ACQ]/);
    for (const key of ["x", "y", "width", "height"]) {
      assert.ok(Number.isFinite(roomNode.layout[key]));
    }
    assert.ok(roomNode.layout.x >= 0);
    assert.ok(roomNode.layout.y >= 0);
    assert.ok(roomNode.layout.x + roomNode.layout.width <= 100);
    assert.ok(roomNode.layout.y + roomNode.layout.height <= 100);

    const roomDefinition = rooms.find(room => room.id === roomNode.id);
    for (const hotspot of roomDefinition.hotspots) {
      if (hotspot.action !== "navigate") continue;
      assert.ok(roomIds.has(hotspot.targetRoom));
    }
  }
});

test("kitchen background keeps its approved dimensions and bytes", async () => {
  const provenance = JSON.parse(await read(kitchen.provenance));
  const png = await read(kitchen.background);
  assert.equal(png.subarray(1, 4).toString(), "PNG");
  assert.equal(png.readUInt32BE(PNG_WIDTH_OFFSET), kitchen.width);
  assert.equal(png.readUInt32BE(PNG_HEIGHT_OFFSET), kitchen.height);
  assert.equal(hash(png), provenance.runtimeSha256);
  assert.equal(hash(await read(provenance.source)), provenance.sourceSha256);
});


test("hotspots use separate object annotations for exact highlights",
  async () => {
  for (const roomDefinition of rooms) {
    for (const hotspot of roomDefinition.hotspots) {
      assert.equal(hotspot.outline, undefined);
      const annotation = roomDefinition.annotations[hotspot.annotation];
      assert.equal(annotation.kind, "object");
      const [x, y, width, height] = annotation.bounds;
      assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0);
      assert.ok(x + width <= roomDefinition.width);
      assert.ok(y + height <= roomDefinition.height);
      const png = await read(annotation.mask);
      assert.equal(png.readUInt32BE(PNG_WIDTH_OFFSET), width);
      assert.equal(png.readUInt32BE(PNG_HEIGHT_OFFSET), height);
    }
  }
});

test("effects reference typed scene annotations", () => {
  const screenBinding = room.effectBindings.find(
    binding => binding.preset === "crt"
  );
  const steamBinding = room.effectBindings.find(
    binding => binding.preset === "steam"
  );
  const screen = room.annotations[screenBinding.annotation];
  const steam = room.annotations[steamBinding.annotation];
  assert.equal(screen.kind, "surface");
  assert.equal(screen.corners.length, 4);
  assert.equal(screen.designSize.length, 2);
  assert.equal(steam.kind, "point");
  assert.equal(steam.position.length, 2);
  assert.equal(steamBinding.parameters.pickupId, "coffee");
});

test("bedroom door transition has one consistent six-frame canvas",
  async () => {
  const door = room.hotspots.find(({ id }) => id === "door");
  const transition = room.transitions[door.transition];
  assert.equal(transition.frames.count, 6);
  assert.equal(transition.frames.object, door.annotation);
  assert.equal(room.annotations[transition.patch].kind, "object");
  const [width, height] = transition.frames.size;
  for (let index = 1; index <= transition.frames.count; index += 1) {
    const png = await read(
      `${transition.frames.directory}/frame-${index}.png`
    );
    assert.equal(png.readUInt32BE(PNG_WIDTH_OFFSET), width);
    assert.equal(png.readUInt32BE(PNG_HEIGHT_OFFSET), height);
  }
});
