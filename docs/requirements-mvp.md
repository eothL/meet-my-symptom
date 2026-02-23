# Requirements Freeze v1 — `meet-my-symptom`

## Summary

`meet-my-symptom` is a pain-description assistant. It helps users turn vague pain complaints into clearer, structured text for:
1. AI chat
2. doctor communication

It is explicitly non-diagnostic.

## Core Requirements

1. Scope is pain-focused only.
2. The tool must never diagnose or prescribe.
3. Platform is responsive web.
4. User can choose:
   - `single_issue`
   - `multi_issue` (max 3 issues)
5. In multi-issue mode, outputs are generated separately per issue.
6. Body selector requirements:
   - required field label: `Body map type`
   - options: male/female map
   - front/back map views
   - 2D zoom + layered overlay interaction
   - region selection with optional subregion selection
   - balanced map coverage (~24–32 clickable regions)
7. Symptom capture requirements:
   - pain descriptor checklist
   - optional custom text
   - required per issue: location, severity, onset, duration, pattern, descriptors
   - optional per issue: triggers, relievers, notes, user goal
   - optional context: meds tried, prior injury, chronic condition + context note
8. Demographics:
   - age optional
   - height optional with structured unit selector
9. Output set is exactly two templates per issue:
   - AI-facing structured bullet prompt
   - doctor-facing plain-language medium summary
10. Output behavior:
   - missing optional fields render as `Not provided`
   - custom text appended verbatim at end
   - user can edit generated outputs before copy/download
11. AI template guardrail text must instruct:
   - ask clarifying questions
   - avoid diagnosis certainty
12. Safety UX:
   - prominent non-diagnostic disclaimer
   - minor caregiver note
   - no required disclaimer checkbox in MVP
13. Data handling:
   - persist session state in `sessionStorage`
   - clear automatically when browser session ends
14. Explicit exclusions:
   - no specialist guidance output
   - no symptom timeline output
   - no model-based generation in MVP
   - no account system
   - no backend persistence

## Data Contract (Requirement-Level)

```ts
type Mode = "single_issue" | "multi_issue";
type BodyMapType = "male" | "female";
type BodyView = "front" | "back";
type IssueId = string;
type RegionId = string;

interface ProfileInput {
  bodyMapType: BodyMapType; // required
  age?: string;
  height?: { value: number; unit: "cm" | "ft_in" };
}

interface PainIssueInput {
  id: IssueId;
  primaryRegion: RegionId; // required
  subregion?: string;
  descriptors: string[]; // required, pain-focused
  severity0to10: number; // required
  onset: string; // required
  duration: string; // required
  pattern: string; // required
  triggers?: string[];
  relievers?: string[];
  userGoal?: string;
  context?: {
    medsTried?: boolean;
    priorInjury?: boolean;
    chronicCondition?: boolean;
    note?: string;
  };
  customText?: string; // optional, appended verbatim
}

interface GeneratedOutputs {
  aiPrompt: string;
  doctorSummary: string;
}
```

## Acceptance Criteria

1. Generation is blocked until required fields are complete for each issue.
2. Multi-issue mode enforces max 3 issues.
3. Each issue produces exactly 2 outputs (AI + doctor).
4. AI output is structured bullets and includes clarifying-question and no-certainty instruction.
5. Doctor output is plain-language and medium length.
6. Optional missing fields appear as `Not provided`.
7. Custom text appears unchanged in a dedicated final section.
8. Disclaimer and caregiver note are visible in generation flow.
9. Outputs are editable before copy/download.
10. Session resume works in-session and clears after session end.

## Future (Out of MVP)

- Experimental tiny local model toggle (placeholder only in MVP).
- Hybrid rule + model generation path.
