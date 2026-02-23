import {
  CAREGIVER_NOTE,
  DISCLAIMER_TEXT,
  DURATION_OPTIONS,
  MODEL_PLACEHOLDER_TEXT,
  ONSET_OPTIONS,
  PAIN_DESCRIPTORS,
  PAIN_EFFECT_OPTIONS,
  PATTERN_OPTIONS,
  RELIEVER_OPTIONS,
  TRIGGER_OPTIONS
} from "./config/options.js";
import { getRegionById, getRegionsByView } from "./config/regions.js";
import { generateOutputs } from "./lib/templateGenerator.js";
import {
  addIssue,
  createInitialState,
  enforceStateConstraints,
  loadState,
  removeIssue,
  saveState
} from "./lib/state.js";
import { validateState } from "./lib/validation.js";

const appRoot = document.querySelector("#app");

let state = enforceStateConstraints(loadState() || createInitialState());
let noticeMessage = "";

appRoot.addEventListener("click", handleClick);
appRoot.addEventListener("change", handleChange);
appRoot.addEventListener("input", handleInput);

render();

function clone(value) {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }
  return JSON.parse(JSON.stringify(value));
}

function setNotice(message) {
  noticeMessage = message;
  render();
  window.setTimeout(() => {
    if (noticeMessage === message) {
      noticeMessage = "";
      render();
    }
  }, 2200);
}

function updateState(mutator, options = { resetOutputs: true }) {
  const next = clone(state);
  mutator(next);

  if (options.resetOutputs) {
    next.outputs = null;
  }

  state = enforceStateConstraints(next);
  saveState(state);
  render();
}

function selectedIssue() {
  return state.issues.find((issue) => issue.id === state.ui.selectedIssueId) || state.issues[0];
}

function heightLabel(profile) {
  if (profile.height.unit === "cm") {
    return profile.height.cmValue ? `${profile.height.cmValue} cm` : "Not provided";
  }
  if (!profile.height.feet && !profile.height.inches) {
    return "Not provided";
  }
  return `${profile.height.feet || "0"} ft ${profile.height.inches || "0"} in`;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderMap(view, issue) {
  const regions = getRegionsByView(view);
  const title = view === "front" ? "Front view" : "Back view";

  return `
    <div class="map-shell">
      <div class="map-title">${title}</div>
      <svg class="body-map" viewBox="0 0 240 420" role="img" aria-label="Clickable body map">
        <circle cx="120" cy="35" r="16" class="body-base" />
        <rect x="108" y="52" width="24" height="24" rx="10" class="body-base" />
        <rect x="80" y="78" width="80" height="150" rx="36" class="body-base" />
        <rect x="46" y="84" width="26" height="144" rx="14" class="body-base" />
        <rect x="168" y="84" width="26" height="144" rx="14" class="body-base" />
        <rect x="90" y="226" width="28" height="176" rx="16" class="body-base" />
        <rect x="122" y="226" width="28" height="176" rx="16" class="body-base" />
        ${regions
          .map((region) => {
            const isActive = issue.primaryRegion === region.id;
            return `<rect
              x="${region.x}"
              y="${region.y}"
              width="${region.w}"
              height="${region.h}"
              rx="7"
              class="region-layer ${isActive ? "region-layer-active" : ""}"
              data-action="select-region"
              data-region-id="${region.id}"
            ></rect>`;
          })
          .join("")}
      </svg>
      <p class="map-hint">Tap a highlighted area to set the primary pain location.</p>
    </div>
  `;
}

function renderSubregionPanel(issue) {
  if (!issue.primaryRegion) {
    return `
      <div class="zoom-panel zoom-empty">
        <h4>Region Zoom</h4>
        <p>Select a primary region first. A finer subregion picker will appear here.</p>
      </div>
    `;
  }

  const region = getRegionById(issue.primaryRegion);
  const options = region?.subregions || [];

  return `
    <div class="zoom-panel">
      <h4>Region Zoom: ${escapeHtml(region?.label || "Selected region")}</h4>
      <p class="zoom-note">Optional finer location</p>
      <div class="chip-grid">
        ${options
          .map((subregion) => {
            const active = issue.subregion === subregion;
            return `<button type="button" class="chip-button ${active ? "chip-button-active" : ""}" data-action="select-subregion" data-subregion="${escapeHtml(
              subregion
            )}">${escapeHtml(subregion)}</button>`;
          })
          .join("")}
      </div>
      <p class="current-subregion">Current finer location: ${escapeHtml(issue.subregion || "Not provided")}</p>
    </div>
  `;
}

function renderChecklist(field, options, selectedValues, issueId) {
  return `
    <div class="checklist-grid">
      ${options
        .map((item) => {
          const checked = selectedValues.includes(item) ? "checked" : "";
          return `
            <label class="check-chip">
              <input
                type="checkbox"
                data-array-field="${field}"
                data-issue-id="${issueId}"
                value="${escapeHtml(item)}"
                ${checked}
              />
              <span>${escapeHtml(item)}</span>
            </label>
          `;
        })
        .join("")}
    </div>
  `;
}

function renderValidation(validation) {
  const lines = [];

  if (validation.profileMissing.length > 0) {
    lines.push(`Profile missing: ${validation.profileMissing.join(", ")}.`);
  }

  validation.issueResults.forEach((result, index) => {
    if (!result.valid) {
      lines.push(`Issue ${index + 1} missing: ${result.missing.join(", ")}.`);
    }
  });

  validation.globalErrors.forEach((error) => lines.push(error));

  if (lines.length === 0) {
    return `<p class="ready-badge">All required fields are complete. You can generate templates.</p>`;
  }

  return `<ul class="validation-list">${lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
}

