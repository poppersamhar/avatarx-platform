from fastapi import APIRouter, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
import os
from openai import OpenAI
import json

router = APIRouter(prefix="/wizard-chat", tags=["wizard"])

class Message(BaseModel):
    role: str
    content: str

class WizardRequest(BaseModel):
    messages: List[Message]
    round: int

class WizardResponse(BaseModel):
    response: str
    completed: bool
    avatar_config: Optional[Dict] = None

@router.post("/", response_model=WizardResponse)
def wizard_chat(request: WizardRequest):
    client = OpenAI(
        api_key=os.getenv("DEEPSEEK_API_KEY"),
        base_url=os.getenv("DEEPSEEK_BASE_URL")
    )

    # 构建系统提示词
    system_prompt = f"""你是AvatarX需求分析师，通过3轮对话了解用户需求。当前第{request.round}轮。

对话策略：
- 第1轮：问虚拟人用途（客服/教育/咨询等）
- 第2轮：问专业领域和具体问题
- 第3轮：问性格特点和能力

规则：
1. 每轮只问1个简短问题
2. 用友好语气
3. 第3轮结束时输出JSON配置

第3轮输出格式：
总结需求后添加：
```json
{{"name":"虚拟人名称","template":"👨‍💼","voice":"专业男声","personality":"详细人设"}}
```

模板选择：客服→👨‍💼，教育→👨‍🎓，技术→👨‍💻，医疗→👨‍⚕️"""

    # 调用大模型
    messages = [{"role": "system", "content": system_prompt}]
    messages.extend([{"role": m.role, "content": m.content} for m in request.messages])

    response = client.chat.completions.create(
        model="deepseek-chat",
        messages=messages,
        temperature=0.7,
        max_tokens=300  # 减少token数量加快速度
    )

    ai_response = response.choices[0].message.content

    # 检查是否完成
    completed = False
    avatar_config = None

    if request.round >= 3:
        # 第3轮必须结束，提取或生成配置
        completed = True

        if "```json" in ai_response:
            # 提取JSON配置
            try:
                json_start = ai_response.find("```json") + 7
                json_end = ai_response.find("```", json_start)
                json_str = ai_response[json_start:json_end].strip()
                avatar_config = json.loads(json_str)
                # 移除JSON部分，只返回用户可见的文本
                ai_response = ai_response[:ai_response.find("```json")].strip()
            except:
                pass

        # 如果AI没有生成配置，使用默认配置
        if not avatar_config:
            # 从对话历史中提取信息生成配置
            conversation_text = " ".join([m.content for m in request.messages if m.role == "user"])
            avatar_config = {
                "name": "智能助手",
                "template": "👨‍💼",
                "voice": "专业男声",
                "personality": f"根据用户需求创建的专业虚拟人。{conversation_text[:100]}"
            }

    return {
        "response": ai_response,
        "completed": completed,
        "avatar_config": avatar_config
    }
