import assert from "node:assert/strict";
import test from "node:test";
import {
  createAudioBus,
  isAudioMuted,
  setAudioMuted,
  toggleAudioMuted,
} from "../js/audio.js";

test("audio bus mute is one shared boolean with persistence key", () => {
  const audio = createAudioBus();
  const first = isAudioMuted(audio);

  toggleAudioMuted(audio);
  assert.equal(isAudioMuted(audio), !first);

  setAudioMuted(audio, false);
  assert.equal(isAudioMuted(audio), false);

  setAudioMuted(audio, true);
  assert.equal(isAudioMuted(audio), true);
});
