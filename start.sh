#!/bin/bash

echo "=== 实时虚拟人开放平台 - 快速启动 ==="
echo ""

# 检查DeepSeek API Key
if grep -q "your_deepseek_api_key_here" backend/.env; then
    echo "⚠️  请先配置DeepSeek API Key"
    echo "编辑 backend/.env 文件，填入你的API Key"
    exit 1
fi

echo "✅ 环境配置检查通过"
echo ""

# 启动后端
echo "🚀 启动后端服务..."
cd backend
python3 run.py &
BACKEND_PID=$!

echo "后端进程ID: $BACKEND_PID"
echo "API文档: http://localhost:8000/docs"
echo ""

# 等待后端启动
sleep 3

# 启动前端
echo "🚀 启动前端服务..."
cd ../frontend
npm run dev

# 清理
kill $BACKEND_PID
