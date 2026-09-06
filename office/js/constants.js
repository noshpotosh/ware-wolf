export const TILE_WIDTH_PX = 128;
export const TILE_HEIGHT_PX = 64;

export const FurnitureKind = {
  DESK: "desk",
  BUBBLER: "bubbler",
  COFFEE: "coffee",
  WHITEBOARD: "whiteboard",
  DOOR: "door",
};

export const RoomId = {
  FOUNDERS_OFFICE: "founders-office",
  SHARED_LOFT: "shared-loft",
};

export const LayoutSource = {
  FIXED: "fixed",
  ECONOMY: "economy",
};

export const PLAYER_STAFF_ID = "nosh";
export const PLAYER_DESK_ID = "desk-nosh";

// Click-to-walk feel: brisk office stride, not a sprint.
export const PLAYER_MOVE_TILES_PER_SECOND = 3.25;
export const PLAYER_WALK_BOB_RATE = 10;

export const CARDINAL_STEPS = [
  { deltaX: 1, deltaY: 0 },
  { deltaX: -1, deltaY: 0 },
  { deltaX: 0, deltaY: 1 },
  { deltaX: 0, deltaY: -1 },
];

// Prefer standing just south of Nosh's desk when the loft loads.
export const SPAWN_SEARCH_OFFSETS = [
  { deltaX: 0, deltaY: 1 },
  { deltaX: 1, deltaY: 0 },
  { deltaX: -1, deltaY: 0 },
  { deltaX: 0, deltaY: -1 },
  { deltaX: 1, deltaY: 1 },
  { deltaX: -1, deltaY: 1 },
  { deltaX: 1, deltaY: -1 },
  { deltaX: -1, deltaY: -1 },
];

// Chebyshev distance: orthogonal + diagonal neighbors count.
export const INTERACT_RANGE_TILES = 1;

export const InteractKind = {
  TALK: "talk",
  DRINK: "drink",
  SIP_COFFEE: "sip-coffee",
  READ_BOARD: "read-board",
  USE_PC: "use-pc",
  USE_DOOR: "use-door",
};

// ADR 002: brief flash while swapping rooms (~150–300ms).
export const ROOM_FLASH_MS = 220;
export const ROOM_FLASH_REDUCED_MS = 40;
// Minimum fade-out so the overlay always clears after mid-swap.
export const ROOM_FLASH_FADE_OUT_MIN_MS = 40;

// Distinct jackets so staff read apart from amber Nosh.
export const NpcJacketFill = {
  "fabrizio-cortell": "#3d5a6c",
  "maeve-quinn": "#6b8057",
  "dex-harlan": "#2f6f5e",
  "cal-rook": "#8b3a3a",
  "reed-mallory": "#4a5560",
};

export const DEFAULT_NPC_JACKET_FILL = "#5c6b73";

export const BUBBLER_DRINK_LINE =
  "Cold water. Pack hydrated.";

export const COFFEE_SIP_LINE =
  "Hot brew. Pack caffeinated.";

// Rotating scribbles on the loft whiteboard.
export const WHITEBOARD_NOTES = [
  "Ship the smallest honest slice.",
  "Brand first. One job per viewport.",
  "Readable beats clever.",
  "Prove it — vibes don't merge.",
  "Name the thing. No mystery mush.",
];

export const StaffTalkLine = {
  "fabrizio-cortell":
    "Scope first. Then we ship. Keep it 100.",
  "maeve-quinn":
    "If the first viewport could be another brand, cut it.",
  "dex-harlan":
    "Readable beats clever. Show me the recipe.",
  "cal-rook":
    "Prove it. I break builds that hide behind vibes.",
  "reed-mallory":
    "No mystery numbers. Name the thing.",
};

export const TOAST_VISIBLE_MS = 3200;
export const DESKTOP_CLOCK_INTERVAL_MS = 30000;
export const AGENT_REPLY_DELAY_MS = 450;
export const AGENT_CHAT_STORAGE_KEY =
  "warewolf-office-agent-chat-v1";

// Soft UI blips — map kind → Hz; gain/duration shared.
export const UiBlipHz = {
  MESSAGE: 660,
  DRINK: 420,
  CLICK: 520,
};
export const UI_BLIP_GAIN = 0.04;
export const UI_BLIP_DURATION_SEC = 0.12;
export const UI_BLIP_CLOSE_DELAY_MS = 200;

export const MessageRole = {
  USER: "user",
  AGENT: "agent",
  SYSTEM: "system",
};

export const DesktopAppId = {
  TEAMS: "teams",
  DIRECTORY: "directory",
  GOALS: "goals",
  LOFT: "loft",
};

