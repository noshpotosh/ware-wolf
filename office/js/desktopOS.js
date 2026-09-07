import { PEOPLE, findPeople } from "./desktopPeople.js";
import { describeTime } from "./worldClock.js";

const ART = "assets/desktop/directory-art.png";
const ICONS = {
  mail: [106, 81, 106, 81], teams: [108, 239, 103, 98],
  directory: [109, 397, 102, 104], documents: [110, 590, 105, 100],
};
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

function sprite(rect, className = "") {
  const ns = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(ns, "svg");
  svg.setAttribute("viewBox", rect.join(" "));
  svg.setAttribute("class", `desktop-art ${className}`);
  svg.setAttribute("aria-hidden", "true");
  const image = document.createElementNS(ns, "image");
  image.setAttribute("href", ART);
  image.setAttribute("width", "1672");
  image.setAttribute("height", "941");
  svg.append(image);
  return svg;
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
    header.append(sprite(ICONS[active]), title);
    const minimize = button("−", closeWindow);
    minimize.setAttribute("aria-label", "Minimize application");
    const maximize = button("□", () => {
      const expanded = window.classList.toggle("expanded");
      maximize.setAttribute("aria-pressed", String(expanded));
    });
    maximize.setAttribute("aria-label", "Expand application");
    const expanded = window.classList.contains("expanded");
    maximize.setAttribute("aria-pressed", String(expanded));
    const close = button("×", closeWindow);
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
      content.replaceChildren();
      for (const item of sidebar.children) {
        item.setAttribute("aria-pressed", String(item.textContent === folder));
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
      sidebar.append(button(folder, () => showFolder(folder)));
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
    const all = button("All Employees", () => {
      onlyFavorites = false;
      refresh();
    });
    const favoriteFilter = button("Favorites", () => {
      onlyFavorites = true;
      refresh();
    });
    function showProfile() {
      const identity = element("div", "desktop-identity");
      const details = element("div");
      details.append(element("h3", "", selected.name),
        element("p", "", selected.role));
      identity.append(sprite(selected.portrait, "profile-portrait"), details);
      const favorite = button(favorites.has(selected.id)
        ? "★ Favorited" : "☆ Add favorite", () => {
        if (favorites.has(selected.id)) favorites.delete(selected.id);
        else favorites.add(selected.id);
        refresh();
        const nextFavorite = profile.querySelector("button[aria-pressed]");
        (nextFavorite || favoriteFilter).focus();
      });
      favorite.setAttribute("aria-pressed", String(favorites.has(selected.id)));
      profile.replaceChildren(identity, element("h4", "", "About"),
        element("p", "", selected.about), button("Message in Teams", () => {
          openApp("teams");
        }), favorite);
    }
    function refresh() {
      all.setAttribute("aria-pressed", String(!onlyFavorites));
      favoriteFilter.setAttribute("aria-pressed", String(onlyFavorites));
      const people = findPeople(search.value, onlyFavorites ? favorites : null);
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
        item.append(sprite(person.portrait), element("span", "", person.name));
        item.setAttribute("aria-pressed", String(person === selected));
        list.append(item);
      }
      showProfile();
    }
    search.addEventListener("input", refresh);
    sidebar.append(search, all, favoriteFilter);
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
    taskbar.append(button("◇ Desktop", closeWindow));
    for (const [id, label] of Object.entries(APPS)) {
      const tab = button("", () => openApp(id));
      tab.setAttribute("aria-label", label);
      tab.append(sprite(ICONS[id]), element("span", "", label));
      tab.setAttribute("aria-pressed", String(active === id && !window.hidden));
      taskbar.append(tab);
    }
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
    shortcut.append(sprite(ICONS[id]),
      element("span", "", id === "directory" ? "Directory" : label));
    shortcuts.append(shortcut);
  }
  desktop.append(shortcuts, window, status, taskbar);
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
