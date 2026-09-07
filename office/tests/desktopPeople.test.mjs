import test from "node:test";
import assert from "node:assert/strict";
import { PEOPLE, findPeople } from "../js/desktopPeople.js";

test("directory search combines case-insensitive names, roles, and favorites", () => {
  assert.deepEqual(findPeople(" DEX ").map(p => p.id), ["dex"]);
  assert.deepEqual(findPeople("design").map(p => p.id), ["maeve"]);
  assert.deepEqual(findPeople("", new Set(["maeve"])).map(p => p.id), ["maeve"]);
  assert.deepEqual(findPeople("dex", new Set(["maeve"])), []);
  assert.deepEqual(findPeople("", new Set()), []);
  assert.equal(findPeople("").length, PEOPLE.length);
});

test("every profile has a unique ID and portrait inside approved artwork", () => {
  assert.equal(new Set(PEOPLE.map(p => p.id)).size, PEOPLE.length);
  for (const person of PEOPLE) {
    const [x, y, width, height] = person.portrait;
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0);
    assert.ok(x + width <= 1672 && y + height <= 941);
  }
});

test("desktop sprite source retains approved image bytes", async () => {
  const { readFile } = await import("node:fs/promises");
  const { createHash } = await import("node:crypto");
  const root = new URL("../", import.meta.url);
  const provenance = JSON.parse(await readFile(
    new URL("art-source/desktop-ui.json", root), "utf8"
  ));
  const png = await readFile(new URL(provenance.runtime, root));
  assert.equal(createHash("sha256").update(png).digest("hex"), provenance.sha256);
  assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)], provenance.size);
});
