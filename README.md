# Meet My Symptom

Meet My Symptom is a non-diagnostic web tool that helps users describe pain symptoms more clearly for:
- AI chat conversations
- doctor/clinician communication

It does **not** provide diagnosis, treatment, or medical certainty.

## Why This Project Exists

Many people know where it hurts but struggle to explain the pain precisely. This tool structures symptom details (location, intensity, onset, pattern, triggers, relievers) into clear templates that are easier to share.

## What It Does (MVP)

- Pain-focused intake flow (not a general symptom checker)
- Single-issue or multi-issue mode (up to 3 issues)
- Clickable front/back body map with optional finer subregion selection
- Structured symptom capture:
  - required: location, descriptors, severity, onset, duration, pattern
  - optional: triggers, relievers, related effects, context, notes, custom text
- Generates exactly 2 outputs per issue:
  - AI-facing structured prompt
  - doctor-facing plain-language summary
- Editable outputs before copy/download
- Download all generated templates as `.txt`
- Session-only persistence via `sessionStorage`

## Safety and Scope

- This product is for communication support only.
- It is intentionally rule-based and deterministic in MVP.
- It should never claim diagnosis certainty.
- The app includes a visible non-diagnostic disclaimer and a caregiver note for minors.

## Quick Start

### Prerequisites

- Node.js (for tests)
- Python 3 (used by the local static dev server)

### Run Locally

```bash
cd meet-my-symptom
npm run dev
```

Open: [http://localhost:4173](http://localhost:4173)

### Run Tests

```bash
cd meet-my-symptom
npm test
```

## Typical Usage Flow

1. Select intake mode (`single_issue` or `multi_issue`).
2. Choose body map type and optional profile details.
3. Pick pain region on front/back map (optional finer subregion).
4. Fill required symptom fields.
5. Generate templates.
6. Edit/copy/download outputs.

## Project Structure

```text
meet-my-symptom/
  AGENTS.md
  docs/
    requirements-mvp.md
    system-overview.md
  src/
    config/
    lib/
    main.js
  tests/
  index.html
  styles.css
  package.json
```

## Key Documentation

- Requirements: `docs/requirements-mvp.md`
- System overview: `docs/system-overview.md`
- Agent guidance: `AGENTS.md`

## Privacy Notes

- No backend persistence in MVP
- No account system
- Data remains in browser session storage and clears when the session ends

## Planned Future Work

- Optional experimental tiny local model path (post-MVP)
- Hybrid rule + model phrasing refinement under strict non-diagnostic guardrails

## License

This project is licensed under the MIT License. See `LICENSE`.
