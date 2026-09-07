import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const OFFICE_ROOT = new URL("../", import.meta.url);
const PNG_SIGNATURE = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
const PNG_WIDTH_OFFSET = 16;
const PNG_HEIGHT_OFFSET = 20;
const PROVENANCE_PATHS = [
  "art-source/founders-office-background.json",
  "art-source/founders-office-empty-desk.json",
];
const read = (path) => readFile(new URL(path, OFFICE_ROOT));
const readJson = async (path) => JSON.parse(await read(path));
const hash = (bytes) => createHash("sha256").update(bytes).digest("hex");

for (const path of PROVENANCE_PATHS) {
  test(`${path} preserves accepted source and runtime bytes`, async () => {
    const provenance = await readJson(path);
    const png = await read(provenance.runtime);
    assert.deepEqual(png.subarray(0, PNG_SIGNATURE.length), PNG_SIGNATURE);
    assert.equal(hash(png), provenance.runtimeSha256);
    assert.equal(hash(await read(provenance.source)), provenance.sourceSha256);
    assert.deepEqual([
      png.readUInt32BE(PNG_WIDTH_OFFSET),
      png.readUInt32BE(PNG_HEIGHT_OFFSET),
    ], provenance.size);
  });
}

test("pickup patches use a verified matching room state", async () => {
  const room = await readJson("data/founders-office-adventure.json");
  const states = await Promise.all(PROVENANCE_PATHS.map(readJson));
  const ids = new Set();
  for (const pickup of room.pickups) {
    assert.ok(!ids.has(pickup.id), "duplicate pickup ID");
    ids.add(pickup.id);
    assert.ok(room.hotspots.some(({ id }) => id === pickup.id));
    const state = states.find(({ runtime }) => runtime === pickup.emptyImage);
    assert.ok(state, "pickup image has no verified provenance");
    assert.equal(state.source, room.background);
    assert.deepEqual(state.size, [room.width, room.height]);
    const { x, y, width, height } = pickup.patch;
    assert.ok([x, y, width, height].every(Number.isFinite));
    assert.ok(x >= 0 && y >= 0 && width > 0 && height > 0);
    assert.ok(x + width <= room.width && y + height <= room.height);
  }
});

test("painted entry dependencies exist without the retired raster kit",
  async () => {
    const visited = new Set();
    await checkLocalReferences(new URL("index.html", OFFICE_ROOT), visited);
    assert.ok([...visited].every((url) => !url.includes("node_modules/")));
    for (const file of await readdir(new URL("js/", OFFICE_ROOT))) {
      const module = new URL(`js/${file}`, OFFICE_ROOT);
      assert.ok(visited.has(module.href), `Unused runtime module: ${file}`);
    }
  });

async function checkLocalReferences(url, visited) {
  if (visited.has(url.href)) return;
  assert.ok(url.href.startsWith(OFFICE_ROOT.href));
  visited.add(url.href);
  const source = await readFile(url, "utf8");
  const patterns = url.pathname.endsWith(".html")
    ? [/(?:src|href)="([^"#]+)"/g]
    : url.pathname.endsWith(".css")
      ? [/url\(["']?([^"')]+)["']?\)/g]
      : [/\bfrom\s+["']([^"']+)["']/g];
  for (const pattern of patterns) {
    for (const [, path] of source.matchAll(pattern)) {
      if (/^(?:https?:|data:|#)/.test(path)) continue;
      const dependency = new URL(path, url);
      await readFile(dependency);
      if (/\.(?:html|css|js)$/.test(dependency.pathname)) {
        await checkLocalReferences(dependency, visited);
      }
    }
  }
}