// Goal ids must match office/data/goals.json.
export const GoalId = {
  SHIP_PHASE4_DESKTOP: "ship-phase4-desktop",
  TALK_TO_THREE_TEAMMATES: "talk-to-three-teammates",
  HYDRATE_ONCE: "hydrate-once",
  OPEN_DIRECTORY_PROFILE: "open-directory-profile",
  MESSAGE_TWO_AGENTS: "message-two-agents",
  SIP_OFFICE_COFFEE: "sip-office-coffee",
  READ_WHITEBOARD_NOTE: "read-whiteboard-note",
};

export const GoalEventKind = {
  OPEN_DESKTOP: "open-desktop",
  OPEN_TEAMS: "open-teams",
  OPEN_DIRECTORY: "open-directory",
  DIRECTORY_PROFILE: "directory-profile",
  TALK: "talk",
  DRINK: "drink",
  SIP_COFFEE: "sip-coffee",
  READ_BOARD: "read-board",
  AGENT_REPLY: "agent-reply",
};

export const TALK_GOAL_TARGET_COUNT = 3;
export const AGENT_REPLY_GOAL_TARGET_COUNT = 2;

export const UpgradeId = {
  DESK_PLANTS: "desk-plants",
  DESK_LAMPS: "desk-lamps",
  BETTER_CHAIRS: "better-chairs",
  AMBER_NEON: "amber-neon",
};

export const STARTER_OFFICE_ID = "starter-loft";

// ADR 002: player walks; crew stay seated until station-snap.
export const NPC_LOFT_MOTION_ENABLED = false;

export const NPC_BUBBLER_VISIT_SECONDS = 18;
export const NPC_BUBBLER_DWELL_SECONDS = 2.5;
export const NPC_MOVE_TILES_PER_SECOND = 2.4;
export const NPC_VISIT_JITTER_BASE = 0.6;
export const NPC_VISIT_JITTER_SPAN = 0.8;

export const AUDIO_MUTE_STORAGE_KEY =
  "warewolf-office-audio-mute-v1";

export const PresenceStatus = {
  AVAILABLE: "Available",
  AWAY: "Away",
};

export const ECONOMY_STORAGE_KEY = "warewolf-office-economy-v1";
export const STARTING_COMPANY_BUCKS = 0;

// Desk kit + floor island (mock fidelity): layout offsets in loft px.
export const CHAIR_TEXTURE_KEY = "chair-pixellab";
export const NOSH_MAT_TEXTURE_KEY = "desk-nosh-mat";

export const FloorTexture = {
  WOOD: "floor-wood",
  CARPET: "floor-carpet",
  ISLAND: "floor-island",
};

export const WALL_TEXTURE_KEY = "wall-bone";
export const WALL_DISPLAY_WIDTH = 128;
export const WALL_DISPLAY_HEIGHT = 176;
export const WALL_ORIGIN_X = 0.5;
export const WALL_ORIGIN_Y = 1;
// Sit the wall foot on the far half of the floor diamond.
export const WALL_SCREEN_OFFSET_Y = -40;
export const WALL_DEPTH_BIAS = -1.2;

export const SPRITE_ORIGIN_CENTER_X = 0.5;
export const SPRITE_ORIGIN_FOOT_Y = 0.92;
export const SPRITE_NO_BOB_Y = 0;

export const ISLAND_INSET_TILES = 2;

export const CHAIR_SCREEN_OFFSET_X = 18;
export const CHAIR_SCREEN_OFFSET_Y = 36;
export const CHAIR_DEPTH_BIAS = -0.35;
export const CHAIR_DISPLAY_SIZE = 96;

export const NAMEPLATE_SCREEN_OFFSET_X = 0;
export const NAMEPLATE_SCREEN_OFFSET_Y = -8;
export const NAMEPLATE_DEPTH_BIAS = 0.45;
export const NAMEPLATE_FONT_PX = 11;
export const NAMEPLATE_COLOR = "#1A1714";
export const NAMEPLATE_BG = "#F4EFE6";
export const NAMEPLATE_STROKE = "#1A1714";
export const NAMEPLATE_PAD_X = 4;
export const NAMEPLATE_PAD_Y = 2;
export const NAMEPLATE_STROKE_WIDTH = 2;
export const NAMEPLATE_ORIGIN_X = 0.5;
export const NAMEPLATE_ORIGIN_Y = 1;

export const NOSH_MAT_SCREEN_OFFSET_X = 0;
export const NOSH_MAT_SCREEN_OFFSET_Y = 22;
export const NOSH_MAT_DEPTH_BIAS = -0.2;
export const NOSH_MAT_DISPLAY_SIZE = 96;

// First-name plates — mock uses short labels, not full legal names.
export const STAFF_NAMEPLATE = {
  nosh: "Nosh",
  "fabrizio-cortell": "Fabrizio",
  "maeve-quinn": "Maeve",
  "dex-harlan": "Dex",
  "cal-rook": "Cal",
  "reed-mallory": "Reed",
};

