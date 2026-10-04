# Instructions for artefact updates

## Shopping list

When the user asks to update their shopping list, edit `courses/courses.json` in `fredleroy/artefacts` on `main` and commit the change. The live page is https://fredleroy.github.io/artefacts/courses/ . Read the current JSON before editing; do not replace unrelated items or change the HTML for a list-content update.

The JSON has a string `tripId` and an `items` array of objects with unique string `id` and `name` fields. Keep existing IDs for retained items, including quantity or wording changes. Use new stable IDs for new items. Preserve the user's language and requested quantities.

- For additions, removals, or corrections to the current list, retain `tripId`. This preserves checked items, hidden items and local additions on each device. An item previously hidden locally stays hidden if its ID is retained.
- When the user explicitly requests a new shopping list or a reset, replace the shared items as requested and change `tripId` to a new unique value (for example, an ISO timestamp). This clears checkmarks, hidden items and local additions on devices when they next refresh. Do not change `tripId` for an ordinary edit.
- If the user's intention to edit the current list or start a new one is unclear, treat it as an edit and preserve `tripId`.

Validate JSON and ID uniqueness, publish the authorized update, and return the live page link. Allow for GitHub Pages deployment delay. The page reloads JSON on interactions, focus, becoming visible, and every 30 seconds while visible. It does not upload local additions to GitHub.
