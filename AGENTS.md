# Agent Instructions (`meet-my-symptom`)

## Mission

Build and maintain a pain-description assistant that helps users communicate symptoms clearly to:
- AI chat tools
- doctors/clinicians

This project must **never** diagnose, prescribe, or claim medical certainty.

## Product Guardrails (Hard Constraints)

- Scope is pain-focused symptom description.
- Outputs are exactly two templates per issue:
  - AI-facing structured prompt
  - doctor-facing plain-language summary
- No specialist-recommendation output.
- No timeline output.
- No model-based generation in MVP (rule-based only).
- Show non-diagnostic disclaimer and caregiver note in the generation flow.

## Privacy and Data Handling

- No backend persistence of personal symptom data.
- Use session-scoped browser storage only.
- Never add analytics that send raw symptom free text.

## Working Scope

- Work inside this repository by default.
- If a task requires changes outside this repo, ask first.
- Keep code simple, testable, and deterministic.

## Technical Defaults

- Frontend-only web app.
- Plain JavaScript modules (no backend required for MVP).
- Template generation must be deterministic and auditable.

## Quality Expectations

- Validate required fields before template generation.
- Keep missing optional fields explicit as `Not provided`.
- Keep custom text verbatim in outputs; do not reinterpret it.
- Maintain max 3 issues in multi-issue mode.

## Testing and Verification

- Add/maintain automated tests for:
  - validation rules
  - template generation behavior
  - multi-issue constraints
- Run `npm test` (or `node --test`) before closing a task when possible.

## Documentation Rules

When behavior changes, update:
- `docs/requirements-mvp.md` for user-visible requirements
- `docs/system-overview.md` for architecture/data-flow changes
- `README.md` for run/test instructions
