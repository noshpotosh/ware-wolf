# Office art source records

This directory records provenance for approved complete scene paintings,
state edits, transitions, portraits, and UI art.

The runtime catalogue is `../data/scene-catalog.json`. Scene candidates stay
under `../../docs/office/mockups/` until Nosh approves one. Approval requires
a versioned runtime path plus source/runtime hashes, native dimensions,
provider/model information, prompt, permitted change, and acceptance reason.

Interactive masks are runtime support assets, not independent art-catalogue
items. They live under `../assets/interaction-masks/` and are referenced by
the scene definition that owns them.
