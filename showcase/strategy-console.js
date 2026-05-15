const STRATEGY_SECTION_IDS = Object.freeze({
  overview: "overview",
  risk: "risk",
  knowledge: "knowledge",
  validation: "validation",
  release: "release",
});

const SAFE_RULE_PATCH_KEYS = Object.freeze(["label", "valueText", "effect"]);

const cloneStrategyState = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const freezeList = (items) => Object.freeze(items.slice());

function buildSectionIndex(data) {
  const sectionsById = Object.create(null);

  for (const section of data.sections ?? []) {
    sectionsById[section.id] = section;
  }

  return sectionsById;
}

function buildRiskCardIndex(sectionsById) {
  const cardsById = Object.create(null);
  const riskSection = sectionsById[STRATEGY_SECTION_IDS.risk];

  for (const card of riskSection?.cards ?? []) {
    cardsById[card.id] = card;
  }

  return cardsById;
}

function buildRuleCatalog(sectionsById) {
  const rulesById = Object.create(null);
  const riskSection = sectionsById[STRATEGY_SECTION_IDS.risk];

  for (const card of riskSection?.cards ?? []) {
    rulesById[card.change.id] = {
      id: card.change.id,
      sectionId: STRATEGY_SECTION_IDS.risk,
      sourceId: card.id,
      label: card.action.label,
      valueText: card.change.valueText,
      effect: card.impact,
      severity: card.severity,
    };
  }

  return rulesById;
}

function buildValidationState(sectionsById) {
  const scenarios = cloneStrategyState(sectionsById[STRATEGY_SECTION_IDS.validation]?.scenarios ?? []);
  const scenarioIds = scenarios.map((scenario) => scenario.id);

  return {
    scenarios: scenarios.map((scenario) => ({
      ...scenario,
      status: "pending",
    })),
    completedScenarioIds: freezeList([]),
    remainingScenarioIds: freezeList(scenarioIds),
    completedCount: 0,
    totalScenarioCount: scenarioIds.length,
  };
}

function createStrategyConsoleState(data) {
  if (!data || !Array.isArray(data.sections)) {
    throw new TypeError("createStrategyConsoleState expects strategy console data");
  }

  const clonedData = cloneStrategyState(data);
  const sectionsById = buildSectionIndex(clonedData);

  return {
    data: clonedData,
    sectionId: STRATEGY_SECTION_IDS.overview,
    sectionsById,
    riskCardsById: buildRiskCardIndex(sectionsById),
    rulesById: buildRuleCatalog(sectionsById),
    draft: {
      isDirty: false,
      updatedRuleIds: freezeList([]),
      rulePatches: Object.create(null),
    },
    focusedRiskRuleId: null,
    validation: buildValidationState(sectionsById),
  };
}

function selectStrategySection(state, sectionId) {
  if (!state?.sectionsById?.[sectionId]) {
    return state;
  }

  return {
    ...state,
    sectionId,
  };
}

function focusRiskCard(state, cardId) {
  const card = state?.riskCardsById?.[cardId] ?? null;
  const ruleId = card?.change?.id ?? null;

  if (!ruleId) {
    return state;
  }

  return {
    ...state,
    sectionId: STRATEGY_SECTION_IDS.risk,
    focusedRiskRuleId: ruleId,
  };
}

function getMergedRiskRuleView(state, ruleId) {
  const baseRule = state?.rulesById?.[ruleId];
  if (!baseRule) {
    return null;
  }

  const patch = state?.draft?.rulePatches?.[ruleId] ?? {};
  return {
    ...baseRule,
    ...patch,
  };
}

function getFocusedRiskCardView(state) {
  const focusedRuleId = state?.focusedRiskRuleId ?? null;
  if (!focusedRuleId) {
    return null;
  }

  const mergedRule = getMergedRiskRuleView(state, focusedRuleId);
  if (!mergedRule) {
    return null;
  }

  const card = state?.riskCardsById?.[mergedRule.sourceId] ?? null;
  if (!card) {
    return null;
  }

  return {
    card,
    rule: mergedRule,
    cardId: card.id,
    ruleId: mergedRule.id,
    sectionId: STRATEGY_SECTION_IDS.risk,
  };
}

function getReleaseSummary(state) {
  return state.draft.updatedRuleIds
    .map((ruleId) => {
      const mergedRule = getMergedRiskRuleView(state, ruleId);
      if (!mergedRule) {
        return null;
      }

      return {
        id: mergedRule.id,
        sourceId: mergedRule.sourceId,
        sectionId: mergedRule.sectionId,
        label: mergedRule.label,
        valueText: mergedRule.valueText,
        effect: mergedRule.effect,
        severity: mergedRule.severity,
      };
    })
    .filter(Boolean);
}

