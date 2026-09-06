export async function loadJson(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Failed to load ${url}: ${response.status}`);
  }

  return response.json();
}

export function staffById(staffList) {
  const byId = {};

  for (const person of staffList) {
    byId[person.id] = person;
  }

  return byId;
}

export async function loadOfficeBundle() {
  const [
    starter,
    pack,
    founders,
    rooms,
    staff,
    goals,
    upgrades,
    offices,
    agentPersonas,
  ] = await Promise.all([
    loadJson("./data/starter-office.json"),
    loadJson("./data/pack-office.json"),
    loadJson("./data/founders-office.json"),
    loadJson("./data/rooms.json"),
    loadJson("./data/staff.json"),
    loadJson("./data/goals.json"),
    loadJson("./data/upgrades.json"),
    loadJson("./data/offices.json"),
    loadJson("./data/agent-personas.json"),
  ]);

  const layouts = {
    [starter.id]: starter,
    [pack.id]: pack,
    [founders.id]: founders,
  };

  return {
    layouts,
    office: starter,
    rooms,
    staff,
    goals,
    upgrades,
    offices,
    agentPersonas,
  };
}

// Back-compat alias used by earlier phases.
export async function loadStarterOfficeBundle() {
  const bundle = await loadOfficeBundle();

  return {
    office: bundle.office,
    rooms: bundle.rooms,
    staff: bundle.staff,
    goals: bundle.goals,
    upgrades: bundle.upgrades,
    agentPersonas: bundle.agentPersonas,
    offices: bundle.offices,
    layouts: bundle.layouts,
  };
}
