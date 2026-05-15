const routes = [
  { id: "home", section: "product", label: "首页" },
  { id: "experience-chat", section: "experience", label: "在线体验" },
  { id: "experience-embed", section: "experience", label: "嵌入组件" },
  { id: "console-overview", section: "console", label: "控制台" },
  { id: "workspace", section: "operations", label: "客服工作台" },
];

const knowledgeSources = [
  {
    id: "faq-return-policy",
    type: "faq",
    title: "退货政策",
    summary: "支持 7 天无理由退货，售后争议需人工接管处理。",
    status: "indexed",
    updatedAt: "2026-05-12 10:05",
    indexState: "ready",
    targets: ["experience-chat", "experience-embed", "workspace"],
    keywords: ["退货", "退款", "售后", "退", "无理由"],
    citation: "FAQ / 售后政策 / 条目 12",
  },
  {
    id: "faq-shipping",
    type: "faq",
    title: "发货与时效",
    summary: "工作日 16:00 前付款的订单优先当日发出，顺丰需视库存与地址确认。",
    status: "indexed",
    updatedAt: "2026-05-12 09:40",
    indexState: "ready",
    targets: ["experience-chat", "experience-embed"],
    keywords: ["发货", "时效", "顺丰", "多久", "几天"],
    citation: "FAQ / 发货说明 / 条目 03",
  },
  {
    id: "doc-laptop-guide",
    type: "document",
    title: "轻薄本选购指南",
    summary: "用于对比办公场景、预算区间与核心配置，适合导购类提问。",
    status: "indexed",
    updatedAt: "2026-05-12 08:55",
    indexState: "ready",
    targets: ["experience-chat", "experience-embed"],
    keywords: ["轻薄本", "办公", "笔记本", "学习", "配置"],
    citation: "文档 / 导购资料 / 轻薄本指南",
  },
  {
    id: "product-macbook-air",
    type: "product",
    title: "MacBook Air M1 商品资料",
    summary: "国行版，适合办公与学习场景，电池循环和成色信息已同步。",
    status: "indexed",
    updatedAt: "2026-05-12 10:18",
    indexState: "ready",
    targets: ["experience-chat", "experience-embed", "workspace"],
    keywords: ["macbook", "air", "国行", "电池", "办公"],
    citation: "商品知识 / MacBook Air M1 / 详情页摘要",
  },
  {
    id: "product-redmi-book",
    type: "product",
    title: "Redmi Book 商品资料",
    summary: "重点展示 3000 元预算内的轻薄本推荐、发货时效和优惠策略。",
    status: "indexed",
    updatedAt: "2026-05-12 10:21",
    indexState: "ready",
    targets: ["experience-chat", "experience-embed", "workspace"],
    keywords: ["3000", "轻薄本", "redmi", "小米", "预算"],
    citation: "商品知识 / Redmi Book / 运营标签",
  },
];

const workbenchConversations = [
  {
    id: "conv-iphone-price",
    customer: "林同学",
    intent: "price",
    risk: "medium",
    requiresHuman: false,
    title: "iPhone 13 议价会话",
    status: "待发送 AI 建议",
    queue: "价格协商",
    waitTime: "08 分钟",
    sla: "剩余 10 分钟",
    summary: "用户追问最低价，系统建议保留议价空间并补充库存信息。",
    suggestedReply: "价格已经压到比较实在了，如果你今天确定，我可以优先帮你安排并补发细节图。",
    messages: [
      ["user", "最低还能少一点吗？我看别家也有差不多的。"],
      ["assistant", "这边已经接近底价了，如果你今天确定，我可以帮你优先安排。"],
    ],
  },
  {
    id: "conv-macbook-tech",
    customer: "周先生",
    intent: "tech",
    risk: "low",
    requiresHuman: false,
    title: "MacBook Air 参数咨询",
    status: "AI 可直接处理",
    queue: "商品咨询",
    waitTime: "03 分钟",
    sla: "剩余 22 分钟",
    summary: "用户咨询国行、电池循环和办公性能，适合知识库与商品资料联合回答。",
    suggestedReply: "这台是国行版，办公、学习和轻度剪辑都够用，电池循环和成色信息我也可以继续发你确认。",
    messages: [
      ["user", "这台是不是国行？电池循环多少次，办公会不会卡？"],
      ["assistant", "是国行版本，办公和学习都够用，我可以继续给你电池循环和成色细节。"],
    ],
  },
  {
    id: "conv-after-sale",
    customer: "阿青",
    intent: "after_sale",
    risk: "high",
    requiresHuman: true,
    title: "售后异常会话",
    status: "人工处理中",
    queue: "售后争议",
    waitTime: "13 分钟",
    sla: "剩余 04 分钟",
    summary: "涉及售后异常与站外引导，必须人工处理并保持站内沟通。",
    suggestedReply: "该会话已进入人工接管流程，建议先确认订单状态与售后规则。",
    messages: [
      ["user", "我这边拍完后系统显示异常，能不能退？"],
      ["user", "要不要我加你微信说，会快一点。"],
    ],
  },
];

function getRoutes() {
  return routes.map((route) => ({ ...route }));
}

function runKnowledgeTest(query) {
  const normalized = String(query || "").trim().toLowerCase();
  if (!normalized) {
    return {
      found: false,
      source: null,
      citation: null,
      excerpt: "请输入测试问题，系统会返回最相关的 FAQ、文档或商品知识。",
      gapReason: "empty-query",
    };
  }

  const match = knowledgeSources
    .map((source) => ({
      source,
      score: source.keywords.reduce((count, keyword) => {
        return normalized.includes(keyword.toLowerCase()) ? count + 1 : count;
      }, 0),
    }))
    .sort((a, b) => b.score - a.score)[0];

  if (!match || match.score === 0) {
    return {
      found: false,
      source: null,
      citation: null,
      excerpt: "当前没有直接命中的知识条目，建议补充 FAQ 或文档内容。",
      gapReason: "no-match",
    };
  }

  return {
    found: true,
    source: {
      id: match.source.id,
      type: match.source.type,
      title: match.source.title,
    },
    citation: match.source.citation,
    excerpt: match.source.summary,
    targets: [...match.source.targets],
  };
}

function summarizePublishImpact(sourceIds) {
  const ids = Array.isArray(sourceIds) ? sourceIds : [];
  const targets = new Set();

  knowledgeSources.forEach((source) => {
    if (ids.includes(source.id)) {
      source.targets.forEach((target) => targets.add(target));
    }
  });

  return Array.from(targets).sort();
}

function shouldEscalateConversation(conversation) {
  if (!conversation) {
    return false;
  }

  return conversation.requiresHuman === true || conversation.risk === "high" || conversation.intent === "after_sale";
}

const api = {
  getRoutes,
  knowledgeSources,
  runKnowledgeTest,
  summarizePublishImpact,
  shouldEscalateConversation,
  workbenchConversations,
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = api;
}

if (typeof window !== "undefined") {
  window.prototypeData = api;
}
