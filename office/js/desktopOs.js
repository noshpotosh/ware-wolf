import { drawPortrait } from "./drawCharacters.js";
import {
  DesktopAppId,
  DESKTOP_CLOCK_INTERVAL_MS,
  GoalEventKind,
  MessageRole,
} from "./constants.js";
import {
  ensureThreadGreeting,
  listThread,
  sendAgentMessage,
  subscribeAgentBus,
} from "./agentBus.js";
import {
  clearElement,
  createEl,
  formatClock,
  bubbleClassForRole,
  presenceClass,
  presenceForPerson,
} from "./desktopDom.js";
import { renderLoftApp } from "./desktopLoftApp.js";
import {
  formatCompanyBucks,
  listGoals,
} from "./economy.js";

function paintTeamsThread(log, agentBus, staffId) {
  clearElement(log);
  const messages = listThread(agentBus, staffId);

  if (!messages.length) {
    log.appendChild(
      createEl("p", "teams-placeholder", "No messages yet.")
    );
    return;
  }

  for (const message of messages) {
    log.appendChild(
      createEl(
        "p",
        bubbleClassForRole(message.role),
        message.text
      )
    );
  }

  log.scrollTop = log.scrollHeight;
}

function buildTeamsRosterRow(person, status, onSelect) {
  const row = createEl("button", "teams-roster-row");
  row.type = "button";
  row.dataset.staff = person.id;
  row.setAttribute("aria-pressed", "false");

  row.appendChild(
    createEl("span", `presence-dot ${presenceClass(status)}`)
  );
  row.appendChild(
    createEl("span", "teams-roster-name", person.displayName)
  );
  row.appendChild(
    createEl("span", "teams-roster-status", status)
  );
  row.addEventListener("click", () => {
    onSelect(person);
  });
  return row;
}

function renderTeamsApp(body, desktop) {
  clearElement(body);

  const staffList = desktop.staffList;
  const agentBus = desktop.agentBus;
  const occupancy = desktop.getOccupancy
    ? desktop.getOccupancy()
    : {};

  const layout = createEl("div", "teams-layout");
  const roster = createEl("aside", "teams-roster");
  const thread = createEl("section", "teams-thread");
  const title = createEl("h2", "teams-thread-title");
  const log = createEl("div", "teams-thread-log");
  const typing = createEl("p", "teams-typing");
  const compose = createEl("form", "teams-compose");
  const input = createEl("input", "teams-compose-input");
  const sendButton = createEl(
    "button",
    "teams-compose-send",
    "Send"
  );

  let activeStaffId = null;
  roster.appendChild(createEl("h2", "roster-heading", "Your team"));

  title.textContent = "Select a teammate";
  typing.hidden = true;
  typing.textContent = "Typing…";
  log.appendChild(
    createEl(
      "p",
      "teams-placeholder",
      "Pick a teammate to open their agent thread."
    )
  );

  input.type = "text";
  input.placeholder = "Message your teammate…";
  input.setAttribute("aria-label", "Teams message");
  sendButton.type = "submit";

  function showThread(person) {
    activeStaffId = person.id;
    for (const row of roster.querySelectorAll(".teams-roster-row")) {
      row.setAttribute(
        "aria-pressed",
        String(row.dataset.staff === person.id)
      );
    }
    title.textContent = person.displayName;
    typing.hidden = true;
    ensureThreadGreeting(agentBus, person.id);
    paintTeamsThread(log, agentBus, person.id);
  }

  subscribeAgentBus(agentBus, (event) => {
    if (!body.contains(layout)) {
      return;
    }

    if (!activeStaffId || event.staffId !== activeStaffId) {
      return;
    }

    if (event.type === "message") {
      if (event.message.role === MessageRole.USER) {
        typing.hidden = false;
      } else {
        typing.hidden = true;

        if (
          event.message.role === MessageRole.AGENT
          && desktop.onGoalEvent
        ) {
          desktop.onGoalEvent(
            GoalEventKind.AGENT_REPLY,
            { staffId: activeStaffId }
          );
        }
      }

      paintTeamsThread(log, agentBus, activeStaffId);
    }

    if (event.type === "thread-ready") {
      paintTeamsThread(log, agentBus, activeStaffId);
    }
  });

  for (const person of staffList) {
    const status = presenceForPerson(
      person,
      desktop,
      occupancy
    );
    roster.appendChild(
      buildTeamsRosterRow(person, status, showThread)
    );
  }

  compose.addEventListener("submit", (event) => {
    event.preventDefault();

    const message = input.value.trim();

    if (!message || !activeStaffId) {
      return;
    }

    const result = sendAgentMessage(
      agentBus,
      activeStaffId,
      message
    );

    if (!result.ok) {
      return;
    }

    input.value = "";

    if (desktop.onMessageSent) {
      desktop.onMessageSent();
    }
  });

  compose.appendChild(input);
  compose.appendChild(sendButton);
  thread.appendChild(title);
  thread.appendChild(log);
  thread.appendChild(typing);
  thread.appendChild(compose);
  layout.appendChild(roster);
  layout.appendChild(thread);
  body.appendChild(layout);
}

