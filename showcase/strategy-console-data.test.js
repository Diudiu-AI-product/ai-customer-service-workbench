const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getStrategyConsoleData,
  getStrategySectionById,
  getStrategyConsoleBrowserApi,
} = require("./strategy-console-data.js");

test("strategy console data exposes the expected sections", () => {
  const data = getStrategyConsoleData();
  const ids = data.sections.map((section) => section.id);

  assert.deepEqual(ids, ["overview", "risk", "knowledge", "validation", "release"]);
  assert.equal(data.header.id, "strategy-console");
  assert.equal(getStrategySectionById(data, "risk").cards.length > 0, true);
  assert.equal(getStrategySectionById(data, "validation").scenarios.length, 3);
});

test("strategy console data is cloned on every access", () => {
  const first = getStrategyConsoleData();
  first.sections[1].cards[0].action.label = "mutated";

  const second = getStrategyConsoleData();

  assert.equal(getStrategySectionById(second, "risk").cards[0].action.label, "路由到售后人工组");
});

test("browser API is frozen and contains the public getters", () => {
  const api = getStrategyConsoleBrowserApi();

  assert.equal(Object.isFrozen(api), true);
  assert.deepEqual(Object.keys(api).sort(), [
    "getStrategyConsoleData",
    "getStrategySectionById",
  ]);
});
