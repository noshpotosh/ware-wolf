import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { validateOfficeGraph } from "../js/officeGraph.js";

const OFFICE_ROOT = new URL("../", import.meta.url);
const graph = JSON.parse(await readFile(
  new URL("data/office-map.json", OFFICE_ROOT)
));

test("office graph owns room definitions and reciprocal doors", async () => {
  assert.equal(validateOfficeGraph(graph), graph);
  const definitions = new Map();
  for (const node of graph.rooms) {
    const room = JSON.parse(await readFile(
      new URL(node.definition, OFFICE_ROOT)
    ));
    definitions.set(node.id, room);
    assert.equal(room.id, node.id);
  }

  for (const connection of graph.connections) {
    const from = definitions.get(connection.from.room);
    const to = definitions.get(connection.to.room);
    const exit = from.hotspots.find(
      hotspot => hotspot.id === connection.from.hotspot
    );
    const entrance = to.hotspots.find(
      hotspot => hotspot.id === connection.to.hotspot
    );
    assert.equal(exit.targetRoom, to.id);
    assert.equal(exit.targetHotspot, entrance.id);
  }
});

test("office graph rejects overlapping IDs and off-map rooms", () => {
  const duplicate = structuredClone(graph);
  duplicate.rooms.push(structuredClone(duplicate.rooms[0]));
  assert.throws(() => validateOfficeGraph(duplicate), /duplicate/);

  const outside = structuredClone(graph);
  outside.rooms[0].layout.x = 99;
  assert.throws(() => validateOfficeGraph(outside), /outside/);
});
