# 后端服务

基于 FastAPI 的后端 API 服务。

## 安装

```bash
pip install -r requirements.txt
```

## 配置

复制 `.env.example` 为 `.env` 并填入你的配置：

```bash
cp .env.example .env
```

## 运行

```bash
python run.py
```

API 文档：http://localhost:8000/docs

## API 端点

- `POST /avatars/` - 创建虚拟人
- `GET /avatars/` - 获取虚拟人列表
- `POST /knowledge/{avatar_id}/upload` - 上传知识文档
- `POST /chat/` - 对话
- `GET /analytics/` - 数据统计