function renderOutputs() {
  if (!state.outputs) {
    return "";
  }

  const blocks = state.issues
    .map((issue, index) => {
      const output = state.outputs.byIssue[issue.id];
      if (!output) {
        return "";
      }

      const region = getRegionById(issue.primaryRegion);
      const regionLabel = region ? region.label : "Not provided";

      return `
        <article class="output-card">
          <h4>Issue ${index + 1}: ${escapeHtml(regionLabel)}</h4>

          <div class="output-block">
            <div class="output-header">
              <h5>AI Prompt</h5>
              <button type="button" data-action="copy-output" data-issue-id="${issue.id}" data-output-field="aiPrompt">Copy</button>
            </div>
            <textarea data-action="edit-output" data-issue-id="${issue.id}" data-output-field="aiPrompt">${escapeHtml(
        output.aiPrompt
      )}</textarea>
          </div>

          <div class="output-block">
            <div class="output-header">
              <h5>Doctor Summary</h5>
              <button type="button" data-action="copy-output" data-issue-id="${issue.id}" data-output-field="doctorSummary">Copy</button>
            </div>
            <textarea data-action="edit-output" data-issue-id="${issue.id}" data-output-field="doctorSummary">${escapeHtml(
        output.doctorSummary
      )}</textarea>
          </div>
        </article>
      `;
    })
    .join("");

  return `
    <section class="panel outputs-panel" id="outputs">
      <div class="outputs-topbar">
        <h3>Generated Templates (Editable)</h3>
        <button type="button" data-action="download-all">Download TXT Bundle</button>
      </div>
      ${blocks}
    </section>
  `;
}

