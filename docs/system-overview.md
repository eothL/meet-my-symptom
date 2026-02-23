# System Overview — `meet-my-symptom`

## Architecture

The MVP is a frontend-only web app with deterministic rule-based generation.

Modules:
1. `src/config/`:
   - region map definitions
   - option lists (descriptors, onset, duration, pattern, triggers, relievers)
2. `src/lib/`:
   - issue factory
   - validation
   - template generation
   - session state load/save
3. `src/main.js`:
   - rendering
   - event handling
   - issue management
   - generation/copy/download actions
4. `styles.css`:
   - responsive UI and map overlay layout

## Data Flow

1. User fills profile and issue fields.
2. App updates state in memory and synchronizes to `sessionStorage`.
3. On generate:
   - validation runs for profile + each issue
   - if valid, generator creates 2 deterministic templates per issue
4. Generated outputs are shown in editable textareas.
5. User can copy per template or download a combined TXT file.
6. Session data remains available until browser session ends.

## Core State Shape (Implementation)

```ts
interface AppState {
  mode: "single_issue" | "multi_issue";
  profile: {
    bodyMapType: "male" | "female" | "";
    age: string;
    height: {
      unit: "cm" | "ft_in";
      cmValue: string;
      feet: string;
      inches: string;
    };
  };
  issues: PainIssueInput[];
  ui: {
    selectedIssueId: string;
    bodyView: "front" | "back";
  };
  outputs: null | {
    generatedAt: string;
    byIssue: Record<string, { aiPrompt: string; doctorSummary: string }>;
  };
}
```

## Validation Rules

Per issue required:
- `primaryRegion`
- `descriptors.length > 0`
- `severity0to10`
- `onset`
- `duration`
- `pattern`

Global required:
- `profile.bodyMapType`

Multi-issue limits:
- min 1 issue
- max 3 issues

## Template Generation Rules

1. Rule-based deterministic formatter only.
2. Missing optional values render as `Not provided`.
3. AI prompt must include explicit guardrails:
   - ask clarifying questions
   - avoid diagnosis certainty
4. Doctor summary uses plain language (non-SOAP, medium length).
5. Custom text is appended verbatim under `Additional note (verbatim)`.

## Privacy Model

- No backend calls for generation.
- Session-only browser storage.
- No persistent server-side user history.

## Non-Functional Notes

- Mobile-first controls with large tap targets.
- Accessible labels for major fields.
- Placeholder "experimental model" indicator is non-functional in MVP.
