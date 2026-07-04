# Mobile Planning Preview QA

Use the internal planning preview before merging UI state changes that affect
planning flows. In development builds, open Explore and select
`Planning state preview`.

## Access checks

- Confirm the Explore screen shows `Planning state preview` when dev tools are enabled.
- Confirm the preview route is not shown as a bottom tab.
- Confirm production-like builds without dev tools show the unavailable message.

## Preview groups

### Schedule draft

- Empty state explains how to generate a draft.
- Draft state shows blocks, assumptions, warnings, and approve/reject actions.
- Approved and synced states show calendar sync status clearly.
- Recovery states show reconnect or regenerate actions when needed.

### Weekly reschedule

- Empty state explains that no missed tasks are ready.
- Pending state disables rerun affordances.
- Placed state shows generated draft dates and placed tasks.
- Overflow and schema/save errors are distinguishable.
- Replayed state tells the user the result was already processed.

### Daily review

- Loading state communicates scheduled tasks are being fetched.
- Empty state explains that a schedule draft must be completed first.
- Tasks state allows reviewing done and missed tasks.
- Save error and saved success copy are both visible.

### Task summary

- Loading state is clear and short.
- Empty state explains how to populate tasks.
- Populated state groups status buckets and estimated minutes.
- Error state gives a retry-oriented message.

### Planning create row

- Idle state has a context-specific placeholder.
- Empty guidance appears when submitting a blank title.
- Pending state disables input and shows `Saving...`.
- Error state gives a retry-oriented mutation failure message.

## When adding a new state

- Add or update a fixture near the owning feature.
- Register the state in `planningStateCatalog`.
- Render it from the planning preview sections.
- Extend validation so missing catalog or preview wiring fails CI.
- Keep source and docs files under 150 lines.