function renderDirectoryApp(body, desktop) {
  clearElement(body);

  const staffList = desktop.staffList;
  const occupancy = desktop.getOccupancy
    ? desktop.getOccupancy()
    : {};

  const layout = createEl("div", "directory-layout");
  const list = createEl("aside", "directory-list");
  const detail = createEl("section", "directory-detail");

  detail.appendChild(
    createEl(
      "p",
      "directory-placeholder",
      "Select a teammate to view their profile."
    )
  );

  function showProfile(person) {
    clearElement(detail);
    for (const row of list.querySelectorAll(".directory-row")) {
      row.setAttribute(
        "aria-pressed",
        String(row.dataset.staff === person.id)
      );
    }
    const portrait = createEl('canvas', 'directory-portrait');
    portrait.setAttribute('role', 'img');
    portrait.setAttribute('aria-label', `${person.displayName} portrait`);
    drawPortrait(portrait, person.id);
    detail.appendChild(portrait);
    const status = presenceForPerson(
      person,
      desktop,
      occupancy
    );

    detail.appendChild(
      createEl("h2", "directory-name", person.displayName)
    );
    detail.appendChild(
      createEl("p", "directory-role", person.role)
    );

    const presence = createEl(
      "p",
      `directory-presence ${presenceClass(status)}`
    );
    const badge = createEl(
      "span",
      "directory-presence-badge"
    );
    badge.setAttribute("aria-hidden", "true");
    presence.appendChild(badge);
    presence.appendChild(
      document.createTextNode(status)
    );
    detail.appendChild(presence);
    detail.appendChild(createEl('h3', 'directory-about-title', 'About'));
    detail.appendChild(
      createEl("p", "directory-about", person.about)
    );

    if (desktop.onGoalEvent) {
      desktop.onGoalEvent(
        GoalEventKind.DIRECTORY_PROFILE,
        { staffId: person.id }
      );
    }
  }

  list.appendChild(
    createEl("h2", "roster-heading", "Directory")
  );

  const searchWrap = createEl("div", "directory-search-wrap");
  const searchIcon = createEl(
    "span",
    "directory-search-icon"
  );
  searchIcon.setAttribute("aria-hidden", "true");
  const search = createEl("input", "directory-search");
  search.type = "search";
  search.placeholder = "Search people…";
  search.setAttribute("aria-label", "Search people");
  search.addEventListener("input", () => {
    const query = search.value.trim().toLowerCase();
    for (const row of list.querySelectorAll(".directory-row")) {
      row.hidden = !row.textContent.toLowerCase()
        .includes(query);
    }
  });
  searchWrap.appendChild(searchIcon);
  searchWrap.appendChild(search);
  list.appendChild(searchWrap);

  // Decorative selected nav chrome to match mock sidebar
  const allEmployees = createEl(
    "div",
    "directory-nav-row is-selected"
  );
  allEmployees.setAttribute("aria-hidden", "true");
  allEmployees.appendChild(
    createEl("span", "directory-nav-icon")
  );
  allEmployees.appendChild(
    document.createTextNode("All Employees")
  );
  list.appendChild(allEmployees);

  for (const person of staffList) {
    const status = presenceForPerson(person, desktop, occupancy);
    const row = createEl("button", "directory-row");
    row.dataset.staff = person.id;
    row.setAttribute('aria-pressed', 'false');
    row.type = "button";

    row.appendChild(
      createEl(
        "span",
        `presence-dot ${presenceClass(status)}`
      )
    );
    row.appendChild(
      createEl(
        "span",
        "directory-row-name",
        person.displayName
      )
    );
    row.addEventListener("click", () => {
      showProfile(person);
    });
    list.appendChild(row);
  }

  layout.appendChild(list);
  layout.appendChild(detail);
  body.appendChild(layout);
  const initialProfile = staffList.find(
    (person) => person.id === "maeve-quinn"
  ) || staffList.find(
    (person) => !person.isPlayer
  ) || staffList[0];
  if (initialProfile) {
    showProfile(initialProfile);
  }
}

