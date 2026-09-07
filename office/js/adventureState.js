const SAVE_KEY = "warewolf.adventure.v1";
const SAVE_VERSION = 1;
const KNOWN_ITEMS = new Set(["coffee"]);

export function loadAdventure(storage) {
  try {
    const saved = JSON.parse(storage.getItem(SAVE_KEY));
    if (saved?.version !== SAVE_VERSION || !Array.isArray(saved.items)) {
      return { items: [] };
    }
    const items = saved.items.filter(id => KNOWN_ITEMS.has(id));
    return { items: [...new Set(items)] };
  } catch {
    return { items: [] };
  }
}

export function saveAdventure(storage, state) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({
      version: SAVE_VERSION,
      items: state.items,
    }));
    return true;
  } catch {
    return false;
  }
}

export function setItemCollected(state, id, collected) {
  if (!KNOWN_ITEMS.has(id)) return state;
  const items = new Set(state.items);
  if (collected) items.add(id);
  else items.delete(id);
  return { ...state, items: [...items] };
}
