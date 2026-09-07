import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import test from "node:test";

const ROOT = new URL("../../", import.meta.url);
const catalog = JSON.parse(await readFile(
  new URL("office/art-source/style-reference.json", ROOT), "utf8",
));

test("approved art references retain their pinned bytes and dimensions",
  async () => {
    assert.ok(Number.isInteger(catalog.version) && catalog.version > 0);
    assert.equal(catalog.pathBase, "repository root");
    assert.ok(catalog.references.length > 0);
    const ids = new Set();
    for (const reference of catalog.references) {
      assert.ok(!ids.has(reference.id), `Duplicate reference: ${reference.id}`);
      ids.add(reference.id);
      assert.ok(reference.scope, `Missing scope: ${reference.id}`);
      const url = new URL(reference.path, ROOT);
      assert.ok(url.href.startsWith(ROOT.href));
      const png = await readFile(url);
      assert.equal(png.subarray(0, 8).toString("hex"), "89504e470d0a1a0a");
      assert.equal(createHash("sha256").update(png).digest("hex"),
        reference.sha256, `Approved reference changed: ${reference.path}`);
      assert.deepEqual([png.readUInt32BE(16), png.readUInt32BE(20)],
        reference.size, `Reference dimensions changed: ${reference.path}`);
    }
  });
