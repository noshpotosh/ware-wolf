import assert from "node:assert/strict";
import test from "node:test";
import { describeTime } from "../js/worldClock.js";
import { loadAdventure } from "../js/adventureState.js";

test("clock displays the supplied local wall-clock time", () => {
  const now = new Date(2026, 8, 7, 14, 32);
  const time = describeTime(now);
  assert.equal(time.clock, now.toLocaleTimeString([], {
    hour: "2-digit", minute: "2-digit", hour12: false,
  }));
  assert.equal(time.mood, "Focused");
});

test("old simulated clock saves keep inventory but discard game time", () => {
  const storage = { getItem: () => JSON.stringify({ version: 1,
    items: ["coffee"], minute: 800, clockPaused: true }) };
  assert.deepEqual(loadAdventure(storage), { items: ["coffee"] });
});
