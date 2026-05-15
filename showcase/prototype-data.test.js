const test = require("node:test");
const assert = require("node:assert/strict");

const {
  getRoutes,
  runKnowledgeTest,
  summarizePublishImpact,
  shouldEscalateConversation,
  workbenchConversations,
} = require("./prototype-data.js");

test("routes cover the required product surfaces", () => {
  const ids = getRoutes().map((route) => route.id);

  assert.deepEqual(ids, [
    "home",
    "experience-chat",
    "experience-embed",
    "console-overview",
    "workspace",
  ]);
});

test("knowledge test hits FAQ content for return-policy questions", () => {
  const result = runKnowledgeTest("商品有问题怎么退货退款？");

  assert.equal(result.found, true);
  assert.equal(result.source.type, "faq");
  assert.match(result.citation, /售后政策/);
});

test("knowledge test hits product or document content for laptop shopping questions", () => {
  const result = runKnowledgeTest("3000 预算内有没有适合办公的轻薄本推荐？");

  assert.equal(result.found, true);
  assert.ok(["document", "product"].includes(result.source.type));
  assert.ok(result.targets.includes("experience-chat"));
});

test("publish impact summarizes affected surfaces from changed knowledge sources", () => {
  const impact = summarizePublishImpact(["faq-return-policy", "product-macbook-air"]);

  assert.deepEqual(impact, ["experience-chat", "experience-embed", "workspace"]);
});

test("high-risk after-sale conversations are escalated while regular product inquiries are not", () => {
  const riskyConversation = workbenchConversations.find((item) => item.id === "conv-after-sale");
  const safeConversation = workbenchConversations.find((item) => item.id === "conv-macbook-tech");

  assert.equal(shouldEscalateConversation(riskyConversation), true);
  assert.equal(shouldEscalateConversation(safeConversation), false);
});
