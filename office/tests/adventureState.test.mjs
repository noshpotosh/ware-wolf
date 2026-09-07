import assert from "node:assert/strict";
import test from "node:test";
import {
  loadAdventure, saveAdventure, setItemCollected,
} from "../js/adventureState.js";

function memoryStorage(initial = null) {
  let value = initial;
  return { getItem: () => value, setItem: (_key, saved) => { value = saved; } };
}

test("pickup persists, deduplicates, and returns after loading", () => {
  const storage = memoryStorage();
  let state = loadAdventure(storage);
  state = setItemCollected(state, "coffee", true);
  state = setItemCollected(state, "coffee", true);
  assert.deepEqual(state.items, ["coffee"]);
  assert.equal(saveAdventure(storage, state), true);
  assert.deepEqual(loadAdventure(storage).items, ["coffee"]);
  state = setItemCollected(loadAdventure(storage), "coffee", false);
  saveAdventure(storage, state);
  assert.deepEqual(loadAdventure(storage).items, []);
});

test("bad and unavailable saves recover without inventing inventory", () => {
  for (const value of ["broken", "null", '{}',
    '{"version":2,"items":["coffee"]}',
    '{"version":1,"items":"coffee"}']) {
    assert.deepEqual(loadAdventure(memoryStorage(value)).items, []);
  }
  const storage = memoryStorage(
    '{"version":1,"items":["coffee","coffee","unknown",null]}'
  );
  assert.deepEqual(loadAdventure(storage).items, ["coffee"]);
  assert.deepEqual(loadAdventure(null).items, []);
  assert.equal(saveAdventure(null, { items: ["coffee"] }), false);
  assert.deepEqual(setItemCollected({ items: [] }, "unknown", true).items, []);
});
