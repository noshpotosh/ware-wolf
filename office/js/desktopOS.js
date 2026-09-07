import { PEOPLE, findPeople } from "./desktopPeople.js";
import { describeTime } from "./worldClock.js";

import { sprite } from "./desktopArt.js";
const APPS = { mail: "Mail", teams: "Teams", directory: "Employee Directory",
  documents: "Documents" };
const MAX_DRAFT_LENGTH = 5000;
const DRAFT_KEY = "warewolf.desktop.drafts.v1";

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function button(label, action, className = "") {
  const node = element("button", className, label);
  node.type = "button";
  node.addEventListener("click", action);
  return node;
}

function readDrafts() {
  try {
    const saved = JSON.parse(localStorage.getItem(DRAFT_KEY));
    const drafts = {};
    for (const key of ["mail", ...PEOPLE.map(person => person.id)]) {
      if (typeof saved?.[key] === "string") {
        drafts[key] = saved[key].slice(0, MAX_DRAFT_LENGTH);
      }
    }
    return drafts;
  } catch { return {}; }
}

export function createDesktop(onVisibilityChange) {
  const desktop = element("dialog", "desktop-os");
  desktop.setAttribute("aria-label", "Computer desktop");
  const canvas = element("div", "desktop-canvas");
  const resize = new ResizeObserver(() => {
    const scale = Math.min(desktop.clientWidth / 1672,
      desktop.clientHeight / 941);
    canvas.style.transform = `translate(-50%, -50%) scale(${scale})`;
  });
  resize.observe(desktop);
  const shortcuts = element("nav", "desktop-shortcuts");
  shortcuts.setAttribute("aria-label", "Desktop applications");
  const window = element("section", "desktop-window");
  window.setAttribute("aria-label", "Application window");
  const taskbar = element("nav", "desktop-taskbar");
  taskbar.setAttribute("aria-label", "Open applications and desktop controls");
  const status = element("p", "desktop-status");
  status.setAttribute("role", "status");
  const drafts = readDrafts();
  const favorites = new Set();
  let active = "mail";
  let selected = PEOPLE[2];
  let clockTimer;
  let opener;

  function saveDraft(key, value) {
    drafts[key] = value;
    try {
      localStorage.setItem(DRAFT_KEY, JSON.stringify(drafts));
      status.textContent = "Draft saved on this computer. Nothing was sent.";
    } catch {
      status.textContent =
        "Draft kept for this visit; browser storage unavailable.";
    }
  }

  function openApp(id) {
    active = id;
    window.dataset.app = id;
    canvas.dataset.app = id;
    window.hidden = false;
    status.textContent = "";
    renderWindow();
    renderTaskbar();
    window.querySelector("h2").focus();
  }

  function closeWindow() {
    window.hidden = true;
    renderTaskbar();
    shortcuts.querySelector(`[data-app="${active}"]`).focus();
  }

  function renderWindow() {
    const header = element("header", "desktop-titlebar");
    const title = element("h2", "", APPS[active]);
    title.tabIndex = -1;
    const titleIcon = active === "directory"
      ? "title-directory" : active;
    header.append(sprite(titleIcon), title);
    const minimize = button("", closeWindow, "window-minimize");
    minimize.setAttribute("aria-label", "Minimize application");
    const maximize = button("", () => {
      const expanded = window.classList.toggle("expanded");
      maximize.setAttribute("aria-pressed", String(expanded));
    });
    maximize.className = "window-maximize";
    maximize.setAttribute("aria-label", "Expand application");
    const expanded = window.classList.contains("expanded");
    maximize.setAttribute("aria-pressed", String(expanded));
    const close = button("", closeWindow, "window-close");
    close.setAttribute("aria-label", "Close application");
    header.append(minimize, maximize, close);
    const body = element("div", "desktop-window-body");
    window.replaceChildren(header, body);
    if (active === "directory") renderDirectory(body);
    if (active === "mail") renderMail(body);
    if (active === "teams") renderTeams(body);
    if (active === "documents") {
      body.append(element("div", "desktop-empty",
        "Your documents folder is empty."));
    }
  }

  function renderMail(body) {
    const sidebar = element("nav", "desktop-sidebar");
    sidebar.setAttribute("aria-label", "Mail folders");
    const content = element("article", "desktop-content mail-content");
    function showFolder(folder) {
      content.dataset.folder = folder;
      content.replaceChildren();
      for (const item of sidebar.children) {
        item.setAttribute("aria-pressed", String(item.dataset.folder === folder));
      }
      if (folder === "Inbox (1)") {
        content.append(element("h3", "", "Welcome to your new office"),
          element("p", "mail-from", "From: Building Manager"),
          element("p", "", "Nosh,"),
          element("p", "", "The keys are yours. Make yourself at home."),
          element("p", "", "Good luck with the first day."),
          button("Reply", () => {
            showFolder("Drafts");
            content.querySelector("textarea").focus();
          }));
      } else if (folder === "Drafts") {
        content.append(element("h3", "", "Reply to Building Manager"));
        draftEditor(content, "mail", "Write a reply…");
      } else {
        content.append(element("h3", "", "Sent"),
          element("p", "", "No sent messages. Mail is a local prototype."));
      }
    }
    for (const folder of ["Inbox (1)", "Sent", "Drafts"]) {
      const item = button(folder, () => showFolder(folder));
      item.dataset.folder = folder;
      item.prepend(element("span", "mail-folder-icon"));
      sidebar.append(item);
    }
    body.append(sidebar, content);
    showFolder("Inbox (1)");
  }

  function draftEditor(parent, key, label) {
    const field = element("textarea");
    field.setAttribute("aria-label", label);
    field.placeholder = label;
    field.maxLength = MAX_DRAFT_LENGTH;
    field.value = drafts[key] || "";
    field.addEventListener("input", () => { drafts[key] = field.value; });
    parent.append(element("p", "desktop-note",
      "Local draft only. Messages are not sent to anyone."), field,
    button("Save draft", () => saveDraft(key, field.value)));
  }

  function renderDirectory(body) {
    const sidebar = element("nav", "desktop-sidebar");
    sidebar.setAttribute("aria-label", "Directory filters");
    const search = element("input");
    search.type = "search";
    search.placeholder = "Search people…";
    search.setAttribute("aria-label", "Search people");
    const list = element("div", "desktop-people");
    const profile = element("article", "desktop-content desktop-profile");
    let onlyFavorites = false;
    let group = null;
    const all = button("All Employees", () => {
      onlyFavorites = false;
      group = null;
      refresh();
    });
    const favoriteFilter = button("Favorites", () => {
      onlyFavorites = true;
      group = null;
      refresh();
    });
    const teams = button("Teams", () => showGroups("teams"));
    const locations = button("Locations", () => showGroups("locations"));
    function showGroups(kind) {
      // A chooser has no people filter until a group is selected.
      onlyFavorites = false;
      group = null;
      search.value = "";
      list.classList.add("desktop-groups");
      for (const item of [all, favoriteFilter, teams, locations]) {
        item.setAttribute("aria-pressed",
          String(item === (kind === "teams" ? teams : locations)));
      }
      list.replaceChildren();
      profile.replaceChildren(element("h3", "",
        kind === "teams" ? "Teams" : "Locations"),
      element("p", "", "Choose a group to see its people."));
      const groups = kind === "teams"
        ? [...new Set(PEOPLE.map(person => person.role))] : ["Not assigned"];
      for (const label of groups) {
        list.append(button(label, () => {
          group = kind === "teams" ? label : null;
          onlyFavorites = false;
          search.value = "";
          refresh();
          list.querySelector("button")?.focus();
        }));
      }
    }
    function showProfile() {
      const identity = element("div", "desktop-identity");
      const details = element("div",
        selected.name.length > 13 ? "long-name" : "");
      details.append(element("h3", "", selected.name),
        element("p", "", selected.role),
        element("p", "desktop-availability", "Available"));
      details.querySelector(".desktop-availability").prepend(
        element("span", "availability-check"));
      identity.append(sprite(selected.portrait, "profile-portrait"), details);
      const favorite = button(favorites.has(selected.id)
        ? "★" : "☆", () => {
        if (favorites.has(selected.id)) favorites.delete(selected.id);
        else favorites.add(selected.id);
        refresh();
        const nextFavorite = profile.querySelector("button[aria-pressed]");
        (nextFavorite || favoriteFilter).focus();
      });
      favorite.classList.add("desktop-favorite");
      favorite.setAttribute("aria-label", favorites.has(selected.id)
        ? "Remove favorite" : "Add favorite");
      favorite.setAttribute("aria-pressed", String(favorites.has(selected.id)));
      profile.replaceChildren(identity, element("h4", "", "About"),
        element("p", "", selected.about), button("Message in Teams", () => {
          openApp("teams");
        }), favorite);
      profile.querySelector("button").prepend(sprite("task-teams"));
    }
    function refresh() {
      list.classList.remove("desktop-groups");
      all.setAttribute("aria-pressed", String(!onlyFavorites && !group));
      favoriteFilter.setAttribute("aria-pressed", String(onlyFavorites));
      teams.setAttribute("aria-pressed", String(Boolean(group)));
      locations.setAttribute("aria-pressed", "false");
      const people = findPeople(search.value, onlyFavorites ? favorites : null)
        .filter(person => !group || person.role === group);
      list.replaceChildren();
      if (!people.length) {
        list.append(element("p", "", "No matching people."));
        profile.replaceChildren();
        return;
      }
      if (!people.includes(selected)) selected = people[0];
      for (const person of people) {
        const item = button("", () => {
          selected = person;
          refresh();
          list.querySelector('[aria-pressed="true"]')?.focus();
        });
        item.append(sprite(person.thumbnail || person.portrait),
          element("span", "", person.name));
        item.setAttribute("aria-pressed", String(person === selected));
        list.append(item);
      }
      showProfile();
    }
    search.addEventListener("input", refresh);
    all.prepend(sprite("employees"));
    favoriteFilter.prepend(sprite("favorites"));
    teams.prepend(sprite("groups"));
    locations.prepend(sprite("locations"));
    const searchBox = element("label", "desktop-search");
    const searchIcon = element("span", "desktop-search-icon");
    searchIcon.setAttribute("aria-hidden", "true");
    searchBox.append(searchIcon, search);
    sidebar.append(searchBox, all, teams, locations, favoriteFilter);
    body.append(sidebar, list, profile);
    body.classList.add("directory-layout");
    refresh();
  }

  function renderTeams(body) {
    const sidebar = element("nav", "desktop-sidebar");
    sidebar.setAttribute("aria-label", "Teams contacts");
    for (const person of PEOPLE.filter(person => person.id !== "nosh")) {
      const item = button(person.name, () => {
        selected = person;
        renderWindow();
        window.querySelector("h2").focus();
      });
      item.setAttribute("aria-pressed", String(person === selected));
      sidebar.append(item);
    }
    const conversation = element("article", "desktop-content");
    conversation.append(element("h3", "", selected.name),
      element("p", "", selected.role));
    const label = `Draft a message to ${selected.name}`;
    draftEditor(conversation, selected.id, label);
    body.append(sidebar, conversation);
  }

  function renderTaskbar() {
    taskbar.replaceChildren();
    const launcher = button("", closeWindow, "desktop-launcher");
    launcher.setAttribute("aria-label", "Show desktop");
    launcher.append(sprite("launcher"));
    taskbar.append(launcher);
    for (const id of ["mail", "teams", "directory"]) {
      const label = id === "directory" ? "Directory" : APPS[id];
      const tab = button("", () => openApp(id));
      tab.setAttribute("aria-label", label);
      tab.append(sprite(`task-${id}`), element("span", "", label));
      tab.setAttribute("aria-pressed", String(active === id && !window.hidden));
      taskbar.append(tab);
    }
    const sound = sprite("sound", "desktop-sound");
    taskbar.append(sound);
    taskbar.append(button("Back to office ↗",
      () => desktop.close(), "desktop-exit"));
    const clock = element("time", "desktop-clock");
    clock.setAttribute("aria-label", "Local time");
    taskbar.append(clock);
    updateClock();
  }

  function updateClock() {
    const clock = taskbar.querySelector("time");
    if (clock) {
      const time = describeTime();
      clock.textContent = `${time.clock}\n${time.date}`;
    }
  }

  for (const [id, label] of Object.entries(APPS)) {
    const shortcut = button("", () => openApp(id));
    shortcut.dataset.app = id;
    shortcut.append(sprite(id),
      element("span", "", id === "directory" ? "Directory" : label));
    shortcuts.append(shortcut);
  }
  canvas.append(shortcuts, window, status, taskbar);
  desktop.append(canvas);
  document.body.append(desktop);
  desktop.addEventListener("close", () => {
    clearInterval(clockTimer);
    onVisibilityChange();
    opener?.focus();
  });
  return {
    open() {
      if (desktop.open) return;
      opener = document.activeElement;
      desktop.showModal();
      openApp(active);
      clockTimer = setInterval(updateClock, 1000);
      onVisibilityChange();
    },
  };
}
