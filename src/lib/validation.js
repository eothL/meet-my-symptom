function hasText(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function validateIssue(issue) {
  const missing = [];

  if (!hasText(issue.primaryRegion)) {
    missing.push("location");
  }

  if (!Array.isArray(issue.descriptors) || issue.descriptors.length === 0) {
    missing.push("descriptor(s)");
  }

  if (!Number.isFinite(issue.severity0to10)) {
    missing.push("severity");
  }

  if (!hasText(issue.onset)) {
    missing.push("onset");
  }

  if (!hasText(issue.duration)) {
    missing.push("duration");
  }

  if (!hasText(issue.pattern)) {
    missing.push("pattern");
  }

  return {
    issueId: issue.id,
    missing,
    valid: missing.length === 0
  };
}

export function validateState(state) {
  const issueResults = state.issues.map(validateIssue);

  const profileMissing = [];
  if (!hasText(state.profile.bodyMapType)) {
    profileMissing.push("body map type");
  }

  const globalErrors = [];
  if (state.mode === "multi_issue" && state.issues.length > 3) {
    globalErrors.push("A maximum of 3 issues is allowed in multi-issue mode.");
  }

  if (state.issues.length === 0) {
    globalErrors.push("At least one issue is required.");
  }

  const canGenerate =
    profileMissing.length === 0 &&
    globalErrors.length === 0 &&
    issueResults.every((result) => result.valid);

  return {
    canGenerate,
    profileMissing,
    issueResults,
    globalErrors
  };
}
