const cloneStrategyConsoleData = (value) => {
  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value));
};

const strategyConsoleFixture = {
  header: {
    id: "strategy-console",
    title: "主管策略台",
    product: "AI 智能客服协同工作台",
    version: "v0.1.3",
    state: {
      id: "draft",
      label: "草稿",
    },
    owner: "客服平台主管",
    updatedAt: "2026-05-14T09:30:00+08:00",
    lastPublishedAt: null,
  },
  sections: [
    {
      id: "overview",
      title: "策略总览",
      description: "展示当前班次的核心经营信号、风险压力和策略状态。",
      period: "2026-05-14 09:00 - 18:00",
      kpis: [
        { id: "auto-reply-rate", label: "自动建议采纳率", value: 68, valueText: "68%", delta: 4.2, deltaText: "+4.2pp", trend: "up", format: "percent" },
        { id: "handoff-rate", label: "人工接管率", value: 12, valueText: "12%", delta: -1.8, deltaText: "-1.8pp", trend: "down", format: "percent" },
        { id: "sla-risk", label: "临近 SLA 会话", value: 9, valueText: "9", delta: -2, deltaText: "-2", trend: "down", format: "count" },
        { id: "after-sale-load", label: "售后压力会话", value: 14, valueText: "14", delta: 3, deltaText: "+3", trend: "up", format: "count" },
        { id: "knowledge-hit", label: "知识命中率", value: 81, valueText: "81%", delta: 1.5, deltaText: "+1.5pp", trend: "up", format: "percent" },
      ],
      notes: [
        "价格咨询仍可继续自动回复，但售后、退款和站外导流场景优先转人工。",
        "近期补充的售后知识正在生效，知识命中率和人工接管质量都有改善。",
      ],
    },
    {
      id: "risk",
      title: "风险与兜底",
      description: "把高风险会话、低置信度回复和负向情绪优先暴露出来。",
      summary: "当前最高风险集中在售后退款、情绪升级和站外沟通引导，主管应优先收紧兜底策略。",
      cards: [
        {
          id: "after-sale",
          label: "售后与退款",
          severity: { id: "high", label: "高" },
          state: { id: "handoff", label: "人工接管" },
          triggers: ["用户提到退款", "用户提到退货", "描述不符", "平台申诉"],
          impact: "容易触发纠纷升级，需要保持站内沟通并明确规则依据。",
          change: { id: "after-sale-up", direction: "up", value: 18, valueText: "上升 18%" },
          action: { id: "route-after-sale", label: "路由到售后人工组" },
        },
        {
          id: "low-confidence",
          label: "低置信度回复",
          severity: { id: "medium", label: "中" },
          state: { id: "review", label: "建议复核" },
          triggers: ["模型置信度低于阈值", "包含多意图表达"],
          impact: "容易输出模糊回复，影响转化和用户体验。",
          change: { id: "low-confidence-up", direction: "up", value: 7, valueText: "上升 7%" },
          action: { id: "require-evidence", label: "先补证据再回复" },
        },
        {
          id: "repeat-question",
          label: "重复追问",
          severity: { id: "medium", label: "中" },
          state: { id: "clarify", label: "先补充信息" },
          triggers: ["同一会话连续两次追问同一商品细节"],
          impact: "如果只重复话术，用户更容易继续压价或要求人工介入。",
          change: { id: "repeat-question-flat", direction: "flat", value: 0, valueText: "持平" },
          action: { id: "provide-parameters", label: "先给出明确参数" },
        },
        {
          id: "emotion-escalation",
          label: "情绪升级",
          severity: { id: "high", label: "高" },
          state: { id: "handoff", label: "立即转人工" },
          triggers: ["出现否定", "投诉", "讽刺", "强烈不满"],
          impact: "需要人工接手安抚，避免继续自动化扩大冲突。",
          change: { id: "emotion-escalation-up", direction: "up", value: 5, valueText: "上升 5%" },
          action: { id: "disable-auto-reply", label: "停用自动回复" },
        },
      ],
    },
    {
      id: "knowledge",
      title: "知识健康",
      description: "定位命中率低、过期和重复覆盖的知识热点。",
      summary: "当前最需要补强的是售后规则、成色解释、物流边界和价格协商口径。",
      hotspots: [
        { id: "after-sale-rules", label: "退款与售后规则", state: { id: "needs-update", label: "待补强" }, hitRate: 43, hitRateText: "43%", priority: 1, issue: "高频被问到，但现有知识卡片缺少可直接引用的流程说明。" },
        { id: "condition-explainer", label: "成色与细节图说明", state: { id: "needs-alignment", label: "待对齐" }, hitRate: 38, hitRateText: "38%", priority: 2, issue: "图片对比和成色口径不统一，容易引发重复追问。" },
        { id: "logistics-boundary", label: "发货时效与物流异常", state: { id: "stable", label: "稳定" }, hitRate: 31, hitRateText: "31%", priority: 3, issue: "用户经常问到发货时间、催单和物流延迟的边界话术。" },
        { id: "price-boundary", label: "价格协商口径", state: { id: "needs-update", label: "待补强" }, hitRate: 29, hitRateText: "29%", priority: 4, issue: "一口价与可议价边界不清，容易让回复前后不一致。" },
      ],
    },
    {
      id: "validation",
      title: "验证与回放",
      description: "通过样例会话检查策略调整是否安全可用。",
      scenarios: [
        { id: "scenario-after-sale", label: "售后异常会话", intent: { id: "after_sale", label: "售后异常" }, state: { id: "pass", label: "通过" }, expectedAction: { id: "handoff", label: "转人工" }, input: "这个跟描述不符，我要退款，能不能加你微信说？", expectation: "应立即转人工，并保留站内沟通和规则说明。" },
        { id: "scenario-price", label: "价格协商会话", intent: { id: "price", label: "价格协商" }, state: { id: "pass", label: "通过" }, expectedAction: { id: "auto-reply", label: "自动回复" }, input: "还能再便宜一点吗，别家同款更低。", expectation: "可自动回复，但要保留议价空间与库存信息。" },
        { id: "scenario-low-confidence", label: "低置信度追问", intent: { id: "product_info", label: "商品咨询" }, state: { id: "review", label: "复核" }, expectedAction: { id: "clarify", label: "补充信息" }, input: "这台具体是哪个版本？有没有边角磨损？", expectation: "先补充商品信息，再确认是否需要人工复核。" },
      ],
      checklist: [
        "风险会话是否优先进入人工队列",
        "售后问题是否命中 after-sale 场景",
        "知识热点是否能反映近期缺口",
      ],
    },
    {
      id: "release",
      title: "发布与影响",
      description: "确认本次草稿对关键业务域的影响后再发布。",
      state: { id: "draft", label: "草稿" },
      summary: {
        text: "本次更新重点是把售后与退款场景前置，减少自动回复误判。",
        impacts: [
          { id: "refund-after-sale", label: "退款与售后", severity: { id: "high", label: "高" }, effect: "提高人工接管率，降低站外沟通风险。" },
          { id: "price-negotiation", label: "价格协商", severity: { id: "medium", label: "中" }, effect: "保留自动回复能力，同时强化议价边界。" },
          { id: "knowledge-health", label: "知识健康", severity: { id: "medium", label: "中" }, effect: "优先补充高频售后和成色说明知识卡。" },
        ],
      },
      gates: ["草稿状态不自动发布", "验证场景全部通过后再进入灰度", "影响售后的改动必须可回滚"],
    },
  ],
};

function getStrategyConsoleData() {
  return cloneStrategyConsoleData(strategyConsoleFixture);
}

function getStrategySectionById(data, sectionId) {
  return data?.sections?.find((section) => section.id === sectionId);
}

function getStrategyConsoleBrowserApi() {
  return Object.freeze({
    getStrategyConsoleData,
    getStrategySectionById,
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    getStrategyConsoleData,
    getStrategySectionById,
    getStrategyConsoleBrowserApi,
  };
}

if (typeof window !== "undefined") {
  window.StrategyConsolePrototypeData = getStrategyConsoleBrowserApi();
}
