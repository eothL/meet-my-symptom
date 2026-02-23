import test from "node:test";
import assert from "node:assert/strict";

import { generateOutputs } from "../src/lib/templateGenerator.js";
import { createInitialState } from "../src/lib/state.js";

function completeIssue(issue, region = "front_knee_left") {
  issue.primaryRegion = region;
  issue.subregion = "Kneecap";
  issue.descriptors = ["Sharp", "Stiff"];
  issue.severity0to10 = 7;
  issue.onset = "Sudden";
  issue.duration = "1-3 days";
  issue.pattern = "Comes and goes";
  issue.triggers = ["Walking"];
  issue.relievers = ["Rest"];
  issue.painEffects = ["Swelling"];
  issue.userGoal = "Get better questions for a clinician visit";
  issue.context.medsTried = true;
  issue.context.note = "Took ibuprofen once yesterday.";
  issue.notes = "Pain feels worse in the evening.";
  issue.customText = "My own note: this gets worse on stairs.";
}

test("generateOutputs returns exactly two templates per issue", () => {
  const state = createInitialState();
  state.profile.bodyMapType = "female";
  state.profile.age = "34";
  state.profile.height.unit = "cm";
  state.profile.height.cmValue = "168";

  completeIssue(state.issues[0]);

  const outputs = generateOutputs(state);
  const issueOutput = outputs.byIssue[state.issues[0].id];

  assert.ok(issueOutput);
  assert.equal(typeof issueOutput.aiPrompt, "string");
  assert.equal(typeof issueOutput.doctorSummary, "string");
  assert.deepEqual(Object.keys(issueOutput).sort(), ["aiPrompt", "doctorSummary"]);
});

test("optional blanks are rendered as Not provided", () => {
  const state = createInitialState();
  state.profile.bodyMapType = "male";

  const issue = state.issues[0];
  issue.primaryRegion = "front_chest_center";
  issue.descriptors = ["Dull"];
  issue.severity0to10 = 3;
  issue.onset = "Gradual";
  issue.duration = "4-7 days";
  issue.pattern = "Constant";
  issue.customText = "";

  const outputs = generateOutputs(state);
  const text = outputs.byIssue[issue.id].aiPrompt;

  assert.match(text, /Age: Not provided/);
  assert.match(text, /Height: Not provided/);
  assert.match(text, /Triggers: Not provided/);
  assert.match(text, /Additional note \(verbatim\):\nNot provided/);
});

test("custom text is appended verbatim in both templates", () => {
  const state = createInitialState();
  state.profile.bodyMapType = "female";

  const customText = "I can point to one exact spot after long walks.";
  completeIssue(state.issues[0], "front_thigh_left");
  state.issues[0].customText = customText;

  const outputs = generateOutputs(state);
  const issueOutput = outputs.byIssue[state.issues[0].id];

  assert.match(issueOutput.aiPrompt, new RegExp(customText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  assert.match(issueOutput.doctorSummary, new RegExp(customText.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
});

test("AI template includes clarifying and no-certainty guardrails", () => {
  const state = createInitialState();
  state.profile.bodyMapType = "male";
  completeIssue(state.issues[0]);

  const outputs = generateOutputs(state);
  const ai = outputs.byIssue[state.issues[0].id].aiPrompt;

  assert.match(ai, /Ask clarifying follow-up questions/i);
  assert.match(ai, /Do not provide a definitive diagnosis/i);
});