function renderGoalsApp(body, economy) {
  clearElement(body);

  const layout = createEl("div", "goals-layout");
  const summary = createEl("p", "goals-summary");
  const list = createEl("div", "goals-list");
  const hint = createEl(
    "p",
    "goals-hint",
    "Goals complete themselves when you do the work in the loft."
  );

  function refresh() {
    clearElement(list);
    summary.textContent =
      `Company balance: ${formatCompanyBucks(economy.companyBucks)}`;

    for (const goal of listGoals(economy)) {
      const card = createEl("article", "goal-card");

      if (goal.isComplete) {
        card.classList.add("is-complete");
      }

      card.appendChild(
        createEl("h3", "goal-title", goal.title)
      );
      card.appendChild(
        createEl(
          "p",
          "goal-description",
          goal.description
        )
      );

      const meta = createEl("p", "goal-meta");
      meta.textContent =
        `${goal.rewardBucks} bucks · ${goal.deadlineLabel}`;
      card.appendChild(meta);

      if (goal.isComplete) {
        card.appendChild(
          createEl("p", "goal-status", "Completed")
        );
      } else {
        card.appendChild(
          createEl(
            "p",
            "goal-progress",
            goal.progressLabel
          )
        );
      }

      list.appendChild(card);
    }
  }

  refresh();
  layout.appendChild(summary);
  layout.appendChild(hint);
  layout.appendChild(list);
  body.appendChild(layout);

  return refresh;
}

