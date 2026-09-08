# Company creation — round 01

Three visual directions for the screen between **New Company** and the
starting bedroom. Nosh selected direction 02 for implementation. The PNG
remains a reference mockup; the runtime screen is accessible HTML and CSS.

## 01 — Founder dossier

Strongest information architecture. Founder, company, and team choices are
easy to scan, and the bottom review bar makes the consequence of the setup
clear. This is the safest base for an implementation mock.

Known limitation: it feels like a management screen more than a moment in
the game world. Candidate role text also drifted from the canonical crew and
must be live HTML/data in any implementation.

## 02 — Command-table charter

Strongest connection to the title screen and the tactile startup fantasy.
The founder ID, charter, stamps, pins, and folders make company creation feel
like signing the first real paperwork.

Known limitation: edit affordances and selection state are less immediately
obvious. The market stamps look simultaneously selected, so interaction would
need a clearer single-choice treatment.

## 03 — Character first

Strongest character-creation energy. The large portrait makes the founder
feel central, while the hiring rail reads like assembling a small RPG party.

Known limitation: the company itself becomes secondary, and the direction
suggests cosmetic portrait customization that the current art set does not
yet support.

## Selected direction

Nosh selected **02**, the command-table charter. The implementation keeps its
walnut tabletop, founder clipboard, pinned charter, stamped market choices,
five application folders, hired stamps, and strong final action. The runtime
uses live HTML and CSS rather than baking controls into the candidate PNG.

All three outputs are 1672×941 PNGs generated with the approved main menu,
founder portrait, and employee-directory artwork supplied as references.
Full prompts, hashes, and work-order constraints are in `prompts.json`.