function updateDraftRule(state, ruleId, patch) {
  const currentRule = state?.rulesById?.[ruleId] ?? null;
  if (!currentRule) {
    return state;
  }

  const sanitizedPatch = Object.create(null);

  for (const key of SAFE_RULE_PATCH_KEYS) {
    if (Object.prototype.hasOwnProperty.call(patch ?? {}, key)) {
      sanitizedPatch[key] = cloneStrategyState(patch[key]);
    }
  }

  if (Object.keys(sanitizedPatch).length === 0) {
    return state;
  }

  const updatedRuleIds = new Set(state.draft.updatedRuleIds);
  updatedRuleIds.add(ruleId);

  return {
    ...state,
    draft: {
      isDirty: true,
      updatedRuleIds: freezeList(Array.from(updatedRuleIds)),
      rulePatches: {
        ...state.draft.rulePatches,
        [ruleId]: {
          ...(state.draft.rulePatches[ruleId] ?? {}),
          ...sanitizedPatch,
        },
      },
    },
    validation: buildValidationState(state.sectionsById),
  };
}

function runValidationScenario(state, scenarioId) {
  const scenario = state?.validation?.scenarios?.find((item) => item.id === scenarioId);
  if (!scenario) {
    return state;
  }

  const completedScenarioIds = new Set(state.validation.completedScenarioIds);
  completedScenarioIds.add(scenarioId);
  const completedScenarioList = Array.from(completedScenarioIds);
  const scenarios = state.validation.scenarios.map((item) =>
    item.id === scenarioId ? { ...item, status: "completed" } : item,
  );
  const remainingScenarioIds = scenarios.map((item) => item.id).filter((id) => !completedScenarioIds.has(id));

  return {
    ...state,
    validation: {
      ...state.validation,
      scenarios,
      completedScenarioIds: freezeList(completedScenarioList),
      remainingScenarioIds: freezeList(remainingScenarioIds),
      completedCount: completedScenarioList.length,
    },
  };
}

function getReleaseReadiness(state) {
  const hasDraftChanges = Boolean(state?.draft?.isDirty);
  const allScenariosComplete = (state?.validation?.remainingScenarioIds?.length ?? 0) === 0;
  const blockedBy = [];

  if (!hasDraftChanges) {
    blockedBy.push("draft-changes");
  }

  if (!allScenariosComplete) {
    blockedBy.push("validation-scenarios");
  }

  return {
    canPublish: blockedBy.length === 0,
    blockedBy: freezeList(blockedBy),
    hasDraftChanges,
    allScenariosComplete,
    completedScenarioCount: state?.validation?.completedCount ?? 0,
    totalScenarioCount: state?.validation?.totalScenarioCount ?? 0,
  };
}

function publishStrategyDraft(state, options = {}) {
  const readiness = getReleaseReadiness(state);
  if (!readiness.canPublish) {
    return state;
  }

  const nextData = cloneStrategyState(state.data);
  const riskSection = nextData.sections.find((section) => section.id === STRATEGY_SECTION_IDS.risk);
  const releaseSection = nextData.sections.find((section) => section.id === STRATEGY_SECTION_IDS.release);
  const publishedAt = options.publishedAt ?? new Date().toISOString();

  for (const summaryItem of getReleaseSummary(state)) {
    const card = riskSection?.cards?.find((item) => item.id === summaryItem.sourceId);
    if (!card) {
      continue;
    }

    card.action.label = summaryItem.label;
    card.change.valueText = summaryItem.valueText;
    card.impact = summaryItem.effect;
  }

  nextData.header.state = {
    id: "published",
    label: "已发布",
  };
  nextData.header.lastPublishedAt = publishedAt;
  nextData.header.updatedAt = publishedAt;

  if (releaseSection) {
    releaseSection.state = {
      id: "published",
      label: "已发布",
    };
  }

  const nextState = createStrategyConsoleState(nextData);

  return {
    ...nextState,
    sectionId: state.sectionId,
    validation: state.validation,
  };
}

const strategyConsoleApi = Object.freeze({
  SECTION_IDS: STRATEGY_SECTION_IDS,
  createStrategyConsoleState,
  selectStrategySection,
  focusRiskCard,
  updateDraftRule,
  runValidationScenario,
  getReleaseReadiness,
  getReleaseSummary,
  getMergedRiskRuleView,
  getFocusedRiskCardView,
  publishStrategyDraft,
});

if (typeof module !== "undefined" && module.exports) {
  module.exports = strategyConsoleApi;
}

if (typeof window !== "undefined") {
  window.StrategyConsoleState = strategyConsoleApi;
}
