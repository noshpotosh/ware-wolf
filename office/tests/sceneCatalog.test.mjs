import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import {
  catalogScene, validateSceneCatalog,
} from "../tools/scene-catalogue/sceneCatalog.js";

const catalog = JSON.parse(await readFile(
  new URL("../data/scene-catalog.json", import.meta.url)
));

test("scene catalogue accepts only whole-scene records", () => {
  assert.equal(validateSceneCatalog(catalog), catalog);
  assert.equal(catalogScene(catalog, "house-kitchen").kind, "room");
  assert.ok(catalog.scenes.every(scene => scene.image && scene.definition));
  assert.ok(catalog.scenes.every(scene => scene.furniture === undefined));
  assert.ok(catalog.scenes.every(scene => scene.layers === undefined));
});

test("scene catalogue rejects duplicates and invalid dimensions", () => {
  const duplicate = structuredClone(catalog);
  duplicate.scenes.push(structuredClone(duplicate.scenes[0]));
  assert.throws(() => validateSceneCatalog(duplicate), /Duplicate scene ID/);

  const invalid = structuredClone(catalog);
  invalid.scenes[0].dimensions = [0, 941];
  assert.throws(() => validateSceneCatalog(invalid), /dimensions/);
});
