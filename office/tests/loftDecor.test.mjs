import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { FloorTexture, FurnitureKind } from "../js/constants.js";
import {
  floorTextureKey,
  isBackWallCell,
  isIslandCell,
  listBackWallCells,
  nameplateLabel,
} from "../js/loftDecor.js";

const starter = JSON.parse(
  await readFile(
    new URL("../data/starter-office.json", import.meta.url),
    "utf8"
  )
);
const founders = JSON.parse(
  await readFile(
    new URL("../data/founders-office.json", import.meta.url),
    "utf8"
  )
);

test("island sits inside the carpet, never on the wood border", () => {
  assert.equal(isIslandCell(starter, 0, 0), false);
  assert.equal(isIslandCell(starter, 1, 1), false);
  assert.equal(isIslandCell(starter, 2, 2), true);
  assert.equal(
    isIslandCell(starter, starter.gridWidth - 1, 3),
    false
  );
});

test("floor keys: wood border, carpet field, checker island", () => {
  assert.equal(floorTextureKey(starter, 0, 3), FloorTexture.WOOD);
  assert.equal(floorTextureKey(starter, 1, 3), FloorTexture.CARPET);
  assert.equal(floorTextureKey(starter, 2, 2), FloorTexture.ISLAND);
  assert.equal(floorTextureKey(starter, 3, 2), FloorTexture.CARPET);
});

test("nameplates use short mock labels", () => {
  const desk = starter.furniture.find(
    (piece) => piece.id === "desk-maeve"
  );
  assert.equal(nameplateLabel(desk, {}), "Maeve");

  const noshDesk = founders.furniture.find(
    (piece) => piece.isPlayerDesk
  );
  assert.equal(nameplateLabel(noshDesk, {}), "Nosh");
});

test("every desk in starter + founders is ready for a chair plate", () => {
  for (const office of [starter, founders]) {
    const desks = office.furniture.filter(
      (piece) => piece.kind === FurnitureKind.DESK
    );
    assert.ok(desks.length >= 1, office.id);

    for (const desk of desks) {
      assert.equal(typeof desk.gridX, "number");
      assert.equal(typeof desk.gridY, "number");
      const label = nameplateLabel(desk, {});
      assert.ok(label, `${desk.id} has a nameplate label`);
    }
  }
});


test("back walls hug far edges and skip door cells", () => {
  assert.equal(isBackWallCell(starter, 0, 0), true);
  assert.equal(isBackWallCell(starter, 3, 0), true);
  assert.equal(isBackWallCell(starter, 0, 3), false); // door gap
  assert.equal(isBackWallCell(starter, 4, 4), false);

  const cells = listBackWallCells(starter);
  assert.ok(cells.length > 0);
  assert.ok(cells.every((cell) => cell.gridX === 0 || cell.gridY === 0));
  assert.ok(
    cells.every(
      (cell) => !(cell.gridX === 0 && cell.gridY === 3)
    )
  );
});
