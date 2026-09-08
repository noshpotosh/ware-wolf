import { sprite } from "./desktopArt.js";
import { PEOPLE } from "./desktopPeople.js";
import {
  createCompanyProfile, FOUNDING_TEAM_SIZE,
} from "./companyProfile.js";

const DEFAULT_TEAM = new Set(["maeve", "fabrizio", "dex"]);
const FIT_LABELS = {
  maeve: "Product instinct",
  fabrizio: "Clear priorities",
  dex: "Reliable systems",
  cal: "Hard verification",
  reed: "Sharp communication",
};

const CREATION_ROLES = {
  maeve: "Product & Design",
  fabrizio: "Planning Lead",
  dex: "Engineering Lead",
  cal: "Quality Lead",
  reed: "Editing Lead",
};

function selectedEmployeeIds(form) {
  return [...form.querySelectorAll('[name="employeeIds"]:checked')]
    .map(input => input.value);
}

function profileFromForm(form) {
  const fields = new FormData(form);
  return createCompanyProfile({
    founderName: fields.get("founderName"),
    leadershipStyle: fields.get("leadershipStyle"),
    companyName: fields.get("companyName"),
    companyMotto: fields.get("companyMotto"),
    companyFocus: fields.get("companyFocus"),
    employeeIds: selectedEmployeeIds(form),
  });
}

function candidateCard(person) {
  const label = document.createElement("label");
  label.className = "candidate-card";
  const input = document.createElement("input");
  input.type = "checkbox";
  input.name = "employeeIds";
  input.value = person.id;
  input.checked = DEFAULT_TEAM.has(person.id);
  const copy = document.createElement("span");
  const role = document.createElement("strong");
  role.textContent = CREATION_ROLES[person.id] || person.role;
  const name = document.createElement("span");
  name.textContent = person.name;
  const fit = document.createElement("small");
  fit.textContent = FIT_LABELS[person.id];
  const paperclip = document.createElement("i");
  paperclip.className = "candidate-paperclip";
  paperclip.setAttribute("aria-hidden", "true");
  copy.append(role, name, fit);
  label.append(
    sprite(person.thumbnail || person.portrait),
    copy,
    input,
    paperclip,
  );
  return label;
}

export function createCompanyCreation({ onCancel, onComplete }) {
  const creator = document.getElementById("company-creator");
  const game = document.getElementById("game-shell");
  const form = document.getElementById("company-creator-form");
  const candidates = document.getElementById("candidate-list");
  const teamCount = document.getElementById("team-count");
  const summary = document.getElementById("company-summary");
  const signature = document.getElementById("founder-signature");
  const submit = form.querySelector('[type="submit"]');
  const employees = PEOPLE.filter(person => person.id !== "nosh");
  candidates.replaceChildren(...employees.map(candidateCard));

  function refresh() {
    const employeeCount = selectedEmployeeIds(form).length;
    const companyName = form.elements.companyName.value.trim();
    const hasRequiredNames = form.elements.founderName.value.trim()
      && companyName;
    const teamIsComplete = employeeCount === FOUNDING_TEAM_SIZE;
    signature.textContent = form.elements.founderName.value.trim() || "Founder";
    teamCount.textContent = `${employeeCount} / ${FOUNDING_TEAM_SIZE} hired`;
    teamCount.dataset.complete = String(teamIsComplete);
    submit.disabled = !(hasRequiredNames && teamIsComplete);
    summary.textContent = `${companyName || "Your company"}`
      + ` · ${employeeCount} founding hires`;
  }

  function resetTeam() {
    for (const input of form.elements.employeeIds) {
      input.checked = DEFAULT_TEAM.has(input.value);
    }
  }

  function show() {
    form.reset();
    resetTeam();
    game.inert = true;
    creator.hidden = false;
    document.title = "Office · New Company";
    refresh();
    requestAnimationFrame(() => {
      document.getElementById("founder-name-input").focus();
    });
  }

  candidates.addEventListener("change", event => {
    const employeeCount = selectedEmployeeIds(form).length;
    const exceedsTeamSize = event.target.checked
      && employeeCount > FOUNDING_TEAM_SIZE;
    if (exceedsTeamSize) {
      event.target.checked = false;
      teamCount.textContent = "Three seats only. Make one count.";
      return;
    }
    refresh();
  });
  form.addEventListener("input", refresh);
  form.addEventListener("submit", event => {
    event.preventDefault();
    const profile = profileFromForm(form);
    if (!profile) return;
    creator.hidden = true;
    game.inert = false;
    onComplete(profile);
  });
  document.getElementById("cancel-company-creation")
    .addEventListener("click", () => {
      creator.hidden = true;
      onCancel();
    });

  return { show };
}
