# Warewolf agent instructions

This file is the cross-environment entry point for AI collaborators. It keeps
Codex aligned with the same company doctrine, rules, and crew definitions that
Cursor uses.

Do not turn this file into a second copy of the doctrine. The linked files are
the source of truth and must be updated in place.

## Load the operating context

Before substantive work in this repository:

1. Read `README.md` and `docs/index.md` for the company and documentation map.
2. Read these binding doctrine files:
   - `docs/culture.md`
   - `docs/coding-standards.md`
   - `docs/pr-discipline.md`
3. Read every file in `.cursor/rules/` and treat its body as an always-on
   project rule. The YAML frontmatter is Cursor metadata, not a limitation on
   the rule in Codex.
4. Read relevant locked decisions under `docs/decisions/` before changing an
   area they govern. Meeting notes provide context; locked decisions and
   doctrine govern behavior.
5. Read the relevant product or implementation docs linked from
   `docs/index.md` before changing that part of the project.

For office art generation, animation, or integration, follow the shared
[art contract](docs/office/art-direction.md),
[pipeline](docs/office/asset-pipeline.md), and
[prompt templates](docs/office/art-prompts.md). Open the actual approved
references in `office/art-source/style-reference.json` before art work.

## Use the shared crew

The canonical agent definitions live in `.cursor/agents/`. Cursor loads those
files directly. Codex discovers the thin adapters in `.codex/agents/`; each
adapter loads the matching canonical persona file. Read the complete matching
persona before acting as or delegating to a named crew member.

- Fabrizio Cortell plans, challenges assumptions, prioritizes, and coordinates.
- Maeve Quinn owns product scope, UX, UI direction, and product taste.
- Dex Harlan implements the smallest honest, readable solution.
- Cal Rook adversarially verifies behavior and reports evidence.
- Reed Mallory performs the final readability pass after verification.

For work that crosses lanes, use this default sequence when each stage is
material: Fabrizio scopes, Maeve shapes, Dex builds, Cal verifies, and Reed
checks readability. Do not add process theater for trivial work.

Do not silently impersonate a named crew member. If the user invokes a crew
member, or a task is delegated to one, follow that member's agent definition.
Otherwise operate as the general Warewolf collaborator and respect every
persona as teammate-owned.

## Non-negotiable locks

- Only Nosh or Fabrizio may merge to `main`. Other agents may open or update
  scoped PRs but must not merge without Nosh or Fabrizio explicitly authorizing
  that specific PR. No Cursor auto-merge by default.
- Keep one concern per branch and PR. Split independently revertible work.
- Easy-to-read, easy-to-understand code and KISS are the top software
  principles. Apply `docs/coding-standards.md`, not a watered-down summary.
- Never edit another agent's persona. Only the agent represented by a persona
  file may evolve that file. Only Fabrizio may edit his persona file or his
  persona/roster sections in `README.md`.
- Core memories are proactive but rare. Follow
  `.cursor/rules/core-memories.mdc`; routine work is not a core memory.

## Keep Cursor and Codex in sync

- Company doctrine belongs in `docs/*.md` and locked calls belong in
  `docs/decisions/`.
- Always-on Cursor adapters belong in `.cursor/rules/` and should point to the
  canonical doctrine instead of cloning it.
- Shared named-agent behavior belongs only in `.cursor/agents/`. Codex adapters
  in `.codex/agents/` must only load the matching canonical persona; do not copy
  persona text into them.
- `AGENTS.md` remains the Codex bootstrap and compatibility map.
- When changing any of these paths, verify that both environments still point
  to the same source of truth.
