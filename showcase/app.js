(function () {
const {
  getRoutes,
  knowledgeSources,
  runKnowledgeTest,
  summarizePublishImpact,
  shouldEscalateConversation,
  workbenchConversations,
} = window.prototypeData;
const strategyConsoleDataApi = window.StrategyConsolePrototypeData;
const strategyConsoleStateApi = window.StrategyConsoleState;

const primaryNavEl = document.getElementById("primary-nav");
const railEl = document.getElementById("context-rail");
const appViewEl = document.getElementById("app-view");

const consoleRouteMap = {
  "console-overview": "overview",
  "console-setup": "risk",
  "console-knowledge": "knowledge",
  "console-ai": "validation",
  "console-publish": "release",
};

const consoleTabs = [
  { id: "overview", route: "console-overview", label: "概览" },
  { id: "setup", route: "console-setup", label: "Quick Setup" },
  { id: "knowledge", route: "console-knowledge", label: "知识源" },
  { id: "ai", route: "console-ai", label: "AI 配置" },
  { id: "publish", route: "console-publish", label: "发布与体验" },
];

const systemSettingsSections = [
  {
    id: "models",
    label: "模型路由",
    note: "主模型、兜底模型与推理策略",
    title: "模型与回复路由",
    description: "负责控制 AI 用哪套模型回复、何时降级、何时切换到更保守的安全模型。",
    metrics: [
      { label: "主会话模型", value: "GPT-5.4", hint: "商品咨询 / 常规问答" },
      { label: "兜底安全模型", value: "GPT-5.2", hint: "售后争议 / 敏感问题" },
      { label: "低置信回退", value: "0.62", hint: "低于阈值触发补证据" },
    ],
    controls: [
      { title: "主回复链路", value: "GPT-5.4 + 商品知识检索", detail: "覆盖商品咨询、价格协商、物流追问的主链路。" },
      { title: "高风险降级", value: "GPT-5.2 安全策略", detail: "售后争议、站外导流、情绪升级时切到保守模式。" },
      { title: "Embedding", value: "text-embedding-4", detail: "用于 FAQ、商品卡和售后规则索引。" },
    ],
    checklist: ["调整模型后需要重新跑验证样例", "高风险场景必须保留安全兜底模型", "路由变更需要留审计记录"],
  },
  {
    id: "channels",
    label: "渠道接入",
    note: "站内、组件、工单与 CRM 同步",
    title: "渠道接入与上下文同步",
    description: "负责统一消息来源、订单上下文、用户身份和接待状态，不让不同渠道各自维护一套逻辑。",
    metrics: [
      { label: "在线渠道", value: "4 个", hint: "闲鱼 / 官网组件 / 工单 / CRM" },
      { label: "订单回填延迟", value: "18s", hint: "最近 24 小时均值" },
      { label: "身份映射异常", value: "2 条", hint: "需人工核对" },
    ],
    controls: [
      { title: "闲鱼会话同步", value: "已开启", detail: "同步买家昵称、商品卡、订单与售后状态。" },
      { title: "官网组件", value: "已开启", detail: "支持游客身份与登录用户合并识别。" },
      { title: "CRM / 工单回流", value: "审核后回写", detail: "人工升级后的工单结果会回流到对话中心。" },
    ],
    checklist: ["同一用户跨渠道需合并身份", "订单状态必须在 30 秒内回填", "升级工单后需回写处置结果"],
  },
  {
    id: "permissions",
    label: "权限审批",
    note: "角色边界、变更审批与责任归属",
    title: "角色权限与审批链路",
    description: "负责控制谁能改策略、谁能发版、谁只能查看，避免一线客服误动系统级配置。",
    metrics: [
      { label: "角色模板", value: "4 类", hint: "主管 / 运营 / 客服 / 技术管理员" },
      { label: "待审批变更", value: "3 条", hint: "涉及高风险策略" },
      { label: "最近授权变更", value: "今天 09:30", hint: "售后组新增发布权限" },
    ],
    controls: [
      { title: "主管权限", value: "可改策略 / 可发版", detail: "拥有 AI 配置与发布闸门的最终确认权。" },
      { title: "运营权限", value: "可改知识 / 不可发版", detail: "可维护 FAQ、商品资料与欢迎语。" },
      { title: "客服权限", value: "只读 + 回流", detail: "只能在对话中心标记缺口和提交反馈。" },
    ],
    checklist: ["高风险策略必须双人审批", "渠道接入密钥仅技术管理员可见", "审计日志保留 180 天"],
  },
  {
    id: "knowledge",
    label: "知识同步",
    note: "索引状态、失效时间与回流节奏",
    title: "知识索引与同步计划",
    description: "负责管理 FAQ、商品资料、售后文档从来源到索引的整个生命周期。",
    metrics: [
      { label: "知识源", value: "28 份", hint: "FAQ / 商品卡 / 售后规则" },
      { label: "待重建索引", value: "4 份", hint: "近 2 小时变更" },
      { label: "同步频率", value: "每 15 分钟", hint: "商品资料增量刷新" },
    ],
    controls: [
      { title: "FAQ 索引", value: "增量同步", detail: "常见问题每次发布后即时重建。" },
      { title: "商品资料", value: "定时抓取", detail: "商品标题、价格、库存与成色信息自动更新。" },
      { title: "售后规则文档", value: "人工审批后入库", detail: "避免未确认口径直接进入知识检索。" },
    ],
    checklist: ["售后文档更新必须先审批", "索引失败要告警到主管", "知识回流需标记来源会话"],
  },
  {
    id: "safety",
    label: "安全审计",
    note: "敏感场景、日志与通知",
    title: "安全边界与审计留痕",
    description: "负责管住 AI 不能说什么、什么时候必须转人工、异常时谁会收到通知。",
    metrics: [
      { label: "敏感规则", value: "17 条", hint: "退款 / 导流 / 承诺边界" },
      { label: "告警接收人", value: "6 人", hint: "主管 / 售后 / 技术" },
      { label: "近 7 天拦截", value: "42 次", hint: "站外导流与越权承诺" },
    ],
    controls: [
      { title: "敏感词拦截", value: "已开启", detail: "命中站外导流、越权承诺后直接中断自动回复。" },
      { title: "高风险通知", value: "飞书 + 邮件", detail: "售后争议与连续投诉实时提醒主管。" },
      { title: "审计日志", value: "完整留痕", detail: "保留模型、知识、策略、发布人与时间。" },
    ],
    checklist: ["敏感会话必须保留原始上下文", "告警通知需要分级", "所有拦截都要可回放"],
  },
  {
    id: "release",
    label: "发布回滚",
    note: "灰度、版本、回滚与生效窗口",
    title: "灰度发布与回滚控制",
    description: "负责让模型升级、知识变更和策略发布可以分批生效、可追踪、可快速回退。",
    metrics: [
      { label: "当前版本", value: "v0.1.3", hint: "昨天 18:20 发布" },
      { label: "灰度范围", value: "25%", hint: "官网组件 + 闲鱼高频咨询" },
      { label: "可回滚窗口", value: "24h", hint: "支持一键恢复上个版本" },
    ],
    controls: [
      { title: "灰度策略", value: "按渠道 + 意图分批", detail: "先在低风险渠道放量，再扩到售后场景。" },
      { title: "回滚入口", value: "已启用", detail: "发布异常时可按版本回退模型与知识引用。" },
      { title: "生效时间窗", value: "09:00 - 18:00", detail: "默认只在主管在线时允许策略发布。" },
    ],
    checklist: ["高风险版本必须先灰度", "模型升级和知识发布要分开追踪", "回滚后自动恢复上一版验证记录"],
  },
];

const systemSettingsDetailPresets = {
  models: [
    {
      owner: "AI 平台组",
      updatedAt: "今天 09:20",
      impact: "影响商品咨询、价格协商和常规导购的主回复质量。",
      fields: [
        { label: "主模型", value: "GPT-5.4" },
        { label: "知识检索策略", value: "商品知识优先 + FAQ 补充" },
        { label: "低置信阈值", value: "0.62" },
      ],
    },
    {
      owner: "安全策略组",
      updatedAt: "今天 09:24",
      impact: "售后争议、站外导流和情绪升级会统一切到保守回复模式。",
      fields: [
        { label: "安全模型", value: "GPT-5.2" },
        { label: "触发条件", value: "售后 / 导流 / 情绪升级" },
        { label: "回退动作", value: "补证据或转人工" },
      ],
    },
    {
      owner: "检索服务",
      updatedAt: "昨天 18:10",
      impact: "影响 FAQ、商品资料和售后文档的召回命中率。",
      fields: [
        { label: "Embedding 模型", value: "text-embedding-4" },
        { label: "索引分片", value: "FAQ / 商品卡 / 售后文档" },
        { label: "更新策略", value: "增量重建" },
      ],
    },
  ],
  channels: [
    {
      owner: "渠道接入组",
      updatedAt: "今天 08:50",
      impact: "影响闲鱼会话是否能同步商品卡、订单和售后状态。",
      fields: [
        { label: "同步状态", value: "已开启" },
        { label: "回填字段", value: "昵称 / 商品 / 订单 / 售后" },
        { label: "失败重试", value: "3 次" },
      ],
    },
    {
      owner: "前端接入组",
      updatedAt: "昨天 17:40",
      impact: "影响官网组件中的游客识别、登录态合并与消息路由。",
      fields: [
        { label: "组件状态", value: "已开启" },
        { label: "身份策略", value: "游客与登录用户合并识别" },
        { label: "会话超时", value: "30 分钟" },
      ],
    },
    {
      owner: "集成平台组",
      updatedAt: "今天 09:05",
      impact: "影响升级工单是否能回流到对话中心与策略台。",
      fields: [
        { label: "回流方式", value: "审核后回写" },
        { label: "同步频率", value: "每 5 分钟" },
        { label: "异常通知", value: "飞书 + 邮件" },
      ],
    },
  ],
  permissions: [
    {
      owner: "平台主管",
      updatedAt: "今天 09:30",
      impact: "决定谁能改 AI 策略、谁能发版，以及谁只能提交反馈。",
      fields: [
        { label: "主管权限", value: "策略编辑 + 发布确认" },
        { label: "审批方式", value: "双人审批" },
        { label: "日志保留", value: "180 天" },
      ],
    },
    {
      owner: "运营经理",
      updatedAt: "昨天 15:00",
      impact: "知识更新速度更快，但不会直接触发系统级发布。",
      fields: [
        { label: "运营权限", value: "改知识 / 不可发版" },
        { label: "审批流", value: "提交主管确认" },
        { label: "可见范围", value: "知识、欢迎语、FAQ" },
      ],
    },
    {
      owner: "客服主管",
      updatedAt: "昨天 11:20",
      impact: "保证一线客服只能回流问题，不会误改底层配置。",
      fields: [
        { label: "客服权限", value: "只读 + 回流" },
        { label: "可操作项", value: "标记缺口 / 升级工单" },
        { label: "敏感配置访问", value: "不可见" },
      ],
    },
  ],
  knowledge: [
    {
      owner: "知识运营",
      updatedAt: "今天 08:45",
      impact: "FAQ 发布后能否及时进入检索，直接影响客服命中率。",
      fields: [
        { label: "同步方式", value: "增量同步" },
        { label: "重建时机", value: "发布后即时重建" },
        { label: "失效机制", value: "按版本淘汰旧卡片" },
      ],
    },
    {
      owner: "商品运营",
      updatedAt: "今天 09:10",
      impact: "决定价格、库存、成色与配件信息是否能保持最新。",
      fields: [
        { label: "抓取频率", value: "每 15 分钟" },
        { label: "字段范围", value: "标题 / 价格 / 库存 / 成色" },
        { label: "异常处理", value: "索引失败自动告警" },
      ],
    },
    {
      owner: "售后规则组",
      updatedAt: "昨天 18:00",
      impact: "未审批的售后规则不会进入 AI 检索，避免误答承诺边界。",
      fields: [
        { label: "入库方式", value: "人工审批后入库" },
        { label: "版本标记", value: "按发布时间追踪" },
        { label: "回流来源", value: "对话中心标记缺口" },
      ],
    },
  ],
  safety: [
    {
      owner: "安全策略组",
      updatedAt: "今天 09:12",
      impact: "决定站外导流、越权承诺等敏感回复是否被即时拦截。",
      fields: [
        { label: "拦截状态", value: "已开启" },
        { label: "规则数量", value: "17 条" },
        { label: "处置动作", value: "中断自动回复" },
      ],
    },
    {
      owner: "值班主管",
      updatedAt: "今天 08:55",
      impact: "高风险会话升级时，主管和售后是否能及时收到告警。",
      fields: [
        { label: "通知方式", value: "飞书 + 邮件" },
        { label: "接收角色", value: "主管 / 售后 / 技术" },
        { label: "告警等级", value: "三级分发" },
      ],
    },
    {
      owner: "审计平台",
      updatedAt: "昨天 20:10",
      impact: "所有模型、知识、发布和拦截行为都要可追踪、可回放。",
      fields: [
        { label: "日志策略", value: "完整留痕" },
        { label: "保留时间", value: "180 天" },
        { label: "回放能力", value: "按版本与会话回看" },
      ],
    },
  ],
  release: [
    {
      owner: "发布经理",
      updatedAt: "昨天 18:20",
      impact: "影响不同渠道和意图的放量顺序，决定异常是否会被放大。",
      fields: [
        { label: "灰度方式", value: "按渠道 + 意图分批" },
        { label: "首批范围", value: "官网组件 / 商品咨询" },
        { label: "扩量条件", value: "验证通过 + 指标稳定" },
      ],
    },
    {
      owner: "平台运维",
      updatedAt: "昨天 18:26",
      impact: "发布异常时能否快速回退到上一版，避免影响客服接待。",
      fields: [
        { label: "回滚入口", value: "已启用" },
        { label: "恢复目标", value: "模型 + 知识引用" },
        { label: "回滚窗口", value: "24h" },
      ],
    },
    {
      owner: "值班主管",
      updatedAt: "今天 09:00",
      impact: "只有主管在线时才允许关键策略生效，避免无人值守发布。",
      fields: [
        { label: "生效时间窗", value: "09:00 - 18:00" },
        { label: "超窗处理", value: "转为待审批" },
        { label: "例外策略", value: "安全回滚即时生效" },
      ],
    },
  ],
};

const quickSetupSteps = [
  {
    label: "步骤 1",
    title: "选择电商客服模板",
    detail: "默认启用商品咨询、FAQ 问答、知识库检索和人工接管入口。",
  },
  {
    label: "步骤 2",
    title: "接入知识源",
    detail: "添加 FAQ、文档、网页抓取与商品资料，并看到索引状态。",
  },
  {
    label: "步骤 3",
    title: "配置欢迎语与推荐问题",
    detail: "设置品牌语气、首屏引导、常见问题按钮和转人工文案。",
  },
  {
    label: "步骤 4",
    title: "预览并发布",
    detail: "在聊天页、嵌入组件和客服建议回复里验证后再上线。",
  },
];

const experiencePrompts = [
  "3000 预算内有适合办公的轻薄本吗？",
  "商品有问题怎么退货退款？",
  "MacBook Air M1 是国行吗？",
  "今天拍下能发顺丰吗？",
];

const publishChanges = [
  {
    id: "faq-return-policy",
    label: "更新退货 FAQ",
    note: "补充售后争议场景的人工接管提示。",
  },
  {
    id: "faq-shipping",
    label: "更新发货说明",
    note: "同步顺丰与优先发货的文案策略。",
  },
  {
    id: "product-macbook-air",
    label: "同步 MacBook 商品资料",
    note: "补充国行、电池循环和办公场景标签。",
  },
];

const moduleNavItems = [
  { id: "home", label: "\u5de5\u4f5c\u53f0\u9996\u9875", note: "\u603b\u89c8\u4e0e\u4efb\u52a1" },
  { id: "dialog-center", label: "\u5bf9\u8bdd\u4e2d\u5fc3", note: "\u4f1a\u8bdd\u5904\u7406" },
  { id: "ai-config", label: "AI \u5ba2\u670d\u914d\u7f6e", note: "\u77e5\u8bc6\u4e0e\u7b56\u7565" },
  { id: "system-settings", label: "\u7cfb\u7edf\u8bbe\u7f6e", note: "\u6a21\u578b\u4e0e\u96c6\u6210" },
];

const supervisorKpis = [
  {
    id: "ai-resolution",
    label: "AI\u89e3\u51b3\u7387",
    value: "82%",
    delta: "+4.6%",
    note: "\u4eca\u65e5 AI \u76f4\u63a5\u5b8c\u6210\u7684\u4f1a\u8bdd\u5360\u6bd4",
    tone: "good",
  },
  {
    id: "handoff",
    label: "\u4eba\u5de5\u63a5\u7ba1\u7387",
    value: "18%",
    delta: "-2.1%",
    note: "\u9ad8\u98ce\u9669\u5531\u540e\u4e0e\u4f4e\u7f6e\u4fe1\u5ea6\u4f1a\u8bdd\u7684\u5168\u5c40\u5360\u6bd4",
    tone: "neutral",
  },
  {
    id: "pending",
    label: "\u5f85\u5904\u7406\u4f1a\u8bdd",
    value: "37",
    delta: "12 \u6761\u65b0\u8fdb",
    note: "\u5f53\u524d\u9700\u4eba\u5de5\u8ddf\u8fdb\u6216\u5206\u914d\u7684\u4f1a\u8bdd\u603b\u91cf",
    tone: "focus",
  },
  {
    id: "sla-risk",
    label: "\u8d85\u65f6\u98ce\u9669\u4f1a\u8bdd",
    value: "6",
    delta: "2 \u6761\u5373\u5c06 SLA",
    note: "\u9884\u8ba1\u5728 15 \u5206\u949f\u5185\u8fdb\u5165\u8d85\u65f6\u98ce\u9669\u7684\u4f1a\u8bdd",
    tone: "risk",
  },
  {
    id: "csat",
    label: "\u7528\u6237\u6ee1\u610f\u5ea6",
    value: "4.7",
    delta: "+0.2",
    note: "\u8fd1 24 \u5c0f\u65f6\u5185\u7684\u5ba2\u670d\u4f53\u9a8c\u8bc4\u5206",
    tone: "good",
  },
];

const supervisorAlerts = [
  {
    id: "after-sale",
    label: "\u9ad8\u98ce\u9669\u5531\u540e\u4f1a\u8bdd",
    value: "6",
    detail: "\u9000\u6b3e\u4e89\u8bae\u3001\u654f\u611f\u60c5\u7eea\u548c\u7ad9\u5916\u5f15\u5bfc\u95ee\u9898\u9700\u4f18\u5148\u8f6c\u4eba\u5de5",
    tone: "risk",
  },
  {
    id: "confidence",
    label: "\u4f4e\u7f6e\u4fe1\u5ea6\u6fc0\u589e",
    value: "+14%",
    detail: "\u8fd1 2 \u5c0f\u65f6 MacBook \u6210\u8272\u4e0e\u4fdd\u4fee\u76f8\u5173\u95ee\u9898\u7684 AI \u628a\u63e1\u5ea6\u4e0b\u964d",
    tone: "warn",
  },
  {
    id: "knowledge-gap",
    label: "\u77e5\u8bc6\u7f3a\u53e3\u9ad8\u53d1",
    value: "9",
    detail: "\u4fdd\u4fee\u671f\u5916\u6362\u8d27\u3001\u914d\u4ef6\u7f3a\u5931\u548c\u8de8\u533a\u53d1\u8d27\u95ee\u9898\u672a\u7a33\u5b9a\u547d\u4e2d",
    tone: "warn",
  },
  {
    id: "csat-drop",
    label: "\u6ee1\u610f\u5ea6\u5f02\u5e38\u6ce2\u52a8",
    value: "-0.4",
    detail: "\u4eca\u5929 11:00 \u540e\u7684\u5531\u540e\u7c7b\u5bf9\u8bdd\u8d1f\u5411\u53cd\u9988\u660e\u663e\u589e\u52a0",
    tone: "neutral",
  },
  {
    id: "refund-sla",
    label: "\u9000\u6b3e\u961f\u5217\u5806\u79ef",
    value: "12",
    detail: "\u9000\u6b3e\u5ba1\u6838\u4e0e\u9000\u8d27\u6536\u8d27\u76f8\u5173\u4f1a\u8bdd\u5728\u8fd1 30 \u5206\u949f\u5185\u589e\u591a",
    tone: "warn",
  },
  {
    id: "vip-backlog",
    label: "VIP \u4f1a\u8bdd\u79ef\u538b",
    value: "5",
    detail: "\u9ad8\u4ef7\u503c\u7528\u6237\u6709 5 \u6761\u4f1a\u8bdd\u672a\u5728\u76ee\u6807\u65f6\u95f4\u5185\u5b8c\u6210\u9996\u6b21\u8ddf\u8fdb",
    tone: "risk",
  },
];

const supervisorQuickActions = [
  { id: "go-dialog", label: "\u8fdb\u5165\u5bf9\u8bdd\u4e2d\u5fc3", route: "dialog-center", note: "\u7acb\u5373\u5904\u7406\u5f85\u63a5\u7ba1\u548c\u9ad8\u98ce\u9669\u4f1a\u8bdd" },
  { id: "go-test", label: "\u67e5\u770b\u77e5\u8bc6\u6d4b\u8bd5", route: "ai-config", note: "\u9a8c\u8bc1 FAQ \u4e0e\u5546\u54c1\u77e5\u8bc6\u662f\u5426\u88ab\u6210\u529f\u53ec\u56de" },
  { id: "go-release", label: "\u67e5\u770b\u6700\u8fd1\u53d1\u5e03", route: "ai-config", note: "\u56de\u770b\u8fd1\u671f\u89c4\u5219\u6216\u77e5\u8bc6\u53d8\u66f4\u5e26\u6765\u7684\u5f71\u54cd" },
  { id: "go-handoff", label: "\u8c03\u6574\u8f6c\u4eba\u5de5\u89c4\u5219", route: "ai-config", note: "\u5feb\u901f\u8c03\u6574\u4f4e\u7f6e\u4fe1\u5ea6\u3001\u5531\u540e\u4e89\u8bae\u548c\u654f\u611f\u95ee\u9898\u5175\u5e95\u903b\u8f91" },
];

const supervisorTaskBuckets = [
  { id: "all", label: "\u5168\u90e8\u4efb\u52a1" },
  { id: "unassigned", label: "\u5f85\u5206\u914d", detail: "\u7b49\u5f85\u4e3b\u7ba1\u5206\u914d" },
  { id: "handoff", label: "\u5f85\u63a5\u7ba1", detail: "\u9700\u4eba\u5de5\u4ecb\u5165" },
  { id: "sla", label: "SLA \u98ce\u9669", detail: "\u4f18\u5148\u5904\u7406\u8d85\u65f6\u98ce\u9669" },
  { id: "knowledge", label: "\u77e5\u8bc6\u56de\u6d41", detail: "\u5f85\u786e\u8ba4\u77e5\u8bc6\u7f3a\u53e3" },
];

const supervisorTasks = [
  {
    id: "task-after-sale-1",
    customer: "\u963f\u9752",
    issue: "\u9000\u6b3e\u4e89\u8bae",
    type: "\u5531\u540e",
    status: "\u5f85\u63a5\u7ba1",
    risk: "\u9ad8",
    wait: "13 \u5206\u949f",
    action: "\u7acb\u5373\u8f6c\u4eba\u5de5",
    bucket: "handoff",
  },
  {
    id: "task-macbook-1",
    customer: "\u5468\u5148\u751f",
    issue: "MacBook \u53c2\u6570\u54a8\u8be2",
    type: "\u5546\u54c1\u54a8\u8be2",
    status: "\u5f85\u5206\u914d",
    risk: "\u4e2d",
    wait: "6 \u5206\u949f",
    action: "\u8fdb\u5165\u5bf9\u8bdd\u4e2d\u5fc3",
    bucket: "unassigned",
  },
  {
    id: "task-price-1",
    customer: "\u6797\u540c\u5b66",
    issue: "\u6700\u4f4e\u4ef7\u8ffd\u95ee",
    type: "\u4ef7\u683c\u534f\u5546",
    status: "\u5f85\u8865\u77e5\u8bc6",
    risk: "\u4e2d",
    wait: "11 \u5206\u949f",
    action: "\u8865\u5546\u54c1\u77e5\u8bc6",
    bucket: "knowledge",
  },
  {
    id: "task-shipping-1",
    customer: "\u6c88\u5c0f\u59d0",
    issue: "\u8de8\u57ce\u53d1\u8d27\u65f6\u6548",
    type: "\u53d1\u8d27\u65f6\u6548",
    status: "\u5373\u5c06\u8d85\u65f6",
    risk: "\u4e2d",
    wait: "14 \u5206\u949f",
    action: "\u4f18\u5148\u56de\u590d",
    bucket: "sla",
  },
  {
    id: "task-after-sale-2",
    customer: "\u5f20\u5148\u751f",
    issue: "\u4fdd\u4fee\u671f\u5916\u6362\u8d27",
    type: "\u89c4\u5219\u8bf4\u660e",
    status: "\u5f85\u8865\u77e5\u8bc6",
    risk: "\u4f4e",
    wait: "9 \u5206\u949f",
    action: "\u8865 FAQ",
    bucket: "knowledge",
  },
  {
    id: "task-sentiment-1",
    customer: "\u9648\u5973\u58eb",
    issue: "\u60c5\u7eea\u5347\u7ea7\u6295\u8bc9",
    type: "\u98ce\u9669\u4f1a\u8bdd",
    status: "\u5f85\u63a5\u7ba1",
    risk: "\u9ad8",
    wait: "7 \u5206\u949f",
    action: "\u5347\u7ea7\u5de5\u5355",
    bucket: "handoff",
  },
];

const dialogStatusTabs = [
  { id: "active", label: "进行中" },
  { id: "snoozed", label: "暂缓" },
  { id: "closed", label: "已关闭" },
];

const dialogSystemViews = [
  { id: "my-queue", label: "我的队列", note: "当前值班会话" },
  { id: "unassigned", label: "未分配", note: "待领取与待分派" },
  { id: "all", label: "全部会话", note: "所有打开中的对话" },
  { id: "handoff", label: "待接管", note: "AI 建议人工介入" },
  { id: "sla", label: "SLA 风险", note: "临近超时" },
  { id: "closed", label: "已关闭", note: "历史归档" },
];

const dialogBusinessViews = [
  { id: "ai-solved", label: "AI 已解决", note: "自动完成的会话" },
  { id: "knowledge-gap", label: "待补知识", note: "处理后要回流知识" },
  { id: "after-sale", label: "退款售后", note: "争议与退货处理" },
  { id: "vip", label: "重点用户", note: "高价值用户优先" },
];

const dialogCenterConversations = [
  {
    id: "conv-after-sale",
    customer: "阿青",
    topic: "退款争议",
    channel: "闲鱼",
    preview: "退款争议，用户反馈商品描述不符，情绪明显升级。",
    risk: "high",
    riskLabel: "高风险",
    status: "待接管",
    assignee: "未分配",
    updatedAt: "2m",
    updatedLabel: "2 分钟前更新",
    workflowState: "active",
    requiresHuman: true,
    aiSolved: false,
    needsKnowledge: false,
    vip: false,
    slaRisk: false,
    mine: false,
    intent: "after_sale",
    aiState: "AI 建议已生成",
    tags: ["高风险", "待接管", "AI 已建议"],
    order: {
      id: "#DY-20260513-041",
      product: "MacBook Air M1 8+256G",
      amount: "¥4,250",
      shipping: "已签收 1 天内",
      afterSale: "待核验描述不符",
    },
    knowledge: {
      faq: "商品问题退货退款",
      rule: "描述不符售后处理流程",
      confidence: "中低",
      gap: "无，但需人工确认承诺边界",
    },
    internalNote: "先核对详情图与质检备注，避免直接承诺退款。",
    suggestion: {
      headline: "AI 已生成建议回复",
      status: "已生成",
      confidence: "低置信度",
      summary: "建议先核对订单、商品说明和质检备注，再由人工确认后发送。",
      body: "这边已经记录你的售后问题，我会先帮你核对订单、商品成色说明和质检备注。如果确认存在描述不符，我们会按售后规则协助你处理退货或退款。",
      evidence: "依据：命中 FAQ《商品问题退货退款》、售后规则《描述不符处理流程》、订单状态《已签收 1 天内》。",
      riskNote: "风险提示：涉及退款承诺，建议人工确认后发送。",
    },
    timeline: [
      { kind: "event", text: "系统提示：AI 已接待，命中售后 FAQ" },
      { kind: "message", role: "user", sender: "阿青", time: "10:21", text: "我收到之后发现商品有划痕，和详情页说的不一样，这个怎么处理？" },
      { kind: "message", role: "assistant", sender: "Diudiu AI", time: "10:21", badge: "AI 自动回复", text: "我先帮你核对订单和商品说明，如果确实与描述不一致，我们会协助你处理后续售后流程。" },
      { kind: "message", role: "user", sender: "阿青", time: "10:23", text: "那你们到底能不能退？我不想一直等。" },
      { kind: "event", text: "系统提示：低置信度，建议转人工" },
    ],
  },
  {
    id: "conv-macbook-tech",
    customer: "周先生",
    topic: "MacBook 参数咨询",
    channel: "官网组件",
    preview: "MacBook 成色、保修和电池循环咨询。",
    risk: "low",
    riskLabel: "常规",
    status: "AI处理中",
    assignee: "王敏",
    updatedAt: "5m",
    updatedLabel: "5 分钟前更新",
    workflowState: "active",
    requiresHuman: false,
    aiSolved: false,
    needsKnowledge: false,
    vip: false,
    slaRisk: false,
    mine: true,
    intent: "tech",
    aiState: "AI 已回复",
    tags: ["AI处理中"],
    order: {
      id: "无订单",
      product: "MacBook Air M1 8+256G",
      amount: "商品咨询",
      shipping: "未下单",
      afterSale: "无",
    },
    knowledge: {
      faq: "MacBook Air M1 商品资料",
      rule: "轻薄本选购指南",
      confidence: "高",
      gap: "无",
    },
    internalNote: "继续引导确认成色与电池循环，再推动成交。",
    suggestion: {
      headline: "AI 建议可直接发送",
      status: "已生成",
      confidence: "高置信度",
      summary: "参数问题命中商品知识，可直接使用 AI 草稿。",
      body: "这台是国行版，办公、学习和轻度剪辑都没问题。如果你在意电池循环和成色细节，我也可以继续发你确认。",
      evidence: "依据：命中商品知识《MacBook Air M1 商品资料》、导购文档《轻薄本选购指南》。",
      riskNote: "当前建议可以直接发送，如需成交推进可补一条细节图说明。",
    },
    timeline: [
      { kind: "message", role: "user", sender: "周先生", time: "09:56", text: "这台是不是国行？电池循环多少次，办公会不会卡？" },
      { kind: "message", role: "assistant", sender: "Diudiu AI", time: "09:57", badge: "AI 自动回复", text: "是国行版本，办公学习都够用，我可以继续给你发电池循环和成色细节。" },
    ],
  },
  {
    id: "conv-shipping-sla",
    customer: "沈小姐",
    topic: "跨城发货时效",
    channel: "Web 组件",
    preview: "跨城发货时效追问，需要给出明确履约口径。",
    risk: "medium",
    riskLabel: "SLA",
    status: "待人工确认",
    assignee: "未分配",
    updatedAt: "9m",
    updatedLabel: "9 分钟前更新",
    workflowState: "active",
    requiresHuman: false,
    aiSolved: false,
    needsKnowledge: false,
    vip: false,
    slaRisk: true,
    mine: false,
    intent: "shipping",
    aiState: "待人工确认",
    tags: ["SLA 风险"],
    order: {
      id: "预售咨询",
      product: "Redmi Book 14",
      amount: "未付款",
      shipping: "需确认库存与地址",
      afterSale: "无",
    },
    knowledge: {
      faq: "发货与时效",
      rule: "顺丰优先发货说明",
      confidence: "中",
      gap: "部分跨区地址口径待补充",
    },
    internalNote: "如果用户继续追问具体时效，需人工确认仓库和地址。",
    suggestion: {
      headline: "建议补充发货口径",
      status: "已生成",
      confidence: "中等置信度",
      summary: "基础时效可直接回答，跨区地址建议人工补充。",
      body: "正常情况下工作日 16:00 前付款的订单会优先当日发出。如果你方便提供收货城市，我也可以继续帮你确认是否支持顺丰优先。",
      evidence: "依据：FAQ《发货与时效》、运营规则《顺丰优先发货说明》。",
      riskNote: "风险提示：跨区地址与库存联动，避免做绝对时效承诺。",
    },
    timeline: [
      { kind: "message", role: "user", sender: "沈小姐", time: "10:04", text: "今天拍下的话，明天能发顺丰吗？我是跨城。" },
      { kind: "event", text: "系统提示：SLA 临近，建议优先回复" },
    ],
  },
  {
    id: "conv-knowledge-gap",
    customer: "张先生",
    topic: "保修期外换货",
    channel: "官网组件",
    preview: "保修期外换货规则不清，需要补充知识口径。",
    risk: "low",
    riskLabel: "待补知识",
    status: "待补知识",
    assignee: "我",
    updatedAt: "14m",
    updatedLabel: "14 分钟前更新",
    workflowState: "snoozed",
    requiresHuman: false,
    aiSolved: false,
    needsKnowledge: true,
    vip: false,
    slaRisk: false,
    mine: true,
    intent: "knowledge_gap",
    aiState: "知识命中不稳",
    tags: ["知识回流"],
    order: {
      id: "历史订单咨询",
      product: "Xiaomi Book Pro",
      amount: "售后咨询",
      shipping: "不适用",
      afterSale: "规则待确认",
    },
    knowledge: {
      faq: "未稳定命中",
      rule: "保修期外售后规则待补充",
      confidence: "低",
      gap: "需要新增 FAQ 与售后说明",
    },
    internalNote: "先回流 FAQ，再恢复该会话处理。",
    suggestion: {
      headline: "建议补知识后再回复",
      status: "待补充",
      confidence: "低置信度",
      summary: "当前没有稳定命中的 FAQ，建议先补知识。",
      body: "目前保修期外换货规则没有稳定命中到高置信知识，建议先标记知识缺口，再由运营补充后继续处理。",
      evidence: "依据：知识测试未命中《保修期外换货》相关 FAQ。",
      riskNote: "风险提示：规则未明确前不建议直接承诺换货。",
    },
    timeline: [
      { kind: "message", role: "user", sender: "张先生", time: "09:42", text: "保修期外还能换货吗？" },
      { kind: "event", text: "系统提示：未命中高置信知识，建议回流 FAQ" },
    ],
  },
  {
    id: "conv-vip-order",
    customer: "陈女士",
    topic: "高价订单成交确认",
    channel: "独立聊天页",
    preview: "高价值用户询问库存和发货，需优先跟进。",
    risk: "medium",
    riskLabel: "重点用户",
    status: "人工处理中",
    assignee: "我",
    updatedAt: "18m",
    updatedLabel: "18 分钟前更新",
    workflowState: "active",
    requiresHuman: false,
    aiSolved: false,
    needsKnowledge: false,
    vip: true,
    slaRisk: false,
    mine: true,
    intent: "vip",
    aiState: "人工处理中",
    tags: ["重点用户"],
    order: {
      id: "#DY-20260513-015",
      product: "MacBook Pro 14 16+512G",
      amount: "¥9,999",
      shipping: "待确认加急发货",
      afterSale: "无",
    },
    knowledge: {
      faq: "发货与时效",
      rule: "重点用户服务策略",
      confidence: "高",
      gap: "无",
    },
    internalNote: "优先给出库存与加急发货答复，争取成交。",
    suggestion: {
      headline: "建议人工补充成交话术",
      status: "已生成",
      confidence: "高置信度",
      summary: "AI 可给基础答复，人工补充库存与发货承诺更好。",
      body: "这台目前还有现货，如果你今天确认下单，我可以继续帮你确认加急发货安排，也可以补发细节图给你核对。",
      evidence: "依据：库存同步、FAQ《发货与时效》、重点用户服务策略。",
      riskNote: "建议人工补充库存确认口径，提高成交率。",
    },
    timeline: [
      { kind: "message", role: "user", sender: "陈女士", time: "09:20", text: "如果我今天拍下，这台能不能加急发货？还有没有现货？" },
      { kind: "message", role: "assistant", sender: "Diudiu AI", time: "09:21", badge: "AI 建议已生成", text: "当前库存和加急发货需要人工确认，我可以先帮你记录需求。" },
    ],
  },
  {
    id: "conv-ai-closed",
    customer: "刘同学",
    topic: "轻薄本预算咨询",
    channel: "官网组件",
    preview: "预算咨询已由 AI 完成推荐并关闭。",
    risk: "low",
    riskLabel: "AI 已解决",
    status: "已关闭",
    assignee: "Diudiu AI",
    updatedAt: "1h",
    updatedLabel: "1 小时前关闭",
    workflowState: "closed",
    requiresHuman: false,
    aiSolved: true,
    needsKnowledge: false,
    vip: false,
    slaRisk: false,
    mine: false,
    intent: "guide",
    aiState: "AI 已解决",
    tags: ["AI 已解决"],
    order: {
      id: "未下单",
      product: "Redmi Book 14",
      amount: "预算 ¥3,000",
      shipping: "无",
      afterSale: "无",
    },
    knowledge: {
      faq: "轻薄本选购指南",
      rule: "商品知识《Redmi Book》",
      confidence: "高",
      gap: "无",
    },
    internalNote: "AI 已完成导购，无需人工跟进。",
    suggestion: {
      headline: "无新的 AI 建议",
      status: "已关闭",
      confidence: "高置信度",
      summary: "该会话已由 AI 完成。",
      body: "AI 已完成轻薄本推荐与发货说明，用户未继续追问。",
      evidence: "依据：导购文档与商品知识正常命中。",
      riskNote: "无需额外处理。",
    },
    timeline: [
      { kind: "message", role: "user", sender: "刘同学", time: "08:10", text: "3000 预算内有适合办公的轻薄本吗？" },
      { kind: "message", role: "assistant", sender: "Diudiu AI", time: "08:11", badge: "AI 自动回复", text: "可以优先看看 Redmi Book 14，适合办公与学习，预算也更合适。" },
      { kind: "event", text: "系统提示：会话已由 AI 解决并关闭" },
    ],
  },
];

const state = {
  route: normalizeRoute(window.location.hash),
  dialogSearch: "",
  dialogStatusTab: "active",
  dialogViewId: "my-queue",
  dialogPendingPage: 1,
  dialogSuggestionExpanded: false,
  dialogShouldScrollToLatest: true,
  systemSettingsSection: "models",
  systemSettingsControlIndex: 0,
  systemSettingsPanelMode: "detail",
  systemSettingsDrafts: {},
  systemSettingsNotice: "系统配置改动将先进入草稿，再经过审批与灰度生效。",
  moduleContext: {
    source: "home",
    target: "home",
    title: "当前在工作台总览页",
    detail: "这里汇总风险、会话、策略和系统级改动，便于主管决定下一步进入哪个模块。",
    conversationId: null,
    strategyTab: null,
    settingsSection: null,
    nextRoute: null,
    nextLabel: null,
  },
  homeAlertPage: 1,
  homeTaskFilter: "all",
  homeTaskPage: 1,
  chatInput: "",
  chatThread: [
    {
      role: "assistant",
      author: "Diudiu AI",
      time: "刚刚",
      text: "你好，我可以帮你回答商品咨询、发货时效、退货政策，也可以在需要时帮你转人工。",
      citations: [],
    },
  ],
  chatEvidence: runKnowledgeTest("3000 预算内有适合办公的轻薄本推荐吗？"),
  embedOpen: true,
  embedInput: "",
  embedThread: [
    {
      role: "assistant",
      text: "欢迎来到嵌入式客服演示，你可以直接问我商品、FAQ 或发货问题。",
    },
  ],
  activeSourceId: knowledgeSources[0].id,
  knowledgeQuery: "商品有问题怎么退货退款？",
  knowledgeResult: runKnowledgeTest("商品有问题怎么退货退款？"),
  publishSelection: ["faq-return-policy", "product-macbook-air"],
  conversations: structuredClone(dialogCenterConversations),
  activeConversationId: "conv-after-sale",
  strategyConsole:
    strategyConsoleDataApi && strategyConsoleStateApi
      ? strategyConsoleStateApi.createStrategyConsoleState(strategyConsoleDataApi.getStrategyConsoleData())
      : null,
  strategyToast: "草稿已同步，可继续验证或直接发布。",
};

const HOME_ALERTS_PER_PAGE = 4;
const HOME_TASKS_PER_PAGE = 4;
const DIALOG_PENDING_PER_PAGE = 3;

function extendDemoConversationHistory() {
  const vipConversation = state.conversations.find((conversation) => conversation.id === "conv-vip-order");
  if (!vipConversation || !Array.isArray(vipConversation.timeline) || vipConversation.timeline.length > 2) {
    return;
  }

  vipConversation.timeline = [
    ...vipConversation.timeline,
    { kind: "message", role: "user", sender: vipConversation.customer, time: "09:22", text: "我最晚明天下午要用，如果今天能发我就直接下单。" },
    { kind: "event", text: "系统提示：已标记 VIP 成交跟进，优先确认库存与加急发货。" },
    { kind: "message", role: "assistant", sender: "客服", time: "09:24", badge: "人工跟进", text: "收到，我正在帮你确认当前现货和加急发货安排，几分钟后给你明确答复。" },
    { kind: "message", role: "user", sender: vipConversation.customer, time: "09:26", text: "好的，如果确认有现货，你也可以顺便发我一下机身细节图。" },
    { kind: "message", role: "assistant", sender: "客服", time: "09:28", badge: "人工跟进", text: "没问题，我确认好库存后一起把细节图和发货时点发给你，方便你直接决定。" },
  ];
}

extendDemoConversationHistory();

function extendPrimaryConversationHistory() {
  const conversation = state.conversations.find((item) => item.id === "conv-macbook-tech");
  if (!conversation || !Array.isArray(conversation.timeline) || conversation.timeline.length > 2) {
    return;
  }

  conversation.timeline = [
    ...conversation.timeline,
    { kind: "message", role: "user", sender: conversation.customer, time: "09:58", text: "如果我现在下单，你能顺便发我成色细节图吗？" },
    { kind: "message", role: "assistant", sender: "Diudiu AI", time: "09:59", badge: "AI 自动回复", text: "可以的，我可以先发你电池循环和机身细节，你看完再决定是否拍下。" },
    { kind: "event", text: "AI 已关联商品知识：MacBook Air M1 商品资料。" },
    { kind: "message", role: "user", sender: conversation.customer, time: "10:01", text: "好，你发我一份成色细节和保修情况，我想再确认一下。" },
    { kind: "message", role: "assistant", sender: "Diudiu AI", time: "10:02", badge: "AI 自动回复", text: "成色这边是轻微使用痕迹，边框和转轴都没有明显磕碰；保修方面我可以继续把激活与维修情况一起发你确认。" },
    { kind: "message", role: "user", sender: conversation.customer, time: "10:03", text: "电池循环高不高？我平时会拿来办公和开很多网页。" },
    { kind: "message", role: "assistant", sender: "Diudiu AI", time: "10:03", badge: "AI 自动回复", text: "循环次数在正常办公本范围内，日常文档、网页、多任务都够用。如果你在意续航，我也可以把当前电池健康一起补给你。" },
    { kind: "event", text: "系统提示：已命中商品参数知识与导购口径，可继续自动回复。" },
    { kind: "message", role: "user", sender: conversation.customer, time: "10:05", text: "那你也发一下有没有维修过、配件全不全。" },
    { kind: "message", role: "assistant", sender: "Diudiu AI", time: "10:06", badge: "AI 自动回复", text: "可以，我会把维修记录、充电器和包装配件情况一起整理给你，方便你一次性确认。" },
    { kind: "message", role: "user", sender: conversation.customer, time: "10:07", text: "如果这些都没问题，我今天就可能下单。" },
  ];
}

extendPrimaryConversationHistory();

function normalizeRoute(hashValue) {
  const cleaned = (hashValue || "#home").replace(/^#/, "");
  const validRoutes = new Set([
    ...moduleNavItems.map((item) => item.id),
    ...getRoutes().map((route) => route.id),
    ...Object.keys(consoleRouteMap),
  ]);
  return validRoutes.has(cleaned) ? cleaned : "home";
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function routeGroup(routeId) {
  if (routeId === "dialog-center" || routeId === "workspace" || routeId.startsWith("experience-")) return "dialog-center";
  if (routeId === "ai-config" || routeId.startsWith("console-")) return "ai-config";
  if (routeId === "system-settings") return "system-settings";
  return "home";
}

function activeConsoleTab() {
  return consoleRouteMap[state.route] || "overview";
}

function currentConversation() {
  return state.conversations.find((item) => item.id === state.activeConversationId) || state.conversations[0];
}

function sourceTypeLabel(type) {
  if (type === "faq") return "FAQ";
  if (type === "document") return "文档";
  return "商品知识";
}

function routeLabel(routeId) {
  const map = {
    home: "\u5de5\u4f5c\u53f0\u9996\u9875",
    "dialog-center": "\u5bf9\u8bdd\u4e2d\u5fc3",
    "ai-config": "AI \u5ba2\u670d\u914d\u7f6e",
    "system-settings": "\u7cfb\u7edf\u8bbe\u7f6e",
    "experience-chat": "\u5bf9\u8bdd\u4f53\u9a8c",
    "experience-embed": "\u7ec4\u4ef6\u6f14\u793a",
    "console-overview": "策略总览",
    "console-setup": "风险与兜底",
    "console-knowledge": "知识健康",
    "console-ai": "验证与回放",
    "console-publish": "发布与影响",
    workspace: "\u5bf9\u8bdd\u5de5\u4f5c\u533a",
  };
  return map[routeId] || routeId;
}

function buildAssistantReply(query, knowledgeResult) {
  if (!knowledgeResult.found) {
    return {
      text: "我暂时没有在知识库里找到完全匹配的内容。你可以继续补充问题，或者我帮你转人工处理。",
      citations: [],
      products: [],
    };
  }

  const sourceType = knowledgeResult.source.type;
  if (sourceType === "faq") {
    return {
      text: `${knowledgeResult.excerpt} 如果你已经遇到售后争议或商品异常，我建议直接发起人工协助。`,
      citations: [knowledgeResult.citation],
      products: [],
    };
  }

  if (sourceType === "document") {
    return {
      text: `${knowledgeResult.excerpt} 结合你的预算，我会优先推荐轻薄、办公稳定、售后说明清晰的机型。`,
      citations: [knowledgeResult.citation],
      products: [
        {
          title: "Redmi Book 14",
          detail: "3000 元档轻薄本，适合办公与学习，发货时效稳定。",
        },
        {
          title: "MacBook Air M1",
          detail: "适合办公、学习与轻度剪辑，商品资料和成色信息已同步。",
        },
      ],
    };
  }

  return {
    text: `${knowledgeResult.excerpt} 如果你需要，我也可以继续给你发成色、电池循环或发货策略的详细说明。`,
    citations: [knowledgeResult.citation],
    products: [
      {
        title: knowledgeResult.source.title,
        detail: knowledgeResult.excerpt,
      },
    ],
  };
}

function renderPrimaryNav() {
  primaryNavEl.innerHTML = ``;

  railEl.innerHTML = `
    <div class="sidebar-stack">
      <div class="sidebar-section">
        <p class="rail-label">\u4e3b\u5bfc\u822a</p>
        <div class="sidebar-links">
          ${moduleNavItems
            .map((item) => {
              const active = item.id === state.route || routeGroup(state.route) === item.id;
              return `
                <a class="sidebar-link ${active ? "active" : ""}" href="#${item.id}">
                  <span>${item.label}</span>
                  <small>${item.note}</small>
                  ${active ? `<em class="sidebar-link-state">当前</em>` : ""}
                </a>
              `;
            })
            .join("")}
        </div>
      </div>
      <div class="sidebar-section sidebar-focus">
        <p class="rail-label">\u4eca\u65e5\u7126\u70b9</p>
        <strong>AI \u89e3\u51b3\u7387 ${supervisorKpis[0].value}</strong>
        <p>\u4eba\u5de5\u63a5\u7ba1\u7387 ${supervisorKpis[1].value}\uff0c\u9ad8\u98ce\u9669\u5531\u540e\u4f1a\u8bdd ${supervisorAlerts[0].value} \u6761\u9700\u4f18\u5148\u5173\u6ce8\u3002</p>
      </div>
      <div class="sidebar-section sidebar-support">
        <p class="rail-label">\u64cd\u4f5c\u5efa\u8bae</p>
        <p>\u5148\u770b\u9996\u9875\u5f02\u5e38\uff0c\u518d\u4ece\u5feb\u6377\u5165\u53e3\u8fdb\u5165\u5bf9\u8bdd\u4e2d\u5fc3\u6216 AI \u5ba2\u670d\u914d\u7f6e\u3002</p>
      </div>
    </div>
  `;
}

function renderRail() {
  const group = routeGroup(state.route);
  const source = knowledgeSources.find((item) => item.id === state.activeSourceId) || knowledgeSources[0];
  const selectedConversation = currentConversation();
  const publishImpact = summarizePublishImpact(state.publishSelection);

  const cards = {
    home: `
      <div class="rail-card">
        <p class="rail-label">\u9996\u9875\u5b9a\u4f4d</p>
        <strong>\u4ea7\u54c1\u5165\u53e3\u9875</strong>
        <p>\u8fd9\u91cc\u53ea\u8d1f\u8d23\u8bf4\u660e\u4ea7\u54c1\u662f\u4ec0\u4e48\uff0c\u4ee5\u53ca\u628a\u8bbf\u5ba2\u5206\u6d41\u5230\u804a\u5929\u4f53\u9a8c\u3001\u5d4c\u5165\u6f14\u793a\u548c\u63a7\u5236\u53f0\u3002</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u5efa\u8bae\u5165\u53e3</p>
        <p>\u5148\u770b\u5728\u7ebf\u4f53\u9a8c\uff0c\u518d\u8fdb\u5165\u63a7\u5236\u53f0\uff1b\u5982\u679c\u8981\u770b\u771f\u5b9e\u63a5\u5165\u65b9\u5f0f\uff0c\u5c31\u53bb\u5d4c\u5165\u7ec4\u4ef6\u6f14\u793a\u3002</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u540e\u53f0\u4fe1\u606f</p>
        <p>\u77e5\u8bc6\u72b6\u6001\u3001\u6d4b\u8bd5\u7ed3\u679c\u3001\u53d1\u5e03\u5f71\u54cd\u9762\u548c\u4eba\u5de5\u63a5\u7ba1\u6982\u51b5\uff0c\u7edf\u4e00\u653e\u5230\u63a7\u5236\u53f0\u6982\u89c8\u91cc\u67e5\u770b\u3002</p>
      </div>
    `,
    experience: `
      <div class="rail-card">
        <p class="rail-label">\u5f53\u524d\u77e5\u8bc6\u547d\u4e2d</p>
        <strong>${escapeHtml(source.title)}</strong>
        <p>${escapeHtml(source.summary)}</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u4f53\u9a8c\u91cd\u70b9</p>
        <p>\u56de\u7b54\u662f\u5426\u81ea\u7136\u3001\u5f15\u7528\u662f\u5426\u53ef\u4fe1\u3001\u5546\u54c1\u63a8\u8350\u662f\u5426\u6709\u8f6c\u5316\u611f\u3001\u7528\u6237\u662f\u5426\u80fd\u660e\u786e\u8f6c\u4eba\u5de5\u3002</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u53ef\u547d\u4e2d\u5165\u53e3</p>
        <p>${source.targets.map((target) => routeLabel(target)).join(" / ")}</p>
      </div>
    `,
    console: `
      <div class="rail-card">
        <p class="rail-label">\u63a7\u5236\u53f0\u91cd\u70b9</p>
        <strong>${routeLabel(state.route)}</strong>
        <p>\u4f18\u5148\u5c55\u793a\u77e5\u8bc6\u3001\u6d4b\u8bd5\u3001\u53d1\u5e03\u548c\u4eba\u5de5\u63a5\u7ba1\u7b56\u7565\uff1b\u6a21\u578b\u53c2\u6570\u4e0b\u6c89\u5230\u9ad8\u7ea7\u8bbe\u7f6e\u3002</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u5f53\u524d\u6d4b\u8bd5\u7ed3\u679c</p>
        <p>${escapeHtml(state.knowledgeResult.excerpt)}</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u53d1\u5e03\u5f71\u54cd\u9762</p>
        <p>${publishImpact.map((target) => routeLabel(target)).join(" / ") || "\u6682\u65e0\u5f71\u54cd\u9762"}</p>
      </div>
    `,
    workspace: `
      <div class="rail-card">
        <p class="rail-label">\u5f53\u524d\u4f1a\u8bdd</p>
        <strong>${escapeHtml(selectedConversation.customer)}</strong>
        <p>${escapeHtml(selectedConversation.summary)}</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u4eba\u5de5\u63a5\u7ba1\u5224\u65ad</p>
        <p>${shouldEscalateConversation(selectedConversation) ? "\u9700\u8981\u8fdb\u5165\u4eba\u5de5\u6216\u9ad8\u98ce\u9669\u5904\u7406\u6d41" : "\u53ef\u7ee7\u7eed\u7531 AI \u4e0e\u5546\u54c1\u77e5\u8bc6\u8054\u5408\u5904\u7406"}</p>
      </div>
      <div class="rail-card">
        <p class="rail-label">\u56de\u6d41\u76ee\u6807</p>
        <p>\u628a\u672a\u89e3\u51b3\u95ee\u9898\u3001\u98ce\u9669\u4f1a\u8bdd\u4e0e\u5e38\u89c1\u8ffd\u95ee\u56de\u6d41\u6210 FAQ\u3001\u5546\u54c1\u77e5\u8bc6\u6216\u56de\u7b54\u7b56\u7565\u7f3a\u53e3\u3002</p>
      </div>
    `,
  };

  railEl.innerHTML = cards[group];
}

function filteredSupervisorTasks() {
  if (state.homeTaskFilter === "all") return supervisorTasks;
  return supervisorTasks.filter((item) => item.bucket === state.homeTaskFilter);
}

function dialogStatusLabel(statusId) {
  return dialogStatusTabs.find((item) => item.id === statusId)?.label || statusId;
}

function dialogViewLabel(viewId) {
  return [...dialogSystemViews, ...dialogBusinessViews].find((item) => item.id === viewId)?.label || viewId;
}

function matchDialogStatus(conversation, statusId = state.dialogStatusTab) {
  return conversation.workflowState === statusId;
}

function matchDialogView(conversation, viewId = state.dialogViewId) {
  if (viewId === "my-queue") return conversation.mine && conversation.workflowState !== "closed";
  if (viewId === "unassigned") return conversation.assignee === "未分配" && conversation.workflowState !== "closed";
  if (viewId === "all") return conversation.workflowState !== "closed";
  if (viewId === "handoff") return conversation.requiresHuman && conversation.workflowState !== "closed";
  if (viewId === "sla") return conversation.slaRisk && conversation.workflowState !== "closed";
  if (viewId === "closed") return conversation.workflowState === "closed";
  if (viewId === "ai-solved") return conversation.aiSolved;
  if (viewId === "knowledge-gap") return conversation.needsKnowledge && conversation.workflowState !== "closed";
  if (viewId === "after-sale") return conversation.intent === "after_sale" && conversation.workflowState !== "closed";
  if (viewId === "vip") return conversation.vip && conversation.workflowState !== "closed";
  return true;
}

function matchDialogSearch(conversation) {
  const query = state.dialogSearch.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    conversation.customer,
    conversation.topic,
    conversation.preview,
    conversation.channel,
    conversation.order.id,
    conversation.order.product,
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

function filteredDialogConversations() {
  return state.conversations
    .filter((conversation) => matchDialogStatus(conversation))
    .filter((conversation) => matchDialogView(conversation))
    .filter((conversation) => matchDialogSearch(conversation));
}

function ensureActiveDialogConversation() {
  const visible = filteredDialogConversations();
  if (!visible.length) return null;
  const current = visible.find((item) => item.id === state.activeConversationId) || visible[0];
  state.activeConversationId = current.id;
  return current;
}

function dialogViewCount(viewId) {
  return state.conversations
    .filter((conversation) => matchDialogStatus(conversation))
    .filter((conversation) => matchDialogView(conversation, viewId)).length;
}

function currentSystemSettingsSection() {
  return systemSettingsSections.find((item) => item.id === state.systemSettingsSection) || systemSettingsSections[0];
}

function currentSystemSettingsPreset() {
  const section = currentSystemSettingsSection();
  const presets = systemSettingsDetailPresets[section.id] || [];
  return presets[state.systemSettingsControlIndex] || presets[0] || null;
}

function currentSystemSettingsDraftKey() {
  return `${state.systemSettingsSection}:${state.systemSettingsControlIndex}`;
}

function currentSystemSettingsDraftFields() {
  const preset = currentSystemSettingsPreset();
  if (!preset) return [];
  return state.systemSettingsDrafts[currentSystemSettingsDraftKey()]?.fields || preset.fields;
}

function setModuleContext(context) {
  state.moduleContext = {
    ...state.moduleContext,
    ...context,
  };
}

function moduleContextNotice() {
  const currentGroup = routeGroup(state.route);
  if (!state.moduleContext || state.moduleContext.target !== currentGroup) {
    return "";
  }

  return `
    <div class="module-context-banner">
      <span class="module-context-chip">来自 ${escapeHtml(routeLabel(state.moduleContext.source))}</span>
      <strong>${escapeHtml(state.moduleContext.title)}</strong>
      <p>${escapeHtml(state.moduleContext.detail)}</p>
      ${
        state.moduleContext.nextRoute
          ? `<button class="small-action" data-action="module-context-next">${escapeHtml(state.moduleContext.nextLabel || "继续下一步")}</button>`
          : ""
      }
    </div>
  `;
}

function conversationIdForTask(taskId) {
  const taskConversationMap = {
    "task-after-sale-1": "conv-after-sale",
    "task-macbook-1": "conv-macbook-tech",
    "task-price-1": "conv-macbook-tech",
    "task-shipping-1": "conv-shipping-sla",
    "task-after-sale-2": "conv-knowledge-gap",
    "task-sentiment-1": "conv-after-sale",
  };

  return taskConversationMap[taskId] || null;
}

function openHomeKpi(kpiId) {
  if (kpiId === "ai-resolution") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "查看 AI 已解决会话",
      detail: "这里回看 AI 已独立完成的会话，确认自动回复质量和关闭标准是否稳定。",
      dialogViewId: "ai-solved",
      nextRoute: "console-overview",
      nextLabel: "去 AI 配置查看整体策略表现",
    });
    return;
  }

  if (kpiId === "handoff") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "查看人工接管会话",
      detail: "这里集中查看 AI 交还人工的会话，判断是否是兜底边界过宽或知识不足。",
      dialogViewId: "handoff",
      nextRoute: "console-setup",
      nextLabel: "去 AI 配置调整转人工边界",
    });
    return;
  }

  if (kpiId === "pending") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "查看全部待处理会话",
      detail: "这里承接当前班次还未完成的会话，便于统一分配和回流问题。",
      dialogViewId: "all",
      nextRoute: "home",
      nextLabel: "回到工作台看整体处理结果",
    });
    return;
  }

  if (kpiId === "sla-risk") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "查看临近 SLA 会话",
      detail: "优先处理快超时的会话，再判断是否需要补发货规则或升级人工。",
      dialogViewId: "sla",
      nextRoute: "console-overview",
      nextLabel: "处理后回 AI 配置复盘影响",
    });
    return;
  }

  if (kpiId === "csat") {
    navigateToModule("console-ai", {
      source: "home",
      target: "ai-config",
      title: "查看满意度相关验证场景",
      detail: "这里回放关键问答样例，确认近期策略调整是否影响用户体验。",
      strategyTab: "validation",
      nextRoute: "console-publish",
      nextLabel: "继续确认发布影响",
    });
  }
}

