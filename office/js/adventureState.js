const SAVE_KEY = "warewolf.adventure.v1";
const SAVE_VERSION = 1;
const STARTING_ROOM_ID = "founders-office";
const KNOWN_ITEMS = new Set(["coffee"]);
const KNOWN_ROOMS = new Set([STARTING_ROOM_ID, "house-kitchen"]);

function readAdventure(storage) {
  try {
    const saved = JSON.parse(storage.getItem(SAVE_KEY));
    if (saved?.version !== SAVE_VERSION || !Array.isArray(saved.items)) {
      return null;
    }
    return saved;
  } catch {
    return null;
  }
}

export function hasSavedAdventure(storage) {
  return readAdventure(storage) !== null;
}

export function loadAdventure(storage) {
  const saved = readAdventure(storage);
  if (!saved) {
    return { items: [], roomId: STARTING_ROOM_ID };
  }
  const items = saved.items.filter(id => KNOWN_ITEMS.has(id));
  const roomId = KNOWN_ROOMS.has(saved.roomId)
    ? saved.roomId : STARTING_ROOM_ID;
  const state = { items: [...new Set(items)], roomId };
  if (saved.company && typeof saved.company === "object") {
    state.company = saved.company;
  }
  return state;
}

export function saveAdventure(storage, state) {
  try {
    storage.setItem(SAVE_KEY, JSON.stringify({
      version: SAVE_VERSION,
      items: state.items,
      roomId: state.roomId,
      company: state.company,
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
