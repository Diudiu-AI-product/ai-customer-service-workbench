# 配置与运行说明

## 1. 环境要求

- Python 3.8 及以上
- 可访问你所使用的大模型 API
- 可获取闲鱼网页端 Cookie

## 2. 安装依赖

```bash
pip install -r requirements.txt
```

## 3. 配置环境变量

将 [`.env.example`](../.env.example) 复制为 `.env`：

```bash
cp .env.example .env
```

需要重点填写的字段有：

### `API_KEY`

大模型服务的密钥。

### `COOKIES_STR`

闲鱼网页端的完整 Cookie 字符串。

### `MODEL_BASE_URL`

模型接口地址。当前默认值是兼容 OpenAI 格式的地址。

### `MODEL_NAME`

实际调用的模型名称，比如 `qwen-max`。

## 4. 如何获取 Cookie

可以在浏览器中登录闲鱼网页端后，按下面思路获取：

1. 打开开发者工具
2. 切到 `Network`
3. 刷新页面或点击任意请求
4. 在请求头中找到 Cookie
5. 复制完整字符串填入 `.env`

## 5. Prompt 文件说明

项目会优先读取正式 Prompt 文件：

- `prompts/classify_prompt.txt`
- `prompts/price_prompt.txt`
- `prompts/tech_prompt.txt`
- `prompts/default_prompt.txt`

如果这些文件不存在，代码会自动回退到 `*_example.txt`。

## 6. 本地启动

```bash
python main.py
```

## 7. Docker 启动

```bash
docker compose up -d
```

## 8. 运行后会生成什么

程序运行后会在本地生成 `data/` 目录，并创建 SQLite 数据库，用于保存：

- 聊天消息历史
- 商品信息缓存
- 议价轮次

## 9. 常见问题

### Cookie 失效怎么办

重新从网页端复制 Cookie，并更新 `.env` 中的 `COOKIES_STR`。

### 想换模型怎么办

修改 `.env` 中的：

- `MODEL_BASE_URL`
- `MODEL_NAME`
- `API_KEY`

### 想修改客服回复风格怎么办

直接调整 `prompts/` 目录下的提示词文件即可。
