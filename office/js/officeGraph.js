const MAP_KEYS = ["x", "y", "width", "height"];

export function validateOfficeGraph(graph) {
  if (graph?.version !== 1 || !Array.isArray(graph.rooms)) {
    throw new Error("Office map needs a version-one room list.");
  }

  const roomIds = new Set();
  for (const room of graph.rooms) {
    if (!room.id || roomIds.has(room.id) || !room.definition) {
      throw new Error(`Invalid or duplicate office room: ${room.id}`);
    }
    roomIds.add(room.id);
    if (!room.label?.trim() || !room.layout?.outline) {
      throw new Error(`Office room needs a label and outline: ${room.id}`);
    }
    if (!MAP_KEYS.every(key => Number.isFinite(room.layout[key]))) {
      throw new Error(`Office room has invalid layout values: ${room.id}`);
    }
    const { x, y, width, height } = room.layout;
    if (x < 0 || y < 0 || width <= 0 || height <= 0
        || x + width > 100 || y + height > 100) {
      throw new Error(`Office room is outside the map: ${room.id}`);
    }
  }

  for (const connection of graph.connections ?? []) {
    if (!roomIds.has(connection.from?.room)
        || !roomIds.has(connection.to?.room)
        || !connection.from.hotspot
        || !connection.to.hotspot) {
      throw new Error("Office connection references an unknown endpoint.");
    }
  }
  return graph;
}