function openHomeAlert(alertId) {
  if (alertId === "after-sale") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "查看高风险售后会话",
      detail: "先处理售后争议会话，再决定是否回到风险页收紧兜底边界。",
      dialogViewId: "after-sale",
      conversationId: "conv-after-sale",
      nextRoute: "console-setup",
      nextLabel: "去 AI 配置检查风险兜底",
    });
    return;
  }

  if (alertId === "confidence") {
    if (state.strategyConsole) {
      state.strategyConsole = strategyConsoleStateApi.focusRiskCard(state.strategyConsole, "low-confidence");
    }

    navigateToModule("console-setup", {
      source: "home",
      target: "ai-config",
      title: "查看低置信度回复风险",
      detail: "这里优先检查低置信度回复是否需要更早补证据或直接转人工。",
      strategyTab: "risk",
      nextRoute: "system-settings",
      nextLabel: "继续看模型与路由设置",
      settingsSection: "models",
    });
    return;
  }

  if (alertId === "knowledge-gap") {
    navigateToModule("console-knowledge", {
      source: "home",
      target: "ai-config",
      title: "查看高发知识缺口",
      detail: "这里确认缺口属于 FAQ、商品资料还是售后文档，再决定是否进入系统同步设置。",
      strategyTab: "knowledge",
      nextRoute: "system-settings",
      nextLabel: "继续看知识同步设置",
      settingsSection: "knowledge",
    });
    return;
  }

  if (alertId === "csat-drop") {
    navigateToModule("console-ai", {
      source: "home",
      target: "ai-config",
      title: "回放满意度波动相关样例",
      detail: "这里优先检查售后和导购场景的回放样例，判断问题出在知识还是策略。",
      strategyTab: "validation",
      nextRoute: "console-publish",
      nextLabel: "继续确认是否需要发布修复",
    });
    return;
  }

  if (alertId === "refund-sla") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "查看退款积压与 SLA 风险",
      detail: "优先处理临近超时的退款会话，再回到 AI 配置查看售后边界是否合理。",
      dialogViewId: "sla",
      conversationId: "conv-after-sale",
      nextRoute: "console-setup",
      nextLabel: "去 AI 配置调整售后边界",
    });
    return;
  }

  if (alertId === "vip-backlog") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "查看重点用户积压会话",
      detail: "这里优先确认 VIP 会话的库存、时效和跟进节奏，再回看渠道与路由设置。",
      dialogViewId: "vip",
      conversationId: "conv-vip-order",
      nextRoute: "system-settings",
      nextLabel: "继续看渠道接入设置",
      settingsSection: "channels",
    });
  }
}

