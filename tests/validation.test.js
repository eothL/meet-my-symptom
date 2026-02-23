import test from "node:test";
import assert from "node:assert/strict";

import { addIssue, createInitialState, enforceStateConstraints } from "../src/lib/state.js";
import { validateState } from "../src/lib/validation.js";

function fillRequired(issue) {
  issue.primaryRegion = "front_knee_left";
  issue.descriptors = ["Sharp"];
  issue.severity0to10 = 6;
  issue.onset = "Sudden";
  issue.duration = "1-3 days";
  issue.pattern = "Comes and goes";
}

test("validation blocks generation when required fields are missing", () => {
  const state = createInitialState();
  state.profile.bodyMapType = "";

  const result = validateState(state);

  assert.equal(result.canGenerate, false);
  assert.ok(result.profileMissing.includes("body map type"));
  assert.equal(result.issueResults[0].valid, false);
});

test("validation allows generation when profile and issue required fields are complete", () => {
  const state = createInitialState();
  state.profile.bodyMapType = "female";
  fillRequired(state.issues[0]);

  const result = validateState(state);

  assert.equal(result.canGenerate, true);
  assert.equal(result.issueResults[0].valid, true);
});

test("multi-issue mode enforces max 3 issues", () => {
  const state = createInitialState();
  state.mode = "multi_issue";

  addIssue(state);
  addIssue(state);
  addIssue(state);

  assert.equal(state.issues.length, 3);

  state.issues.forEach(fillRequired);
  state.profile.bodyMapType = "male";

  const result = validateState(state);
  assert.equal(result.canGenerate, true);
});

test("enforceStateConstraints trims issues above 3", () => {
  const state = createInitialState();
  state.mode = "multi_issue";
  addIssue(state);
  addIssue(state);
  addIssue(state);

  const constrained = enforceStateConstraints(state);
  assert.equal(constrained.issues.length, 3);
});
