export function createIssue(id) {
  return {
    id,
    primaryRegion: "",
    subregion: "",
    descriptors: [],
    severity0to10: 5,
    onset: "",
    duration: "",
    pattern: "",
    triggers: [],
    relievers: [],
    painEffects: [],
    notes: "",
    userGoal: "",
    context: {
      medsTried: false,
      priorInjury: false,
      chronicCondition: false,
      note: ""
    },
    customText: ""
  };
}

export function nextIssueId(issues) {
  const maxId = issues.reduce((currentMax, issue) => {
    const match = issue.id.match(/^issue-(\d+)$/);
    if (!match) {
      return currentMax;
    }
    return Math.max(currentMax, Number.parseInt(match[1], 10));
  }, 0);

  return `issue-${maxId + 1}`;
}
