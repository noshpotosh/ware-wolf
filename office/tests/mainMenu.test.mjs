import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const OFFICE_ROOT = new URL("../", import.meta.url);
const read = (path) => readFile(new URL(path, OFFICE_ROOT), "utf8");

test("title art and effects share one image coordinate space", async () => {
  const html = await read("index.html");
  const scene = JSON.parse(await read("data/main-menu-scene.json"));
  const effects = await read("js/sceneEffects.js");
  const effectStart = html.indexOf('<svg class="main-menu-effects"');
  const effectEnd = html.indexOf("</svg>", effectStart);
  const effectMarkup = html.slice(effectStart, effectEnd);

  assert.ok(effectStart >= 0);
  assert.match(effectMarkup, /viewBox="0 0 1672 941"/);
  assert.match(effectMarkup, /class="main-menu-art"/);
  assert.match(effectMarkup, /main-menu-command-table\.png/);
  assert.doesNotMatch(effectMarkup, /title-server-lights/);
  assert.equal(scene.fit, "cover");
  assert.equal(scene.width, 1672);
  assert.equal(scene.height, 941);
  const crt = scene.effectBindings.find(binding => binding.preset === "crt");
  const screen = scene.annotations[crt.annotation];
  assert.equal(crt.kind, "surface");
  assert.equal(screen.kind, "surface");
  assert.match(effects, /crt-surface-scan/);
  const leds = scene.effectBindings.filter(binding => binding.preset === "led");
  assert.equal(leds.length, 6);
  assert.ok(leds.every(binding => (
    binding.kind === "point"
      && scene.annotations[binding.annotation]?.kind === "point"
  )));
  assert.deepEqual(
    new Set(leds.map(binding => binding.parameters.color)),
    new Set(["green", "amber"])
  );
  assert.match(effects, /anchored-led/);
});

test("title animations have reduced-motion controls", async () => {
  const css = await read("css/mainMenu.css");
  const annotationCss = await read("css/sceneAnnotations.css");

  assert.match(css, /prefers-reduced-motion: reduce/);
  assert.match(css, /main-menu\[data-paused="true"\]/);
  assert.match(css, /opacity: \.08/);
  assert.match(annotationCss, /body\.reduce-motion \.crt-surface-effect/);
  assert.match(annotationCss, /main-menu\[data-paused="true"\]/);
  assert.match(annotationCss, /anchored-led-blink/);
  assert.match(annotationCss, /box-shadow/);
  assert.match(annotationCss, /border-radius: 1px/);
});