function openHomeTask(taskId, bucket) {
  navigateToModule("dialog-center", {
    source: "home",
    target: "dialog-center",
    title: "从任务表进入具体会话",
    detail: "这里承接工作台中的待处理任务，处理完成后再决定是否回流到 AI 配置或系统设置。",
    dialogViewId: dialogViewForTaskBucket(bucket),
    conversationId: conversationIdForTask(taskId),
    nextRoute: bucket === "knowledge" ? "console-knowledge" : bucket === "handoff" ? "console-setup" : "home",
    nextLabel: bucket === "knowledge" ? "处理后去知识健康" : bucket === "handoff" ? "处理后去风险与兜底" : "回到工作台",
  });
}

function dialogRiskTone(conversation) {
  if (conversation.risk === "high") return "risk";
  if (conversation.risk === "medium") return "warn";
  return "good";
}

function dialogAssistantTone(conversation) {
  if (conversation.suggestion.confidence.includes("低")) return "warn";
  return "good";
}

function dialogViewForTaskBucket(bucket) {
  if (bucket === "knowledge") return "knowledge-gap";
  if (bucket === "handoff") return "handoff";
  if (bucket === "sla") return "sla";
  if (bucket === "unassigned") return "unassigned";
  return "all";
}

function setDialogView(viewId, options = {}) {
  const { resetSearch = false } = options;
  state.dialogViewId = viewId || "all";
  state.dialogPendingPage = 1;

  if (resetSearch) {
    state.dialogSearch = "";
  }

  if (state.dialogViewId === "closed") {
    state.dialogStatusTab = "closed";
  } else if (state.dialogStatusTab === "closed") {
    state.dialogStatusTab = "active";
  }

  const visible = filteredDialogConversations();
  state.activeConversationId = visible[0]?.id || state.activeConversationId;
  state.dialogSuggestionExpanded = false;
}

function paginatedSupervisorAlerts() {
  const start = (state.homeAlertPage - 1) * HOME_ALERTS_PER_PAGE;
  return supervisorAlerts.slice(start, start + HOME_ALERTS_PER_PAGE);
}

function alertPageCount() {
  return Math.max(1, Math.ceil(supervisorAlerts.length / HOME_ALERTS_PER_PAGE));
}

function taskCountForBucket(bucketId) {
  if (bucketId === "all") return supervisorTasks.length;
  return supervisorTasks.filter((item) => item.bucket === bucketId).length;
}

function paginatedSupervisorTasks() {
  const visibleTasks = filteredSupervisorTasks();
  const start = (state.homeTaskPage - 1) * HOME_TASKS_PER_PAGE;
  return visibleTasks.slice(start, start + HOME_TASKS_PER_PAGE);
}

function taskPageCount() {
  return Math.max(1, Math.ceil(filteredSupervisorTasks().length / HOME_TASKS_PER_PAGE));
}

function renderHome() {
  const visibleAlerts = paginatedSupervisorAlerts();
  const visibleTasks = paginatedSupervisorTasks();
  const activeFilter = supervisorTaskBuckets.find((item) => item.id === state.homeTaskFilter) || supervisorTaskBuckets[0];
  const alertPages = alertPageCount();
  const taskPages = taskPageCount();

  return `
    <section class="dashboard-home">
      ${moduleContextNotice()}
      <article class="dashboard-hero">
        <div>
          <p class="section-kicker">Workbench Overview</p>
          <h2>AI智能客服工作台</h2>
          <p>先看 AI 解决效果和现场压力，再进入风险会话、知识缺口与人工接管处理。</p>
        </div>
        <div class="dashboard-hero-actions">
          <a class="small-action" href="#dialog-center">进入对话中心</a>
          <a class="small-action" href="#ai-config">查看 AI 配置</a>
        </div>
      </article>

      <section class="kpi-grid">
        ${supervisorKpis
          .map((item) => `
            <button class="kpi-card kpi-card-button ${item.tone}" data-action="home-kpi" data-kpi-id="${item.id}">
              <div class="kpi-head">
                <p class="label">${item.label}</p>
                <span class="kpi-delta">${item.delta}</span>
              </div>
              <strong class="kpi-value">${item.value}</strong>
              <p class="kpi-note">${item.note}</p>
            </button>
          `)
          .join("")}
      </section>

      <section class="dashboard-middle">
        <article class="dashboard-panel">
          <div class="section-head">
            <div>
              <p class="section-kicker">Risk & Alerts</p>
              <h3>风险与异常</h3>
              <p class="section-note">每页展示 4 条重点告警，可继续翻页查看不同类型的异常与积压。</p>
            </div>
            <div class="panel-actions">
              <span class="page-indicator">第 ${state.homeAlertPage} / ${alertPages} 页</span>
              ${alertPages > 1 ? `
                <div class="pager">
                  <button class="pager-button" data-action="home-alert-page" data-page="${state.homeAlertPage - 1}" ${state.homeAlertPage === 1 ? "disabled" : ""}>上一页</button>
                  <button class="pager-button" data-action="home-alert-page" data-page="${state.homeAlertPage + 1}" ${state.homeAlertPage === alertPages ? "disabled" : ""}>下一页</button>
                </div>
              ` : ""}
            </div>
          </div>
          <div class="alert-grid">
            ${visibleAlerts
              .map((item) => `
                <button class="alert-card alert-card-button ${item.tone}" data-action="home-alert" data-alert-id="${item.id}">
                  <div class="alert-head">
                    <p class="label">${item.label}</p>
                    <strong>${item.value}</strong>
                  </div>
                  <p>${item.detail}</p>
                </button>
              `)
              .join("")}
          </div>
        </article>

        <article class="dashboard-panel quick-panel">
          <div class="section-head">
            <div>
              <p class="section-kicker">Quick Actions</p>
              <h3>快捷入口</h3>
            </div>
          </div>
          <div class="quick-grid">
            ${supervisorQuickActions
              .map((item) => `
                <a class="quick-card" href="#${item.route}" data-action="module-shortcut" data-shortcut-id="${item.id}">
                  <strong>${item.label}</strong>
                  <p>${item.note}</p>
                </a>
              `)
              .join("")}
          </div>
        </article>
      </section>

      <section class="dashboard-lower">
        <article class="dashboard-panel">
          <div class="section-head">
            <div>
              <p class="section-kicker">Task Summary</p>
              <h3>待处理任务</h3>
              <p class="section-note">按当前值班规则自动生成，不同业务线可切换为退款、物流或 VIP 队列。</p>
            </div>
            <div class="chip-row">
              <span class="chip">${activeFilter.label}</span>
              ${state.homeTaskFilter !== "all" ? `<button class="chip-button" data-action="home-filter" data-filter="all">查看全部</button>` : ""}
            </div>
          </div>
          <div class="task-summary-grid">
            ${supervisorTaskBuckets
              .filter((item) => item.id !== "all")
              .map((item) => `
                <button class="task-summary-card ${state.homeTaskFilter === item.id ? "active" : ""}" data-action="home-filter" data-filter="${item.id}">
                  <p class="label">${item.label}</p>
                  <strong>${taskCountForBucket(item.id)}</strong>
                  <span>${item.detail || "按当前任务策略聚合"}</span>
                </button>
              `)
              .join("")}
          </div>
        </article>

        <article class="dashboard-panel">
            <div class="section-head">
              <div>
                <p class="section-kicker">Queue Table</p>
                <h3>统一任务表</h3>
              </div>
              <div class="panel-actions">
                <span class="page-indicator">第 ${state.homeTaskPage} / ${taskPages} 页</span>
                ${taskPages > 1 ? `
                  <div class="pager">
                    <button class="pager-button" data-action="home-task-page" data-page="${state.homeTaskPage - 1}" ${state.homeTaskPage === 1 ? "disabled" : ""}>上一页</button>
                    <button class="pager-button" data-action="home-task-page" data-page="${state.homeTaskPage + 1}" ${state.homeTaskPage === taskPages ? "disabled" : ""}>下一页</button>
                  </div>
                ` : ""}
              </div>
            </div>
          <div class="task-table-wrap">
            <div class="task-table task-table-head">
              <span>会话 / 用户</span>
              <span>问题类型</span>
              <span>当前状态</span>
              <span>风险等级</span>
              <span>等待时长</span>
              <span>建议动作</span>
            </div>
            ${visibleTasks
              .map((task) => `
                <div class="task-table task-table-row">
                  <span><strong>${task.customer}</strong><small>${task.issue}</small></span>
                  <span>${task.type}</span>
                  <span>${task.status}</span>
                  <span><b class="risk-pill ${task.risk === "\u9ad8" ? "high" : task.risk === "\u4e2d" ? "medium" : "low"}">${task.risk}</b></span>
                  <span>${task.wait}</span>
                  <span><button class="task-link-button" data-action="home-task-open" data-task-id="${task.id}" data-task-bucket="${task.bucket}">${task.action}</button></span>
                </div>
              `)
              .join("")}
          </div>
        </article>
      </section>
    </section>
  `;
}

