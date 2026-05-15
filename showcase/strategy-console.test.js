const test = require("node:test");
const assert = require("node:assert/strict");

const { getStrategyConsoleData } = require("./strategy-console-data.js");
const {
  createStrategyConsoleState,
  focusRiskCard,
  getFocusedRiskCardView,
  getMergedRiskRuleView,
  getReleaseReadiness,
  getReleaseSummary,
  publishStrategyDraft,
  runValidationScenario,
  selectStrategySection,
  updateDraftRule,
} = require("./strategy-console.js");

function getSetup() {
  const data = getStrategyConsoleData();
  const riskSection = data.sections.find((section) => section.id === "risk");
  const validationSection = data.sections.find((section) => section.id === "validation");
  const afterSale = riskSection.cards.find((card) => card.id === "after-sale");

  return {
    data,
    riskCardId: afterSale.id,
    ruleId: afterSale.change.id,
    scenarioIds: validationSection.scenarios.map((scenario) => scenario.id),
  };
}

test("state initializes on overview with clean draft data", () => {
  const { data, scenarioIds } = getSetup();
  const state = createStrategyConsoleState(data);

  assert.equal(state.sectionId, "overview");
  assert.equal(state.draft.isDirty, false);
  assert.deepEqual(state.validation.remainingScenarioIds, scenarioIds);
});

test("section selection and focus helpers expose UI-ready views", () => {
  const { data, riskCardId, ruleId } = getSetup();
  const state = createStrategyConsoleState(data);
  const selected = selectStrategySection(state, "knowledge");
  const focused = focusRiskCard(selected, riskCardId);
  const focusedView = getFocusedRiskCardView(focused);

  assert.equal(selected.sectionId, "knowledge");
  assert.equal(focused.sectionId, "risk");
  assert.equal(focusedView.rule.id, ruleId);
});

test("draft updates derive release summaries from the merged rule view", () => {
  const { data, ruleId } = getSetup();
  const state = createStrategyConsoleState(data);
  const updated = updateDraftRule(state, ruleId, {
    label: "升级到售后专席",
    valueText: "上升 24%",
    effect: "所有退款关键词先走售后人工队列。",
  });

  const merged = getMergedRiskRuleView(updated, ruleId);
  const summary = getReleaseSummary(updated);

  assert.equal(updated.draft.isDirty, true);
  assert.equal(merged.label, "升级到售后专席");
  assert.equal(summary[0].valueText, "上升 24%");
});

test("saving a new draft invalidates previous validation progress", () => {
  const { data, ruleId, scenarioIds } = getSetup();
  const state = createStrategyConsoleState(data);
  const validated = runValidationScenario(state, scenarioIds[0]);
  const updated = updateDraftRule(validated, ruleId, {
    valueText: "上升 11%",
  });

  assert.deepEqual(updated.validation.completedScenarioIds, []);
  assert.equal(updated.validation.scenarios.every((item) => item.status === "pending"), true);
});

test("publish readiness requires draft changes and completed validation", () => {
  const { data, ruleId, scenarioIds } = getSetup();
  const initial = createStrategyConsoleState(data);
  const staged = updateDraftRule(initial, ruleId, {
    valueText: "上升 11%",
  });
  const readyState = scenarioIds.reduce((current, scenarioId) => runValidationScenario(current, scenarioId), staged);

  assert.equal(getReleaseReadiness(initial).canPublish, false);
  assert.equal(getReleaseReadiness(readyState).canPublish, true);
});

test("publishing merges patches into the source data and resets draft state", () => {
  const { data, ruleId, scenarioIds } = getSetup();
  const initial = createStrategyConsoleState(data);
  const staged = updateDraftRule(initial, ruleId, {
    label: "转售后复核",
    valueText: "上升 22%",
    effect: "退款语义先转人工，再展示规则依据。",
  });
  const readyState = scenarioIds.reduce((current, scenarioId) => runValidationScenario(current, scenarioId), staged);
  const published = publishStrategyDraft(readyState, {
    publishedAt: "2026-05-15T10:00:00+08:00",
  });

  const riskSection = published.data.sections.find((section) => section.id === "risk");
  const afterSale = riskSection.cards.find((card) => card.id === "after-sale");

  assert.equal(published.data.header.state.id, "published");
  assert.equal(afterSale.action.label, "转售后复核");
  assert.equal(afterSale.change.valueText, "上升 22%");
  assert.equal(published.draft.isDirty, false);
});
