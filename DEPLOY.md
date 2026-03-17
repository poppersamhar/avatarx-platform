# 部署指南

## 📋 准备工作

### 必需的账号
- GitHub账号
- DeepSeek API Key（https://platform.deepseek.com/）
- Vercel账号（前端部署，可选）
- Railway账号（后端部署，可选）

## 🚀 本地运行

### 1. 克隆项目
```bash
git clone https://github.com/YOUR_USERNAME/avatarx-platform.git
cd avatarx-platform
```

### 2. 后端配置
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 文件，填入你的 DeepSeek API Key
python run.py
```

### 3. 前端配置
```bash
cd frontend
npm install
npm run dev
```

### 4. 访问
- 前端：http://localhost:5173
- 后端API文档：http://localhost:8000/docs

## ☁️ 云端部署

### 前端部署（Vercel）

1. **登录Vercel**
   - 访问 https://vercel.com
   - 使用GitHub账号登录

2. **导入项目**
   - 点击 "New Project"
   - 选择你的GitHub仓库
   - 点击 "Import"

3. **配置构建**
   ```
   Framework Preset: Vite
   Root Directory: frontend
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm install
   ```

4. **部署**
   - 点击 "Deploy"
   - 等待构建完成
   - 获得部署URL（如：https://your-app.vercel.app）

5. **更新前端API地址**
   - 在 `frontend/src/App.tsx` 中
   - 将所有 `http://localhost:8000` 替换为你的后端URL
   - 提交并推送代码，Vercel会自动重新部署

### 后端部署（Railway）

1. **登录Railway**
   - 访问 https://railway.app
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 选择 "Deploy from GitHub repo"
   - 选择你的仓库

3. **配置环境变量**
   - 在项目设置中添加环境变量：
   ```
   DEEPSEEK_API_KEY=your_api_key_here
   DEEPSEEK_BASE_URL=https://api.deepseek.com
   CHROMA_PERSIST_DIRECTORY=/app/data/chroma
   DATABASE_URL=sqlite:////app/data/avatars.db
   ```

4. **配置启动命令**
   - Root Directory: `backend`
   - Start Command: `python run.py`
   - 或在 `backend` 目录创建 `Procfile`:
   ```
   web: cd backend && python run.py
   ```

5. **部署**
   - Railway会自动检测Python项目
   - 自动安装依赖并启动
   - 获得部署URL（如：https://your-app.railway.app）

6. **配置CORS**
   - 确保后端允许前端域名访问
   - 在 `backend/app/main.py` 中更新CORS配置：
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://your-frontend.vercel.app"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

### 后端部署（Render - 备选方案）

1. **登录Render**
   - 访问 https://render.com
   - 使用GitHub账号登录

2. **创建Web Service**
   - 点击 "New +"
   - 选择 "Web Service"
   - 连接GitHub仓库

3. **配置**
   ```
   Name: avatarx-backend
   Root Directory: backend
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: python run.py
   ```

4. **添加环境变量**
   - 同Railway配置

5. **部署**
   - 点击 "Create Web Service"
   - 等待部署完成

## 🔧 环境变量说明

### 后端必需环境变量
```bash
DEEPSEEK_API_KEY=sk-xxx          # DeepSeek API密钥
DEEPSEEK_BASE_URL=https://api.deepseek.com  # API地址
CHROMA_PERSIST_DIRECTORY=./data/chroma       # 向量数据库存储路径
DATABASE_URL=sqlite:///./data/avatars.db     # SQLite数据库路径
```

### 前端环境变量（可选）
```bash
VITE_API_URL=https://your-backend.railway.app  # 后端API地址
```

## 📝 部署检查清单

- [ ] GitHub仓库已创建并推送代码
- [ ] DeepSeek API Key已获取
- [ ] 后端已部署并可访问
- [ ] 前端已部署并可访问
- [ ] 前端API地址已更新为后端URL
- [ ] CORS配置正确
- [ ] 环境变量已正确设置
- [ ] 数据库和向量库目录已创建
- [ ] 测试创建虚拟人功能
- [ ] 测试对话功能
- [ ] 测试团队协作功能

## 🐛 常见问题

### 1. CORS错误
**问题**：前端无法访问后端API
**解决**：检查后端CORS配置，确保允许前端域名

### 2. API Key错误
**问题**：对话功能报错
**解决**：检查DeepSeek API Key是否正确设置

### 3. 数据库错误
**问题**：无法创建虚拟人
**解决**：确保数据库目录存在且有写入权限

### 4. 向量库错误
**问题**：知识库功能报错
**解决**：确保ChromaDB目录存在且有写入权限

### 5. 构建失败
**问题**：Vercel或Railway构建失败
**解决**：检查依赖版本，查看构建日志

## 📞 获取帮助

如遇到问题，请：
1. 查看项目README.md
2. 检查后端日志
3. 在GitHub提Issue

---

祝部署顺利！🎉
