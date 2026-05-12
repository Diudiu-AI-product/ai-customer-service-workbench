const conversations = [
  {
    id: "chat-001",
    user: "林同学",
    source: "闲鱼会话",
    time: "2 分钟前",
    snippet: "最低多少？我看到别家同款也在卖，想确认一下你这边还能不能便宜一点。",
    risk: "medium",
    mode: "auto",
    intent: "price",
    round: 2,
    autoReplyAllowed: true,
    sent: false,
    owner: "AI 自动处理",
    assignee: "系统分配 · 华东 A 组",
    queue: "价格协商队列",
    priority: "medium",
    waitTime: "08 分钟",
    sla: "剩余 10 分钟",
    locked: "未锁定",
    internalNote: "第 2 轮议价，暂不暴露底价。",
    title: "林同学 · iPhone 13 会话",
    headerTags: ["价格咨询", "第 2 轮议价", "低风险可自动回复"],
    confidence: 89,
    suggestedReply: "价格已经尽量压到比较实在了，如果你是真心想要，我这边还能再帮你向下谈一点，但不会差太多。",
    conversationStatus: {
      label: "待发送",
      tone: "pending",
      detail: "AI 已生成建议回复，等待客服确认后发送。"
    },
    opsSuggestions: [
      {
        title: "控制议价幅度",
        detail: "这是第 2 轮价格追问，建议继续保留让价空间，但不要直接暴露底价。"
      },
      {
        title: "优先强调成色与库存",
        detail: "当前只剩 1 台，回复时带上成色与库存信息，更容易把用户从比价拉回成交判断。"
      },
      {
        title: "若继续压价，进入人工复核",
        detail: "如果用户第三次追问最低价，可切到人工判断是否需要限时优惠或放弃跟进。"
      }
    ],
    explain: {
      summary: "系统把这条消息识别为价格意图，因为用户直接询问“最低多少”，并带有明显的比价语气。",
      signals: [
        "命中价格相关关键词：最低多少、别家也有",
        "当前会话已进入第 2 轮议价，不适合继续使用首轮报价口径",
        "风险等级为中，适合自动回复但不适合过度让价"
      ],
      context: [
        "读取了商品价格区间：￥2,999 - ￥3,199",
        "读取了商品成色和库存，避免建议回复与商品状态脱节",
        "结合历史会话判断用户仍处于议价阶段"
      ],
      action: "建议自动回复，但回复内容要保留议价空间，同时避免直接给出底价。"
    },
    product: {
      title: "iPhone 13 128G 蓝色",
      summary: "国行，电池健康 89%，无拆修，边框轻微使用痕迹，适合追求性价比的用户。",
      attrs: [
        ["价格区间", "￥2,999 - ￥3,199"],
        ["库存", "1 台"],
        ["成色", "89 新"],
        ["推荐策略", "温和议价"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "10:21",
        author: "林同学",
        text: "还在吗？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "assistant",
        type: "text",
        time: "10:21",
        author: "AI 客服",
        text: "在的，这边还在，有什么想了解的可以直接问我。",
        status: { label: "已发送", tone: "sent" }
      },
      {
        role: "user",
        type: "text",
        time: "10:23",
        author: "林同学",
        text: "最低多少？我看到别家也有差不多的。",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-002",
    user: "周先生",
    source: "闲鱼会话",
    time: "7 分钟前",
    snippet: "这台 MacBook Air 是不是国行？电池循环多少次，办公会不会卡？",
    risk: "low",
    mode: "auto",
    intent: "tech",
    round: 0,
    autoReplyAllowed: true,
    sent: false,
    owner: "AI 自动处理",
    assignee: "系统分配 · 商品咨询 Bot",
    queue: "商品咨询队列",
    priority: "low",
    waitTime: "03 分钟",
    sla: "剩余 22 分钟",
    locked: "未锁定",
    internalNote: "参数咨询，优先直接答全。",
    title: "周先生 · MacBook Air 会话",
    headerTags: ["技术咨询", "商品信息已命中缓存", "建议直接自动回复"],
    confidence: 93,
    suggestedReply: "是国行版本，日常办公、文档、网页和轻度剪辑都没问题。如果你比较在意电池循环次数，我也可以把当前信息再发你确认。",
    conversationStatus: {
      label: "待发送",
      tone: "pending",
      detail: "信息型问题，建议直接发送 AI 回复。"
    },
    opsSuggestions: [
      {
        title: "直接给足信息",
        detail: "这类技术咨询不需要反复试探，建议一次性回答国行、电池和办公表现，减少往返。"
      },
      {
        title: "沉淀为知识卡",
        detail: "“国行吗”“办公卡不卡”是高频问题，适合整理成标准知识片段，提升命中率。"
      },
      {
        title: "补一条成交推进句",
        detail: "用户确认参数后，可以顺带补一句“如果需要我可以继续拍更多细节图”，提高转化。"
      }
    ],
    explain: {
      summary: "系统判断这是技术 / 商品信息咨询，因为用户关注国行、循环次数和办公性能，而不是价格或售后。",
      signals: [
        "命中技术类问法：是不是国行、循环多少次、会不会卡",
        "问题都围绕商品参数和使用体验展开",
        "没有支付、售后或站外引导信号"
      ],
      context: [
        "商品信息缓存已命中，不需要重新拉取",
        "当前库存只有 1 台，回复需要尽量明确直接",
        "历史聊天仍处于初次咨询阶段"
      ],
      action: "建议直接自动回复，优先提供清晰信息，减少用户继续追问的成本。"
    },
    product: {
      title: "MacBook Air M1 8G+256G",
      summary: "轻办公、高频学习场景友好，国行版本，外观轻微磕碰但功能正常。",
      attrs: [
        ["价格区间", "￥4,250"],
        ["库存", "1 台"],
        ["适用场景", "办公 / 学习 / 轻剪辑"],
        ["推荐策略", "信息清晰直答"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "10:05",
        author: "周先生",
        text: "你好，这台是不是国行？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "assistant",
        type: "text",
        time: "10:05",
        author: "AI 客服",
        text: "你好，是国行版本的，有什么细节想了解都可以问我。",
        status: { label: "已发送", tone: "sent" }
      },
      {
        role: "user",
        type: "text",
        time: "10:06",
        author: "周先生",
        text: "电池循环多少次，办公会不会卡？",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-003",
    user: "阿青",
    source: "闲鱼会话",
    time: "13 分钟前",
    snippet: "我这边上次拍了之后系统显示异常，能不能退？这个要不要我加你微信说。",
    risk: "high",
    mode: "manual",
    intent: "after_sale",
    round: 0,
    autoReplyAllowed: false,
    sent: false,
    owner: "售后人工组",
    assignee: "王琳 · 售后二线",
    queue: "高风险售后队列",
    priority: "high",
    waitTime: "13 分钟",
    sla: "剩余 04 分钟",
    locked: "人工锁定",
    internalNote: "涉及售后异常与站外风险，保持站内沟通。",
    title: "阿青 · 售后异常会话",
    headerTags: ["售后争议", "涉及站外风险", "已转人工"],
    confidence: 64,
    suggestedReply: "建议人工接管。当前消息涉及售后异常与站外联系方式，不建议自动生成回复。",
    conversationStatus: {
      label: "人工处理中",
      tone: "manual",
      detail: "已命中高风险规则，AI 自动回复关闭。"
    },
    opsSuggestions: [
      {
        title: "先补处理时效",
        detail: "建议人工先告知用户预计处理时间，避免会话空窗导致情绪升级。"
      },
      {
        title: "核对订单与规则",
        detail: "转人工后优先确认订单状态、退款条件和平台规则，避免口径失误。"
      },
      {
        title: "保留站内沟通",
        detail: "后续仍建议在平台内完成解释与协商，不要迁移到站外。"
      }
    ],
    explain: {
      summary: "系统没有继续自动回复，而是建议人工接管，因为这条消息同时涉及售后异常和站外联系方式，已经超出安全自动化边界。",
      signals: [
        "命中售后异常语义：系统异常、能不能退",
        "命中站外引导信号：加微信说",
        "这类问题一旦自动回复不当，容易带来规则和风险问题"
      ],
      context: [
        "该会话已出现人工回复痕迹，说明之前已经被人工关注",
        "售后和争议问题不适合用通用客服口径继续推进",
        "当前没有足够上下文支持 AI 自主给出退款类承诺"
      ],
      action: "建议立即转人工，不再自动发送 AI 回复，并由人工结合订单状态处理。"
    },
    product: {
      title: "售后处理中订单会话",
      summary: "该会话当前不应继续自动回复，建议人工查看订单状态、沟通记录和平台规则后处理。",
      attrs: [
        ["风险等级", "高"],
        ["库存", "不适用"],
        ["处理策略", "人工优先"],
        ["推荐策略", "规则优先"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "09:48",
        author: "阿青",
        text: "我这边上次拍了之后系统显示异常，能不能退？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "assistant",
        type: "text",
        time: "09:49",
        author: "卖家人工",
        text: "这个我先帮你看一下订单状态，你稍等。",
        status: { label: "人工处理中", tone: "manual" }
      },
      {
        role: "user",
        type: "text",
        time: "09:52",
        author: "阿青",
        text: "要不要我加你微信说，会快一点。",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-004",
    user: "陈女士",
    source: "闲鱼会话",
    time: "4 分钟前",
    snippet: "这台小米 14 还能少一点吗？如果今天拍下能不能包顺丰。",
    risk: "medium",
    mode: "auto",
    intent: "price",
    round: 1,
    autoReplyAllowed: true,
    sent: false,
    owner: "AI 自动处理",
    assignee: "系统分配 · 华东 B 组",
    queue: "价格协商队列",
    priority: "medium",
    waitTime: "06 分钟",
    sla: "剩余 12 分钟",
    locked: "未锁定",
    internalNote: "首轮议价，先稳价格，再补发货时效。",
    title: "陈女士 · 小米 14 会话",
    headerTags: ["价格咨询", "首轮议价", "支持自动回复"],
    confidence: 86,
    suggestedReply: "价格已经做过一轮调整了，如果你今天确定拍下，我这边可以帮你优先安排发出，顺丰也可以沟通。",
    conversationStatus: {
      label: "待发送",
      tone: "pending",
      detail: "价格与履约混合问题，建议先发 AI 建议，再看用户是否继续压价。"
    },
    opsSuggestions: [
      {
        title: "先稳价格再给履约承诺",
        detail: "用户既问价格又问顺丰，建议先回应价格空间，再补一句可优先发货。"
      },
      {
        title: "避免首轮让价过大",
        detail: "当前是首轮议价，不建议直接给到底价，保留二次沟通空间。"
      },
      {
        title: "若确认拍下再给具体时效",
        detail: "等用户明确购买意向后，再补更具体的发货安排。"
      }
    ],
    explain: {
      summary: "系统识别为价格主导会话，发货诉求是次要信息，适合由 AI 先给出稳态回复。",
      signals: [
        "命中价格关键词：少一点、今天拍下",
        "包含履约问法：能不能包顺丰",
        "当前仍处于首轮议价，风险可控"
      ],
      context: [
        "商品库存正常，可支撑顺丰发货类话术",
        "当前队列中价格会话较多，适合优先自动处理",
        "用户尚未提出售后或风险诉求"
      ],
      action: "建议自动回复，先控价格幅度，再补充发货安排。"
    },
    product: {
      title: "小米 14 12+256 黑色",
      summary: "国行在保，机身边框轻微使用痕迹，适合在意发货时效和性价比的用户。",
      attrs: [
        ["价格区间", "￥2,850 - ￥2,980"],
        ["库存", "2 台"],
        ["成色", "95 新"],
        ["推荐策略", "稳价促单"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "10:16",
        author: "陈女士",
        text: "这台小米 14 还能少一点吗？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "user",
        type: "text",
        time: "10:17",
        author: "陈女士",
        text: "如果今天拍下能不能包顺丰。",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-005",
    user: "小何",
    source: "闲鱼会话",
    time: "16 分钟前",
    snippet: "我收到之后发现有划痕，和页面说的不一样，这个怎么处理？",
    risk: "high",
    mode: "manual",
    intent: "after_sale",
    round: 0,
    autoReplyAllowed: false,
    sent: false,
    owner: "售后人工组",
    assignee: "赵冉 · 质检复核",
    queue: "高风险售后队列",
    priority: "high",
    waitTime: "16 分钟",
    sla: "剩余 03 分钟",
    locked: "人工锁定",
    internalNote: "描述不符争议，优先核验商品详情图和质检备注。",
    title: "小何 · 描述不符争议会话",
    headerTags: ["售后争议", "描述不符", "已转人工"],
    confidence: 71,
    suggestedReply: "该会话建议由人工继续处理，需先核验商品详情图、质检记录和订单状态。",
    conversationStatus: {
      label: "人工处理中",
      tone: "manual",
      detail: "命中描述不符与售后争议规则，暂不建议自动发送回复。"
    },
    opsSuggestions: [
      {
        title: "先同步核验进度",
        detail: "建议先告知用户正在核验商品详情图和质检记录，避免用户情绪继续升级。"
      },
      {
        title: "回到站内证据链",
        detail: "优先在站内引用商品页图片和备注，减少口头解释带来的分歧。"
      },
      {
        title: "必要时升级工单",
        detail: "若用户坚持描述不符且带有退款诉求，可直接升级到质检主管处理。"
      }
    ],
    explain: {
      summary: "系统识别为描述不符争议，属于售后高风险场景，不适合继续自动回复。",
      signals: [
        "命中争议关键词：有划痕、不一样、怎么处理",
        "涉及页面描述与实物差异，存在规则风险",
        "SLA 已进入紧急处理区间"
      ],
      context: [
        "当前需要结合详情图、质检备注和聊天记录判断",
        "售后争议一旦口径不一致，容易引发升级或差评",
        "已有人工接管，不再建议回到自动模式"
      ],
      action: "建议人工处理，并视核验结果决定是否升级工单。"
    },
    product: {
      title: "描述不符争议订单",
      summary: "当前更需要查看详情图、质检记录和售后规则，而不是商品参数本身。",
      attrs: [
        ["风险等级", "高"],
        ["处理时限", "剩余 03 分钟"],
        ["处理策略", "人工复核"],
        ["推荐策略", "证据优先"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "09:33",
        author: "小何",
        text: "我收到之后发现有划痕，和页面说的不一样。",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "assistant",
        type: "text",
        time: "09:35",
        author: "卖家人工",
        text: "我先帮你核一下详情图和之前备注，你稍等一下。",
        status: { label: "人工处理中", tone: "manual" }
      }
    ]
  },
  {
    id: "chat-006",
    user: "贺先生",
    source: "闲鱼会话",
    time: "9 分钟前",
    snippet: "这副 AirPods Pro 2 是原装盒吗？降噪和续航怎么样？",
    risk: "low",
    mode: "auto",
    intent: "tech",
    round: 0,
    autoReplyAllowed: true,
    sent: false,
    owner: "AI 自动处理",
    assignee: "系统分配 · 商品咨询 Bot",
    queue: "商品咨询队列",
    priority: "low",
    waitTime: "05 分钟",
    sla: "剩余 18 分钟",
    locked: "未锁定",
    internalNote: "标准参数问题，可直接命中知识卡。",
    title: "贺先生 · AirPods Pro 2 会话",
    headerTags: ["技术咨询", "参数问答", "建议直接自动回复"],
    confidence: 91,
    suggestedReply: "是原装盒在的，降噪和日常通勤使用都没问题，续航表现也比较稳定。如果你需要，我可以再补几张细节图给你看。",
    conversationStatus: {
      label: "待发送",
      tone: "pending",
      detail: "参数型问题，适合直接发送标准知识回复。"
    },
    opsSuggestions: [
      {
        title: "标准知识片段直答",
        detail: "命中了耳机参数知识卡，建议直接发送，不必人工改写。"
      },
      {
        title: "补一条细节图引导",
        detail: "可在回复末尾补充“需要的话我可以再拍细节图”，提高转化。"
      },
      {
        title: "注意不要过度承诺续航",
        detail: "续航表述建议保持日常使用场景，不要给过强的性能承诺。"
      }
    ],
    explain: {
      summary: "系统识别为商品参数咨询，适合知识卡直答。",
      signals: [
        "命中参数关键词：原装盒、降噪、续航",
        "未涉及价格、售后或站外信号",
        "商品知识命中率高"
      ],
      context: [
        "商品信息已缓存，无需额外查询",
        "当前队列中商品咨询可优先自动化清理",
        "用户尚处于首次咨询阶段"
      ],
      action: "建议自动回复，并在尾部补充细节图引导。"
    },
    product: {
      title: "AirPods Pro 2 充电盒套装",
      summary: "通勤与轻办公场景友好，支持主动降噪，包装配件齐全。",
      attrs: [
        ["价格区间", "￥1,120"],
        ["库存", "1 套"],
        ["适用场景", "通勤 / 轻办公"],
        ["推荐策略", "知识卡直答"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "10:11",
        author: "贺先生",
        text: "这副 AirPods Pro 2 是原装盒吗？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "user",
        type: "text",
        time: "10:12",
        author: "贺先生",
        text: "降噪和续航怎么样？",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-007",
    user: "Daisy",
    source: "闲鱼会话",
    time: "11 分钟前",
    snippet: "如果我中午前拍下，今天能发吗？另外发货前能不能帮我再拍个开机视频。",
    risk: "medium",
    mode: "auto",
    intent: "delivery",
    round: 0,
    autoReplyAllowed: true,
    sent: false,
    owner: "AI 自动处理",
    assignee: "系统分配 · 履约支持 Bot",
    queue: "站内闭环队列",
    priority: "medium",
    waitTime: "07 分钟",
    sla: "剩余 14 分钟",
    locked: "未锁定",
    internalNote: "履约型诉求，先确认可发货，再承诺视频补充。",
    title: "Daisy · 发货确认会话",
    headerTags: ["履约确认", "站内闭环", "可自动回复"],
    confidence: 84,
    suggestedReply: "如果你中午前拍下，我这边可以优先安排今天发出；发货前也可以补一个简单开机视频给你确认。",
    conversationStatus: {
      label: "待发送",
      tone: "pending",
      detail: "履约确认类问题，建议直接给出清晰时效与补充动作。"
    },
    opsSuggestions: [
      {
        title: "先确认时效",
        detail: "用户最关心的是今天能不能发，回复里需要先给明确结果。"
      },
      {
        title: "视频承诺保持轻量",
        detail: "建议承诺简单开机视频，不要引导到更重的人工操作。"
      },
      {
        title: "保持站内闭环",
        detail: "该类补充材料可直接站内发送，避免额外沟通链路。"
      }
    ],
    explain: {
      summary: "系统识别为履约确认问题，信息明确且风险可控，适合自动回复。",
      signals: [
        "命中履约关键词：今天能发吗、开机视频",
        "用户没有议价、售后或争议信号",
        "问题需要清晰时效承诺"
      ],
      context: [
        "履约型问题对转化有帮助，适合优先处理",
        "当前库存与发货能力支持当天发出",
        "站内可直接补充视频材料"
      ],
      action: "建议自动回复，先明确能否发货，再补充视频支持。"
    },
    product: {
      title: "iPad mini 6 紫色",
      summary: "适合轻办公和观影使用，库存稳定，发货效率较高。",
      attrs: [
        ["价格区间", "￥2,680"],
        ["库存", "2 台"],
        ["适用场景", "办公 / 观影"],
        ["推荐策略", "履约促单"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "10:08",
        author: "Daisy",
        text: "如果我中午前拍下，今天能发吗？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "user",
        type: "text",
        time: "10:09",
        author: "Daisy",
        text: "另外发货前能不能帮我再拍个开机视频。",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-008",
    user: "张同学",
    source: "闲鱼会话",
    time: "5 分钟前",
    snippet: "Switch 这台能做到 1500 吗？如果配件全在我就直接拍。",
    risk: "medium",
    mode: "auto",
    intent: "price",
    round: 1,
    autoReplyAllowed: true,
    sent: false,
    owner: "AI 自动处理",
    assignee: "系统分配 · 华东 A 组",
    queue: "价格协商队列",
    priority: "medium",
    waitTime: "09 分钟",
    sla: "剩余 09 分钟",
    locked: "未锁定",
    internalNote: "用户带成交信号，先稳住价格，再补配件完整度。",
    title: "张同学 · Switch 会话",
    headerTags: ["价格咨询", "带成交意向", "低风险可自动回复"],
    confidence: 88,
    suggestedReply: "配件是齐的，这个价格我这边已经压得比较实在了。如果你是真心要，我可以再帮你确认一点空间，但不一定能直接到 1500。",
    conversationStatus: {
      label: "待发送",
      tone: "pending",
      detail: "该会话已临近 SLA，建议优先处理。"
    },
    opsSuggestions: [
      {
        title: "先确认配件完整",
        detail: "用户愿意直接拍下，说明成交意向较强，先回应配件完整度能降低犹豫。"
      },
      {
        title: "价格不要一步到位",
        detail: "建议保留一点协商空间，不要直接满足用户目标价。"
      },
      {
        title: "临近 SLA 需优先发出",
        detail: "当前会话已接近 SLA 红线，建议排在本轮优先发送列表里。"
      }
    ],
    explain: {
      summary: "系统识别为带成交信号的议价会话，建议优先回复。",
      signals: [
        "命中价格问法：能做到 1500 吗",
        "命中强成交信号：配件全在就直接拍",
        "当前剩余 SLA 仅 9 分钟"
      ],
      context: [
        "配件信息已命中商品缓存",
        "会话接近时效红线，优先级高于普通商品咨询",
        "用户意向强，回复应偏促单而非纯解释"
      ],
      action: "建议自动回复，并优先在本轮发出。"
    },
    product: {
      title: "Nintendo Switch OLED 白色",
      summary: "主机、底座、电源和 Joy-Con 配件齐全，适合希望直接成交的用户。",
      attrs: [
        ["价格区间", "￥1,580 - ￥1,680"],
        ["库存", "1 台"],
        ["成色", "92 新"],
        ["推荐策略", "促单议价"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "10:18",
        author: "张同学",
        text: "Switch 这台能做到 1500 吗？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "user",
        type: "text",
        time: "10:19",
        author: "张同学",
        text: "如果配件全在我就直接拍。",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-009",
    user: "王阿姨",
    source: "闲鱼会话",
    time: "18 分钟前",
    snippet: "我拍完以后一直没显示物流，这个是不是没发出？要不要退款。",
    risk: "high",
    mode: "manual",
    intent: "after_sale",
    round: 0,
    autoReplyAllowed: false,
    sent: false,
    owner: "售后人工组",
    assignee: "李扬 · 订单支持",
    queue: "高风险售后队列",
    priority: "high",
    waitTime: "18 分钟",
    sla: "剩余 02 分钟",
    locked: "人工锁定",
    internalNote: "物流异常 + 退款苗头，需先查订单状态再给口径。",
    title: "王阿姨 · 物流异常会话",
    headerTags: ["物流异常", "退款苗头", "已转人工"],
    confidence: 68,
    suggestedReply: "当前会话建议由人工继续处理，需先确认订单物流状态，再决定是否进入退款说明。",
    conversationStatus: {
      label: "人工处理中",
      tone: "manual",
      detail: "命中物流异常与退款意向规则，AI 自动回复关闭。"
    },
    opsSuggestions: [
      {
        title: "先查物流节点",
        detail: "在给用户口径前先确认物流节点，避免误判成未发出。"
      },
      {
        title: "延后退款承诺",
        detail: "未查清订单状态前，不建议直接承诺退款方案。"
      },
      {
        title: "必要时转订单支持",
        detail: "若物流节点长时间无更新，可同步订单支持团队介入。"
      }
    ],
    explain: {
      summary: "系统识别为物流异常与退款苗头并存的售后风险会话，应由人工处理。",
      signals: [
        "命中物流异常关键词：没显示物流、没发出",
        "命中退款意向：要不要退款",
        "SLA 已接近红线"
      ],
      context: [
        "当前缺少物流节点信息，不能直接承诺退款",
        "物流异常容易引发焦虑和差评，需要先稳情绪",
        "该类问题更适合订单支持与售后共同处理"
      ],
      action: "建议人工处理，并优先查物流状态后再回复用户。"
    },
    product: {
      title: "物流异常订单会话",
      summary: "当前重点是订单与物流状态，不是商品参数。建议人工先拉取物流节点再回复。",
      attrs: [
        ["风险等级", "高"],
        ["处理时限", "剩余 02 分钟"],
        ["处理策略", "订单优先"],
        ["推荐策略", "物流核验"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "09:22",
        author: "王阿姨",
        text: "我拍完以后一直没显示物流，这个是不是没发出？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "user",
        type: "text",
        time: "09:24",
        author: "王阿姨",
        text: "要不要退款。",
        status: { label: "已读", tone: "read" }
      }
    ]
  },
  {
    id: "chat-010",
    user: "Mia",
    source: "闲鱼会话",
    time: "6 分钟前",
    snippet: "这台 Kindle 可以绑定新账号吧？屏幕有没有发黄或者坏点。",
    risk: "low",
    mode: "auto",
    intent: "tech",
    round: 0,
    autoReplyAllowed: true,
    sent: false,
    owner: "AI 自动处理",
    assignee: "系统分配 · 商品咨询 Bot",
    queue: "商品咨询队列",
    priority: "low",
    waitTime: "04 分钟",
    sla: "剩余 20 分钟",
    locked: "未锁定",
    internalNote: "标准验机问题，适合走知识卡 + 细节图引导。",
    title: "Mia · Kindle 会话",
    headerTags: ["技术咨询", "验机问题", "建议自动回复"],
    confidence: 92,
    suggestedReply: "可以绑定新账号，屏幕没有发黄和坏点，日常阅读没问题。如果你需要，我也可以再补一张开机和屏幕细节图。",
    conversationStatus: {
      label: "待发送",
      tone: "pending",
      detail: "验机类问题，适合知识卡回复。"
    },
    opsSuggestions: [
      {
        title: "直接答绑定与屏幕状态",
        detail: "这类问题需要一口气把用户最关心的点说清楚。"
      },
      {
        title: "补细节图能提升信任",
        detail: "如果用户继续确认，可以补屏幕细节图帮助成交。"
      },
      {
        title: "保持表述客观",
        detail: "描述屏幕状态时保持客观，不要使用绝对化承诺。"
      }
    ],
    explain: {
      summary: "系统识别为验机与参数确认问题，可直接自动回复。",
      signals: [
        "命中验机问法：绑定新账号、发黄、坏点",
        "无议价、售后和履约冲突",
        "当前时效压力较低"
      ],
      context: [
        "商品验机信息已命中缓存",
        "用户仍处于了解商品阶段",
        "后续可顺带补图推进成交"
      ],
      action: "建议自动回复，并视情况补一张屏幕细节图。"
    },
    product: {
      title: "Kindle Paperwhite 5 黑色",
      summary: "适合日常阅读，屏幕状态良好，可直接绑定新账号使用。",
      attrs: [
        ["价格区间", "￥640"],
        ["库存", "1 台"],
        ["适用场景", "阅读 / 学习"],
        ["推荐策略", "验机直答"]
      ]
    },
    messages: [
      {
        role: "user",
        type: "text",
        time: "10:14",
        author: "Mia",
        text: "这台 Kindle 可以绑定新账号吧？",
        status: { label: "已读", tone: "read" }
      },
      {
        role: "user",
        type: "text",
        time: "10:15",
        author: "Mia",
        text: "屏幕有没有发黄或者坏点。",
        status: { label: "已读", tone: "read" }
      }
    ]
  }
];

const listEl = document.getElementById("conversation-list");
const titleEl = document.getElementById("chat-title");
const tagsEl = document.getElementById("chat-tags");
const threadEl = document.getElementById("thread");
const replyEl = document.getElementById("suggested-reply");
const confidenceEl = document.getElementById("confidence-pill");
const decisionSummaryEl = document.getElementById("decision-summary");
const decisionEl = document.getElementById("decision-list");
const productEl = document.getElementById("product-card");
const feedbackEl = document.getElementById("action-feedback");
const transferBtn = document.getElementById("transfer-btn");
const insertSuggestionBtn = document.getElementById("insert-suggestion-btn");
const manualSendBtn = document.getElementById("manual-send-btn");
const uploadTriggerBtn = document.getElementById("upload-trigger-btn");
const voiceTriggerBtn = document.getElementById("voice-trigger-btn");
const imageInput = document.getElementById("image-input");
const messageInput = document.getElementById("message-input");
const internalNoteInput = document.getElementById("internal-note-input");
const composerAttachmentsEl = document.getElementById("composer-attachments");
const explainBtn = document.getElementById("explain-btn");
const filterRow = document.getElementById("filter-row");
const quickPhrasesEl = document.getElementById("quick-phrases");
const queueTabs = document.getElementById("queue-tabs");
const queueSearchInput = document.getElementById("queue-search-input");
const queueSummaryEl = document.getElementById("queue-summary");
const taskStripEl = document.getElementById("task-strip");
const workspaceBannerStatsEl = document.getElementById("workspace-banner-stats");
const workspaceTargetTextEl = document.getElementById("workspace-target-text");
const globalStatusEl = document.getElementById("global-status");
const topbarTotalCountEl = document.getElementById("topbar-total-count");
const topbarHighRiskCountEl = document.getElementById("topbar-high-risk-count");
const heroSummaryGridEl = document.getElementById("hero-summary-grid");
const distributionListEl = document.getElementById("distribution-list");
const queueSortRuleEl = document.getElementById("queue-sort-rule");
const workflowActionsEl = document.getElementById("workflow-actions");
const claimNextBtn = document.getElementById("claim-next-btn");
const reassignBtn = document.getElementById("reassign-btn");
const holdBtn = document.getElementById("hold-btn");
const escalateBtn = document.getElementById("escalate-btn");
const contextKickerEl = document.getElementById("context-kicker");
const contextTitleEl = document.getElementById("context-title");
const modalBackdropEl = document.getElementById("modal-backdrop");
const modalOverviewEl = document.getElementById("modal-overview");
const modalBodyEl = document.getElementById("modal-body");
const closeModalBtn = document.getElementById("close-modal-btn");
const opsSuggestionsEl = document.getElementById("ops-suggestions");

let activeId = conversations[0].id;
let currentFilter = "all";
let currentQueue = "all";
let searchQuery = "";
let pendingImage = null;
let pendingVoice = null;

function nowLabel() {
  return "刚刚";
}

function parseFirstNumber(text) {
  const match = String(text || "").match(/(\d+(?:\.\d+)?)/);
  return match ? Number.parseFloat(match[1]) : 0;
}

function getWaitMinutes(item) {
  return parseFirstNumber(item.waitTime);
}

function getSlaMinutes(item) {
  return parseFirstNumber(item.sla) || 999;
}

function getMessageAgeMinutes(item) {
  return parseFirstNumber(item.time) || 999;
}

function getRiskWeight(item) {
  if (item.risk === "high") return 3;
  if (item.mode === "manual") return 2;
  if (item.priority === "high") return 2;
  if (item.risk === "medium" || item.priority === "medium") return 1;
  return 0;
}

function getIntentGroup(item) {
  if (item.intent === "price") return "price";
  if (item.intent === "after_sale") return "after_sale";
  if (item.intent === "tech") return "goods";
  return "other";
}

function formatCount(value) {
  return String(value).padStart(2, "0");
}

function formatPercent(numerator, denominator) {
  if (!denominator) return "0%";
  return `${Math.round((numerator / denominator) * 100)}%`;
}

function appendSystemMessage(current, text, tone = "manual", label = "系统更新") {
  current.messages.push({
    role: "system",
    type: "text",
    time: nowLabel(),
    author: "系统提示",
    text,
    status: { label, tone }
  });
}

function getRiskTag(item) {
  if (item.risk === "high") {
    return { text: "高风险", className: "risk-high" };
  }

  if (item.risk === "medium") {
    return { text: "价格意图", className: "risk-medium" };
  }

  return { text: "技术 / 普通咨询", className: "risk-low" };
}

function getModeTag(item) {
  return item.mode === "manual"
    ? { text: "人工接管", className: "mode-manual" }
    : { text: "自动模式", className: "mode-auto" };
}

function getPriorityText(priority) {
  if (priority === "high") return "高优先级";
  if (priority === "medium") return "中优先级";
  return "常规优先级";
}

function getStatusClass(tone) {
  return `status-${tone || "default"}`;
}

function getQueueType(item) {
  if (item.queue.includes("价格")) return "price";
  if (item.queue.includes("商品")) return "goods";
  if (item.queue.includes("售后") || item.risk === "high") return "aftersale";
  return "all";
}

function matchesSearch(item) {
  if (!searchQuery) return true;

  const haystack = [
    item.user,
    item.title,
    item.snippet,
    item.queue,
    item.product?.title || "",
    item.intent,
  ].join(" ").toLowerCase();

  return haystack.includes(searchQuery);
}

function getFilteredConversations() {
  const visible = conversations.filter((item) => {
    if (currentFilter === "auto" && item.mode !== "auto") return false;
    if (currentFilter === "manual" && item.mode !== "manual") return false;
    if (currentFilter === "risk" && item.risk !== "high") return false;
    if (currentQueue !== "all" && getQueueType(item) !== currentQueue) return false;
    return matchesSearch(item);
  });

  return visible.sort((left, right) => {
    const riskGap = getRiskWeight(right) - getRiskWeight(left);
    if (riskGap !== 0) return riskGap;

    const slaGap = getSlaMinutes(left) - getSlaMinutes(right);
    if (slaGap !== 0) return slaGap;

    const waitGap = getWaitMinutes(right) - getWaitMinutes(left);
    if (waitGap !== 0) return waitGap;

    return getMessageAgeMinutes(left) - getMessageAgeMinutes(right);
  });
}

function getOverviewSnapshot(items) {
  const total = items.length;
  const pendingCount = items.filter((item) => !item.sent && item.autoReplyAllowed && item.mode !== "manual").length;
  const manualCount = items.filter((item) => item.mode === "manual").length;
  const highPriorityCount = items.filter((item) => item.priority === "high" || item.risk === "high").length;
  const nearSlaCount = items.filter((item) => getSlaMinutes(item) <= 10).length;
  const autoEligibleCount = items.filter((item) => item.autoReplyAllowed && item.mode !== "manual").length;
  const highRiskCount = items.filter((item) => item.risk === "high").length;
  const avgWait = total ? Math.round(items.reduce((sum, item) => sum + getWaitMinutes(item), 0) / total) : 0;

  return {
    total,
    pendingCount,
    manualCount,
    highPriorityCount,
    nearSlaCount,
    autoEligibleCount,
    highRiskCount,
    avgWait
  };
}

function renderHeroSummary() {
  if (!heroSummaryGridEl) return;

  const snapshot = getOverviewSnapshot(conversations);
  heroSummaryGridEl.innerHTML = `
    <div class="hero-overview-card">
      <span>待发送回复</span>
      <strong>${formatCount(snapshot.pendingCount)}</strong>
      <p>适合直接采纳 AI 建议</p>
    </div>
    <div class="hero-overview-card">
      <span>人工处理中</span>
      <strong>${formatCount(snapshot.manualCount)}</strong>
      <p>售后与风险会话优先跟进</p>
    </div>
    <div class="hero-overview-card">
      <span>高优先级会话</span>
      <strong>${formatCount(snapshot.highPriorityCount)}</strong>
      <p>建议在本班次内完成闭环</p>
    </div>
    <div class="hero-overview-card hero-metric-card">
      <span>平均等待时长</span>
      <strong>${snapshot.avgWait}m</strong>
    </div>
    <div class="hero-overview-card hero-metric-card">
      <span>临近 SLA</span>
      <strong>${formatPercent(snapshot.nearSlaCount, snapshot.total)}</strong>
    </div>
    <div class="hero-overview-card hero-metric-card">
      <span>自动建议适用率</span>
      <strong>${formatPercent(snapshot.autoEligibleCount, snapshot.total)}</strong>
    </div>
    <div class="hero-overview-card hero-metric-card">
      <span>人工接管占比</span>
      <strong>${formatPercent(snapshot.manualCount, snapshot.total)}</strong>
    </div>
  `;

  if (topbarTotalCountEl) {
    topbarTotalCountEl.textContent = formatCount(snapshot.total);
  }

  if (topbarHighRiskCountEl) {
    topbarHighRiskCountEl.textContent = formatCount(snapshot.highRiskCount);
  }
}

function renderDistribution() {
  if (!distributionListEl) return;

  const visible = getFilteredConversations();
  const total = visible.length || 1;
  const groups = [
    { key: "goods", label: "售前咨询" },
    { key: "price", label: "议价会话" },
    { key: "after_sale", label: "售后异常" },
    { key: "other", label: "其他事项" }
  ].map((group) => {
    const count = visible.filter((item) => getIntentGroup(item) === group.key).length;
    return {
      ...group,
      count,
      percent: Math.round((count / total) * 100)
    };
  });

  distributionListEl.innerHTML = groups.map((group) => `
    <div class="distribution-item">
      <div class="distribution-label-row">
        <div class="distribution-label-copy">
          <span>${group.label}</span>
          <small>${group.count} / ${visible.length}</small>
        </div>
        <strong>${group.percent}%</strong>
      </div>
      <div class="distribution-bar"><span style="width: ${group.percent}%"></span></div>
    </div>
  `).join("");
}

function renderOperationsOverview() {
  const snapshot = getOverviewSnapshot(conversations);
  const visible = getFilteredConversations();
  const visiblePending = visible.filter((item) => !item.sent && item.autoReplyAllowed && item.mode !== "manual").length;
  const visibleUrgent = visible.filter((item) => item.risk === "high" || getSlaMinutes(item) <= 10).length;

  renderHeroSummary();
  renderDistribution();

  if (workspaceTargetTextEl) {
    workspaceTargetTextEl.textContent = visible.length
      ? `先处理 ${visiblePending} 条待发送，再跟进 ${visibleUrgent} 条临近 SLA / 高风险会话`
      : "当前筛选条件下暂无会话，建议切回全部队列继续查看。";
  }

  if (queueSortRuleEl) {
    queueSortRuleEl.textContent = "高风险 > SLA 剩余 > 等待时长 > 最新消息";
  }

  if (globalStatusEl) {
    globalStatusEl.textContent = snapshot.highRiskCount
      ? `当前有 ${snapshot.highRiskCount} 条高风险会话，另有 ${snapshot.nearSlaCount} 条会话已进入临近 SLA 处理段`
      : "当前队列健康，近 5 分钟未出现高风险或超时会话。";
  }
}

function ensureActiveConversation() {
  const visible = getFilteredConversations();
  if (!visible.some((item) => item.id === activeId)) {
    activeId = visible.length ? visible[0].id : null;
  }
}

function getActiveConversation() {
  return conversations.find((item) => item.id === activeId) || null;
}

function buildHeaderTags(item) {
  const tags = [...item.headerTags];

  if (item.sent && !tags.includes("已模拟发送")) {
    tags.push("已模拟发送");
  }

  if (item.mode === "manual" && !tags.includes("人工处理中")) {
    tags.push("人工处理中");
  }

  return tags;
}

function buildDecisions(item) {
  return [
    ["意图识别", item.intent],
    ["是否自动回复", item.autoReplyAllowed && item.mode !== "manual" ? "是" : "否"],
    ["议价轮次", item.round > 0 ? `第 ${item.round} 轮` : "无"],
    ["安全检查", item.risk === "high" ? "命中风险规则" : "通过"],
    ["人工接管", item.mode === "manual" ? "已触发" : "未触发"]
  ];
}

function setFeedback(text) {
  feedbackEl.textContent = text;
}

function renderQueueTabs() {
  if (!queueTabs) return;

  Array.from(queueTabs.querySelectorAll(".queue-tab")).forEach((button) => {
    button.classList.toggle("active", button.dataset.queue === currentQueue);
  });
}

function renderQueueSummary() {
  if (!queueSummaryEl) return;

  const visible = getFilteredConversations();
  const manualCount = visible.filter((item) => item.mode === "manual").length;
  const pendingCount = visible.filter((item) => !item.sent && item.autoReplyAllowed && item.mode !== "manual").length;
  const highRiskCount = visible.filter((item) => item.risk === "high").length;

  queueSummaryEl.innerHTML = `
    <div class="queue-summary-item">
      <span>当前可见</span>
      <strong>${visible.length}</strong>
    </div>
    <div class="queue-summary-item">
      <span>待发送</span>
      <strong>${pendingCount}</strong>
    </div>
    <div class="queue-summary-item">
      <span>人工跟进</span>
      <strong>${manualCount}</strong>
    </div>
    <div class="queue-summary-item">
      <span>高风险</span>
      <strong>${highRiskCount}</strong>
    </div>
  `;
}

function renderWorkspaceBanner() {
  if (!workspaceBannerStatsEl) return;

  const visible = getFilteredConversations();
  const pendingCount = visible.filter((item) => !item.sent && item.autoReplyAllowed && item.mode !== "manual").length;
  const manualCount = visible.filter((item) => item.mode === "manual").length;
  const highRiskCount = visible.filter((item) => item.risk === "high").length;
  const nearSlaCount = visible.filter((item) => getSlaMinutes(item) <= 10).length;

  workspaceBannerStatsEl.innerHTML = `
    <span>待发送 ${pendingCount}</span>
    <span>人工队列 ${manualCount}</span>
    <span>高风险 ${highRiskCount}</span>
    <span>临近 SLA ${nearSlaCount}</span>
  `;
}

function renderTaskStrip(current) {
  if (!taskStripEl) return;

  if (!current) {
    taskStripEl.innerHTML = "";
    return;
  }

  const actionText = current.mode === "manual"
    ? "需人工接管"
    : current.autoReplyAllowed
      ? "优先发送 AI 建议"
      : "暂不自动发送";

  const queueTypeText = current.risk === "high"
    ? "SLA 风险高"
    : current.priority === "medium"
      ? "需在 10 分钟内处理"
      : "常规优先级";

  taskStripEl.innerHTML = `
    <div class="task-strip-item emphasis">
      <span>当前任务</span>
      <strong>${actionText}</strong>
    </div>
    <div class="task-strip-item">
      <span>所属队列</span>
      <strong>${current.queue}</strong>
    </div>
    <div class="task-strip-item">
      <span>SLA 提示</span>
      <strong>${queueTypeText}</strong>
    </div>
    <div class="task-strip-item">
      <span>处理方式</span>
      <strong>${current.owner}</strong>
    </div>
  `;
}

function renderInternalNote(current) {
  if (!internalNoteInput) return;
  internalNoteInput.value = current?.internalNote || "";
}

function renderComposerAttachments() {
  if (!composerAttachmentsEl) return;

  const cards = [];

  if (pendingImage) {
    cards.push(`
      <div class="attachment-card">
        <img src="${pendingImage.url}" alt="${pendingImage.name}">
        <strong>${pendingImage.name}</strong>
        <span>图片将随回复一起展示</span>
      </div>
    `);
  }

  if (pendingVoice) {
    cards.push(`
      <div class="attachment-card voice-card">
        <strong>语音回复卡片</strong>
        <div class="voice-wave"></div>
        <span>${pendingVoice.duration} · 点击发送后进入聊天流</span>
      </div>
    `);
  }

  composerAttachmentsEl.innerHTML = cards.join("");
}

function renderConversationList() {
  const visible = getFilteredConversations();
  listEl.innerHTML = "";

  if (!visible.length) {
    listEl.innerHTML = `
      <div class="empty-state">
        当前筛选条件下没有会话。你可以切换到“全部会话”继续查看其他场景。
      </div>
    `;
    return;
  }

  visible.forEach((item) => {
    const tags = [getRiskTag(item), getModeTag(item)];
    const button = document.createElement("button");
    button.type = "button";
    button.className = `conversation-item priority-${item.priority} ${item.id === activeId ? "active" : ""}`;
    button.innerHTML = `
      <div class="conversation-top">
        <div class="conversation-topline">
          <span class="priority-dot ${item.priority}"></span>
          <strong>${item.user}</strong>
        </div>
        <span class="conversation-meta">${item.time}</span>
      </div>
      <p class="conversation-snippet">${item.snippet}</p>
      <div class="conversation-data">
        <div>
          <span>等待时长</span>
          <strong>${item.waitTime}</strong>
        </div>
        <div>
          <span>SLA</span>
          <strong>${item.sla}</strong>
        </div>
        <div>
          <span>负责人</span>
          <strong>${item.assignee}</strong>
        </div>
        <div>
          <span>锁定状态</span>
          <strong>${item.locked}</strong>
        </div>
      </div>
      <div class="conversation-bottom">
        <div class="tag-row">
          ${tags.map((tag) => `<span class="tag ${tag.className}">${tag.text}</span>`).join("")}
        </div>
        <span class="conversation-meta">${item.queue}</span>
      </div>
    `;

    button.addEventListener("click", () => {
      activeId = item.id;
      pendingImage = null;
      pendingVoice = null;
      if (messageInput) {
        messageInput.value = "";
      }
      renderComposerAttachments();
      setFeedback("已切换会话。现在可以对照聊天记录、商品上下文和右侧决策卡一起看。");
      renderAll();
    });

    listEl.appendChild(button);
  });
}

function renderOpsSuggestions(current) {
  if (!opsSuggestionsEl) return;

  if (!current) {
    opsSuggestionsEl.innerHTML = "";
    return;
  }

  opsSuggestionsEl.innerHTML = current.opsSuggestions.map((item, index) => `
    <div class="timeline-item ${index === 0 ? "primary" : "secondary"}">
      <span></span>
      <div>
        <strong>${item.title}</strong>
        <p>${item.detail}</p>
      </div>
    </div>
  `).join("");
}

function renderMessageContent(msg) {
  if (msg.type === "image") {
    return `
      <p>${msg.text || "已发送一张商品图片"}</p>
      <img class="message-image" src="${msg.imageUrl}" alt="${msg.imageName || "图片消息"}">
    `;
  }

  if (msg.type === "voice") {
    return `
      <p>${msg.text || "发送了一条语音回复"}</p>
      <div class="voice-message">
        <div class="voice-wave"></div>
        <span>${msg.duration || "00:12"} · 语音卡片展示</span>
      </div>
    `;
  }

  return `<p>${msg.text}</p>`;
}

function buildContextPanel(current) {
  if (current.risk === "high" || current.intent === "after_sale" || current.mode === "manual") {
    return {
      kicker: "处理上下文",
      title: "人工复核与风控信息",
      bodyTitle: current.product.title,
      summary: current.explain.action,
      highlights: [
        ["剩余 SLA", current.sla],
        ["当前负责人", current.assignee]
      ],
      details: [
        ["锁定状态", current.locked],
        ["处理状态", current.conversationStatus.label],
        ["处理策略", current.opsSuggestions[0]?.title || "人工优先"],
        ["内部备注", current.internalNote || "暂无内部备注"]
      ],
      variant: "service"
    };
  }

  if (current.intent === "price") {
    return {
      kicker: "商品上下文",
      title: "当前商品与成交策略",
      bodyTitle: current.product.title,
      summary: current.product.summary,
      highlights: current.product.attrs.slice(0, 2),
      details: current.product.attrs.slice(2),
      variant: "product"
    };
  }

  return {
    kicker: "商品知识卡",
    title: "当前商品",
    bodyTitle: current.product.title,
    summary: current.product.summary,
    highlights: current.product.attrs.slice(0, 2),
    details: current.product.attrs.slice(2),
    variant: "knowledge"
  };
}

function renderContextPanel(current) {
  const panel = buildContextPanel(current);
  const highlights = (panel.highlights || []).filter(Boolean);
  const details = (panel.details || []).filter(Boolean);

  if (contextKickerEl) {
    contextKickerEl.textContent = panel.kicker;
  }

  if (contextTitleEl) {
    contextTitleEl.textContent = panel.title;
  }

  productEl.classList.toggle("contextual-card", panel.variant !== "product");
  productEl.innerHTML = `
    <div class="product-topline">
      ${highlights.map(([label, value]) => `
        <div class="product-highlight">
          <span>${label}</span>
          <strong>${value}</strong>
        </div>
      `).join("")}
    </div>
    <h4 class="product-title">${panel.bodyTitle}</h4>
    <p class="product-summary">${panel.summary}</p>
    <ul class="product-list">
      ${details.map(([label, value]) => `
        <li>
          <span class="product-muted">${label}</span>
          <span>${value}</span>
        </li>
      `).join("")}
    </ul>
  `;
}

function renderWorkflowActions(current) {
  if (!workflowActionsEl) return;

  const visible = getFilteredConversations();
  const hasNext = visible.length > 1;

  claimNextBtn.disabled = !current || !hasNext;
  reassignBtn.disabled = !current;
  holdBtn.disabled = !current || current.conversationStatus.label === "已挂起";
  escalateBtn.disabled = !current || current.queue.includes("升级工单");
}

function renderActiveConversation() {
  const current = getActiveConversation();
  if (!current) {
    titleEl.textContent = "暂无会话";
    tagsEl.innerHTML = "";
    threadEl.innerHTML = "";
    replyEl.textContent = "当前没有可展示的建议回复。";
    confidenceEl.textContent = "--";
    decisionSummaryEl.innerHTML = "";
    decisionEl.innerHTML = "";
    productEl.innerHTML = "";
    if (contextKickerEl) contextKickerEl.textContent = "处理上下文";
    if (contextTitleEl) contextTitleEl.textContent = "暂无上下文";
    renderOpsSuggestions(null);
    renderTaskStrip(null);
    renderWorkflowActions(null);
    renderInternalNote(null);
    transferBtn.disabled = true;
    explainBtn.disabled = true;
    return;
  }

  const currentAction = current.mode === "manual"
    ? "转人工处理"
    : current.autoReplyAllowed
      ? "建议自动回复"
      : "暂不自动回复";

  titleEl.textContent = current.title;
  tagsEl.innerHTML = buildHeaderTags(current).map((tag) => `<span class="tag">${tag}</span>`).join("");
  replyEl.textContent = current.mode === "manual"
    ? "该会话当前已切换为人工处理，系统不再建议自动发送回复。"
    : current.suggestedReply;
  confidenceEl.textContent = `置信度 ${current.confidence}%`;

  const decisionSummaryItems = [
    ["处理队列", current.queue],
    ["会话优先级", getPriorityText(current.priority)],
    ["当前动作", currentAction]
  ];

  decisionSummaryEl.innerHTML = decisionSummaryItems.map(([label, value]) => `
    <div class="decision-stat">
      <span>${label}</span>
      <strong>${value}</strong>
    </div>
  `).join("");

  threadEl.innerHTML = `
    <section class="conversation-status-card">
      <div class="conversation-status-top">
        <div>
          <p class="composer-label">当前会话状态</p>
          <strong>${current.conversationStatus.label}</strong>
        </div>
        <span class="message-status ${getStatusClass(current.conversationStatus.tone)}">${current.conversationStatus.label}</span>
      </div>
      <p>${current.conversationStatus.detail}</p>
    </section>
    ${current.messages.map((msg) => `
      <article class="bubble ${msg.role}">
        <div class="thread-top">
          <strong>${msg.author}</strong>
          <div class="thread-meta-group">
            <span class="message-meta">${msg.time}</span>
            ${msg.status ? `<span class="message-status ${getStatusClass(msg.status.tone)}">${msg.status.label}</span>` : ""}
          </div>
        </div>
        ${renderMessageContent(msg)}
      </article>
    `).join("")}
  `;

  decisionEl.innerHTML = buildDecisions(current).map(([label, value]) => `
    <li>
      <span class="decision-label">${label}</span>
      <span class="decision-value">${value}</span>
    </li>
  `).join("");

  renderOpsSuggestions(current);
  renderTaskStrip(current);
  renderWorkflowActions(current);
  renderContextPanel(current);
  renderInternalNote(current);
  renderComposerAttachments();

  transferBtn.disabled = current.mode === "manual";
  explainBtn.disabled = false;
}

function renderFilters() {
  Array.from(filterRow.querySelectorAll(".filter-chip")).forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === currentFilter);
  });
}

function renderExplainModal() {
  const current = getActiveConversation();
  if (!current) return;

  modalOverviewEl.innerHTML = `
    <div class="overview-chip">
      <span>意图识别</span>
      <strong>${current.intent}</strong>
    </div>
    <div class="overview-chip">
      <span>置信度</span>
      <strong>${current.confidence}%</strong>
    </div>
    <div class="overview-chip">
      <span>优先级</span>
      <strong>${getPriorityText(current.priority)}</strong>
    </div>
    <div class="overview-chip">
      <span>最终动作</span>
      <strong>${current.mode === "manual" ? "人工处理" : current.autoReplyAllowed ? "自动回复" : "暂不自动回复"}</strong>
    </div>
  `;

  modalBodyEl.innerHTML = `
    <section class="explain-block tone-accent">
      <h4>一句话结论</h4>
      <p>${current.explain.summary}</p>
    </section>
    <section class="explain-block">
      <h4>判断信号</h4>
      <div class="explain-list">
        ${current.explain.signals.map((item) => `<div class="explain-item">${item}</div>`).join("")}
      </div>
    </section>
    <section class="explain-block">
      <h4>上下文依据</h4>
      <div class="explain-list">
        ${current.explain.context.map((item) => `<div class="explain-item">${item}</div>`).join("")}
      </div>
    </section>
    <section class="explain-block">
      <h4>建议动作</h4>
      <p>${current.explain.action}</p>
    </section>
  `;
}

function openExplainModal() {
  renderExplainModal();
  modalBackdropEl.classList.remove("hidden");
}

function closeExplainModal() {
  modalBackdropEl.classList.add("hidden");
}

function sendCustomMessage() {
  const current = getActiveConversation();
  if (!current) return;

  const text = messageInput.value.trim();

  if (!text && !pendingImage && !pendingVoice) {
    setFeedback("请输入回复内容，或添加图片 / 语音后再发送。");
    return;
  }

  const time = nowLabel();

  if (text) {
    current.messages.push({
      role: "assistant",
      type: "text",
      time,
      author: "客服",
      text,
      status: { label: "已发送", tone: "sent" }
    });
  }

  if (pendingImage) {
    current.messages.push({
      role: "assistant",
      type: "image",
      time,
      author: "客服",
      text: "补充一张商品图片，方便你确认细节。",
      imageUrl: pendingImage.url,
      imageName: pendingImage.name,
      status: { label: "已发送", tone: "sent" }
    });
  }

  if (pendingVoice) {
    current.messages.push({
      role: "assistant",
      type: "voice",
      time,
      author: "客服",
      text: "补充一条语音说明。",
      duration: pendingVoice.duration,
      status: { label: "已发送", tone: "sent" }
    });
  }

  current.sent = true;
  current.conversationStatus = {
    label: "已发送",
    tone: "sent",
    detail: "本轮回复已发送，等待用户下一步反馈。"
  };

  pendingImage = null;
  pendingVoice = null;
  messageInput.value = "";
  if (internalNoteInput) {
    current.internalNote = internalNoteInput.value.trim();
  }

  setFeedback("回复已模拟发送。当前会话状态、标签和右侧建议已同步更新。");
  globalStatusEl.textContent = "最近动作：一条会话已发送回复，当前队列保持稳定。";
  renderAll();
}

function insertSuggestedReply() {
  const current = getActiveConversation();
  if (!current) return;

  if (current.mode === "manual") {
    setFeedback("该会话已切换为人工处理，不再插入自动建议。");
    return;
  }

  messageInput.value = current.suggestedReply;
  messageInput.focus();
  setFeedback("已将 AI 建议插入输入框，你可以继续编辑后发送。");
}

function transferToManual() {
  const current = getActiveConversation();
  if (!current || current.mode === "manual") return;

  current.mode = "manual";
  current.autoReplyAllowed = false;
  current.owner = "售后人工组";
  current.assignee = "王琳 · 售后二线";
  current.queue = "人工复核队列";
  current.priority = "high";
  current.sla = "剩余 05 分钟";
  current.locked = "人工锁定";
  current.conversationStatus = {
    label: "人工处理中",
    tone: "manual",
    detail: "已切换到人工处理流程，后续不再自动发送 AI 回复。"
  };
  current.opsSuggestions = [
    {
      title: "先补处理时效",
      detail: "建议人工先告知用户预计处理时间，避免会话空窗导致情绪升级。"
    },
    {
      title: "核对订单与规则",
      detail: "转人工后优先确认订单状态、退款条件和平台规则，避免口径失误。"
    },
    {
      title: "保留站内沟通",
      detail: "后续仍建议在平台内完成解释与协商，不要迁移到站外。"
    }
  ];
  appendSystemMessage(current, "会话已切换为人工处理模式，后续不再自动发送 AI 回复。", "manual", "人工处理中");

  setFeedback("已转为人工处理。现在可以看到会话标签、决策卡和聊天区状态一起发生了变化。");
  globalStatusEl.textContent = "最近动作：一条会话已切换为人工处理。";
  renderAll();
}

function claimNextConversation() {
  const visible = getFilteredConversations();
  if (visible.length < 2) {
    setFeedback("当前队列里没有下一条可领取的会话。");
    return;
  }

  const currentIndex = visible.findIndex((item) => item.id === activeId);
  const nextIndex = currentIndex >= 0 ? (currentIndex + 1) % visible.length : 0;
  activeId = visible[nextIndex].id;
  pendingImage = null;
  pendingVoice = null;

  if (messageInput) {
    messageInput.value = "";
  }

  setFeedback("已领取下一条优先会话，列表仍按风险、SLA 和等待时长重新排序。");
  renderAll();
}

function reassignConversation() {
  const current = getActiveConversation();
  if (!current) return;

  current.mode = "manual";
  current.autoReplyAllowed = false;
  current.owner = "人工复核组";
  current.assignee = "值班组长 · 华东 B 组";
  current.queue = "人工复核队列";
  current.priority = "high";
  current.locked = "人工锁定";
  current.sla = "剩余 06 分钟";
  current.conversationStatus = {
    label: "已转派",
    tone: "manual",
    detail: "当前会话已转派到人工复核组，等待新负责人继续处理。"
  };

  appendSystemMessage(current, "会话已转派到人工复核组，后续需要人工继续跟进。", "manual", "已转派");
  setFeedback("已完成转派，当前负责人、队列和会话状态已同步更新。");
  renderAll();
}

function holdConversation() {
  const current = getActiveConversation();
  if (!current) return;

  current.conversationStatus = {
    label: "已挂起",
    tone: "pending",
    detail: "当前会话已暂时挂起，等待更多订单信息或人工复核结果。"
  };

  appendSystemMessage(current, "会话已挂起，待补充上下文或内部确认后继续处理。", "pending", "已挂起");
  setFeedback("会话已挂起，适合等待订单信息、补图或内部确认后再继续。");
  renderAll();
}

function escalateConversation() {
  const current = getActiveConversation();
  if (!current) return;

  current.mode = "manual";
  current.autoReplyAllowed = false;
  current.owner = "升级工单处理";
  current.assignee = "质检主管 · 高优先队列";
  current.queue = "升级工单队列";
  current.priority = "high";
  current.risk = "high";
  current.locked = "人工锁定";
  current.sla = "剩余 03 分钟";
  current.conversationStatus = {
    label: "升级处理中",
    tone: "manual",
    detail: "该会话已升级到高优先工单流，后续由质检或售后主管继续处理。"
  };
  current.opsSuggestions = [
    {
      title: "优先核对订单与规则",
      detail: "升级后先核对订单状态、退款条件和平台规则，避免给出超边界承诺。"
    },
    {
      title: "明确处理时限",
      detail: "向用户明确当前会话已进入升级处理，并同步预计反馈时间。"
    },
    {
      title: "保留站内闭环",
      detail: "涉及售后与风险场景时继续保持站内沟通，避免迁移到站外。"
    }
  ];

  appendSystemMessage(current, "会话已升级为高优先工单，后续由质检主管继续处理。", "manual", "升级处理中");
  setFeedback("已升级工单，当前会话进入高优先处理流，风险与 SLA 都会被优先关注。");
  renderAll();
}

function renderAll() {
  renderOperationsOverview();
  ensureActiveConversation();
  renderWorkspaceBanner();
  renderQueueTabs();
  renderQueueSummary();
  renderFilters();
  renderConversationList();
  renderActiveConversation();
}

filterRow.addEventListener("click", (event) => {
  const button = event.target.closest(".filter-chip");
  if (!button) return;
  currentFilter = button.dataset.filter || "all";
  renderAll();
});

if (queueTabs) {
  queueTabs.addEventListener("click", (event) => {
    const button = event.target.closest(".queue-tab");
    if (!button) return;
    currentQueue = button.dataset.queue || "all";
    renderAll();
  });
}

if (queueSearchInput) {
  queueSearchInput.addEventListener("input", (event) => {
    searchQuery = event.target.value.trim().toLowerCase();
    renderAll();
  });
}

if (quickPhrasesEl) {
  quickPhrasesEl.addEventListener("click", (event) => {
    const button = event.target.closest(".quick-phrase");
    if (!button || !messageInput) return;

    Array.from(quickPhrasesEl.querySelectorAll(".quick-phrase")).forEach((item) => {
      item.classList.toggle("active", item === button);
    });

    const phrase = button.dataset.phrase || "";
    messageInput.value = phrase;
    messageInput.focus();
    setFeedback("已插入常用话术，你可以继续编辑后发送。");
  });
}

if (internalNoteInput) {
  internalNoteInput.addEventListener("input", (event) => {
    const current = getActiveConversation();
    if (!current) return;
    current.internalNote = event.target.value;
  });
}

insertSuggestionBtn.addEventListener("click", () => {
  insertSuggestedReply();
});

transferBtn.addEventListener("click", () => {
  transferToManual();
});

if (claimNextBtn) {
  claimNextBtn.addEventListener("click", () => {
    claimNextConversation();
  });
}

if (reassignBtn) {
  reassignBtn.addEventListener("click", () => {
    reassignConversation();
  });
}

if (holdBtn) {
  holdBtn.addEventListener("click", () => {
    holdConversation();
  });
}

if (escalateBtn) {
  escalateBtn.addEventListener("click", () => {
    escalateConversation();
  });
}

uploadTriggerBtn.addEventListener("click", () => {
  imageInput.click();
});

imageInput.addEventListener("change", (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    pendingImage = {
      name: file.name,
      url: reader.result
    };
    renderComposerAttachments();
    setFeedback("已添加一张待发送图片。");
  };
  reader.readAsDataURL(file);
});

voiceTriggerBtn.addEventListener("click", () => {
  const samples = ["00:08", "00:12", "00:16"];
  const duration = samples[Math.floor(Math.random() * samples.length)];
  pendingVoice = { duration };
  renderComposerAttachments();
  setFeedback("已添加一条待发送语音卡片。");
});

manualSendBtn.addEventListener("click", () => {
  sendCustomMessage();
});

explainBtn.addEventListener("click", () => {
  openExplainModal();
});

closeModalBtn.addEventListener("click", () => {
  closeExplainModal();
});

modalBackdropEl.addEventListener("click", (event) => {
  if (event.target === modalBackdropEl) {
    closeExplainModal();
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeExplainModal();
  }
});

renderAll();
renderComposerAttachments();
setFeedback("当前会话工作台已就绪。你可以切换会话、发送建议回复，或查看这次判断背后的依据。");
