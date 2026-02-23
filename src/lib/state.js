import { createIssue, nextIssueId } from "./issueFactory.js";

export const SESSION_STORAGE_KEY = "meet-my-symptom.session.v1";

function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function createDefaultProfile() {
  return {
    bodyMapType: "",
    age: "",
    height: {
      unit: "cm",
      cmValue: "",
      feet: "",
      inches: ""
    }
  };
}

export function createInitialState() {
  const firstIssue = createIssue("issue-1");

  return {
    mode: "single_issue",
    profile: createDefaultProfile(),
    issues: [firstIssue],
    ui: {
      selectedIssueId: firstIssue.id,
      bodyView: "front"
    },
    outputs: null
  };
}

export function enforceStateConstraints(rawState) {
  const state = clone(rawState || {});

  if (state.mode !== "single_issue" && state.mode !== "multi_issue") {
    state.mode = "single_issue";
  }

  if (!state.profile) {
    state.profile = createDefaultProfile();
  }

  if (!Array.isArray(state.issues) || state.issues.length === 0) {
    state.issues = [createIssue("issue-1")];
  }

  state.issues = state.issues.map((issue) => {
    const fallback = createIssue(issue && issue.id ? issue.id : nextIssueId(state.issues));
    return {
      ...fallback,
      ...issue,
      context: {
        ...fallback.context,
        ...(issue && issue.context ? issue.context : {})
      }
    };
  });

  if (state.mode === "single_issue" && state.issues.length > 1) {
    state.issues = [state.issues[0]];
  }

  if (state.issues.length > 3) {
    state.issues = state.issues.slice(0, 3);
  }

  if (!state.ui) {
    state.ui = { selectedIssueId: state.issues[0].id, bodyView: "front" };
  }

  if (state.ui.bodyView !== "front" && state.ui.bodyView !== "back") {
    state.ui.bodyView = "front";
  }

  const selectedExists = state.issues.some((issue) => issue.id === state.ui.selectedIssueId);
  if (!selectedExists) {
    state.ui.selectedIssueId = state.issues[0].id;
  }

  if (!state.outputs || typeof state.outputs !== "object") {
    state.outputs = null;
  }

  if (!state.profile.height || typeof state.profile.height !== "object") {
    state.profile.height = createDefaultProfile().height;
  }

  if (state.profile.height.unit !== "cm" && state.profile.height.unit !== "ft_in") {
    state.profile.height.unit = "cm";
  }

  return state;
}

export function addIssue(state) {
  if (state.issues.length >= 3) {
    return state;
  }

  const issueId = nextIssueId(state.issues);
  state.issues.push(createIssue(issueId));
  state.ui.selectedIssueId = issueId;
  return state;
}

export function removeIssue(state, issueId) {
  if (state.issues.length === 1) {
    return state;
  }

  state.issues = state.issues.filter((issue) => issue.id !== issueId);

  if (!state.issues.some((issue) => issue.id === state.ui.selectedIssueId)) {
    state.ui.selectedIssueId = state.issues[0].id;
  }

  return state;
}

export function loadState() {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw);
    return enforceStateConstraints(parsed);
  } catch (_error) {
    return null;
  }
}

export function saveState(state) {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return;
  }

  window.sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));
}
