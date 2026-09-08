import assert from "node:assert/strict";
import test from "node:test";
import {
  hasSavedAdventure, loadAdventure, saveAdventure, setItemCollected,
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

test("continue is available only for a valid saved adventure", () => {
  assert.equal(hasSavedAdventure(memoryStorage()), false);
  assert.equal(hasSavedAdventure(memoryStorage("broken")), false);
  assert.equal(hasSavedAdventure(memoryStorage(
    '{"version":1,"items":[]}'
  )), true);
  assert.equal(hasSavedAdventure(null), false);
});

test("company setup persists with the room and inventory", () => {
  const storage = memoryStorage();
  const company = {
    founderName: "Nosh",
    companyName: "Warewolf",
    employeeIds: ["maeve", "fabrizio", "dex"],
  };
  saveAdventure(storage, {
    items: ["coffee"], roomId: "house-kitchen", company,
  });
  assert.deepEqual(loadAdventure(storage), {
    items: ["coffee"], roomId: "house-kitchen", company,
  });
});

test("current room persists and unknown rooms return to the bedroom", () => {
  const kitchen = memoryStorage(
    '{"version":1,"items":[],"roomId":"house-kitchen"}'
  );
  assert.equal(loadAdventure(kitchen).roomId, "house-kitchen");

  const unknown = memoryStorage(
    '{"version":1,"items":[],"roomId":"attic"}'
  );
  assert.equal(loadAdventure(unknown).roomId, "founders-office");
  assert.equal(loadAdventure(memoryStorage()).roomId, "founders-office");
});