function renderDialogCenterLanding() {
  const visibleConversations = filteredDialogConversations();
  const current = ensureActiveDialogConversation();
  const currentIndex = current ? visibleConversations.findIndex((conversation) => conversation.id === current.id) : -1;
  const currentPosition = currentIndex >= 0 ? currentIndex + 1 : 0;

  if (!current) {
    return `
      <section class="dialog-center-shell">
        <article class="module-hero">
          <p class="section-kicker">对话中心</p>
          <h2>当前没有符合筛选条件的会话</h2>
          <p>可以切换状态、视图，或者搜索其他用户与订单号。</p>
        </article>
      </section>
    `;
  }

  const suggestion = current.suggestion;
  const micIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 11.5a5 5 0 0 0 10 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 16.5V20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9 20h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;

  return `
    <section class="dialog-center-shell">
      <aside class="dialog-sidebar">
        <article class="dialog-card">
          <p class="section-kicker">搜索与状态</p>
          <div class="dialog-search-row">
            <input class="input dialog-search-input" id="dialog-search-input" placeholder="搜索用户 / 订单号 / 商品关键词" value="${escapeHtml(state.dialogSearch)}">
            <button class="small-action" data-action="dialog-search">搜索</button>
          </div>
          <div class="dialog-status-tabs">
            ${dialogStatusTabs
              .map((item) => `<button class="dialog-status-tab ${state.dialogStatusTab === item.id ? "active" : ""}" data-action="dialog-status-tab" data-status="${item.id}">${item.label}</button>`)
              .join("")}
          </div>
        </article>

        <article class="dialog-card">
          <div class="section-head compact">
            <div>
              <p class="section-kicker">系统视图</p>
              <p class="section-note">按处理状态分流会话</p>
            </div>
          </div>
          <div class="dialog-view-list">
            ${dialogSystemViews
              .map(
                (item) => `
                  <button class="dialog-view-item ${state.dialogViewId === item.id ? "active" : ""}" data-action="dialog-view" data-view="${item.id}">
                    <div>
                      <strong>${item.label}</strong>
                      <small>${item.note}</small>
                    </div>
                    <span>${dialogViewCount(item.id)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </article>

        <article class="dialog-card">
          <div class="section-head compact">
            <div>
              <p class="section-kicker">专项视图</p>
              <p class="section-note">按专题问题集中处理</p>
            </div>
          </div>
          <div class="dialog-view-list">
            ${dialogBusinessViews
              .map(
                (item) => `
                  <button class="dialog-view-item ${state.dialogViewId === item.id ? "active" : ""}" data-action="dialog-view" data-view="${item.id}">
                    <div>
                      <strong>${item.label}</strong>
                      <small>${item.note}</small>
                    </div>
                    <span>${dialogViewCount(item.id)}</span>
                  </button>
                `
              )
              .join("")}
          </div>
        </article>

        <article class="dialog-card grow">
          <div class="section-head compact">
            <div>
              <p class="section-kicker">会话列表</p>
              <p class="section-note">${dialogStatusLabel(state.dialogStatusTab)} · ${visibleConversations.length} 条</p>
            </div>
          </div>
          <div class="dialog-queue-list">
            ${visibleConversations
              .map(
                (conversation) => `
                  <button class="dialog-queue-card ${conversation.id === current.id ? "active" : ""}" data-action="select-conversation" data-conversation-id="${conversation.id}">
                    <div class="dialog-queue-top">
                      <strong>${escapeHtml(conversation.customer)}</strong>
                      <span>${escapeHtml(conversation.updatedAt)}</span>
                    </div>
                    <h4>${escapeHtml(conversation.topic)}</h4>
                    <div class="dialog-tag-row">
                      <span class="signal-chip ${dialogRiskTone(conversation)}">${escapeHtml(conversation.riskLabel)}</span>
                      <span class="signal-chip neutral">${escapeHtml(conversation.status)}</span>
                    </div>
                    <p>${escapeHtml(conversation.preview)}</p>
                    <div class="dialog-queue-meta">
                      <span>${escapeHtml(conversation.channel)}</span>
                      <span>${escapeHtml(conversation.assignee)}</span>
                      <span>${escapeHtml(conversation.aiState)}</span>
                    </div>
                  </button>
                `
              )
              .join("")}
          </div>
        </article>
      </aside>

      <div class="dialog-main-column">
        <article class="dialog-thread-shell">
          <div class="dialog-thread-header">
            <div>
              <p class="section-kicker">会话头部</p>
              <h2>${escapeHtml(current.customer)} · ${escapeHtml(current.topic)}</h2>
              <p>${escapeHtml(current.channel)}会话 · ${escapeHtml(current.assignee)} · ${escapeHtml(current.updatedLabel)}</p>
              <div class="dialog-tag-row">
                ${current.tags.map((tag) => `<span class="signal-chip ${tag.includes("高风险") ? "risk" : tag.includes("待接管") || tag.includes("SLA") ? "warn" : "neutral"}">${escapeHtml(tag)}</span>`).join("")}
              </div>
            </div>
            <div class="dialog-thread-actions">
              <button class="small-action ${current.requiresHuman ? "solid-action" : ""}" data-action="workspace-human">${current.requiresHuman ? "人工处理中" : "接管会话"}</button>
              <button class="small-action" data-action="workspace-escalate">升级工单</button>
            </div>
          </div>

          <div class="dialog-stream-panel">
            <p class="section-kicker">消息流</p>
            <div class="dialog-stream">
              ${current.timeline
                .map((item) => {
                  if (item.kind === "event") {
                    return `<div class="dialog-event">${escapeHtml(item.text)}</div>`;
                  }
                  return `
                    <div class="dialog-message ${item.role === "user" ? "user" : "assistant"}">
                      <div class="dialog-message-head">
                        <strong>${escapeHtml(item.sender)}</strong>
                        <span>${escapeHtml(item.time)}</span>
                        ${item.badge ? `<em>${escapeHtml(item.badge)}</em>` : ""}
                      </div>
                      <div>${escapeHtml(item.text)}</div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>

          <div class="dialog-assist-card ${state.dialogSuggestionExpanded ? "expanded" : "collapsed"}">
            <div class="dialog-assist-top">
              <div>
                <p class="section-kicker">AI 建议回复</p>
                <h3>${escapeHtml(suggestion.headline)}</h3>
              </div>
              <div class="dialog-tag-row">
                <span class="signal-chip good">${escapeHtml(suggestion.status)}</span>
                <span class="signal-chip ${dialogAssistantTone(current)}">${escapeHtml(suggestion.confidence)}</span>
                <button class="chip-button" data-action="dialog-toggle-suggestion">${state.dialogSuggestionExpanded ? "收起建议" : "展开建议"}</button>
              </div>
            </div>
            <p class="dialog-assist-summary">${escapeHtml(suggestion.summary)}</p>
            ${
              state.dialogSuggestionExpanded
                ? `
                  <div class="dialog-assist-detail">
                    <p>${escapeHtml(suggestion.body)}</p>
                    <div class="dialog-evidence">${escapeHtml(suggestion.evidence)}</div>
                    <p class="dialog-risk-note">${escapeHtml(suggestion.riskNote)}</p>
                    <div class="dialog-assist-actions">
                      <button class="small-action" data-action="dialog-insert-suggestion">插入输入框</button>
                      <button class="small-action" data-action="dialog-regenerate">重新生成</button>
                      <button class="small-action" data-action="workspace-gap">标记不适用</button>
                    </div>
                  </div>
                `
                : ""
            }
          </div>

          <div class="dialog-composer">
            <p class="section-kicker">回复输入区</p>
            <textarea class="dialog-composer-input" id="dialog-reply-input" placeholder="在这里编辑最终发送给用户的回复，也可以插入 AI 建议后再修改。"></textarea>
            <div class="dialog-composer-actions">
              <div class="dialog-icon-actions">
                <button class="icon-button" aria-label="上传图片或附件">+</button>
                <button class="icon-button" aria-label="语音输入">${micIcon}</button>
              </div>
              <div class="dialog-inline-actions">
                <button class="chip-button" data-action="dialog-quick-reply">快捷回复</button>
                <button class="chip-button" data-action="workspace-gap">标记知识缺口</button>
              </div>
              <button class="solid-action" data-action="dialog-send-reply">发送回复</button>
            </div>
          </div>
        </article>
      </div>

      <aside class="dialog-right-column">
        <article class="dialog-card">
          <p class="section-kicker">用户与会话信息</p>
          <div class="dialog-meta-list">
            <div><span>用户</span><strong>${escapeHtml(current.customer)}</strong></div>
            <div><span>渠道</span><strong>${escapeHtml(current.channel)}</strong></div>
            <div><span>状态</span><strong>${escapeHtml(current.status)}</strong></div>
            <div><span>分派</span><strong>${escapeHtml(current.assignee)}</strong></div>
            <div><span>最近活跃</span><strong>${escapeHtml(current.updatedLabel.replace("更新", ""))}</strong></div>
          </div>
          <div class="dialog-tag-row">
            <span class="signal-chip ${dialogRiskTone(current)}">${escapeHtml(current.riskLabel)}</span>
            ${current.intent === "after_sale" ? `<span class="signal-chip warn">售后争议</span>` : ""}
            ${current.vip ? `<span class="signal-chip neutral">重点用户</span>` : ""}
          </div>
        </article>

        <article class="dialog-card">
          <p class="section-kicker">订单 / 商品上下文</p>
          <div class="dialog-meta-stack">
            <strong>订单 ${escapeHtml(current.order.id)}</strong>
            <p>商品：${escapeHtml(current.order.product)}</p>
            <p>金额：${escapeHtml(current.order.amount)}</p>
            <p>状态：${escapeHtml(current.order.shipping)}</p>
            <p>售后状态：${escapeHtml(current.order.afterSale)}</p>
          </div>
        </article>

        <article class="dialog-card">
          <p class="section-kicker">知识与 AI 依据</p>
          <ul class="dialog-bullet-list">
            <li>FAQ：${escapeHtml(current.knowledge.faq)}</li>
            <li>规则：${escapeHtml(current.knowledge.rule)}</li>
            <li>AI 置信度：${escapeHtml(current.knowledge.confidence)}</li>
            <li>知识缺口：${escapeHtml(current.knowledge.gap)}</li>
          </ul>
        </article>

        <article class="dialog-card">
          <p class="section-kicker">操作与备注</p>
          <div class="dialog-action-stack">
            <button class="dialog-side-action">
              <strong>转派给售后同事</strong>
              <small>适合退款争议、规则确认与售后核验场景</small>
            </button>
            <button class="dialog-side-action" data-action="workspace-escalate">
              <strong>升级到质检 / 售后主管</strong>
              <small>用于描述不符、投诉升级或高优先级争议</small>
            </button>
            <button class="dialog-side-action" data-action="workspace-gap">
              <strong>标记知识缺口</strong>
              <small>回流 FAQ、商品知识或策略规则</small>
            </button>
          </div>
          <div class="dialog-note-head">
            <p class="section-kicker">内部备注</p>
            <button class="chip-button">新增备注</button>
          </div>
          <div class="dialog-note-card">
            <strong>最近备注</strong>
            <p>${escapeHtml(current.internalNote)}</p>
          </div>
        </article>
      </aside>
    </section>
  `;
}

function renderAiConfigLanding() {
  return `
    <section class="module-placeholder">
      <article class="module-hero">
        <p class="section-kicker">AI Support Configuration</p>
        <h2>AI 客服配置</h2>
        <p>知识源、知识测试、回答策略、转人工规则和发布链路会在这里进一步细化。</p>
      </article>
      <div class="placeholder-grid">
        <article class="placeholder-card">
          <p class="label">Knowledge</p>
          <h4>知识库与 FAQ</h4>
          <p>统一管理 FAQ、文档、商品知识和召回状态。</p>
        </article>
        <article class="placeholder-card">
          <p class="label">Validation</p>
          <h4>知识测试与发布预览</h4>
          <p>运营可先用问题预演确认命中来源、引用片段和发布影响面。</p>
        </article>
        <article class="placeholder-card">
          <p class="label">Policy</p>
          <h4>AI 回答策略与转人工</h4>
          <p>将包含品牌语气、低置信度兵底、唱后规则和人工接管路由。</p>
        </article>
      </div>
    </section>
  `;
}

function renderDialogCenterWorkbench() {
  const visibleConversations = filteredDialogConversations();
  const current = ensureActiveDialogConversation();

  if (!current) {
    return `
      <section class="dialog-center-shell dialog-center-shell-v2">
        <article class="module-hero">
          <p class="section-kicker">对话中心</p>
          <h2>当前没有符合筛选条件的会话</h2>
          <p>可以切换状态、视图，或者搜索其他用户与订单号。</p>
        </article>
      </section>
    `;
  }

  const suggestion = current.suggestion;
  const micIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 11.5a5 5 0 0 0 10 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 16.5V20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9 20h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;

  return `
    <section class="dialog-workbench-page">
      <article class="dashboard-hero dialog-workbench-hero">
        <div>
          <p class="section-kicker">Conversation Center</p>
          <h2>对话中心工作面板</h2>
          <p>统一在一个工作面里处理接管、风险会话和知识缺口，中栏优先保证回复效率，左右栏只承载必要信息与上下文。</p>
        </div>
        <div class="dashboard-hero-actions dialog-workbench-actions">
          <span class="chip">当前视图：${escapeHtml(dialogStatusLabel(state.dialogStatusTab))}</span>
          <span class="chip">可处理 ${visibleConversations.length} 条</span>
          <a class="small-action" href="#home">返回首页</a>
        </div>
      </article>

      <section class="dialog-center-shell dialog-center-shell-v2">
        <aside class="dialog-sidebar">
        <article class="dialog-panel dialog-sidebar-panel">
          <section class="dialog-panel-section dialog-panel-section-tight">
            <p class="section-kicker">搜索与状态</p>
            <div class="dialog-search-row">
              <input class="input dialog-search-input" id="dialog-search-input" placeholder="搜索用户 / 订单号 / 商品关键词" value="${escapeHtml(state.dialogSearch)}">
              <button class="small-action" data-action="dialog-search">搜索</button>
            </div>
            <div class="dialog-status-tabs">
              ${dialogStatusTabs
                .map((item) => `<button class="dialog-status-tab ${state.dialogStatusTab === item.id ? "active" : ""}" data-action="dialog-status-tab" data-status="${item.id}">${item.label}</button>`)
                .join("")}
            </div>
          </section>

          <section class="dialog-panel-section">
            <div class="section-head compact">
              <div>
                <p class="section-kicker">系统视图</p>
                <p class="section-note">按处理状态分流会话</p>
              </div>
            </div>
            <div class="dialog-view-list">
              ${dialogSystemViews
                .map(
                  (item) => `
                    <button class="dialog-view-item ${state.dialogViewId === item.id ? "active" : ""}" data-action="dialog-view" data-view="${item.id}">
                      <div>
                        <strong>${item.label}</strong>
                        <small>${item.note}</small>
                      </div>
                      <span>${dialogViewCount(item.id)}</span>
                    </button>
                  `
                )
                .join("")}
            </div>
          </section>

          <section class="dialog-panel-section">
            <div class="section-head compact">
              <div>
                <p class="section-kicker">专项视图</p>
                <p class="section-note">按业务问题集中处理</p>
              </div>
            </div>
            <div class="dialog-view-list">
              ${dialogBusinessViews
                .map(
                  (item) => `
                    <button class="dialog-view-item ${state.dialogViewId === item.id ? "active" : ""}" data-action="dialog-view" data-view="${item.id}">
                      <div>
                        <strong>${item.label}</strong>
                        <small>${item.note}</small>
                      </div>
                      <span>${dialogViewCount(item.id)}</span>
                    </button>
                  `
                )
                .join("")}
            </div>
          </section>

          <section class="dialog-panel-section dialog-panel-fill">
            <div class="section-head compact">
              <div>
                <p class="section-kicker">会话列表</p>
                <p class="section-note">${dialogStatusLabel(state.dialogStatusTab)} · ${visibleConversations.length} 条</p>
              </div>
            </div>
            <div class="dialog-queue-list">
              ${visibleConversations
                .map(
                  (conversation) => `
                    <button class="dialog-queue-card ${conversation.id === current.id ? "active" : ""}" data-action="select-conversation" data-conversation-id="${conversation.id}">
                      <div class="dialog-queue-top">
                        <strong>${escapeHtml(conversation.customer)}</strong>
                        <span>${escapeHtml(conversation.updatedAt)}</span>
                      </div>
                      <h4>${escapeHtml(conversation.topic)}</h4>
                      <div class="dialog-tag-row">
                        <span class="signal-chip ${dialogRiskTone(conversation)}">${escapeHtml(conversation.riskLabel)}</span>
                        <span class="signal-chip neutral">${escapeHtml(conversation.status)}</span>
                      </div>
                      <p>${escapeHtml(conversation.preview)}</p>
                      <div class="dialog-queue-meta">
                        <span>${escapeHtml(conversation.channel)}</span>
                        <span>${escapeHtml(conversation.assignee)}</span>
                        <span>${escapeHtml(conversation.aiState)}</span>
                      </div>
                    </button>
                  `
                )
                .join("")}
            </div>
          </section>
        </article>
      </aside>

      <div class="dialog-main-column">
        <article class="dialog-thread-shell dialog-thread-shell-v2">
          <div class="dialog-thread-header">
            <div>
              <p class="section-kicker">会话头部</p>
              <h2>${escapeHtml(current.customer)} · ${escapeHtml(current.topic)}</h2>
              <p>${escapeHtml(current.channel)} 会话 · ${escapeHtml(current.assignee)} · ${escapeHtml(current.updatedLabel)}</p>
              <div class="dialog-tag-row">
                ${current.tags.map((tag) => `<span class="signal-chip ${tag.includes("高风险") ? "risk" : tag.includes("待接管") || tag.includes("SLA") ? "warn" : "neutral"}">${escapeHtml(tag)}</span>`).join("")}
              </div>
            </div>
            <div class="dialog-thread-actions">
              <button class="small-action ${current.requiresHuman ? "solid-action" : ""}" data-action="workspace-human">${current.requiresHuman ? "人工处理中" : "接管会话"}</button>
              <button class="small-action" data-action="workspace-escalate">升级工单</button>
            </div>
          </div>

          <div class="dialog-stream-panel">
            <p class="section-kicker">消息流</p>
            <div class="dialog-stream">
              ${current.timeline
                .map((item) => {
                  if (item.kind === "event") {
                    return `<div class="dialog-event">${escapeHtml(item.text)}</div>`;
                  }

                  return `
                    <div class="dialog-message ${item.role === "user" ? "user" : "assistant"}">
                      <div class="dialog-message-head">
                        <strong>${escapeHtml(item.sender)}</strong>
                        <span>${escapeHtml(item.time)}</span>
                        ${item.badge ? `<em>${escapeHtml(item.badge)}</em>` : ""}
                      </div>
                      <div>${escapeHtml(item.text)}</div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>

          <div class="dialog-assist-card ${state.dialogSuggestionExpanded ? "expanded" : "collapsed"}">
            <div class="dialog-assist-top">
              <div>
                <p class="section-kicker">AI 建议条</p>
                <h3>${escapeHtml(suggestion.headline)}</h3>
              </div>
              <div class="dialog-tag-row">
                <span class="signal-chip good">${escapeHtml(suggestion.status)}</span>
                <span class="signal-chip ${dialogAssistantTone(current)}">${escapeHtml(suggestion.confidence)}</span>
                <button class="chip-button" data-action="dialog-toggle-suggestion">${state.dialogSuggestionExpanded ? "收起建议" : "展开建议"}</button>
              </div>
            </div>
            <p class="dialog-assist-summary">${escapeHtml(suggestion.summary)}</p>
            ${
              state.dialogSuggestionExpanded
                ? `
                  <div class="dialog-assist-detail">
                    <p>${escapeHtml(suggestion.body)}</p>
                    <div class="dialog-evidence">${escapeHtml(suggestion.evidence)}</div>
                    <p class="dialog-risk-note">${escapeHtml(suggestion.riskNote)}</p>
                    <div class="dialog-assist-actions">
                      <button class="small-action" data-action="dialog-insert-suggestion">插入输入框</button>
                      <button class="small-action" data-action="dialog-regenerate">重新生成</button>
                      <button class="small-action" data-action="workspace-gap">标记不适用</button>
                    </div>
                  </div>
                `
                : ""
            }
          </div>

          <div class="dialog-composer">
            <p class="section-kicker">输入区</p>
            <textarea class="dialog-composer-input" id="dialog-reply-input" placeholder="在这里编辑最终发送给用户的回复，也可以插入 AI 建议后再修改。"></textarea>
            <div class="dialog-composer-actions">
              <div class="dialog-icon-actions">
                <button class="icon-button" aria-label="上传图片或附件">+</button>
                <button class="icon-button" aria-label="语音输入">${micIcon}</button>
              </div>
              <div class="dialog-inline-actions">
                <button class="chip-button" data-action="dialog-quick-reply">快捷回复</button>
                <button class="chip-button" data-action="workspace-gap">标记知识缺口</button>
              </div>
              <button class="solid-action" data-action="dialog-send-reply">发送回复</button>
            </div>
          </div>
        </article>
      </div>

      <aside class="dialog-right-column">
        <article class="dialog-panel dialog-context-panel">
          <section class="dialog-panel-section dialog-panel-section-tight">
            <p class="section-kicker">右侧模块栏</p>
            <div class="dialog-context-nav">
              <span class="dialog-context-chip active">用户信息</span>
              <span class="dialog-context-chip">订单商品</span>
              <span class="dialog-context-chip">知识依据</span>
              <span class="dialog-context-chip">动作备注</span>
            </div>
          </section>

          <section class="dialog-panel-section">
            <p class="section-kicker">用户信息</p>
            <div class="dialog-meta-list">
              <div><span>用户</span><strong>${escapeHtml(current.customer)}</strong></div>
              <div><span>渠道</span><strong>${escapeHtml(current.channel)}</strong></div>
              <div><span>状态</span><strong>${escapeHtml(current.status)}</strong></div>
              <div><span>分派</span><strong>${escapeHtml(current.assignee)}</strong></div>
              <div><span>最近活跃</span><strong>${escapeHtml(current.updatedLabel)}</strong></div>
            </div>
            <div class="dialog-tag-row">
              <span class="signal-chip ${dialogRiskTone(current)}">${escapeHtml(current.riskLabel)}</span>
              ${current.intent === "after_sale" ? `<span class="signal-chip warn">售后争议</span>` : ""}
              ${current.vip ? `<span class="signal-chip neutral">重点用户</span>` : ""}
            </div>
          </section>

          <section class="dialog-panel-section">
            <p class="section-kicker">订单商品</p>
            <div class="dialog-meta-stack">
              <strong>订单 ${escapeHtml(current.order.id)}</strong>
              <p>商品：${escapeHtml(current.order.product)}</p>
              <p>金额：${escapeHtml(current.order.amount)}</p>
              <p>状态：${escapeHtml(current.order.shipping)}</p>
              <p>售后状态：${escapeHtml(current.order.afterSale)}</p>
            </div>
          </section>

          <section class="dialog-panel-section">
            <p class="section-kicker">知识依据</p>
            <ul class="dialog-bullet-list">
              <li>FAQ：${escapeHtml(current.knowledge.faq)}</li>
              <li>规则：${escapeHtml(current.knowledge.rule)}</li>
              <li>AI 置信度：${escapeHtml(current.knowledge.confidence)}</li>
              <li>知识缺口：${escapeHtml(current.knowledge.gap)}</li>
            </ul>
          </section>

          <section class="dialog-panel-section dialog-panel-fill">
            <p class="section-kicker">动作备注</p>
            <div class="dialog-action-stack">
              <button class="dialog-side-action">
                <strong>转派给售后同事</strong>
                <small>适合退款争议、规则确认与售后核验场景</small>
              </button>
              <button class="dialog-side-action" data-action="workspace-escalate">
                <strong>升级到质检 / 售后主管</strong>
                <small>用于描述不符、投诉升级或高优先级争议</small>
              </button>
              <button class="dialog-side-action" data-action="workspace-gap">
                <strong>标记知识缺口</strong>
                <small>回流 FAQ、商品知识或策略规则</small>
              </button>
            </div>
            <div class="dialog-note-head">
              <p class="section-kicker">内部备注</p>
              <button class="chip-button">新增备注</button>
            </div>
            <div class="dialog-note-card">
              <strong>最近备注</strong>
              <p>${escapeHtml(current.internalNote)}</p>
            </div>
          </section>
        </article>
      </aside>
    </section>
    </section>
  `;
}

function renderDialogCenterWorkbenchV2() {
  const visibleConversations = filteredDialogConversations();
  const current = ensureActiveDialogConversation();
  const suggestion = current ? current.suggestion : null;
  const currentIndex = current ? visibleConversations.findIndex((conversation) => conversation.id === current.id) : -1;
  const currentPosition = currentIndex >= 0 ? currentIndex + 1 : 0;
  const replyQueueMine = state.conversations.filter((conversation) => conversation.mine && conversation.workflowState === "active");
  const replyQueueSupport = state.conversations.filter(
    (conversation) =>
      !conversation.mine &&
      conversation.workflowState === "active" &&
      (conversation.requiresHuman || conversation.slaRisk || conversation.needsKnowledge)
  );
  const replyQueueConversations = [...replyQueueMine, ...replyQueueSupport].filter(
    (conversation, index, list) => list.findIndex((item) => item.id === conversation.id) === index
  );
  const pendingPageCount = Math.max(1, Math.ceil(replyQueueConversations.length / DIALOG_PENDING_PER_PAGE));
  const pendingPage = Math.min(state.dialogPendingPage, pendingPageCount);
  if (pendingPage !== state.dialogPendingPage) {
    state.dialogPendingPage = pendingPage;
  }
  const pendingPageStart = (pendingPage - 1) * DIALOG_PENDING_PER_PAGE;
  const visiblePendingConversations = replyQueueConversations.slice(
    pendingPageStart,
    pendingPageStart + DIALOG_PENDING_PER_PAGE
  );
  const micIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15a3 3 0 0 0 3-3V7a3 3 0 1 0-6 0v5a3 3 0 0 0 3 3Z" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
      <path d="M7 11.5a5 5 0 0 0 10 0" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M12 16.5V20" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M9 20h6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>
    </svg>
  `;

  const mainColumn = current
    ? `
        <div class="dialog-thread-header">
          <div>
            <p class="section-kicker">会话头部</p>
            <h2>${escapeHtml(current.customer)} · ${escapeHtml(current.topic)}</h2>
            <p>${escapeHtml(current.channel)} 会话 · ${escapeHtml(current.assignee)} · ${escapeHtml(current.updatedLabel)}</p>
            <div class="dialog-tag-row">
              ${current.tags.map((tag) => `<span class="signal-chip ${tag.includes("高风险") ? "risk" : tag.includes("待接管") || tag.includes("SLA") ? "warn" : "neutral"}">${escapeHtml(tag)}</span>`).join("")}
            </div>
          </div>
          <div class="dialog-thread-actions">
            ${
              visibleConversations.length > 1
                ? `<span class="chip dialog-thread-counter">${escapeHtml(dialogViewLabel(state.dialogViewId))} · ${currentPosition} / ${visibleConversations.length}</span>`
                : ""
            }
            ${
              visibleConversations.length > 1
                ? `
                    <button class="small-action" data-action="dialog-cycle-conversation" data-step="-1" ${currentIndex <= 0 ? "disabled" : ""}>上一条</button>
                    <button class="small-action" data-action="dialog-cycle-conversation" data-step="1" ${currentIndex >= visibleConversations.length - 1 ? "disabled" : ""}>下一条</button>
                  `
                : ""
            }
            <button class="small-action ${current.requiresHuman ? "solid-action" : ""}" data-action="workspace-human">${current.requiresHuman ? "人工处理中" : "接管会话"}</button>
            <button class="small-action" data-action="workspace-escalate">升级工单</button>
          </div>
        </div>

        <div class="dialog-stream-panel">
          <p class="section-kicker">消息流</p>
          <div class="dialog-scroll-indicator dialog-scroll-indicator-top" aria-hidden="true">
            <span>上滑查看更早消息</span>
          </div>
          <div class="dialog-stream" data-dialog-scroll>
            <div class="dialog-stream-track">
              ${current.timeline
                .map((item) => {
                  if (item.kind === "event") {
                    return `<div class="dialog-event">${escapeHtml(item.text)}</div>`;
                  }

                  return `
                    <div class="dialog-message ${item.role === "user" ? "user" : "assistant"}">
                      <div class="dialog-message-head">
                        <strong>${escapeHtml(item.sender)}</strong>
                        <span>${escapeHtml(item.time)}</span>
                        ${item.badge ? `<em>${escapeHtml(item.badge)}</em>` : ""}
                      </div>
                      <div>${escapeHtml(item.text)}</div>
                    </div>
                  `;
                })
                .join("")}
            </div>
          </div>
          <div class="dialog-scroll-indicator dialog-scroll-indicator-bottom" aria-hidden="true">
            <span>下滑返回最新回复</span>
          </div>
        </div>

        <div class="dialog-assist-card ${state.dialogSuggestionExpanded ? "expanded" : "collapsed"}">
          <div class="dialog-assist-top">
            <div>
              <p class="section-kicker">AI 建议条</p>
              <h3>${escapeHtml(suggestion.headline)}</h3>
            </div>
            <div class="dialog-tag-row">
              <span class="signal-chip good">${escapeHtml(suggestion.status)}</span>
              <span class="signal-chip ${dialogAssistantTone(current)}">${escapeHtml(suggestion.confidence)}</span>
              <button class="chip-button" data-action="dialog-toggle-suggestion">${state.dialogSuggestionExpanded ? "收起建议" : "展开建议"}</button>
            </div>
          </div>
          <p class="dialog-assist-summary">${escapeHtml(suggestion.summary)}</p>
          ${
            state.dialogSuggestionExpanded
              ? `
                  <div class="dialog-assist-detail">
                    <p>${escapeHtml(suggestion.body)}</p>
                    <div class="dialog-evidence">${escapeHtml(suggestion.evidence)}</div>
                    <p class="dialog-risk-note">${escapeHtml(suggestion.riskNote)}</p>
                    <div class="dialog-assist-actions">
                      <button class="small-action" data-action="dialog-insert-suggestion">插入输入框</button>
                      <button class="small-action" data-action="dialog-regenerate">重新生成</button>
                      <button class="small-action" data-action="workspace-gap">标记不适用</button>
                    </div>
                  </div>
                `
              : ""
          }
        </div>

        <div class="dialog-composer">
          <p class="section-kicker">输入区</p>
          <textarea class="dialog-composer-input" id="dialog-reply-input" placeholder="在这里编辑最终发送给用户的回复，也可以插入 AI 建议后再修改。"></textarea>
          <div class="dialog-composer-actions">
            <div class="dialog-icon-actions">
              <button class="icon-button" aria-label="上传图片或附件">+</button>
              <button class="icon-button" aria-label="语音输入">${micIcon}</button>
            </div>
            <div class="dialog-inline-actions">
              <button class="chip-button" data-action="dialog-quick-reply">快捷回复</button>
              <button class="chip-button" data-action="workspace-gap">标记知识缺口</button>
            </div>
            <button class="solid-action" data-action="dialog-send-reply">发送回复</button>
          </div>
        </div>
      `
    : `
        <div class="dialog-thread-header dialog-thread-header-empty">
          <div>
            <p class="section-kicker">会话头部</p>
            <h2>当前筛选下没有可处理会话</h2>
            <p>可以切换左侧系统视图、专项视图，或清空搜索后回到完整队列。</p>
          </div>
          <div class="dialog-thread-actions">
            <button class="small-action" data-action="open-dialog-view" data-view="all" data-reset-search="true">查看全部会话</button>
            <button class="small-action" data-action="open-dialog-view" data-view="knowledge-gap" data-reset-search="true">查看待补知识</button>
          </div>
        </div>

        <div class="dialog-stream-panel dialog-empty-panel">
          <div class="empty-state">
            当前筛选组合没有命中会话。左栏仍可继续切换状态和视图，不需要退回别的页面。
          </div>
        </div>

        <div class="dialog-assist-card dialog-assist-card-empty">
          <div class="dialog-assist-top">
            <div>
              <p class="section-kicker">AI 建议条</p>
              <h3>等待选择会话</h3>
            </div>
          </div>
          <p class="dialog-assist-summary">当左栏重新选中一条会话后，这里会恢复 AI 建议、证据和输入联动。</p>
        </div>

        <div class="dialog-composer dialog-composer-disabled">
          <p class="section-kicker">输入区</p>
          <textarea class="dialog-composer-input" placeholder="请先从左侧选择一条会话。" disabled></textarea>
        </div>
      `;

  const rightColumn = current
    ? `
        <section class="dialog-panel-section dialog-context-block">
          <p class="section-kicker">用户信息</p>
          <div class="dialog-meta-list">
            <div><span>用户</span><strong>${escapeHtml(current.customer)}</strong></div>
            <div><span>渠道</span><strong>${escapeHtml(current.channel)}</strong></div>
            <div><span>状态</span><strong>${escapeHtml(current.status)}</strong></div>
            <div><span>分派</span><strong>${escapeHtml(current.assignee)}</strong></div>
            <div><span>最近活跃</span><strong>${escapeHtml(current.updatedLabel)}</strong></div>
          </div>
          <div class="dialog-tag-row">
            <span class="signal-chip ${dialogRiskTone(current)}">${escapeHtml(current.riskLabel)}</span>
            ${current.intent === "after_sale" ? `<span class="signal-chip warn">售后争议</span>` : ""}
            ${current.vip ? `<span class="signal-chip neutral">重点用户</span>` : ""}
          </div>
        </section>

        <section class="dialog-panel-section dialog-context-block">
          <p class="section-kicker">订单商品</p>
          <div class="dialog-meta-stack">
            <strong>订单 ${escapeHtml(current.order.id)}</strong>
            <p>商品：${escapeHtml(current.order.product)}</p>
            <p>金额：${escapeHtml(current.order.amount)}</p>
            <p>状态：${escapeHtml(current.order.shipping)}</p>
            <p>售后状态：${escapeHtml(current.order.afterSale)}</p>
          </div>
        </section>

        <section class="dialog-panel-section dialog-context-block">
          <p class="section-kicker">知识依据</p>
          <ul class="dialog-bullet-list">
            <li>FAQ：${escapeHtml(current.knowledge.faq)}</li>
            <li>规则：${escapeHtml(current.knowledge.rule)}</li>
            <li>AI 置信度：${escapeHtml(current.knowledge.confidence)}</li>
            <li>知识缺口：${escapeHtml(current.knowledge.gap)}</li>
          </ul>
        </section>
      `
    : `
        <section class="dialog-panel-section dialog-context-block">
          <p class="section-kicker">用户信息</p>
          <div class="empty-state">当前没有选中的会话，用户上下文会在这里显示。</div>
        </section>

        <section class="dialog-panel-section dialog-context-block">
          <p class="section-kicker">订单商品</p>
          <div class="empty-state">选中会话后，这里会补充订单、商品和售后状态。</div>
        </section>

        <section class="dialog-panel-section dialog-context-block">
          <p class="section-kicker">知识依据</p>
          <div class="empty-state">知识依据、命中规则和置信度会跟随当前会话联动显示。</div>
        </section>
      `;

  return `
    <section class="dialog-workbench-page">
      ${moduleContextNotice()}
      <article class="dashboard-hero dialog-workbench-hero">
        <div>
          <p class="section-kicker">Conversation Center</p>
          <h2>对话中心工作面板</h2>
          <p>统一在一个工作面里处理接管、风险会话和知识缺口，中栏优先保证回复效率，左右栏只承载必要信息与上下文。</p>
        </div>
        <div class="dashboard-hero-actions dialog-workbench-actions">
          <span class="chip">当前视图：${escapeHtml(dialogStatusLabel(state.dialogStatusTab))}</span>
          <span class="chip">可处理 ${visibleConversations.length} 条</span>
          <a class="small-action" href="#home">返回首页</a>
        </div>
      </article>

      <section class="dialog-center-shell dialog-center-shell-v2">
        <aside class="dialog-sidebar">
          <article class="dialog-panel dialog-sidebar-panel">
            <section class="dialog-panel-section dialog-panel-section-tight dialog-left-section dialog-left-section-search">
              <p class="section-kicker">搜索与状态</p>
              <div class="dialog-search-row">
                <input class="input dialog-search-input" id="dialog-search-input" placeholder="搜索用户 / 订单号 / 商品关键词" value="${escapeHtml(state.dialogSearch)}">
                <button class="small-action" data-action="dialog-search">搜索</button>
              </div>
              <div class="dialog-status-tabs">
                ${dialogStatusTabs
                  .map((item) => `<button class="dialog-status-tab ${state.dialogStatusTab === item.id ? "active" : ""}" data-action="dialog-status-tab" data-status="${item.id}">${item.label}</button>`)
                  .join("")}
              </div>
            </section>

            <section class="dialog-panel-section dialog-panel-section-tight dialog-left-section dialog-left-section-pending">
              <div class="section-head compact">
                <div>
                  <p class="section-kicker">待处理对话</p>
                  <p class="section-note">优先展示我的队列，再补当前最需要盯的会话</p>
                </div>
              </div>
              <div class="dialog-pending-list">
                ${
                  replyQueueConversations.length
                    ? visiblePendingConversations
                        .map(
                          (conversation) => `
                            <button class="dialog-pending-card ${current && conversation.id === current.id ? "active" : ""}" data-action="select-conversation" data-conversation-id="${conversation.id}">
                              <div class="dialog-pending-top">
                                <strong>${escapeHtml(conversation.customer)}</strong>
                                <span>${escapeHtml(conversation.updatedAt)}</span>
                              </div>
                              <p>${escapeHtml(conversation.topic)}</p>
                              <div class="dialog-tag-row">
                                <span class="signal-chip ${dialogRiskTone(conversation)}">${escapeHtml(conversation.riskLabel)}</span>
                                <span class="signal-chip neutral">${escapeHtml(conversation.channel)}</span>
                              </div>
                            </button>
                          `
                        )
                        .join("")
                    : `<div class="empty-state">当前我的队列里没有待回复会话。</div>`
                }
              </div>
              ${
                replyQueueConversations.length > DIALOG_PENDING_PER_PAGE
                  ? `
                      <div class="dialog-pending-pager">
                        <span class="page-indicator">第 ${pendingPage} / ${pendingPageCount} 页</span>
                        <div class="dialog-inline-actions">
                          <button class="pager-button" data-action="dialog-pending-page" data-page="${pendingPage - 1}" ${pendingPage === 1 ? "disabled" : ""}>上一页</button>
                          <button class="pager-button" data-action="dialog-pending-page" data-page="${pendingPage + 1}" ${pendingPage === pendingPageCount ? "disabled" : ""}>下一页</button>
                        </div>
                      </div>
                    `
                  : ""
              }
            </section>

            <section class="dialog-panel-section dialog-left-section dialog-left-section-secondary">
              <div class="section-head compact">
                <div>
                  <p class="section-kicker">系统视图</p>
                  <p class="section-note">按处理状态分流会话</p>
                </div>
              </div>
              <div class="dialog-view-list dialog-view-grid">
                ${dialogSystemViews
                  .map(
                    (item) => `
                      <button class="dialog-view-item ${state.dialogViewId === item.id ? "active" : ""}" data-action="dialog-view" data-view="${item.id}">
                        <div>
                          <strong>${item.label}</strong>
                          <small>${item.note}</small>
                        </div>
                        <span>${dialogViewCount(item.id)}</span>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </section>

            <section class="dialog-panel-section dialog-left-section dialog-left-section-secondary">
              <div class="section-head compact">
                <div>
                  <p class="section-kicker">专项视图</p>
                  <p class="section-note">按业务问题集中处理</p>
                </div>
              </div>
              <div class="dialog-view-list dialog-view-grid">
                ${dialogBusinessViews
                  .map(
                    (item) => `
                      <button class="dialog-view-item ${state.dialogViewId === item.id ? "active" : ""}" data-action="dialog-view" data-view="${item.id}">
                        <div>
                          <strong>${item.label}</strong>
                          <small>${item.note}</small>
                        </div>
                        <span>${dialogViewCount(item.id)}</span>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </section>

            <section class="dialog-panel-section dialog-panel-fill dialog-left-section dialog-left-section-queue">
              <div class="section-head compact">
                <div>
                  <p class="section-kicker">会话列表</p>
                  <p class="section-note">${escapeHtml(dialogViewLabel(state.dialogViewId))} · ${escapeHtml(dialogStatusLabel(state.dialogStatusTab))} · ${visibleConversations.length} 条</p>
                </div>
              </div>
              <div class="dialog-queue-list">
                ${visibleConversations
                  .map(
                    (conversation) => `
                      <button class="dialog-queue-card ${current && conversation.id === current.id ? "active" : ""}" data-action="select-conversation" data-conversation-id="${conversation.id}">
                        <div class="dialog-queue-top">
                          <strong>${escapeHtml(conversation.customer)}</strong>
                          <span>${escapeHtml(conversation.updatedAt)}</span>
                        </div>
                        <h4>${escapeHtml(conversation.topic)}</h4>
                        <div class="dialog-tag-row">
                          <span class="signal-chip ${dialogRiskTone(conversation)}">${escapeHtml(conversation.riskLabel)}</span>
                          <span class="signal-chip neutral">${escapeHtml(conversation.status)}</span>
                        </div>
                        <p>${escapeHtml(conversation.preview)}</p>
                        <div class="dialog-queue-meta">
                          <span>${escapeHtml(conversation.channel)}</span>
                          <span>${escapeHtml(conversation.assignee)}</span>
                          <span>${escapeHtml(conversation.aiState)}</span>
                        </div>
                      </button>
                    `
                  )
                  .join("")}
              </div>
            </section>
          </article>
        </aside>

        <div class="dialog-main-column">
          <article class="dialog-thread-shell dialog-thread-shell-v2">
            ${mainColumn}
          </article>
        </div>

        <aside class="dialog-right-column">
          <article class="dialog-panel dialog-context-panel">
            <section class="dialog-panel-section dialog-panel-section-tight dialog-context-intro">
              <p class="section-kicker">右侧模块栏</p>
              <div class="dialog-context-nav">
                <span class="dialog-context-chip active">用户信息</span>
                <span class="dialog-context-chip">订单商品</span>
                <span class="dialog-context-chip">知识依据</span>
                <span class="dialog-context-chip">动作备注</span>
              </div>
            </section>

            ${rightColumn}

            <section class="dialog-panel-section dialog-panel-fill dialog-context-block">
              <p class="section-kicker">动作备注</p>
              <div class="dialog-action-stack">
                <button class="dialog-side-action">
                  <strong>转派给售后同事</strong>
                  <small>适合退款争议、规则确认与售后核验场景</small>
                </button>
                <button class="dialog-side-action" data-action="workspace-escalate">
                  <strong>升级到质检 / 售后主管</strong>
                  <small>用于描述不符、投诉升级或高优先级争议</small>
                </button>
                <button class="dialog-side-action" data-action="workspace-gap">
                  <strong>标记知识缺口</strong>
                  <small>回流 FAQ、商品知识或策略规则</small>
                </button>
              </div>
              <div class="dialog-note-head">
                <p class="section-kicker">内部备注</p>
                <button class="chip-button">新增备注</button>
              </div>
              <div class="dialog-note-card">
                <strong>最近备注</strong>
                <p>${escapeHtml(current ? current.internalNote : "当前没有可展示的内部备注。")}</p>
              </div>
            </section>
          </article>
        </aside>
      </section>
    </section>
  `;
}

function renderSystemSettings() {
  const activeSection = currentSystemSettingsSection();
  const activePreset = currentSystemSettingsPreset();
  const draftFields = currentSystemSettingsDraftFields();
  const activeControl = activeSection.controls[state.systemSettingsControlIndex] || activeSection.controls[0];

  return `
    <section class="settings-shell">
      ${moduleContextNotice()}
      <article class="settings-hero">
        <div>
          <p class="section-kicker">System Settings</p>
          <h2>系统设置控制台</h2>
          <p>统一管理模型、渠道、权限、知识同步、安全边界与发布机制，给主管与技术管理员一套共用的底层控制面。</p>
        </div>
        <div class="settings-hero-actions">
          <span class="chip">当前配置域：${escapeHtml(activeSection.label)}</span>
          <span class="chip">最近变更：今天 09:30</span>
          <button class="small-action">导出配置快照</button>
        </div>
      </article>

      <section class="settings-layout">
        <aside class="settings-side-nav">
          <article class="settings-side-card">
            <p class="section-kicker">配置域</p>
            <div class="settings-nav-list">
              ${systemSettingsSections.map((section) => `
                <button class="settings-nav-item ${section.id === activeSection.id ? "active" : ""}" data-action="system-settings-section" data-section-id="${section.id}">
                  <strong>${escapeHtml(section.label)}</strong>
                  <span>${escapeHtml(section.note)}</span>
                </button>
              `).join("")}
            </div>
          </article>
        </aside>

        <div class="settings-main">
          <article class="settings-panel">
            <div class="settings-section-head">
              <div>
                <p class="section-kicker">Configuration Panel</p>
                <h3>${escapeHtml(activeSection.title)}</h3>
                <p>${escapeHtml(activeSection.description)}</p>
              </div>
              <div class="chip-row">
                <span class="chip">需审批后生效</span>
                <span class="chip">变更将写入审计日志</span>
              </div>
            </div>

            <div class="settings-metric-grid">
              ${activeSection.metrics.map((metric) => `
                <article class="settings-metric-card">
                  <span>${escapeHtml(metric.label)}</span>
                  <strong>${escapeHtml(metric.value)}</strong>
                  <p>${escapeHtml(metric.hint)}</p>
                </article>
              `).join("")}
            </div>

            <div class="settings-control-grid">
              ${activeSection.controls.map((control, index) => `
                <article class="settings-control-card ${index === state.systemSettingsControlIndex ? "active" : ""}">
                  <div class="settings-control-head">
                    <strong>${escapeHtml(control.title)}</strong>
                    <span class="status-chip">${escapeHtml(control.value)}</span>
                  </div>
                  <p>${escapeHtml(control.detail)}</p>
                  <div class="settings-inline-actions">
                    <button class="chip-button" data-action="system-settings-detail" data-control-index="${index}">查看详情</button>
                    <button class="chip-button" data-action="system-settings-config" data-control-index="${index}">调整配置</button>
                  </div>
                </article>
              `).join("")}
            </div>
          </article>

          <article class="settings-panel settings-detail-panel">
            <div class="settings-section-head compact">
              <div>
                <p class="section-kicker">${state.systemSettingsPanelMode === "config" ? "Draft Editor" : "Control Detail"}</p>
                <h3>${escapeHtml(activeControl?.title || activeSection.title)}</h3>
                <p>${escapeHtml(activePreset?.impact || "当前配置项会影响 AI 回复质量、权限边界或发布节奏。")}</p>
              </div>
              <div class="chip-row">
                <span class="chip">负责人：${escapeHtml(activePreset?.owner || "平台组")}</span>
                <span class="chip">最近更新：${escapeHtml(activePreset?.updatedAt || "今天")}</span>
              </div>
            </div>

            ${
              state.systemSettingsPanelMode === "config"
                ? `
                  <div class="settings-notice">${escapeHtml(state.systemSettingsNotice)}</div>
                  <div class="settings-draft-form" data-settings-key="${escapeHtml(currentSystemSettingsDraftKey())}">
                    ${draftFields.map((field, index) => `
                      <label class="settings-field">
                        <span>${escapeHtml(field.label)}</span>
                        <input data-field-index="${index}" value="${escapeHtml(field.value)}">
                      </label>
                    `).join("")}
                  </div>
                  <div class="settings-inline-actions">
                    <button class="small-action" data-action="system-settings-save-draft">保存草稿</button>
                    <button class="chip-button" data-action="system-settings-detail" data-control-index="${state.systemSettingsControlIndex}">返回详情</button>
                  </div>
                `
                : `
                  <div class="settings-detail-grid">
                    ${draftFields.map((field) => `
                      <div class="settings-detail-item">
                        <span>${escapeHtml(field.label)}</span>
                        <strong>${escapeHtml(field.value)}</strong>
                      </div>
                    `).join("")}
                  </div>
                  <div class="settings-inline-actions">
                    <button class="small-action" data-action="system-settings-config" data-control-index="${state.systemSettingsControlIndex}">编辑当前配置</button>
                  </div>
                `
            }
          </article>

          <article class="settings-panel settings-check-panel">
            <div class="settings-section-head compact">
              <div>
                <p class="section-kicker">上线检查</p>
                <h3>当前配置域校验项</h3>
              </div>
            </div>
            <div class="settings-check-list">
              ${activeSection.checklist.map((item) => `
                <div class="settings-check-item">
                  <span>校验</span>
                  <p>${escapeHtml(item)}</p>
                </div>
              `).join("")}
            </div>
          </article>
        </div>

        <aside class="settings-rail">
          <article class="settings-rail-card">
            <p class="section-kicker">变更摘要</p>
            <div class="settings-rail-stack">
              <div class="settings-rail-item">
                <span>当前配置域</span>
                <strong>${escapeHtml(activeSection.title)}</strong>
              </div>
              <div class="settings-rail-item">
                <span>焦点配置项</span>
                <strong>${escapeHtml(activeControl?.title || "未选择")}</strong>
              </div>
              <div class="settings-rail-item">
                <span>发布方式</span>
                <strong>审批后灰度</strong>
              </div>
              <div class="settings-rail-item">
                <span>回滚能力</span>
                <strong>可按版本恢复</strong>
              </div>
            </div>
          </article>

          <article class="settings-rail-card">
            <p class="section-kicker">审计留痕</p>
            <div class="settings-notice">${escapeHtml(state.systemSettingsNotice)}</div>
            <div class="settings-audit-list">
              <div class="settings-audit-item">
                <strong>09:30</strong>
                <p>售后组新增策略发布审批人。</p>
              </div>
              <div class="settings-audit-item">
                <strong>昨天 18:20</strong>
                <p>系统版本升级到 v0.1.3，并同步新索引模板。</p>
              </div>
              <div class="settings-audit-item">
                <strong>昨天 16:00</strong>
                <p>官网组件灰度范围从 10% 扩大到 25%。</p>
              </div>
            </div>
            <button class="small-action">查看完整日志</button>
          </article>
        </aside>
      </section>
    </section>
  `;
}

function renderChatExperience() {
  const evidence = state.chatEvidence;
  const picks = buildAssistantReply("", evidence).products;

  return `
    <section class="chat-shell">
      <aside class="chat-sidebar">
        <article class="chat-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">User Entry</p>
              <h3>独立聊天页</h3>
            </div>
          </div>
          <p>面向真实访客的对话体验。它的重点是欢迎语、提问引导、知识引用与商品推荐，而不是运营字段和内部状态。</p>
          <div class="prompt-row" style="margin-top:14px">
            ${experiencePrompts
              .map((prompt) => `<button class="prompt-chip" data-action="chat-prompt" data-prompt="${escapeHtml(prompt)}">${escapeHtml(prompt)}</button>`)
              .join("")}
          </div>
        </article>

        <article class="chat-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">Knowledge Match</p>
              <h3>当前知识命中</h3>
            </div>
          </div>
          <p>${escapeHtml(evidence.excerpt)}</p>
          <div class="citation-list">
            ${evidence.found ? `<span>${escapeHtml(evidence.citation)}</span>` : `<span>知识缺口待补充</span>`}
          </div>
        </article>

        <article class="chat-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">Product Picks</p>
              <h3>推荐商品卡片</h3>
            </div>
          </div>
          <div class="product-picks">
            ${picks
              .map(
                (pick) => `
                  <div class="pick-card">
                    <strong>${escapeHtml(pick.title)}</strong>
                    <p>${escapeHtml(pick.detail)}</p>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      </aside>

      <div class="chat-main">
        <article class="thread-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">Conversation</p>
              <h3>Diudiu AI 导购助手</h3>
            </div>
            <span class="signal-chip good">支持转人工</span>
          </div>
          <div class="thread-list">
            ${state.chatThread
              .map(
                (item) => `
                  <div class="thread-bubble ${item.role}">
                    <div class="thread-head">
                      <span class="thread-name">${escapeHtml(item.author)}</span>
                      <span class="thread-time">${escapeHtml(item.time)}</span>
                    </div>
                    <div>${escapeHtml(item.text)}</div>
                    ${
                      item.citations && item.citations.length
                        ? `<div class="citation-list">${item.citations.map((citation) => `<span>${escapeHtml(citation)}</span>`).join("")}</div>`
                        : ""
                    }
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="composer" style="margin-top:18px">
            <input class="input" id="chat-input" placeholder="试试问：3000 预算内有什么适合办公的轻薄本？" value="${escapeHtml(state.chatInput)}">
            <div class="composer-actions">
              <button class="small-action" data-action="chat-send">发送问题</button>
              <button class="small-action danger-action" data-action="chat-human">需要人工帮助</button>
            </div>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderEmbedExperience() {
  return `
    <section class="embed-shell">
      <div class="demo-store">
        <div class="section-head">
          <div>
            <p class="section-kicker">Store Demo</p>
            <h3>组件挂在站点里的真实样子</h3>
          </div>
        </div>
        <div class="store-hero">
          <div class="store-block">
            <p class="label">正在浏览</p>
            <h4 style="font-size:30px;margin-top:8px">二手轻薄本电商详情页</h4>
            <p style="margin-top:10px">用户在站点中浏览商品时，可以直接从右下角打开 AI 客服，询问参数、发货、退货或人工协助。</p>
            <div class="chip-row" style="margin-top:14px">
              <span class="signal-chip good">FAQ 已接入</span>
              <span class="signal-chip good">商品知识已同步</span>
              <span class="signal-chip warn">2 项改动待发布</span>
            </div>
          </div>
          <div class="store-block">
            <p class="label">站点信息</p>
            <ul>
              <li>站点右下角挂载单行脚本即可初始化组件。</li>
              <li>组件与独立聊天页共用知识源与转人工策略。</li>
              <li>客服工作台可看到来自组件的会话并做接管。</li>
            </ul>
          </div>
        </div>
        <div class="store-product-grid">
          <article class="store-product">
            <div class="store-thumb"></div>
            <h4 style="margin-top:12px">Redmi Book 14</h4>
            <p>3000 元档轻薄本，适合办公场景。</p>
          </article>
          <article class="store-product">
            <div class="store-thumb"></div>
            <h4 style="margin-top:12px">MacBook Air M1</h4>
            <p>国行版、办公学习稳定，适合追求长续航的人群。</p>
          </article>
          <article class="store-product">
            <div class="store-thumb"></div>
            <h4 style="margin-top:12px">Xiaomi Book</h4>
            <p>偏轻度创作，商品资料和发货策略已同步。</p>
          </article>
        </div>
      </div>

      <aside class="widget-panel">
        <div class="widget-header">
          <div>
            <p class="section-kicker">Widget State</p>
            <h3>${state.embedOpen ? "组件已展开" : "组件已折叠"}</h3>
          </div>
          <button class="small-action widget-trigger" data-action="embed-toggle">${state.embedOpen ? "收起" : "展开"}</button>
        </div>
        <div class="widget-surface ${state.embedOpen ? "" : "hidden"}">
          <h4>Diudiu Web Widget</h4>
          <p class="widget-note">这是挂在站点右下角的客服窗口，回答内容会和控制台知识源、发布状态保持一致。</p>
          <div class="widget-thread">
            ${state.embedThread
              .map(
                (item) => `
                  <div class="widget-message ${item.role}">
                    ${escapeHtml(item.text)}
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="widget-input-row" style="margin-top:14px">
            <input class="input" id="embed-input" placeholder="比如：今天拍下能发顺丰吗？" value="${escapeHtml(state.embedInput)}">
            <div class="prompt-row">
              <button class="prompt-chip" data-action="embed-prompt" data-prompt="今天拍下能发顺丰吗？">发货时效</button>
              <button class="prompt-chip" data-action="embed-prompt" data-prompt="商品有问题怎么退货退款？">退货政策</button>
            </div>
            <div class="composer-actions">
              <button class="small-action" data-action="embed-send">发送</button>
              <button class="small-action danger-action" data-action="embed-human">转人工</button>
            </div>
          </div>
        </div>
      </aside>
    </section>
  `;
}

function renderConsoleOverview() {
  return `
    <div class="console-grid">
      <article class="console-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Overview</p>
            <h3>客服当前可用状态</h3>
          </div>
        </div>
        <div class="config-grid">
          <div class="config-card">
            <p class="label">知识源健康</p>
            <strong>5 / 5</strong>
            <p>FAQ、文档、网页和商品知识均已索引成功，可直接进入聊天体验。</p>
          </div>
          <div class="config-card">
            <p class="label">待发布变更</p>
            <strong>02</strong>
            <p>知识或策略改动必须先测试与预览，才能进入独立聊天页与嵌入组件。</p>
          </div>
          <div class="config-card">
            <p class="label">人工接管概况</p>
            <strong>18%</strong>
            <p>售后争议、低置信度与用户主动求助的会话会进入工作台兜底。</p>
          </div>
        </div>
      </article>
      <article class="console-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">MVP Rules</p>
            <h3>控制台优先级</h3>
          </div>
        </div>
        <ul>
          <li>先看知识源是否健康，再看测试命中与发布状态。</li>
          <li>AI 配置先展示品牌语气、回答策略和转人工规则，再下沉到底层参数。</li>
          <li>任何一次知识改动，都要明确影响哪些入口和客服建议回复场景。</li>
        </ul>
      </article>
    </div>
  `;
}

function renderConsoleSetup() {
  return `
    <div class="tile-grid">
      ${quickSetupSteps
        .map(
          (step) => `
            <article class="tile">
              <p class="label">${step.label}</p>
              <h4>${escapeHtml(step.title)}</h4>
              <p>${escapeHtml(step.detail)}</p>
            </article>
          `
        )
        .join("")}
    </div>
  `;
}

function renderConsoleKnowledge() {
  const selectedSource = knowledgeSources.find((item) => item.id === state.activeSourceId) || knowledgeSources[0];
  const impact = selectedSource ? summarizePublishImpact([selectedSource.id]) : [];

  return `
    <div class="console-grid">
      <article class="console-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Sources</p>
            <h3>知识源列表</h3>
          </div>
        </div>
        <div class="source-list">
          ${knowledgeSources
            .map(
              (source) => `
                <div class="source-card ${source.id === state.activeSourceId ? "active" : ""}">
                  <div class="inline-meta">
                    <span class="signal-chip good">${sourceTypeLabel(source.type)}</span>
                    <span class="status-chip">${source.status}</span>
                  </div>
                  <h4 style="margin-top:12px">${escapeHtml(source.title)}</h4>
                  <p>${escapeHtml(source.summary)}</p>
                  <div class="source-meta">
                    <span>更新于 ${escapeHtml(source.updatedAt)}</span>
                    <span>索引状态 ${escapeHtml(source.indexState)}</span>
                  </div>
                  <div class="composer-actions" style="margin-top:12px">
                    <button class="small-action" data-action="select-source" data-source-id="${escapeHtml(source.id)}">查看详情</button>
                  </div>
                </div>
              `
            )
            .join("")}
        </div>
      </article>
      <article class="console-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Knowledge Test</p>
            <h3>测试命中与知识缺口</h3>
          </div>
        </div>
        <div class="knowledge-tester">
          <div class="knowledge-form">
            <input class="input" id="knowledge-input" value="${escapeHtml(state.knowledgeQuery)}" placeholder="输入一个用户会问的问题，比如：商品有问题怎么退货退款？">
            <div class="composer-actions">
              <button class="small-action" data-action="knowledge-test">测试命中</button>
            </div>
          </div>
          <div class="knowledge-result ${state.knowledgeResult.found ? "" : "empty"}">
            <div class="knowledge-result-head">
              <h4>${state.knowledgeResult.found ? escapeHtml(state.knowledgeResult.source.title) : "未命中知识"}</h4>
              <span class="signal-chip ${state.knowledgeResult.found ? "good" : "warn"}">${state.knowledgeResult.found ? "已命中" : "待补充"}</span>
            </div>
            <p>${escapeHtml(state.knowledgeResult.excerpt)}</p>
            <div class="citation-list">
              ${
                state.knowledgeResult.citation
                  ? `<span>${escapeHtml(state.knowledgeResult.citation)}</span>`
                  : `<span>建议补充 FAQ 或文档内容</span>`
              }
            </div>
          </div>
          <div class="console-panel" style="padding:16px">
            <p class="label">当前来源影响面</p>
            <div class="impact-preview" style="margin-top:12px">
              ${impact.map((target) => `<span>${routeLabel(target)}</span>`).join("")}
            </div>
          </div>
        </div>
      </article>
    </div>
  `;
}

function renderConsoleAI() {
  return `
    <div class="config-grid">
      <article class="config-card">
        <p class="label">品牌与语气</p>
        <strong>专业但不生硬</strong>
        <p>欢迎语和推荐问题优先引导用户说需求，而不是一上来就展示复杂能力。</p>
      </article>
      <article class="config-card">
        <p class="label">回答策略</p>
        <strong>FAQ → 商品知识 → 文档</strong>
        <p>优先命中高频 FAQ，再调用商品资料和文档，减少用户来回追问。</p>
      </article>
      <article class="config-card">
        <p class="label">转人工规则</p>
        <strong>低置信度 / 售后 / 敏感诉求</strong>
        <p>售后争议、用户主动求助和高风险场景直接进入工作台，由客服继续处理。</p>
      </article>
      <article class="config-card">
        <p class="label">高级设置</p>
        <strong>OpenAI / text-embedding-3-large</strong>
        <p>Chat Model、Embedding Model、Temperature、Top P 保留在高级区，不抢主视图。</p>
      </article>
    </div>
  `;
}

function renderConsolePublish() {
  const impact = summarizePublishImpact(state.publishSelection);

  return `
    <div class="console-grid">
      <article class="console-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Pending Changes</p>
            <h3>待发布的知识与策略变更</h3>
          </div>
        </div>
        <div class="source-list">
          ${publishChanges
            .map((change) => {
              const active = state.publishSelection.includes(change.id);
              return `
                <div class="source-card ${active ? "active" : ""}">
                  <h4>${escapeHtml(change.label)}</h4>
                  <p>${escapeHtml(change.note)}</p>
                  <div class="composer-actions" style="margin-top:12px">
                    <button class="small-action" data-action="toggle-publish-change" data-change-id="${escapeHtml(change.id)}">${active ? "移出本次发布" : "加入本次发布"}</button>
                  </div>
                </div>
              `;
            })
            .join("")}
        </div>
      </article>
      <article class="console-panel">
        <div class="section-head">
          <div>
            <p class="section-kicker">Impact Preview</p>
            <h3>发布影响面与上线验证</h3>
          </div>
        </div>
        <p>当前选中的变更会影响以下入口。上线前必须在这些入口完成一次预览与测试。</p>
        <div class="impact-preview" style="margin-top:16px">
          ${impact.map((target) => `<span>${routeLabel(target)}</span>`).join("")}
        </div>
        <ul style="margin-top:16px">
          <li>聊天页预览：验证 FAQ、引用片段和商品卡片是否同步变化。</li>
          <li>嵌入组件预览：验证组件中的回答与转人工入口是否同步。</li>
          <li>客服建议回复：验证客服工作台中的 AI 建议是否能反映这次知识更新。</li>
        </ul>
      </article>
    </div>
  `;
}

function renderConsole() {
  const activeTab = activeConsoleTab();
  const contentByTab = {
    overview: renderConsoleOverview(),
    setup: renderConsoleSetup(),
    knowledge: renderConsoleKnowledge(),
    ai: renderConsoleAI(),
    publish: renderConsolePublish(),
  };

  return `
    <section class="console-shell">
      <div class="console-shelf">
        <div>
          <p class="section-kicker">Console</p>
          <h2 style="margin:6px 0 0;font-family:'STSong','Songti SC',serif">管理员配置与发布中心</h2>
        </div>
        <div class="console-tabs">
          ${consoleTabs
            .map((tab) => `<a class="console-tab ${activeTab === tab.id ? "active" : ""}" href="#${tab.route}">${tab.label}</a>`)
            .join("")}
        </div>
      </div>
      ${contentByTab[activeTab]}
    </section>
  `;
}

function renderWorkspace() {
  const current = currentConversation();

  return `
    <section class="workspace-shell">
      <aside class="queue-column">
        <article class="console-panel">
          <div class="section-head">
            <div>
              <p class="section-kicker">Queue</p>
              <h3>待处理会话</h3>
            </div>
          </div>
          <div class="queue-list">
            ${state.conversations
              .map(
                (conversation) => `
                  <div class="queue-card ${conversation.id === state.activeConversationId ? "active" : ""}">
                    <div class="queue-row">
                      <strong>${escapeHtml(conversation.customer)}</strong>
                      <span class="queue-pill ${conversation.id === state.activeConversationId ? "active" : ""}">${escapeHtml(conversation.queue)}</span>
                    </div>
                    <p>${escapeHtml(conversation.summary)}</p>
                    <div class="status-row">
                      <span class="signal-chip ${shouldEscalateConversation(conversation) ? "risk" : "good"}">${shouldEscalateConversation(conversation) ? "人工优先" : "AI 可处理"}</span>
                      <button class="small-action" data-action="select-conversation" data-conversation-id="${escapeHtml(conversation.id)}">查看</button>
                    </div>
                  </div>
                `
              )
              .join("")}
          </div>
        </article>
      </aside>

      <div class="detail-column">
        <article class="thread-card">
          <div class="section-head">
            <div>
              <p class="section-kicker">Workbench</p>
              <h3>${escapeHtml(current.title)}</h3>
            </div>
            <span class="signal-chip ${shouldEscalateConversation(current) ? "risk" : "good"}">${shouldEscalateConversation(current) ? "人工处理中" : "AI 建议可用"}</span>
          </div>
          <p>${escapeHtml(current.suggestedReply)}</p>
          <div class="chip-row" style="margin-top:12px">
            <span class="chip">${escapeHtml(current.status)}</span>
            <span class="chip">${escapeHtml(current.waitTime)}</span>
            <span class="chip">${escapeHtml(current.sla)}</span>
          </div>
          <div class="thread-stream">
            ${current.messages
              .map(
                ([role, text]) => `
                  <div class="thread-bubble ${role === "user" ? "user" : "assistant"}">
                    <div class="thread-head">
                      <span class="thread-name">${role === "user" ? escapeHtml(current.customer) : "Diudiu AI / 客服"}</span>
                      <span class="thread-time">实时会话</span>
                    </div>
                    <div>${escapeHtml(text)}</div>
                  </div>
                `
              )
              .join("")}
          </div>
          <div class="operator-actions">
            <button class="small-action" data-action="workspace-human">转人工</button>
            <button class="small-action" data-action="workspace-escalate">升级工单</button>
            <button class="small-action" data-action="workspace-gap">标记知识缺口</button>
          </div>
        </article>
      </div>

      <aside class="insight-column">
        <article class="insight-stat">
          <p class="label">人工接管判断</p>
          <strong>${shouldEscalateConversation(current) ? "YES" : "NO"}</strong>
          <p>${shouldEscalateConversation(current) ? "当前会话会进入人工或高风险兜底链路。" : "当前会话可继续由 AI 建议和商品知识联合处理。"}</p>
        </article>
        <article class="insight-stat">
          <p class="label">回流目标</p>
          <strong>${current.intent === "after_sale" ? "FAQ / 规则" : "商品知识"}</strong>
          <p>${current.intent === "after_sale" ? "售后争议类问题需要沉淀为 FAQ、风控规则和人工接管策略。" : "商品咨询与议价问题应回流为商品知识、发货说明与导购策略。"}</p>
        </article>
        <article class="insight-stat">
          <p class="label">最近动作</p>
          <strong>${escapeHtml(current.queue)}</strong>
          <p>${escapeHtml(current.summary)}</p>
        </article>
      </aside>
    </section>
  `;
}

function strategyTabDefinitions() {
  return [
    { id: "overview", route: "console-overview", label: "策略总览" },
    { id: "risk", route: "console-setup", label: "风险与兜底" },
    { id: "knowledge", route: "console-knowledge", label: "知识健康" },
    { id: "validation", route: "console-ai", label: "验证与回放" },
    { id: "release", route: "console-publish", label: "发布与影响" },
  ];
}

function activeStrategyTab() {
  return consoleRouteMap[state.route] || "overview";
}

function currentStrategySection(sectionId) {
  return state.strategyConsole?.sectionsById?.[sectionId] ?? null;
}

function formatStrategyDateTime(value) {
  if (!value) return "尚未发布";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function strategyTrendTone(trend) {
  if (trend === "up") return "is-up";
  if (trend === "down") return "is-down";
  return "is-flat";
}

function strategySeverityTone(severityId) {
  if (severityId === "high") return "is-high";
  if (severityId === "medium") return "is-medium";
  return "is-low";
}

function strategyReadinessHint(blocker) {
  if (blocker === "draft-changes") return "至少保存一条策略改动，发布按钮才会解锁。";
  if (blocker === "validation-scenarios") return "发布前必须把三条验证场景全部跑完。";
  return "还有未完成的发布条件。";
}

function strategyValidationProgress(readiness) {
  if (!readiness.totalScenarioCount) return 0;
  return Math.round((readiness.completedScenarioCount / readiness.totalScenarioCount) * 100);
}

function renderStrategySectionGuide(title, description) {
  return `
    <div class="strategy-section-guide">
      <span class="strategy-section-guide-label">本页职责</span>
      <p><strong>${escapeHtml(title)}</strong>${escapeHtml(description)}</p>
    </div>
  `;
}

function renderStrategyOverviewPage() {
  const overview = currentStrategySection("overview");
  const readiness = strategyConsoleStateApi.getReleaseReadiness(state.strategyConsole);
  const observationCards = [
    {
      title: "自动回复边界",
      body: overview.notes[0],
    },
    {
      title: "知识命中信号",
      body: overview.notes[1],
    },
  ];

  return `
    <section class="strategy-section">
      <div class="strategy-section-head">
        <div>
          <p class="section-kicker">Overview</p>
          <h3>${escapeHtml(overview.title)}</h3>
          <p>${escapeHtml(overview.description)}</p>
        </div>
        <div class="chip-row">
          <span class="chip">验证完成 ${readiness.completedScenarioCount}/${readiness.totalScenarioCount}</span>
          <span class="chip">当前草稿 ${state.strategyConsole.draft.updatedRuleIds.length} 条</span>
        </div>
      </div>
      ${renderStrategySectionGuide("先判断今天的问题集中在哪。", "这里不做编辑，先看经营信号、风险压力和知识命中，决定后面优先进入哪一类策略调整。")}
      <div class="strategy-kpi-grid">
        ${overview.kpis.map((kpi) => `
          <article class="strategy-kpi-card">
            <span>${escapeHtml(kpi.label)}</span>
            <strong>${escapeHtml(kpi.valueText)}</strong>
            <em class="strategy-trend ${strategyTrendTone(kpi.trend)}">${escapeHtml(kpi.deltaText)}</em>
            <p>${kpi.trend === "up" ? "较上一窗口改善" : kpi.trend === "down" ? "较上一窗口回落" : "与上一窗口持平"}</p>
          </article>
        `).join("")}
      </div>
      <div class="strategy-note-grid">
        ${observationCards.map((item) => `
          <article class="strategy-note-card">
            <strong>${escapeHtml(item.title)}</strong>
            <p>${escapeHtml(item.body)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStrategyRiskEditor() {
  const focusedView = strategyConsoleStateApi.getFocusedRiskCardView(state.strategyConsole);

  if (!focusedView) {
    return `
      <aside class="strategy-editor-card strategy-editor-empty">
        <strong>先选一张风险卡</strong>
        <p>点击左侧风险卡后，就能编辑主管口径、趋势说明和发布影响。</p>
        <button class="small-action" data-action="strategy-focus-risk-card" data-card-id="after-sale">从售后与退款开始</button>
      </aside>
    `;
  }

  const { card, rule, ruleId } = focusedView;

  return `
    <aside class="strategy-editor-card">
      <div class="strategy-section-head strategy-section-head-compact">
        <div>
          <p class="section-kicker">Rule Editor</p>
          <h3>${escapeHtml(card.label)}</h3>
        </div>
        <div class="inline-meta">
          <span class="strategy-severity ${strategySeverityTone(card.severity.id)}">${escapeHtml(card.severity.label)}风险</span>
          <span class="status-chip">${escapeHtml(card.state.label)}</span>
        </div>
      </div>
      <p class="strategy-helper-copy">保存后右侧发布栏会立刻同步，验证进度会自动重置。</p>
      <div class="strategy-editor-form" data-rule-id="${escapeHtml(ruleId)}">
        <label class="strategy-field">
          <span>处理动作标签</span>
          <input data-field="label" value="${escapeHtml(rule.label)}">
        </label>
        <label class="strategy-field">
          <span>趋势说明</span>
          <input data-field="valueText" value="${escapeHtml(rule.valueText)}">
        </label>
        <label class="strategy-field">
          <span>影响说明</span>
          <textarea data-field="effect">${escapeHtml(rule.effect)}</textarea>
        </label>
      </div>
      <div class="strategy-trigger-list">
        ${card.triggers.map((trigger) => `<span class="strategy-trigger">${escapeHtml(trigger)}</span>`).join("")}
      </div>
      <div class="composer-actions">
        <button class="small-action" data-action="strategy-save-rule" data-rule-id="${escapeHtml(ruleId)}">保存到草稿</button>
        <button class="chip-button" data-action="strategy-reset-editor">恢复当前草稿值</button>
      </div>
    </aside>
  `;
}

function renderStrategyRiskPage() {
  const risk = currentStrategySection("risk");
  const focusedView = strategyConsoleStateApi.getFocusedRiskCardView(state.strategyConsole);

  return `
    <section class="strategy-section">
      <div class="strategy-section-head">
        <div>
          <p class="section-kicker">Risk Controls</p>
          <h3>${escapeHtml(risk.title)}</h3>
          <p>${escapeHtml(risk.summary)}</p>
        </div>
        <div class="chip-row">
          <span class="chip">高风险优先人工</span>
          <span class="chip">点击卡片进入编辑</span>
        </div>
      </div>
      ${renderStrategySectionGuide("先收边界，再决定自动化范围。", "这里改的是业务规则，不是模型参数。保存任何规则改动后，都会重新进入草稿并要求重新校验。")}
      <div class="strategy-risk-layout">
        <div class="strategy-risk-grid">
          ${risk.cards.map((card) => {
            const mergedRule = strategyConsoleStateApi.getMergedRiskRuleView(state.strategyConsole, card.change.id);

            return `
              <button class="strategy-risk-card ${focusedView?.cardId === card.id ? "is-active" : ""}" data-action="strategy-focus-risk-card" data-card-id="${escapeHtml(card.id)}">
                <div class="card-head">
                  <div>
                    <strong>${escapeHtml(card.label)}</strong>
                    <div class="inline-meta">
                      <span class="strategy-severity ${strategySeverityTone(card.severity.id)}">${escapeHtml(card.severity.label)}风险</span>
                      <span class="status-chip">${escapeHtml(card.state.label)}</span>
                    </div>
                  </div>
                  <strong class="strategy-risk-change">${escapeHtml(mergedRule?.valueText ?? card.change.valueText)}</strong>
                </div>
                <p>${escapeHtml(mergedRule?.effect ?? card.impact)}</p>
                <div class="strategy-trigger-list">
                  ${card.triggers.map((trigger) => `<span class="strategy-trigger">${escapeHtml(trigger)}</span>`).join("")}
                </div>
                <div class="strategy-risk-footer">
                  <span>${escapeHtml(mergedRule?.label ?? card.action.label)}</span>
                  <small>${escapeHtml(card.state.label)}</small>
                </div>
              </button>
            `;
          }).join("")}
        </div>
        ${renderStrategyRiskEditor()}
      </div>
    </section>
  `;
}

function renderStrategyKnowledgePage() {
  const knowledge = currentStrategySection("knowledge");

  return `
    <section class="strategy-section">
      <div class="strategy-section-head">
        <div>
          <p class="section-kicker">Knowledge Health</p>
          <h3>${escapeHtml(knowledge.title)}</h3>
          <p>${escapeHtml(knowledge.summary)}</p>
        </div>
      </div>
      ${renderStrategySectionGuide("判断问题出在知识，而不是出在规则。", "如果高频问题命中率低或口径不一致，应该先补知识卡、商品资料和售后说明，而不是继续收紧回复策略。")}
      <div class="strategy-knowledge-grid">
        ${knowledge.hotspots.map((item) => `
          <article class="strategy-knowledge-card">
            <div class="strategy-knowledge-head">
              <div class="strategy-knowledge-copy">
                <div class="strategy-knowledge-meta">
                  <span class="status-chip">${escapeHtml(item.state.label)}</span>
                  <span class="chip">优先级 ${item.priority}</span>
                </div>
                <strong class="strategy-knowledge-title">${escapeHtml(item.label)}</strong>
              </div>
              <div class="strategy-knowledge-score">
                <small>命中率</small>
                <strong class="strategy-knowledge-rate">${escapeHtml(item.hitRateText)}</strong>
              </div>
            </div>
            <div class="strategy-meter"><span style="width:${item.hitRate}%"></span></div>
            <p>${escapeHtml(item.issue)}</p>
          </article>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStrategyValidationPage() {
  const validation = currentStrategySection("validation");
  const readiness = strategyConsoleStateApi.getReleaseReadiness(state.strategyConsole);

  return `
    <section class="strategy-section">
      <div class="strategy-section-head">
        <div>
          <p class="section-kicker">Validation Replay</p>
          <h3>${escapeHtml(validation.title)}</h3>
          <p>${escapeHtml(validation.description)}</p>
        </div>
        <div class="composer-actions">
          <button class="small-action" data-action="strategy-run-all-scenarios">运行全部校验</button>
          <span class="chip">${readiness.completedScenarioCount}/${readiness.totalScenarioCount} 已完成</span>
        </div>
      </div>
      ${renderStrategySectionGuide("用关键样例拦住误伤。", "规则或知识一旦改动，这里就要重新跑关键场景，确认售后、价格和低置信度对话没有被误判。")}
      <div class="strategy-validation-grid">
        ${state.strategyConsole.validation.scenarios.map((scenario) => `
          <article class="strategy-scenario-card ${scenario.status === "completed" ? "is-completed" : ""}">
            <div class="card-head">
              <div>
                <strong>${escapeHtml(scenario.label)}</strong>
                <div class="inline-meta">
                  <span class="status-chip">${escapeHtml(scenario.intent.label)}</span>
                  <span class="status-chip">${escapeHtml(scenario.expectedAction.label)}</span>
                </div>
              </div>
              <span class="strategy-severity ${scenario.status === "completed" ? "is-low" : "is-medium"}">${scenario.status === "completed" ? "已完成" : "待运行"}</span>
            </div>
            <div class="strategy-preview-block">
              <small>输入样例</small>
              <p>${escapeHtml(scenario.input)}</p>
            </div>
            <div class="strategy-preview-block">
              <small>预期结果</small>
              <p>${escapeHtml(scenario.expectation)}</p>
            </div>
            <div class="status-row">
              <small>${escapeHtml(scenario.state.label)} 场景</small>
              <button class="small-action" data-action="strategy-run-scenario" data-scenario-id="${escapeHtml(scenario.id)}" ${scenario.status === "completed" ? "disabled" : ""}>${scenario.status === "completed" ? "已验证" : "运行校验"}</button>
            </div>
          </article>
        `).join("")}
      </div>
      <div class="strategy-checklist">
        ${validation.checklist.map((item) => `
          <div class="strategy-check-item">
            <span>✓</span>
            <div>
              <strong>${escapeHtml(item)}</strong>
              <p>这条检查项会在主管发布前快速过一遍，避免只看指标不看风险。</p>
            </div>
          </div>
        `).join("")}
      </div>
    </section>
  `;
}

function renderStrategyReleasePage() {
  const release = currentStrategySection("release");
  const releaseSummary = strategyConsoleStateApi.getReleaseSummary(state.strategyConsole);

  return `
    <section class="strategy-section">
      <div class="strategy-section-head">
        <div>
          <p class="section-kicker">Release Gates</p>
          <h3>${escapeHtml(release.title)}</h3>
          <p>${escapeHtml(release.description)}</p>
        </div>
      </div>
      ${renderStrategySectionGuide("确认影响范围后再发布。", "这里看的不是能不能点发布，而是本次草稿会影响哪些业务面，以及是否满足上线前的闸门条件。")}
      <div class="strategy-release-layout">
        <div class="strategy-impact-grid">
          ${release.summary.impacts.map((impact) => `
            <article class="strategy-impact-card">
              <small>${escapeHtml(impact.severity.label)}优先关注</small>
              <strong>${escapeHtml(impact.label)}</strong>
              <p>${escapeHtml(impact.effect)}</p>
            </article>
          `).join("")}
        </div>
        <div class="strategy-release-list">
          ${
            releaseSummary.length
              ? releaseSummary.map((item) => `
                  <article class="strategy-release-item">
                    <div class="card-head">
                      <strong>${escapeHtml(item.label)}</strong>
                      <span class="strategy-severity ${strategySeverityTone(item.severity.id)}">${escapeHtml(item.severity.label)}风险</span>
                    </div>
                    <small>${escapeHtml(item.valueText)}</small>
                    <p>${escapeHtml(item.effect)}</p>
                  </article>
                `).join("")
              : `
                  <article class="strategy-release-item strategy-release-empty">
                    <strong>当前没有待发布变更</strong>
                    <p>先去风险与兜底页保存至少一条规则改动，发布区才会开始汇总。</p>
                  </article>
                `
          }
        </div>
      </div>
    </section>
  `;
}

function renderStrategyMainSection() {
  const tab = activeStrategyTab();

  if (tab === "risk") return renderStrategyRiskPage();
  if (tab === "knowledge") return renderStrategyKnowledgePage();
  if (tab === "validation") return renderStrategyValidationPage();
  if (tab === "release") return renderStrategyReleasePage();
  return renderStrategyOverviewPage();
}

function renderStrategyGlobalRailCard(readiness, releaseSummary, progress) {
  return `
    <article class="strategy-rail-card">
      <p class="section-kicker">全局发布状态</p>
      <div class="card-head">
        <strong>${escapeHtml(state.strategyConsole.data.header.state.label)}</strong>
        <span class="status-chip">${escapeHtml(formatStrategyDateTime(state.strategyConsole.data.header.lastPublishedAt))}</span>
      </div>
      <div class="strategy-rail-metrics">
        <div class="strategy-rail-metric">
          <span>草稿变更</span>
          <strong>${releaseSummary.length} 条</strong>
        </div>
        <div class="strategy-rail-metric">
          <span>验证进度</span>
          <strong>${readiness.completedScenarioCount}/${readiness.totalScenarioCount}</strong>
        </div>
        <div class="strategy-rail-metric">
          <span>阻塞项</span>
          <strong>${readiness.blockedBy.length ? `${readiness.blockedBy.length} 项` : "已解除"}</strong>
        </div>
      </div>
      <div class="strategy-meter"><span style="width:${progress}%"></span></div>
      <p>${state.strategyConsole.data.header.state.id === "published" ? "当前页面展示的是最近一次已发布策略，新改动会重新进入草稿与校验流程。" : "当前仍处于草稿阶段，只有保存改动并完成校验后，才会进入发布环节。"}</p>
      <div class="composer-actions">
        <a class="small-action" href="#console-publish">查看发布与影响</a>
        <a class="chip-button" href="#console-ai">查看验证进度</a>
      </div>
    </article>
  `;
}

function renderStrategyOverviewRailCard(overview) {
  const notes = overview.notes.slice(0, 2);

  return `
    <article class="strategy-rail-card">
      <p class="section-kicker">值班观察</p>
      <div class="strategy-context-list">
        ${notes.map((note) => `
          <div class="strategy-context-item">
            <strong>${escapeHtml(note.split("，")[0])}</strong>
            <p>${escapeHtml(note)}</p>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderStrategyRiskRailCard() {
  const focusedView = strategyConsoleStateApi.getFocusedRiskCardView(state.strategyConsole);

  if (!focusedView) {
    return `
      <article class="strategy-rail-card">
        <p class="section-kicker">当前规则焦点</p>
        <p>风险页右侧只跟随当前选中的规则卡，避免主管在多个高风险策略之间来回对照时信息串线。</p>
        <a class="small-action" href="#console-setup">查看风险规则</a>
      </article>
    `;
  }

  const { card, rule } = focusedView;

  return `
    <article class="strategy-rail-card">
      <p class="section-kicker">当前规则焦点</p>
      <strong>${escapeHtml(card.label)}</strong>
      <div class="strategy-rail-metrics">
        <div class="strategy-rail-metric">
          <span>当前动作</span>
          <strong>${escapeHtml(rule.label)}</strong>
        </div>
        <div class="strategy-rail-metric">
          <span>趋势说明</span>
          <strong>${escapeHtml(rule.valueText)}</strong>
        </div>
      </div>
      <p>${escapeHtml(rule.effect)}</p>
      <div class="strategy-trigger-list">
        ${card.triggers.slice(0, 3).map((trigger) => `<span class="strategy-trigger">${escapeHtml(trigger)}</span>`).join("")}
      </div>
    </article>
  `;
}

function renderStrategyKnowledgeRailCard(knowledge) {
  const hotspots = [...knowledge.hotspots].sort((a, b) => a.priority - b.priority).slice(0, 3);

  return `
    <article class="strategy-rail-card">
      <p class="section-kicker">补强优先顺序</p>
      <div class="strategy-context-list">
        ${hotspots.map((item) => `
          <div class="strategy-context-item">
            <div class="strategy-rail-summary">
              <strong>${escapeHtml(item.label)}</strong>
              <span>${escapeHtml(item.hitRateText)}</span>
            </div>
            <p>优先级 ${item.priority} · ${escapeHtml(item.state.label)}</p>
          </div>
        `).join("")}
      </div>
    </article>
  `;
}

function renderStrategyValidationRailCard(validation, readiness) {
  return `
    <article class="strategy-rail-card">
      <p class="section-kicker">校验说明</p>
      ${
        readiness.blockedBy.length
          ? readiness.blockedBy.map((item) => `<div class="strategy-blocker">${escapeHtml(strategyReadinessHint(item))}</div>`).join("")
          : `<p>当前没有发布阻塞项，可以进入发布环节确认影响范围。</p>`
      }
      <div class="strategy-context-list">
        ${validation.checklist.slice(0, 2).map((item) => `
          <div class="strategy-context-item">
            <strong>${escapeHtml(item)}</strong>
          </div>
        `).join("")}
      </div>
      <button class="small-action" data-action="strategy-run-all-scenarios">运行全部校验</button>
    </article>
  `;
}

function renderStrategyReleaseRailCard(release, releaseSummary, readiness) {
  return `
    <article class="strategy-rail-card">
      <p class="section-kicker">发布闸门</p>
      <ul class="strategy-gate-list">
        ${release.gates.map((gate) => `<li>${escapeHtml(gate)}</li>`).join("")}
      </ul>
      ${
        releaseSummary.length
          ? `
            <div class="strategy-context-list">
              ${releaseSummary.map((item) => `
                <div class="strategy-context-item">
                  <div class="strategy-rail-summary">
                    <strong>${escapeHtml(item.label)}</strong>
                    <span>${escapeHtml(item.valueText)}</span>
                  </div>
                  <p>${escapeHtml(item.effect)}</p>
                </div>
              `).join("")}
            </div>
          `
          : `<p>还没有保存的策略改动，先去风险与兜底页保存至少一条规则，再回到这里做发布确认。</p>`
      }
      <div class="composer-actions">
        <button class="small-action" data-action="strategy-run-all-scenarios">运行全部校验</button>
        <button class="solid-action" data-action="strategy-publish" ${readiness.canPublish ? "" : "disabled"}>发布当前草稿</button>
      </div>
    </article>
  `;
}

function renderStrategyRightRail() {
  const tab = activeStrategyTab();
  const overview = currentStrategySection("overview");
  const knowledge = currentStrategySection("knowledge");
  const validation = currentStrategySection("validation");
  const release = currentStrategySection("release");
  const releaseSummary = strategyConsoleStateApi.getReleaseSummary(state.strategyConsole);
  const readiness = strategyConsoleStateApi.getReleaseReadiness(state.strategyConsole);
  const progress = strategyValidationProgress(readiness);
  let contextMarkup = renderStrategyOverviewRailCard(overview);

  if (tab === "risk") contextMarkup = renderStrategyRiskRailCard();
  if (tab === "knowledge") contextMarkup = renderStrategyKnowledgeRailCard(knowledge);
  if (tab === "validation") contextMarkup = renderStrategyValidationRailCard(validation, readiness);
  if (tab === "release") contextMarkup = renderStrategyReleaseRailCard(release, releaseSummary, readiness);

  return `
    <aside class="strategy-side-rail">
      ${renderStrategyGlobalRailCard(readiness, releaseSummary, progress)}
      ${contextMarkup}
    </aside>
  `;
}

function renderAiConfigLanding() {
  if (!state.strategyConsole || !strategyConsoleDataApi || !strategyConsoleStateApi) {
    return `
      <section class="module-placeholder">
        <article class="module-hero">
          <p class="section-kicker">AI Support Configuration</p>
          <h2>AI 客服配置</h2>
          <p>策略台脚本尚未加载成功，请检查资源注入。</p>
        </article>
      </section>
    `;
  }

  const overview = currentStrategySection("overview");
  const releaseSummary = strategyConsoleStateApi.getReleaseSummary(state.strategyConsole);
  const readiness = strategyConsoleStateApi.getReleaseReadiness(state.strategyConsole);

  return `
    <section class="strategy-console-shell">
      ${moduleContextNotice()}
      <div class="console-shelf strategy-console-shelf">
        <div>
          <p class="section-kicker">Strategy Workspace</p>
          <h2 class="strategy-console-title">客服策略中台</h2>
        </div>
        <div class="console-tabs">
          ${strategyTabDefinitions().map((tab) => `<a class="console-tab ${activeStrategyTab() === tab.id ? "active" : ""}" href="#${tab.route}">${tab.label}</a>`).join("")}
        </div>
      </div>
      <section class="strategy-summary-bar">
        <div class="strategy-summary-copy">
          <p class="section-kicker">运行摘要</p>
          <h3>今日策略态势</h3>
          <p>聚焦高风险兜底、草稿变化与验证进度，支持主管在同一页完成判断与发布确认。</p>
        </div>
        <div class="strategy-summary-stats">
          <article class="strategy-summary-stat">
            <span>当前时间窗</span>
            <strong>${escapeHtml(overview.period)}</strong>
          </article>
          <article class="strategy-summary-stat">
            <span>草稿变更</span>
            <strong>${releaseSummary.length} 条</strong>
          </article>
          <article class="strategy-summary-stat">
            <span>验证进度</span>
            <strong>${readiness.completedScenarioCount}/${readiness.totalScenarioCount}</strong>
          </article>
          <article class="strategy-summary-stat">
            <span>发布状态</span>
            <strong>${escapeHtml(state.strategyConsole.data.header.state.label)}</strong>
          </article>
        </div>
      </section>
      <div class="strategy-console-layout">
        <div class="strategy-console-main">
          ${renderStrategyMainSection()}
        </div>
        ${renderStrategyRightRail()}
      </div>
    </section>
  `;
}

function renderAppView() {
  const group = routeGroup(state.route);
  let markup = "";

  if (group === "home") markup = `<section class="view-page">${renderHome()}</section>`;
  if (group === "dialog-center") markup = `<section class="view-page">${renderDialogCenterWorkbenchV2()}</section>`;
  if (group === "ai-config") markup = `<section class="view-page">${renderAiConfigLanding()}</section>`;
  if (group === "system-settings") markup = `<section class="view-page">${renderSystemSettings()}</section>`;

  appViewEl.innerHTML = markup;
}

function render() {
  renderPrimaryNav();
  renderAppView();
  syncDialogStreamState();
}

function syncDialogStreamState() {
  const panel = document.querySelector(".dialog-thread-shell-v2 .dialog-stream-panel");
  const stream = panel?.querySelector(".dialog-stream[data-dialog-scroll]");

  if (!panel || !stream) {
    return;
  }

  const updateScrollState = () => {
    const maxScrollTop = Math.max(0, stream.scrollHeight - stream.clientHeight);
    const canScrollUp = stream.scrollTop > 10;
    const canScrollDown = maxScrollTop - stream.scrollTop > 10;
    const isScrollable = maxScrollTop > 10;

    panel.dataset.scrollable = isScrollable ? "true" : "false";
    panel.dataset.canScrollUp = canScrollUp ? "true" : "false";
    panel.dataset.canScrollDown = canScrollDown ? "true" : "false";
  };

  stream.addEventListener("scroll", updateScrollState, { passive: true });

  window.requestAnimationFrame(() => {
    if (state.dialogShouldScrollToLatest) {
      stream.scrollTop = stream.scrollHeight;
      state.dialogShouldScrollToLatest = false;
    }

    updateScrollState();
  });
}

function scrollAppViewToTop() {
  if (appViewEl) {
    appViewEl.scrollTop = 0;
  }

  if (typeof window !== "undefined") {
    window.scrollTo(0, 0);
  }
}

function navigateToModule(route, context = {}) {
  state.route = route;

  if (context.strategyTab && context.strategyTab in consoleRouteMap) {
    state.route = Object.keys(consoleRouteMap).find((key) => consoleRouteMap[key] === context.strategyTab) || route;
  }

  if (context.conversationId) {
    state.activeConversationId = context.conversationId;
    state.dialogShouldScrollToLatest = true;
  }

  if (context.dialogViewId) {
    setDialogView(context.dialogViewId, { resetSearch: context.resetSearch === true });
  }

  if (context.settingsSection) {
    state.systemSettingsSection = context.settingsSection;
    state.systemSettingsControlIndex = 0;
    state.systemSettingsPanelMode = "detail";
  }

  setModuleContext({
    source: context.source || routeGroup(state.route),
    target: routeGroup(state.route),
    title: context.title || state.moduleContext.title,
    detail: context.detail || state.moduleContext.detail,
    conversationId: context.conversationId || null,
    strategyTab: context.strategyTab || null,
    settingsSection: context.settingsSection || null,
    nextRoute: context.nextRoute || null,
    nextLabel: context.nextLabel || null,
  });

  window.location.hash = `#${state.route}`;
  render();
  scrollAppViewToTop();
}

function applyModuleShortcut(shortcutId) {
  if (shortcutId === "go-dialog") {
    navigateToModule("dialog-center", {
      source: "home",
      target: "dialog-center",
      title: "从工作台进入高风险会话处理",
      detail: "优先处理待接管、高风险或临近 SLA 的会话，并在处理后决定是否回流策略。",
      dialogViewId: "handoff",
      nextRoute: "console-setup",
      nextLabel: "处理后去调整风险策略",
    });
    return;
  }

  if (shortcutId === "go-test") {
    navigateToModule("console-knowledge", {
      source: "home",
      target: "ai-config",
      title: "从工作台进入知识健康排查",
      detail: "这里重点验证 FAQ、商品资料和售后知识是否能被稳定命中。",
      strategyTab: "knowledge",
      nextRoute: "system-settings",
      nextLabel: "继续看知识同步设置",
    });
    return;
  }

  if (shortcutId === "go-release") {
    navigateToModule("console-publish", {
      source: "home",
      target: "ai-config",
      title: "从工作台进入发布影响确认",
      detail: "这里回看最近策略与知识变更会影响哪些会话和业务面。",
      strategyTab: "release",
      nextRoute: "home",
      nextLabel: "回到工作台看影响结果",
    });
    return;
  }

  if (shortcutId === "go-handoff") {
    navigateToModule("console-setup", {
      source: "home",
      target: "ai-config",
      title: "从工作台进入风险与兜底策略",
      detail: "这里调整低置信度、售后争议和敏感问题的转人工与保守回复边界。",
      strategyTab: "risk",
      nextRoute: "system-settings",
      nextLabel: "继续看安全审计设置",
    });
  }
}

function pushChatMessage(query) {
  const result = runKnowledgeTest(query);
  const reply = buildAssistantReply(query, result);
  const now = new Date();
  const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  state.chatEvidence = result;
  state.chatThread.push({
    role: "user",
    author: "访客",
    time,
    text: query,
    citations: [],
  });
  state.chatThread.push({
    role: "assistant",
    author: "Diudiu AI",
    time,
    text: reply.text,
    citations: reply.citations,
  });
  state.chatInput = "";
}

function pushEmbedMessage(query) {
  const result = runKnowledgeTest(query);
  const reply = buildAssistantReply(query, result);
  state.embedThread.push({ role: "user", text: query });
  state.embedThread.push({ role: "assistant", text: reply.text });
  state.embedInput = "";
}

function togglePublishChange(changeId) {
  if (state.publishSelection.includes(changeId)) {
    state.publishSelection = state.publishSelection.filter((id) => id !== changeId);
  } else {
    state.publishSelection = [...state.publishSelection, changeId];
  }
}

function mutateCurrentConversation(mutator) {
  const index = state.conversations.findIndex((item) => item.id === state.activeConversationId);
  if (index === -1) return;
  const copy = { ...state.conversations[index] };
  mutator(copy);
  state.conversations.splice(index, 1, copy);
}

window.addEventListener("hashchange", () => {
  state.route = normalizeRoute(window.location.hash);
  if (routeGroup(state.route) === "dialog-center") {
    state.dialogShouldScrollToLatest = true;
  }
  render();
  scrollAppViewToTop();
});

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget) return;

  const action = actionTarget.dataset.action;
  if (action === "chat-prompt") {
    state.chatInput = actionTarget.dataset.prompt || "";
    render();
  }

  if (action === "chat-send") {
    const input = document.getElementById("chat-input");
    const query = (input ? input.value : state.chatInput).trim();
    if (query) {
      pushChatMessage(query);
      render();
    }
  }

  if (action === "chat-human") {
    pushChatMessage("需要人工协助处理。");
    mutateCurrentConversation((conversation) => {
      conversation.requiresHuman = true;
      conversation.status = "待人工接管";
    });
    render();
  }

  if (action === "home-filter") {
    state.homeTaskFilter = actionTarget.dataset.filter || "all";
    state.homeTaskPage = 1;
    render();
  }

  if (action === "home-alert-page") {
    const nextPage = Number(actionTarget.dataset.page || state.homeAlertPage);
    state.homeAlertPage = Math.min(Math.max(nextPage, 1), alertPageCount());
    render();
  }

  if (action === "home-kpi") {
    openHomeKpi(actionTarget.dataset.kpiId || "");
  }

  if (action === "home-alert") {
    openHomeAlert(actionTarget.dataset.alertId || "");
  }

  if (action === "home-task-page") {
    const nextPage = Number(actionTarget.dataset.page || state.homeTaskPage);
    state.homeTaskPage = Math.min(Math.max(nextPage, 1), taskPageCount());
    render();
  }

  if (action === "home-task-open") {
    openHomeTask(actionTarget.dataset.taskId || "", actionTarget.dataset.taskBucket || "all");
  }

  if (action === "open-dialog-view") {
    event.preventDefault();
    navigateToModule("dialog-center", {
      source: routeGroup(state.route),
      target: "dialog-center",
      title: "进入对话中心处理具体会话",
      detail: "这里承接首页任务、风险告警和配置回流后的具体会话处理。",
      dialogViewId: actionTarget.dataset.view || "all",
      resetSearch: actionTarget.dataset.resetSearch === "true",
      nextRoute: "console-overview",
      nextLabel: "处理后回到 AI 配置总览",
    });
  }

  if (action === "module-shortcut") {
    event.preventDefault();
    applyModuleShortcut(actionTarget.dataset.shortcutId || "");
  }

  if (action === "module-context-next") {
    if (!state.moduleContext?.nextRoute) return;

    const nextRoute = state.moduleContext.nextRoute;
    const nextGroup = routeGroup(nextRoute);
    const context = {
      source: routeGroup(state.route),
      target: nextGroup,
      title: `从 ${routeLabel(routeGroup(state.route))} 继续到 ${routeLabel(nextGroup)}`,
      detail: "当前步骤已完成，继续进入下一个关联模块完成闭环。",
    };

    if (nextGroup === "ai-config") {
      context.strategyTab = consoleRouteMap[nextRoute] || "overview";
    }

    if (nextGroup === "system-settings") {
      context.settingsSection = state.moduleContext.settingsSection || "knowledge";
    }

    navigateToModule(nextRoute, context);
  }

  if (action === "embed-toggle") {
    state.embedOpen = !state.embedOpen;
    render();
  }

  if (action === "embed-prompt") {
    state.embedInput = actionTarget.dataset.prompt || "";
    render();
  }

  if (action === "embed-send") {
    const input = document.getElementById("embed-input");
    const query = (input ? input.value : state.embedInput).trim();
    if (query) {
      pushEmbedMessage(query);
      render();
    }
  }

  if (action === "embed-human") {
    pushEmbedMessage("我想找人工客服。");
    render();
  }

  if (action === "select-source") {
    state.activeSourceId = actionTarget.dataset.sourceId;
    render();
  }

  if (action === "knowledge-test") {
    const input = document.getElementById("knowledge-input");
    state.knowledgeQuery = (input ? input.value : state.knowledgeQuery).trim();
    state.knowledgeResult = runKnowledgeTest(state.knowledgeQuery);
    render();
  }

  if (action === "toggle-publish-change") {
    togglePublishChange(actionTarget.dataset.changeId);
    render();
  }

  if (action === "select-conversation") {
    state.activeConversationId = actionTarget.dataset.conversationId;
    state.dialogSuggestionExpanded = false;
    state.dialogShouldScrollToLatest = true;
    render();
  }

  if (action === "dialog-status-tab") {
    state.dialogStatusTab = actionTarget.dataset.status || "active";
    if (state.dialogStatusTab === "closed") {
      state.dialogViewId = "closed";
    } else if (state.dialogViewId === "closed") {
      state.dialogViewId = "all";
    }
    setDialogView(state.dialogViewId);
    render();
  }

  if (action === "dialog-view") {
    setDialogView(actionTarget.dataset.view || "my-queue");
    render();
  }

  if (action === "dialog-pending-page") {
    const replyQueueMine = state.conversations.filter((conversation) => conversation.mine && conversation.workflowState === "active");
    const replyQueueSupport = state.conversations.filter(
      (conversation) =>
        !conversation.mine &&
        conversation.workflowState === "active" &&
        (conversation.requiresHuman || conversation.slaRisk || conversation.needsKnowledge)
    );
    const replyQueueConversations = [...replyQueueMine, ...replyQueueSupport].filter(
      (conversation, index, list) => list.findIndex((item) => item.id === conversation.id) === index
    );
    const pendingPageCount = Math.max(1, Math.ceil(replyQueueConversations.length / DIALOG_PENDING_PER_PAGE));
    const nextPage = Number(actionTarget.dataset.page || state.dialogPendingPage);
    state.dialogPendingPage = Math.min(Math.max(nextPage, 1), pendingPageCount);
    render();
  }

  if (action === "dialog-cycle-conversation") {
    const visible = filteredDialogConversations();
    if (!visible.length) return;
    const currentIndex = visible.findIndex((conversation) => conversation.id === state.activeConversationId);
    const step = Number(actionTarget.dataset.step || 1);
    const nextIndex = Math.min(Math.max((currentIndex === -1 ? 0 : currentIndex) + step, 0), visible.length - 1);
    state.activeConversationId = visible[nextIndex].id;
    state.dialogSuggestionExpanded = false;
    state.dialogShouldScrollToLatest = true;
    render();
  }

  if (action === "dialog-search") {
    const input = document.getElementById("dialog-search-input");
    state.dialogSearch = (input ? input.value : state.dialogSearch).trim();
    state.dialogPendingPage = 1;
    const visible = filteredDialogConversations();
    state.activeConversationId = visible[0]?.id || state.activeConversationId;
    state.dialogSuggestionExpanded = false;
    state.dialogShouldScrollToLatest = true;
    render();
  }

  if (action === "dialog-toggle-suggestion") {
    state.dialogSuggestionExpanded = !state.dialogSuggestionExpanded;
    render();
  }

  if (action === "dialog-insert-suggestion") {
    const current = ensureActiveDialogConversation();
    const input = document.getElementById("dialog-reply-input");
    if (current && input) {
      input.value = current.suggestion.body;
      input.focus();
    }
  }

  if (action === "dialog-quick-reply") {
    const input = document.getElementById("dialog-reply-input");
    if (input) {
      input.value = "这边已经收到你的问题，我先继续帮你确认一下具体情况，稍后给你明确答复。";
      input.focus();
    }
  }

  if (action === "dialog-regenerate") {
    state.dialogSuggestionExpanded = true;
    render();
  }

  if (action === "system-settings-section") {
    state.systemSettingsSection = actionTarget.dataset.sectionId || state.systemSettingsSection;
    state.systemSettingsControlIndex = 0;
    state.systemSettingsPanelMode = "detail";
    state.systemSettingsNotice = "系统配置改动将先进入草稿，再经过审批与灰度生效。";
    setModuleContext({
      source: "system-settings",
      target: "system-settings",
      title: `当前正在查看 ${currentSystemSettingsSection().label}`,
      detail: "这里处理底层能力、权限和同步机制，改动后要回到 AI 配置确认业务影响。",
      settingsSection: state.systemSettingsSection,
      nextRoute: "console-overview",
      nextLabel: "回到 AI 配置确认影响",
    });
    render();
  }

  if (action === "system-settings-detail") {
    state.systemSettingsControlIndex = Number(actionTarget.dataset.controlIndex || state.systemSettingsControlIndex);
    state.systemSettingsPanelMode = "detail";
    render();
  }

  if (action === "system-settings-config") {
    state.systemSettingsControlIndex = Number(actionTarget.dataset.controlIndex || state.systemSettingsControlIndex);
    state.systemSettingsPanelMode = "config";
    render();
  }

  if (action === "system-settings-save-draft") {
    const form = document.querySelector(`.settings-draft-form[data-settings-key="${currentSystemSettingsDraftKey()}"]`);
    if (!form) {
      return;
    }

    const fields = [...form.querySelectorAll("[data-field-index]")]
      .map((input) => {
        const index = Number(input.dataset.fieldIndex || 0);
        const presetField = currentSystemSettingsPreset()?.fields[index];
        return {
          label: presetField?.label || `字段 ${index + 1}`,
          value: input.value.trim(),
        };
      });

    state.systemSettingsDrafts[currentSystemSettingsDraftKey()] = { fields };
    state.systemSettingsPanelMode = "detail";
    state.systemSettingsNotice = `${currentSystemSettingsSection().label} 已保存草稿，等待审批后才能进入灰度。`;
    setModuleContext({
      source: "system-settings",
      target: "system-settings",
      title: `${currentSystemSettingsSection().label} 草稿已保存`,
      detail: "底层配置已经进入草稿，下一步应回到 AI 配置或工作台确认业务影响与发布顺序。",
      settingsSection: state.systemSettingsSection,
      nextRoute: "console-publish",
      nextLabel: "去 AI 配置确认发布影响",
    });
    render();
  }

  if (action === "dialog-send-reply") {
    const current = ensureActiveDialogConversation();
    const input = document.getElementById("dialog-reply-input");
    const reply = (input ? input.value : "").trim();
    if (current && reply) {
      mutateCurrentConversation((conversation) => {
        if (!Array.isArray(conversation.timeline)) return;
        conversation.timeline = [
          ...conversation.timeline,
          { kind: "message", role: "assistant", sender: "Diudiu AI / 客服", time: "刚刚", badge: "人工回复", text: reply },
        ];
        conversation.status = "人工处理中";
        conversation.assignee = "我";
        conversation.mine = true;
        conversation.requiresHuman = false;
        conversation.tags = Array.from(new Set(conversation.tags.filter((tag) => tag !== "待接管").concat("人工处理中")));
      });
      state.dialogSuggestionExpanded = false;
      state.dialogShouldScrollToLatest = true;
      render();
    }
  }

  if (action === "workspace-escalate") {
    mutateCurrentConversation((conversation) => {
      conversation.requiresHuman = true;
      conversation.risk = "high";
      conversation.status = "已升级工单";
      conversation.assignee = "我";
      conversation.mine = true;
      conversation.tags = Array.from(new Set(conversation.tags.concat("已升级工单")));
      if (Array.isArray(conversation.timeline)) {
        conversation.timeline = [...conversation.timeline, { kind: "event", text: "系统提示：会话已升级到高优先级处理流" }];
      }
    });
    navigateToModule("console-setup", {
      source: "dialog-center",
      target: "ai-config",
      title: "会话已升级，建议检查风险兜底策略",
      detail: "这条会话进入高优先级处理流后，应同步确认转人工和高风险边界是否需要收紧。",
      conversationId: state.activeConversationId,
      strategyTab: "risk",
      nextRoute: "system-settings",
      nextLabel: "继续看安全审计设置",
    });
  }

  if (action === "workspace-human") {
    mutateCurrentConversation((conversation) => {
      conversation.requiresHuman = true;
      conversation.risk = "high";
      conversation.status = "已转人工";
      conversation.assignee = "我";
      conversation.mine = true;
      conversation.tags = Array.from(new Set(conversation.tags.filter((tag) => tag !== "待接管").concat("人工处理中")));
      if (Array.isArray(conversation.timeline)) {
        conversation.timeline = [...conversation.timeline, { kind: "event", text: "系统提示：会话已转人工，由当前客服继续处理" }];
      }
    });
    state.dialogShouldScrollToLatest = true;
    render();
  }

  if (action === "workspace-gap") {
    mutateCurrentConversation((conversation) => {
      conversation.status = "待补知识";
      conversation.needsKnowledge = true;
      conversation.internalNote = "已标记知识缺口，待 AI 配置补充相关 FAQ 或规则口径。";
      conversation.tags = Array.from(new Set(conversation.tags.concat("知识回流")));
      conversation.preview = `${conversation.preview} 已标记知识缺口。`;
      if (Array.isArray(conversation.timeline)) {
        conversation.timeline = [...conversation.timeline, { kind: "event", text: "系统提示：已标记知识缺口，待回流 AI 配置" }];
      }
    });
    navigateToModule("console-knowledge", {
      source: "dialog-center",
      target: "ai-config",
      title: "已从对话中心回流知识缺口",
      detail: "先在知识健康里确认缺口归因，再决定是否需要补 FAQ、商品资料或系统级同步策略。",
      conversationId: state.activeConversationId,
      strategyTab: "knowledge",
      nextRoute: "system-settings",
      nextLabel: "继续看知识同步设置",
      settingsSection: "knowledge",
    });
  }
});

function setStrategyToast(message) {
  state.strategyToast = message;
}

function saveStrategyRule(ruleId) {
  const editor = document.querySelector(`.strategy-editor-form[data-rule-id="${ruleId}"]`);
  if (!editor || !state.strategyConsole) {
    return;
  }

  const label = editor.querySelector('[data-field="label"]')?.value?.trim() ?? "";
  const valueText = editor.querySelector('[data-field="valueText"]')?.value?.trim() ?? "";
  const effect = editor.querySelector('[data-field="effect"]')?.value?.trim() ?? "";

  state.strategyConsole = strategyConsoleStateApi.updateDraftRule(state.strategyConsole, ruleId, {
    label,
    valueText,
    effect,
  });
  setStrategyToast("规则已保存到草稿，验证进度已重置，右侧发布栏已同步更新。");
}

function runAllStrategyScenarios() {
  if (!state.strategyConsole) {
    return;
  }

  state.strategyConsole = state.strategyConsole.validation.scenarios.reduce((currentState, scenario) => {
    if (scenario.status === "completed") {
      return currentState;
    }

    return strategyConsoleStateApi.runValidationScenario(currentState, scenario.id);
  }, state.strategyConsole);
  setStrategyToast("三条验证场景已全部回放，可以检查右侧发布闸门是否已放行。");
}

document.addEventListener("click", (event) => {
  const actionTarget = event.target.closest("[data-action]");
  if (!actionTarget || !String(actionTarget.dataset.action || "").startsWith("strategy-")) {
    return;
  }

  const action = actionTarget.dataset.action;

  if (action === "strategy-focus-risk-card") {
    state.strategyConsole = strategyConsoleStateApi.focusRiskCard(state.strategyConsole, actionTarget.dataset.cardId);
    render();
  }

  if (action === "strategy-save-rule") {
    saveStrategyRule(actionTarget.dataset.ruleId);
    render();
  }

  if (action === "strategy-reset-editor") {
    setStrategyToast("编辑器已恢复为当前草稿值。");
    render();
  }

  if (action === "strategy-run-scenario") {
    state.strategyConsole = strategyConsoleStateApi.runValidationScenario(state.strategyConsole, actionTarget.dataset.scenarioId);
    setStrategyToast("当前验证场景已完成，发布栏中的进度条已同步更新。");
    render();
  }

  if (action === "strategy-run-all-scenarios") {
    runAllStrategyScenarios();
    render();
  }

  if (action === "strategy-publish") {
    const readiness = strategyConsoleStateApi.getReleaseReadiness(state.strategyConsole);
    if (!readiness.canPublish) {
      setStrategyToast("仍有阻塞项未清除，先完成右侧提示的草稿和验证动作。");
      render();
      return;
    }

    state.strategyConsole = strategyConsoleStateApi.publishStrategyDraft(state.strategyConsole, {
      publishedAt: new Date().toISOString(),
    });
    setStrategyToast("草稿已发布，风险卡片已同步为最新口径；继续编辑会重新进入草稿流程。");
    render();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "chat-input") state.chatInput = event.target.value;
  if (event.target.id === "dialog-search-input") state.dialogSearch = event.target.value;
  if (event.target.id === "embed-input") state.embedInput = event.target.value;
  if (event.target.id === "knowledge-input") state.knowledgeQuery = event.target.value;
});

render();
})();
