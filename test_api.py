#!/usr/bin/env python3
"""
API测试脚本 - 验证所有端点
"""
import requests
import json

BASE_URL = "http://localhost:8000"

def test_health():
    print("🔍 测试健康检查...")
    r = requests.get(f"{BASE_URL}/health")
    print(f"✅ 健康检查: {r.json()}")

def test_create_avatar():
    print("\n🔍 测试创建虚拟人...")
    data = {
        "name": "小智客服",
        "template": "👨‍💼",
        "voice": "专业男声",
        "personality": "专业、耐心、善于解答问题"
    }
    r = requests.post(f"{BASE_URL}/avatars/", json=data)
    avatar = r.json()
    print(f"✅ 创建虚拟人: {avatar['name']} (ID: {avatar['id']})")
    return avatar['id']

def test_list_avatars():
    print("\n🔍 测试获取虚拟人列表...")
    r = requests.get(f"{BASE_URL}/avatars/")
    avatars = r.json()
    print(f"✅ 虚拟人列表: {len(avatars)} 个")
    return avatars

def test_chat(avatar_id):
    print(f"\n🔍 测试对话 (Avatar ID: {avatar_id})...")
    data = {
        "avatar_id": avatar_id,
        "message": "你好，请介绍一下你自己"
    }
    r = requests.post(f"{BASE_URL}/chat/", json=data)
    response = r.json()
    print(f"✅ 对话响应: {response['response'][:50]}...")

def test_analytics():
    print("\n🔍 测试数据分析...")
    r = requests.get(f"{BASE_URL}/analytics/")
    data = r.json()
    print(f"✅ 数据统计: {data}")

if __name__ == "__main__":
    print("=" * 50)
    print("实时虚拟人开放平台 - API测试")
    print("=" * 50)

    try:
        test_health()
        avatar_id = test_create_avatar()
        test_list_avatars()
        test_chat(avatar_id)
        test_analytics()

        print("\n" + "=" * 50)
        print("✅ 所有测试通过！")
        print("=" * 50)
    except Exception as e:
        print(f"\n❌ 测试失败: {e}")
