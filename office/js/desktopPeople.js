export const PEOPLE = [
  { id: "nosh", name: "Nosh", role: "Founder", portrait: [654, 162, 59, 65],
    about: "A quiet room. A whole company ahead." },
  { id: "fabrizio", name: "Fabrizio Cortell", role: "Planning and coordination",
    portrait: [654, 248, 59, 65],
    about: "Clear priorities. Honest conversations." },
  { id: "maeve", name: "Maeve Quinn", role: "Product and design",
    portrait: [935, 176, 217, 232], thumbnail: [654, 333, 59, 65],
    about: "Clear ideas. Thoughtful design.\nGood coffee." },
  { id: "dex", name: "Dex Harlan", role: "Engineering",
    portrait: [654, 423, 59, 65], about: "Simple solutions, carefully built." },
  { id: "cal", name: "Cal Rook", role: "Quality and verification",
    portrait: [654, 510, 59, 65], about: "A second look at the details." },
  { id: "reed", name: "Reed Mallory", role: "Editing and clarity",
    portrait: [654, 600, 59, 65], about: "Every word has a job." },
];

export function findPeople(query, favorites = null) {
  const term = query.trim().toLowerCase();
  return PEOPLE.filter(person => {
    const searchable = `${person.name} ${person.role}`.toLowerCase();
    const matches = searchable.includes(term);
    return matches && (!favorites || favorites.has(person.id));
  });
}
