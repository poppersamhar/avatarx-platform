# GitHub 部署指南

## 📦 推送到GitHub

### 1. 初始化Git仓库

```bash
cd /Users/samhar/x/实时虚拟人开放平台
git init
git add .
git commit -m "feat: 实时虚拟人开放平台 MVP

- 虚拟人创建与管理
- 知识库训练（RAG）
- 单Agent对话
- Multi-Agent团队协作
- 数据分析看板

技术栈：
- 前端：React + TypeScript + Tailwind CSS
- 后端：FastAPI + ChromaDB + DeepSeek API"
```

### 2. 创建GitHub仓库

1. 访问 https://github.com/new
2. 仓库名称: `virtual-human-platform` 或 `ai-avatar-platform`
3. 描述: "实时虚拟人开放平台 - Multi-Agent协作的AI虚拟人创建与交互平台"
4. 选择 Public（面试展示用）
5. 不要初始化README（我们已经有了）

### 3. 推送代码

```bash
git remote add origin https://github.com/YOUR_USERNAME/virtual-human-platform.git
git branch -M main
git push -u origin main
```

## 🚀 部署到Vercel（前端）

### 方式1：通过Vercel网站

1. 访问 https://vercel.com
2. 点击 "New Project"
3. 导入你的GitHub仓库
4. 配置：
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. 环境变量：
   - `VITE_API_URL`: 你的后端API地址（先部署后端）
6. 点击 "Deploy"

### 方式2：通过Vercel CLI

```bash
cd frontend
npm install -g vercel
vercel login
vercel --prod
```

## 🚀 部署到Railway（后端）

### 1. 准备Railway配置

创建 `railway.json`:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "cd backend && uvicorn app.main:app --host 0.0.0.0 --port $PORT",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### 2. 部署到Railway

1. 访问 https://railway.app
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的仓库
5. 配置环境变量：
   - `DEEPSEEK_API_KEY`: sk-f673372f9afe4a82a632d72de7097576
   - `DEEPSEEK_BASE_URL`: https://api.deepseek.com
   - `DATABASE_URL`: sqlite:///./data/app.db
   - `CHROMA_PERSIST_DIRECTORY`: ./data/chroma
6. 点击 "Deploy"

### 3. 获取后端URL

部署成功后，Railway会提供一个URL，例如：
`https://your-app.railway.app`

### 4. 更新前端环境变量

回到Vercel，更新环境变量：
- `VITE_API_URL`: `https://your-app.railway.app`

重新部署前端。

## 🔧 替代方案：Render（后端）

如果Railway有问题，可以用Render：

1. 访问 https://render.com
2. 点击 "New +" → "Web Service"
3. 连接GitHub仓库
4. 配置：
   - **Name**: virtual-human-api
   - **Root Directory**: `backend`
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. 环境变量：同Railway
6. 选择免费套餐
7. 点击 "Create Web Service"

## 📝 更新README

在GitHub仓库中添加徽章和演示链接：

```markdown
# 实时虚拟人开放平台

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/virtual-human-platform)

🔗 **在线演示**: https://your-app.vercel.app

AI驱动的虚拟人创建与交互平台，支持Multi-Agent团队协作。

## 特性

- 🤖 虚拟人创建与配置
- 📚 知识库训练（RAG）
- 💬 实时智能对话
- 👥 Multi-Agent团队协作
- 📊 数据分析看板
```

## 🎯 面试时展示

### 展示GitHub仓库

重点展示：
1. **代码结构**: 清晰的前后端分离
2. **Commit历史**: 规范的提交信息
3. **README**: 完整的项目说明
4. **文档**: 产品规划、开发指南

### 展示在线Demo

1. 打开Vercel部署的前端
2. 演示完整功能
3. 说明部署架构

### 技术亮点

- 全栈开发能力
- 现代化技术栈
- 可部署、可扩展
- 完整的工程实践

## ⚠️ 注意事项

### 安全

1. **不要提交敏感信息**:
   - `.env` 文件已在 `.gitignore` 中
   - API Key 通过环境变量配置

2. **数据持久化**:
   - Railway/Render 免费版重启会丢失数据
   - 生产环境需要使用云数据库

### 成本

- Vercel: 免费（个人项目）
- Railway: 免费额度 $5/月
- Render: 免费（有限制）
- DeepSeek API: 按调用量计费

### 性能

- 免费服务器可能较慢
- 冷启动需要等待
- 演示前提前访问预热

## 📞 问题排查

### 前端无法连接后端

1. 检查 `VITE_API_URL` 是否正确
2. 检查后端CORS配置
3. 查看浏览器控制台错误

### 后端启动失败

1. 检查环境变量是否配置
2. 查看Railway/Render日志
3. 确认依赖安装成功

### 数据库错误

1. 确认data目录可写
2. 检查SQLite路径
3. 查看ChromaDB配置

## ✅ 部署检查清单

- [ ] 代码推送到GitHub
- [ ] 后端部署成功
- [ ] 前端部署成功
- [ ] 环境变量配置正确
- [ ] API可以正常访问
- [ ] 前端可以调用后端
- [ ] 创建虚拟人功能正常
- [ ] 对话功能正常
- [ ] README更新完整

完成后，你就有了一个可以在线访问的完整项目！🎉
