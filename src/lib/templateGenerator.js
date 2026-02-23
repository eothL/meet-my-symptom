import { getRegionById } from "../config/regions.js";

function notProvidedIfBlank(value) {
  if (typeof value !== "string") {
    return "Not provided";
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "Not provided";
}

function listOrNotProvided(values) {
  if (!Array.isArray(values) || values.length === 0) {
    return "Not provided";
  }
  return values.join(", ");
}

function formatHeight(height) {
  if (!height) {
    return "Not provided";
  }

  if (height.unit === "cm") {
    return height.cmValue && String(height.cmValue).trim().length > 0
      ? `${String(height.cmValue).trim()} cm`
      : "Not provided";
  }

  if (height.unit === "ft_in") {
    const feet = String(height.feet || "").trim();
    const inches = String(height.inches || "").trim();

    if (!feet && !inches) {
      return "Not provided";
    }

    const feetText = feet ? `${feet} ft` : "0 ft";
    const inchesText = inches ? `${inches} in` : "0 in";
    return `${feetText} ${inchesText}`;
  }

  return "Not provided";
}

function regionLabel(regionId) {
  const region = getRegionById(regionId);
  return region ? region.label : "Not provided";
}

function contextSummary(context) {
  if (!context) {
    return "Not provided";
  }

  const lines = [];
  lines.push(`Medication tried: ${context.medsTried ? "Yes" : "No"}`);
  lines.push(`Prior injury in this area: ${context.priorInjury ? "Yes" : "No"}`);
  lines.push(`Known chronic condition: ${context.chronicCondition ? "Yes" : "No"}`);
  lines.push(`Context note: ${notProvidedIfBlank(context.note || "")}`);

  return lines.join("; ");
}

function buildAiPrompt(profile, issue, issueNumber) {
  const location = regionLabel(issue.primaryRegion);
  const subregion = notProvidedIfBlank(issue.subregion || "");
  const descriptors = listOrNotProvided(issue.descriptors);
  const severity = Number.isFinite(issue.severity0to10)
    ? `${issue.severity0to10}/10`
    : "Not provided";

  return [
    `Issue ${issueNumber} — Pain Description Prompt`,
    "",
    "Please help me discuss this pain problem clearly.",
    "",
    "Guardrails for your response:",
    "- Ask clarifying follow-up questions before giving suggestions.",
    "- Do not provide a definitive diagnosis or certainty claim.",
    "- Keep guidance educational and encourage clinician follow-up when needed.",
    "",
    "Patient profile:",
    `- Body map type: ${notProvidedIfBlank(profile.bodyMapType)}`,
    `- Age: ${notProvidedIfBlank(profile.age || "")}`,
    `- Height: ${formatHeight(profile.height)}`,
    "",
    "Pain details:",
    `- Primary location: ${location}`,
    `- Optional finer location: ${subregion}`,
    `- Pain descriptors: ${descriptors}`,
    `- Current severity: ${severity}`,
    `- Onset: ${notProvidedIfBlank(issue.onset || "")}`,
    `- Duration: ${notProvidedIfBlank(issue.duration || "")}`,
    `- Pattern: ${notProvidedIfBlank(issue.pattern || "")}`,
    `- Triggers: ${listOrNotProvided(issue.triggers)}`,
    `- Relievers: ${listOrNotProvided(issue.relievers)}`,
    `- Related pain effects: ${listOrNotProvided(issue.painEffects)}`,
    `- User goal: ${notProvidedIfBlank(issue.userGoal || "")}`,
    `- Context: ${contextSummary(issue.context)}`,
    `- Additional notes: ${notProvidedIfBlank(issue.notes || "")}`,
    "",
    "Additional note (verbatim):",
    `${notProvidedIfBlank(issue.customText || "")}`
  ].join("\n");
}

function buildDoctorSummary(profile, issue, issueNumber) {
  const location = regionLabel(issue.primaryRegion);
  const subregion = notProvidedIfBlank(issue.subregion || "");
  const descriptors = listOrNotProvided(issue.descriptors);
  const severity = Number.isFinite(issue.severity0to10)
    ? `${issue.severity0to10}/10`
    : "Not provided";

  return [
    `Issue ${issueNumber} — Plain-Language Symptom Summary`,
    "",
    `I am seeking help for pain located around ${location}${
      subregion !== "Not provided" ? ` (${subregion})` : ""
    }.`,
    `Right now, I would rate the pain as ${severity}, and it feels ${descriptors.toLowerCase()}.`,
    `The pain started ${notProvidedIfBlank(issue.onset || "")} and has lasted ${notProvidedIfBlank(
      issue.duration || ""
    )}.`,
    `The pattern is ${notProvidedIfBlank(issue.pattern || "")}.`,
    `It tends to worsen with ${listOrNotProvided(issue.triggers)} and improve with ${listOrNotProvided(
      issue.relievers
    )}.`,
    `Related pain effects I noticed: ${listOrNotProvided(issue.painEffects)}.`,
    `Context I can share: ${contextSummary(issue.context)}.`,
    `My goal for this visit/conversation: ${notProvidedIfBlank(issue.userGoal || "")}.`,
    `Other notes: ${notProvidedIfBlank(issue.notes || "")}.`,
    "",
    "Additional note (verbatim):",
    `${notProvidedIfBlank(issue.customText || "")}`,
    "",
    `Profile details: body map type ${notProvidedIfBlank(profile.bodyMapType)}, age ${notProvidedIfBlank(
      profile.age || ""
    )}, height ${formatHeight(profile.height)}.`
  ].join("\n");
}

export function generateOutputs(state) {
  const byIssue = {};

  state.issues.forEach((issue, index) => {
    byIssue[issue.id] = {
      aiPrompt: buildAiPrompt(state.profile, issue, index + 1),
      doctorSummary: buildDoctorSummary(state.profile, issue, index + 1)
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    byIssue
  };
}