export function createDesktopOs(options) {
  const root = options.root;
  const staffList = options.staffList;
  const economy = options.economy;
  const agentBus = options.agentBus;
  const onClose = options.onClose;
  const onGoalComplete = options.onGoalComplete;
  const onUpgradePurchase = options.onUpgradePurchase;
  const onOfficeChange = options.onOfficeChange;
  const onMessageSent = options.onMessageSent;
  const onGoalEvent = options.onGoalEvent;
  const getOccupancy = options.getOccupancy;

  const windowEl = root.querySelector(".desktop-window");
  const titleEl = root.querySelector(".window-title");
  const bodyEl = root.querySelector(".window-body");
  const closeButton = root.querySelector(".window-close");
  const minimizeButton = root.querySelector(".window-minimize");
  const maximizeButton = root.querySelector(".window-maximize");
  const soundButton = root.querySelector(".desktop-sound");
  const muteButton = document.getElementById("mute-button");
  const exitButton = root.querySelector("#desktop-exit");
  const clockEl = root.querySelector(".taskbar-clock");
  const iconButtons = root.querySelectorAll("[data-app]");

  const state = {
    root,
    staffList,
    economy,
    agentBus,
    onClose,
    onGoalComplete,
    onUpgradePurchase,
    onOfficeChange,
    onMessageSent,
    onGoalEvent,
    getOccupancy,
    windowEl,
    titleEl,
    bodyEl,
    clockEl,
    isOpen: false,
    activeAppId: null,
    clockTimerId: null,
  };

  function refreshTaskbar() {
    if (!clockEl) {
      return;
    }

    const now = new Date();
    const date = now.toLocaleDateString([], {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
    clockEl.textContent = `${formatClock(now)}\n${date}`;
    clockEl.dateTime = now.toISOString();
    if (soundButton && muteButton) {
      const isMuted = muteButton.getAttribute("aria-pressed") === "true";
      const label = isMuted ? "Unmute sound" : "Mute sound";
      soundButton.setAttribute("aria-pressed", String(isMuted));
      soundButton.setAttribute("aria-label", label);
      soundButton.title = label;
    }
  }

  function closeWindow() {
    state.activeAppId = null;
    root.removeAttribute("data-active-app");
    for (const button of iconButtons) {
      button.setAttribute('aria-pressed', 'false');
    }

    if (windowEl) {
      windowEl.hidden = true;
    }

    if (titleEl) {
      titleEl.textContent = "";
    }

    if (bodyEl) {
      clearElement(bodyEl);
    }
  }

  function openApp(appId) {
    if (!windowEl || !bodyEl || !titleEl) {
      return;
    }

    if (state.activeAppId === appId) {
      windowEl.hidden = false;
      return;
    }

    state.activeAppId = appId;
    root.dataset.activeApp = appId;
    for (const button of iconButtons) {
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.app === appId)
      );
    }
    windowEl.hidden = false;

    if (appId === DesktopAppId.GOALS) {
      titleEl.textContent = "Team Goals";
      renderGoalsApp(bodyEl, economy);
      return;
    }

    if (appId === DesktopAppId.TEAMS) {
      titleEl.textContent = "Teams";
      renderTeamsApp(bodyEl, state);

      if (state.onGoalEvent) {
        state.onGoalEvent(GoalEventKind.OPEN_TEAMS);
      }

      return;
    }

    if (appId === DesktopAppId.DIRECTORY) {
      titleEl.textContent = "Employee Directory";
      renderDirectoryApp(bodyEl, state);

      if (state.onGoalEvent) {
        state.onGoalEvent(GoalEventKind.OPEN_DIRECTORY);
      }

      return;
    }

    if (appId === DesktopAppId.LOFT) {
      titleEl.textContent = "Loft Shop";
      renderLoftApp(bodyEl, state);
    }
  }

  for (const button of iconButtons) {
    button.addEventListener("click", () => {
      openApp(button.dataset.app);
    });
  }

  if (closeButton) {
    closeButton.addEventListener("click", () => {
      closeWindow();
    });
  }

  if (minimizeButton) {
    minimizeButton.addEventListener("click", () => {
      windowEl.hidden = true;
      const activeButton = root.querySelector(
        `.taskbar-app[data-app="${state.activeAppId}"]`
      );
      activeButton?.focus();
    });
  }

  if (maximizeButton) {
    maximizeButton.addEventListener("click", () => {
      const expanded = windowEl.classList.toggle("is-maximized");
      maximizeButton.setAttribute("aria-pressed", String(expanded));
      maximizeButton.setAttribute(
        "aria-label", expanded ? "Restore window" : "Maximize window"
      );
    });
  }

  if (soundButton && muteButton) {
    soundButton.addEventListener("click", () => {
      muteButton.click();
      refreshTaskbar();
    });
  }

  if (exitButton) {
    exitButton.addEventListener("click", () => {
      closeDesktopOs(state);
    });
  }

  state.closeWindow = closeWindow;
  state.openApp = openApp;
  state.refreshTaskbar = refreshTaskbar;

  return state;
}

export function isDesktopOsOpen(desktop) {
  return Boolean(desktop && desktop.isOpen);
}

export function openDesktopOs(desktop) {
  if (!desktop || desktop.isOpen) {
    return;
  }

  desktop.isOpen = true;
  desktop.root.hidden = false;
  document.body.classList.add("desktop-open");
  desktop.closeWindow();
  desktop.refreshTaskbar();
  desktop.clockTimerId = window.setInterval(() => {
    desktop.refreshTaskbar();
  }, DESKTOP_CLOCK_INTERVAL_MS);

  const firstIcon = desktop.root.querySelector("[data-app]");

  if (firstIcon) {
    firstIcon.focus();
  }

  if (desktop.onGoalEvent) {
    desktop.onGoalEvent(GoalEventKind.OPEN_DESKTOP);
  }
}

export function closeDesktopOs(desktop) {
  if (!desktop || !desktop.isOpen) {
    return;
  }

  desktop.isOpen = false;
  desktop.closeWindow();
  desktop.root.hidden = true;
  document.body.classList.remove("desktop-open");

  if (desktop.clockTimerId !== null) {
    window.clearInterval(desktop.clockTimerId);
    desktop.clockTimerId = null;
  }

  if (desktop.onClose) {
    desktop.onClose();
  }
}

export function handleDesktopOsKeydown(desktop, event) {
  if (!isDesktopOsOpen(desktop)) {
    return false;
  }

  if (event.key !== "Escape") {
    return true;
  }

  if (desktop.activeAppId) {
    desktop.closeWindow();
    return true;
  }

  closeDesktopOs(desktop);
  return true;
}
