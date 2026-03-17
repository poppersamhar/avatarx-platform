# AvatarX - 实时虚拟人开放平台

> AI驱动的智能虚拟人创建与Multi-Agent协作平台

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104-green.svg)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-blue.svg)](https://www.python.org/)

## 🌟 核心特性

### AI Native 交互
- **3轮对话创建** - AI引导式虚拟人创建，无需复杂表单
- **实时训练** - 边用边学，添加问答样本即时生效
- **智能对话** - 基于DeepSeek的自然语言交互

### Multi-Agent 协作
- **意图识别路由** - 自动分析用户问题，路由到最合适的Agent
- **团队管理** - 动态添加/移除成员，灵活调整路由策略
- **协作对话** - 多个专业Agent协同工作，处理复杂场景

### 知识库增强
- **文档上传** - 支持TXT、PDF、Word格式
- **向量化存储** - ChromaDB向量数据库
- **RAG检索** - 基于知识库的精准回答

### 完整管理
- **个人主页** - 统一管理所有Agents和Teams
- **配置管理** - 声音、人设、知识库配置
- **实时训练** - 添加/删除训练样本

## 🎯 应用场景

### 客服团队
```
接待Agent → 产品专家 → 技术支持 → 售后服务
```
自动识别用户问题类型，路由到对应专家

### 教育团队
```
讲师Agent → 助教Agent → 答疑Agent
```
根据问题难度和类型，智能分配

### 销售团队
```
顾问Agent → 产品专家 → 商务Agent
```
从咨询到成交的全流程协作

## 🏗️ 技术架构

### 前端技术栈
- **React 18** + TypeScript - 现代化UI框架
- **Vite** - 极速开发构建工具
- **React Router** - 单页应用路由
- **Apple风格设计** - 极简美观的用户界面

### 后端技术栈
- **FastAPI** - 高性能Python Web框架
- **SQLite** - 轻量级关系数据库
- **ChromaDB** - 向量数据库，支持语义搜索
- **DeepSeek API** - 强大的对话生成能力

### AI能力
- **意图识别** - 自动分析用户问题类型
- **智能路由** - 选择最合适的Agent回答
- **RAG增强** - 结合知识库的精准回答
- **实时学习** - 基于对话历史的持续优化

## 📦 项目结构

```
实时虚拟人开放平台/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── App.tsx          # 主应用组件
│   │   ├── main.tsx         # 入口文件
│   │   └── index.css        # 全局样式
│   ├── package.json
│   └── vite.config.ts
│
├── backend/                  # FastAPI后端服务
│   ├── app/
│   │   ├── main.py          # FastAPI应用入口
│   │   ├── models/          # 数据模型
│   │   │   └── database.py  # SQLAlchemy模型
│   │   └── routers/         # API路由
│   │       ├── avatar.py    # Agent管理
│   │       ├── team.py      # 团队管理
│   │       ├── team_chat.py # 团队对话
│   │       ├── chat.py      # 单Agent对话
│   │       ├── knowledge.py # 知识库管理
│   │       ├── training.py  # 实时训练
│   │       └── wizard.py    # AI引导创建
│   ├── requirements.txt
│   └── run.py
│
├── docs/                     # 文档
├── .gitignore
└── README.md
```

## 🚀 快速开始

### 环境要求
- Python 3.11+
- Node.js 18+
- DeepSeek API Key

### 1. 克隆项目
```bash
git clone https://github.com/yourusername/avatarx-platform.git
cd avatarx-platform
```

### 2. 后端启动

```bash
cd backend

# 安装依赖
pip install -r requirements.txt

# 配置环境变量
cp .env.example .env
# 编辑.env，填入你的DeepSeek API Key:
# DEEPSEEK_API_KEY=your_api_key_here
# DEEPSEEK_BASE_URL=https://api.deepseek.com

# 启动后端
python run.py
```

后端将运行在 http://localhost:8000

### 3. 前端启动

```bash
cd frontend

# 安装依赖
npm install

# 启动开发服务器
npm run dev
```

前端将运行在 http://localhost:5173

### 4. 访问应用

打开浏览器访问 http://localhost:5173，开始创建你的第一个虚拟人！

## 📖 使用指南

### 创建虚拟人
1. 访问首页，开始AI对话引导
2. 回答3个问题（用途、领域、特点）
3. AI自动生成虚拟人配置
4. 配置声音、上传知识库（可选）

### 实时训练
1. 进入Agent详情页
2. 点击"🎓 实时训练"标签
3. 添加问答样本
4. 训练数据即时生效

### 创建团队
1. 在个人主页点击"创建团队"
2. 选择至少2个成员
3. 指定路由Agent（负责意图识别）
4. 开始团队协作对话

### 团队管理
1. 进入Team详情页
2. 点击"👥 成员管理"标签
3. 添加/移除成员
4. 更换路由Agent

## 🎨 功能展示

### 1. AI对话创建
通过3轮自然对话，AI自动理解需求并生成虚拟人配置

### 2. 个人主页
统一管理所有Agents和Teams，卡片式展示

### 3. Agent详情页
- **对话标签** - 实时对话测试
- **实时训练标签** - 添加训练样本
- **配置标签** - 查看Agent信息

### 4. Team详情页
- **团队对话标签** - 多Agent协作对话，显示具体哪个Agent回复
- **成员管理标签** - 添加/移除成员，更换路由Agent

### 5. 实时训练
- 添加问答样本
- 查看训练历史（最多50条）
- 删除不需要的样本
- 训练数据即时生效

## 🔧 API文档

启动后端后访问 http://localhost:8000/docs 查看完整的API文档

### 主要API端点

#### Agent管理
- `POST /avatars/` - 创建Agent
- `GET /avatars/` - 获取所有Agents
- `GET /avatars/{id}` - 获取单个Agent
- `PUT /avatars/{id}` - 更新Agent
- `DELETE /avatars/{id}` - 删除Agent

#### 团队管理
- `POST /teams/` - 创建团队
- `GET /teams/` - 获取所有团队
- `DELETE /teams/{id}` - 删除团队
- `POST /teams/{id}/members` - 添加成员
- `DELETE /teams/{id}/members/{avatar_id}` - 移除成员
- `PUT /teams/{id}/router` - 更换路由Agent

#### 对话
- `POST /chat/` - 单Agent对话
- `POST /team-chat/` - 团队协作对话

#### 实时训练
- `POST /training/` - 添加训练样本
- `GET /training/{avatar_id}/history` - 获取训练历史
- `DELETE /training/{avatar_id}/history/{id}` - 删除训练样本

#### AI引导
- `POST /wizard-chat/` - AI引导对话

## 🌐 部署

### 前端部署（Vercel）
```bash
cd frontend
npm run build
# 推送到GitHub，在Vercel导入项目
```

### 后端部署（Railway/Render）
1. 推送代码到GitHub
2. 在平台上连接仓库
3. 设置环境变量（DEEPSEEK_API_KEY等）
4. 自动部署

## 🤝 贡献

欢迎提交Issue和Pull Request！

## 📄 License

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🙏 致谢

- [DeepSeek](https://www.deepseek.com/) - 提供强大的AI对话能力
- [FastAPI](https://fastapi.tiangolo.com/) - 高性能Web框架
- [React](https://reactjs.org/) - 现代化前端框架
- [ChromaDB](https://www.trychroma.com/) - 向量数据库

## 📧 联系方式

如有问题或建议，欢迎通过Issue联系我们。

---

⭐ 如果这个项目对你有帮助，请给个Star支持一下！
