const SCENE_KINDS = new Set(["room", "title"]);

function requireText(value, message) {
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(message);
  }
}

function requireDimensions(value, message) {
  const valid = Array.isArray(value)
    && value.length === 2
    && value.every(number => Number.isInteger(number) && number > 0);
  if (!valid) throw new Error(message);
}

export function validateSceneCatalog(catalog) {
  if (catalog?.version !== 1 || !Array.isArray(catalog.scenes)) {
    throw new Error("The scene catalogue must use version 1.");
  }

  const ids = new Set();
  for (const scene of catalog.scenes) {
    requireText(scene.id, "Every scene needs an ID.");
    requireText(scene.label, `Scene ${scene.id} needs a label.`);
    requireText(scene.image, `Scene ${scene.id} needs a painting.`);
    requireText(scene.definition, `Scene ${scene.id} needs a definition.`);
    requireText(scene.provenance, `Scene ${scene.id} needs provenance.`);
    requireDimensions(
      scene.dimensions,
      `Scene ${scene.id} needs positive integer dimensions.`
    );
    if (!SCENE_KINDS.has(scene.kind)) {
      throw new Error(`Scene ${scene.id} has an unknown kind.`);
    }
    if (!Array.isArray(scene.tags)
        || !scene.tags.every(tag => typeof tag === "string")) {
      throw new Error(`Scene ${scene.id} has invalid tags.`);
    }
    if (ids.has(scene.id)) throw new Error(`Duplicate scene ID: ${scene.id}`);
    ids.add(scene.id);
  }
  return catalog;
}

export function catalogScene(catalog, id) {
  return catalog.scenes.find(scene => scene.id === id);
}
