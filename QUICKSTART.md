# 快速开始指南

## 前置要求

- Python 3.11+
- Node.js 18+
- DeepSeek API Key

## 本地开发

### 1. 配置后端

```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
```

编辑 `.env` 文件，填入你的 DeepSeek API Key：
```
DEEPSEEK_API_KEY=sk-your-key-here
```

### 2. 启动后端

```bash
python run.py
```

访问 http://localhost:8000/docs 查看API文档

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

## 使用流程

1. **创建虚拟人**：选择形象、配置声音和人设
2. **上传知识**：上传PDF/TXT文档构建知识库
3. **单Agent对话**：与单个虚拟人对话测试
4. **创建团队**：组建Multi-Agent团队
5. **团队对话**：体验智能路由和协作

## Multi-Agent演示

创建一个客服团队：
- 虚拟人1：接待员（路由Agent）
- 虚拟人2：技术支持
- 虚拟人3：售后服务

用户提问时，接待员会自动判断问题类型并分配给合适的专家。

## 部署

详见 `docs/开发指南.md`