function render() {
  const issue = selectedIssue();
  const validation = validateState(state);
  const canGenerate = validation.canGenerate;

  appRoot.innerHTML = `
    <div class="page-bg"></div>
    <main class="app-shell">
      <div class="corner-placeholder" title="${escapeHtml(MODEL_PLACEHOLDER_TEXT)}">
        <span>Experimental model</span>
        <span class="info-bubble">i</span>
      </div>

      <header class="hero">
        <h1>Meet My Symptom</h1>
        <p>Describe pain clearly for AI chats and doctor visits. This tool does not diagnose.</p>
      </header>

      <section class="panel notice-panel">
        <h2>Important Notice</h2>
        <p>${escapeHtml(DISCLAIMER_TEXT)}</p>
        <p class="caregiver-note">${escapeHtml(CAREGIVER_NOTE)}</p>
      </section>

      <section class="panel">
        <h2>Profile</h2>
        <div class="field-row">
          <div>
            <label>Intake mode</label>
            <div class="inline-options">
              <label><input type="radio" name="mode" value="single_issue" data-action="set-mode" ${
                state.mode === "single_issue" ? "checked" : ""
              }/> Single issue</label>
              <label><input type="radio" name="mode" value="multi_issue" data-action="set-mode" ${
                state.mode === "multi_issue" ? "checked" : ""
              }/> Multi-issue (up to 3)</label>
            </div>
          </div>

          <div>
            <label>Body map type (required)</label>
            <div class="inline-options">
              <label><input type="radio" name="bodyMapType" value="male" data-profile-field="bodyMapType" ${
                state.profile.bodyMapType === "male" ? "checked" : ""
              }/> Male map</label>
              <label><input type="radio" name="bodyMapType" value="female" data-profile-field="bodyMapType" ${
                state.profile.bodyMapType === "female" ? "checked" : ""
              }/> Female map</label>
            </div>
          </div>
        </div>

        <div class="field-row">
          <label>
            Age (optional)
            <input type="text" value="${escapeHtml(state.profile.age)}" data-profile-field="age" placeholder="e.g. 34" />
          </label>

          <div>
            <label>Height (optional)</label>
            <div class="height-controls">
              <select data-profile-field="heightUnit">
                <option value="cm" ${state.profile.height.unit === "cm" ? "selected" : ""}>cm</option>
                <option value="ft_in" ${state.profile.height.unit === "ft_in" ? "selected" : ""}>ft + in</option>
              </select>
              ${
                state.profile.height.unit === "cm"
                  ? `<input type="number" min="0" step="1" placeholder="cm" value="${escapeHtml(
                      state.profile.height.cmValue
                    )}" data-profile-field="heightCm" />`
                  : `<input type="number" min="0" step="1" placeholder="ft" value="${escapeHtml(
                      state.profile.height.feet
                    )}" data-profile-field="heightFeet" />
                     <input type="number" min="0" max="11" step="1" placeholder="in" value="${escapeHtml(
                       state.profile.height.inches
                     )}" data-profile-field="heightInches" />`
              }
            </div>
            <p class="mini-help">Current height: ${escapeHtml(heightLabel(state.profile))}</p>
          </div>
        </div>
      </section>

      <section class="panel">
        <div class="issues-topbar">
          <h2>Issues</h2>
          ${
            state.mode === "multi_issue"
              ? `<button type="button" data-action="add-issue" ${state.issues.length >= 3 ? "disabled" : ""}>Add issue</button>`
              : ""
          }
        </div>

        <div class="issue-tabs">
          ${state.issues
            .map((item, index) => {
              const active = item.id === issue.id;
              return `<button type="button" class="issue-tab ${active ? "issue-tab-active" : ""}" data-action="select-issue" data-issue-id="${
                item.id
              }">Issue ${index + 1}</button>`;
            })
            .join("")}
        </div>

        ${
          state.mode === "multi_issue" && state.issues.length > 1
            ? `<div class="remove-row"><button type="button" data-action="remove-issue" data-issue-id="${issue.id}">Remove current issue</button></div>`
            : ""
        }
      </section>

      <section class="panel">
        <h2>Location Selection</h2>
        <div class="inline-options">
          <button type="button" data-action="set-view" data-view="front" class="${
            state.ui.bodyView === "front" ? "pill-active" : ""
          }">Front</button>
          <button type="button" data-action="set-view" data-view="back" class="${
            state.ui.bodyView === "back" ? "pill-active" : ""
          }">Back</button>
        </div>
        <div class="map-layout">
          ${renderMap(state.ui.bodyView, issue)}
          ${renderSubregionPanel(issue)}
        </div>
      </section>

      <section class="panel">
        <h2>Issue Details</h2>

        <label>
          Pain severity (required): <strong>${issue.severity0to10}/10</strong>
          <input type="range" min="0" max="10" step="1" value="${issue.severity0to10}" data-issue-field="severity0to10" data-issue-id="${issue.id}" />
        </label>

        <div class="field-row">
          <label>
            Onset (required)
            <select data-issue-field="onset" data-issue-id="${issue.id}">
              <option value="">Select</option>
              ${ONSET_OPTIONS.map(
                (value) =>
                  `<option value="${escapeHtml(value)}" ${issue.onset === value ? "selected" : ""}>${escapeHtml(
                    value
                  )}</option>`
              ).join("")}
            </select>
          </label>

          <label>
            Duration (required)
            <select data-issue-field="duration" data-issue-id="${issue.id}">
              <option value="">Select</option>
              ${DURATION_OPTIONS.map(
                (value) =>
                  `<option value="${escapeHtml(value)}" ${issue.duration === value ? "selected" : ""}>${escapeHtml(
                    value
                  )}</option>`
              ).join("")}
            </select>
          </label>

          <label>
            Pattern (required)
            <select data-issue-field="pattern" data-issue-id="${issue.id}">
              <option value="">Select</option>
              ${PATTERN_OPTIONS.map(
                (value) =>
                  `<option value="${escapeHtml(value)}" ${issue.pattern === value ? "selected" : ""}>${escapeHtml(
                    value
                  )}</option>`
              ).join("")}
            </select>
          </label>
        </div>

        <h3>Pain descriptors (required)</h3>
        ${renderChecklist("descriptors", PAIN_DESCRIPTORS, issue.descriptors, issue.id)}

        <h3>Triggers (optional)</h3>
        ${renderChecklist("triggers", TRIGGER_OPTIONS, issue.triggers, issue.id)}

        <h3>Relievers (optional)</h3>
        ${renderChecklist("relievers", RELIEVER_OPTIONS, issue.relievers, issue.id)}

        <h3>Related pain effects (optional)</h3>
        ${renderChecklist("painEffects", PAIN_EFFECT_OPTIONS, issue.painEffects, issue.id)}

        <h3>Context (optional)</h3>
        <div class="inline-options context-options">
          <label><input type="checkbox" data-context-field="medsTried" data-issue-id="${issue.id}" ${
            issue.context.medsTried ? "checked" : ""
          } /> Medication tried</label>
          <label><input type="checkbox" data-context-field="priorInjury" data-issue-id="${issue.id}" ${
            issue.context.priorInjury ? "checked" : ""
          } /> Prior injury in area</label>
          <label><input type="checkbox" data-context-field="chronicCondition" data-issue-id="${issue.id}" ${
            issue.context.chronicCondition ? "checked" : ""
          } /> Chronic condition</label>
        </div>

        <div class="field-row">
          <label>
            User goal (optional)
            <input type="text" value="${escapeHtml(issue.userGoal)}" data-issue-field="userGoal" data-issue-id="${issue.id}" placeholder="e.g. prepare focused questions" />
          </label>

          <label>
            Additional notes (optional)
            <textarea data-issue-field="notes" data-issue-id="${issue.id}" rows="3" placeholder="Anything else helpful">${escapeHtml(
    issue.notes
  )}</textarea>
          </label>
        </div>

        <label>
          Context note (optional)
          <textarea data-context-field="note" data-issue-id="${issue.id}" rows="3" placeholder="Medication timing, prior episode details, etc.">${escapeHtml(
    issue.context.note
  )}</textarea>
        </label>

        <label>
          Custom text (optional, included verbatim)
          <textarea data-issue-field="customText" data-issue-id="${issue.id}" rows="4" placeholder="This text will be copied exactly into the templates.">${escapeHtml(
    issue.customText
  )}</textarea>
        </label>
      </section>

      <section class="panel generation-panel">
        <h2>Generate Templates</h2>
        ${renderValidation(validation)}
        <button type="button" data-action="generate" ${canGenerate ? "" : "disabled"}>Generate AI + Doctor Templates</button>
        ${noticeMessage ? `<p class="notice-message">${escapeHtml(noticeMessage)}</p>` : ""}
      </section>

      ${renderOutputs()}
    </main>
  `;
}

function issueById(issueId) {
  return state.issues.find((item) => item.id === issueId);
}

function toggleArrayValue(values, value, checked) {
  const set = new Set(values);
  if (checked) {
    set.add(value);
  } else {
    set.delete(value);
  }
  return [...set];
}

function handleClick(event) {
  const actionElement = event.target.closest("[data-action]");
  if (!actionElement) {
    return;
  }

  const action = actionElement.dataset.action;

  if (action === "set-mode") {
    const mode = actionElement.value;
    updateState((draft) => {
      draft.mode = mode;
      if (mode === "single_issue" && draft.issues.length > 1) {
        draft.issues = [draft.issues[0]];
        draft.ui.selectedIssueId = draft.issues[0].id;
      }
    });
    return;
  }

  if (action === "add-issue") {
    updateState((draft) => {
      if (draft.mode !== "multi_issue") {
        draft.mode = "multi_issue";
      }
      addIssue(draft);
    });
    return;
  }

  if (action === "remove-issue") {
    const issueId = actionElement.dataset.issueId;
    updateState((draft) => {
      removeIssue(draft, issueId);
    });
    return;
  }

  if (action === "select-issue") {
    const issueId = actionElement.dataset.issueId;
    updateState(
      (draft) => {
        draft.ui.selectedIssueId = issueId;
      },
      { resetOutputs: false }
    );
    return;
  }

  if (action === "set-view") {
    const view = actionElement.dataset.view;
    updateState(
      (draft) => {
        draft.ui.bodyView = view;
      },
      { resetOutputs: false }
    );
    return;
  }

  if (action === "select-region") {
    const regionId = actionElement.dataset.regionId;
    updateState((draft) => {
      const issue = draft.issues.find((item) => item.id === draft.ui.selectedIssueId);
      if (!issue) {
        return;
      }
      issue.primaryRegion = regionId;
      issue.subregion = "";
    });
    return;
  }

  if (action === "select-subregion") {
    const subregion = actionElement.dataset.subregion;
    updateState((draft) => {
      const issue = draft.issues.find((item) => item.id === draft.ui.selectedIssueId);
      if (!issue) {
        return;
      }
      issue.subregion = subregion;
    });
    return;
  }

  if (action === "generate") {
    const validation = validateState(state);
    if (!validation.canGenerate) {
      setNotice("Complete required fields before generating templates.");
      return;
    }

    updateState(
      (draft) => {
        draft.outputs = generateOutputs(draft);
      },
      { resetOutputs: false }
    );

    return;
  }

  if (action === "copy-output") {
    const issueId = actionElement.dataset.issueId;
    const field = actionElement.dataset.outputField;
    const issueOutput = state.outputs?.byIssue?.[issueId];
    const text = issueOutput?.[field];
    if (!text) {
      return;
    }

    copyToClipboard(text)
      .then(() => setNotice("Template copied to clipboard."))
      .catch(() => setNotice("Clipboard not available. Copy manually."));
    return;
  }

  if (action === "download-all") {
    downloadBundle();
  }
}

function handleChange(event) {
  const { target } = event;

  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.dataset.profileField) {
    const field = target.dataset.profileField;
    updateState((draft) => {
      if (field === "bodyMapType") {
        draft.profile.bodyMapType = target.value;
      }
      if (field === "age") {
        draft.profile.age = target.value;
      }
      if (field === "heightUnit") {
        draft.profile.height.unit = target.value;
      }
      if (field === "heightCm") {
        draft.profile.height.cmValue = target.value;
      }
      if (field === "heightFeet") {
        draft.profile.height.feet = target.value;
      }
      if (field === "heightInches") {
        draft.profile.height.inches = target.value;
      }
    });
    return;
  }

  if (target.dataset.issueField) {
    const issueId = target.dataset.issueId || state.ui.selectedIssueId;
    const field = target.dataset.issueField;

    updateState((draft) => {
      const issue = draft.issues.find((item) => item.id === issueId);
      if (!issue) {
        return;
      }

      if (field === "severity0to10") {
        issue.severity0to10 = Number.parseInt(target.value, 10);
      } else {
        issue[field] = target.value;
      }
    });
    return;
  }

  if (target.dataset.arrayField) {
    const issueId = target.dataset.issueId || state.ui.selectedIssueId;
    const field = target.dataset.arrayField;

    updateState((draft) => {
      const issue = draft.issues.find((item) => item.id === issueId);
      if (!issue) {
        return;
      }
      issue[field] = toggleArrayValue(issue[field], target.value, target.checked);
    });
    return;
  }

  if (target.dataset.contextField) {
    const issueId = target.dataset.issueId || state.ui.selectedIssueId;
    const field = target.dataset.contextField;

    updateState((draft) => {
      const issue = draft.issues.find((item) => item.id === issueId);
      if (!issue) {
        return;
      }

      if (field === "note") {
        issue.context.note = target.value;
      } else {
        issue.context[field] = target.checked;
      }
    });
    return;
  }
}

function handleInput(event) {
  const { target } = event;
  if (!(target instanceof HTMLElement)) {
    return;
  }

  if (target.dataset.action === "edit-output") {
    const issueId = target.dataset.issueId;
    const field = target.dataset.outputField;
    if (!state.outputs || !state.outputs.byIssue[issueId]) {
      return;
    }
    state.outputs.byIssue[issueId][field] = target.value;
    saveState(state);
  }
}

async function copyToClipboard(text) {
  if (navigator.clipboard?.writeText) {
    return navigator.clipboard.writeText(text);
  }

  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
}

function downloadBundle() {
  if (!state.outputs) {
    setNotice("Generate templates before downloading.");
    return;
  }

  const chunks = [];
  state.issues.forEach((issue, index) => {
    const output = state.outputs.byIssue[issue.id];
    if (!output) {
      return;
    }
    const region = getRegionById(issue.primaryRegion);
    chunks.push(`Issue ${index + 1}: ${region ? region.label : "Not provided"}`);
    chunks.push("\n=== AI Prompt ===\n");
    chunks.push(output.aiPrompt);
    chunks.push("\n\n=== Doctor Summary ===\n");
    chunks.push(output.doctorSummary);
    chunks.push("\n\n----------------------------------------\n\n");
  });

  const blob = new Blob([chunks.join("")], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = "meet-my-symptom-templates.txt";
  anchor.click();
  URL.revokeObjectURL(url);

  setNotice("TXT bundle downloaded.");
}

if (issueById(state.ui.selectedIssueId) === undefined) {
  state.ui.selectedIssueId = state.issues[0].id;
  saveState(state);
}
