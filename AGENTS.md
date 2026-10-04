# Instructions for artefact updates

## Shared shopping list

The live page is https://fredleroy.github.io/artefacts/courses/ . Its source of truth is the Firestore document `lists/courses` in the project configured by `courses/firebase-config.js`. The schema is `{ "items": [{ "id": "stable-id", "name": "Article", "checked": false }] }`. Only 20 items are allowed; names are limited to 200 characters and IDs to 80.

When asked to change the shopping list, read and update the current Firestore document. Do not edit `initial-list.json` as a way to update a live list: it is only a seed used if the document does not exist. Prefer a Firestore transaction or REST conditional write with the document update time to avoid overwriting concurrent edits. Access is public within the constraints in `firestore.rules`; no user login is needed.

For additions, removals and wording/quantity changes, preserve retained item IDs and checked states. For an explicit new list, replace the items and set all checked states to false. If intent is unclear, preserve the current list. Do not reintroduce localStorage or IndexedDB persistence. Browser-only items from the old page are not migrated automatically.

If Firebase is not configured or reachable, report the blocker and do not claim that the live list was updated. Check the current remote branch before making changes.

Rules only permit direct reads and validated writes to `lists/courses`. All other documents, collection queries, document deletion and unexpected fields are denied. Publish rule changes before deploying frontend changes that require them. Never commit service-account credentials; the public web configuration may be committed.
