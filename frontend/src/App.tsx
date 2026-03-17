import { BrowserRouter, Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';

// API base URL - use relative path for Vercel deployment
const API_BASE = '/api';

// AI对话引导页面
function AIWizardPage() {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<{role: string, content: string}[]>([
    { role: 'assistant', content: '你好！我会通过3个问题帮你快速创建专属虚拟人。\n\n你想让虚拟人做什么？（比如客服、教育、咨询等）' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [round, setRound] = useState(1);
  const [creating, setCreating] = useState(false);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch(`${API_BASE}/wizard-chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg],
          round: round
        })
      });

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);

      if (data.completed) {
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '✨ 完美！正在创建你的专属虚拟人...'
        }]);
        setCreating(true);
        createAvatarFromAI(data.avatar_config);
      } else {
        setRound(round + 1);
      }
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，出现了错误。请重试。' }]);
    } finally {
      setLoading(false);
    }
  };

  const createAvatarFromAI = async (config: any) => {
    try {
      const response = await fetch(`${API_BASE}/avatars/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      if (response.ok) {
        const avatar = await response.json();
        navigate(`/agent/${avatar.id}/setup`);
      }
    } catch (error) {
      alert('创建失败，请重试');
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ maxWidth: '800px', width: '100%' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ fontSize: '48px', fontWeight: '700', fontStyle: 'italic', color: '#007AFF', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>a</div>
          <div style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f' }}>AvatarX</div>
          <div style={{ fontSize: '14px', color: '#86868b', marginTop: '8px' }}>AI驱动的智能虚拟人创建</div>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', minHeight: '500px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px', padding: '12px', background: '#f0f9ff', borderRadius: '12px' }}>
            <span style={{ fontSize: '14px', color: '#007AFF', fontWeight: '500' }}>
              {creating ? '🚀 创建中...' : round <= 3 ? `第 ${round}/3 轮对话` : '正在为你创建虚拟人...'}
            </span>
          </div>

          <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ marginBottom: '20px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '16px 20px',
                  borderRadius: '16px',
                  background: msg.role === 'user' ? '#007AFF' : '#f5f5f7',
                  color: msg.role === 'user' ? 'white' : '#1d1d1f',
                  fontSize: '15px',
                  lineHeight: '1.6',
                  whiteSpace: 'pre-wrap'
                }}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: '20px' }}>
                <div style={{ padding: '16px 20px', borderRadius: '16px', background: '#f5f5f7' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                    <span style={{ marginLeft: '8px', fontSize: '13px', color: '#86868b' }}>AI思考中...</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {round <= 3 && (
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="输入你的回答..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: '15px',
                  border: '2px solid #d1d1d6',
                  borderRadius: '12px',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#007AFF'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d1d6'}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: '14px 28px',
                  background: loading || !input.trim() ? '#d1d1d6' : '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                发送
              </button>
            </div>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              background: 'none',
              border: 'none',
              color: '#86868b',
              fontSize: '14px',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            跳过引导，进入个人主页
          </button>
        </div>
      </div>
    </div>
  );
}

// 个人主页 - 展示所有agents和teams
function HomePage() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/avatars/`).then(r => r.json()),
      fetch(`${API_BASE}/teams/`).then(r => r.json())
    ]).then(([agentsData, teamsData]) => {
      setAgents(agentsData);
      setTeams(teamsData);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#86868b' }}>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', padding: '48px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '48px', textAlign: 'center' }}>
          <div style={{ fontSize: '48px', fontWeight: '700', fontStyle: 'italic', color: '#007AFF', fontFamily: 'Georgia, serif', marginBottom: '8px' }}>a</div>
          <h1 style={{ fontSize: '36px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>AvatarX</h1>
          <p style={{ fontSize: '16px', color: '#86868b' }}>我的虚拟人平台</p>
        </div>

        {/* Create Button */}
        <div style={{ marginBottom: '32px', textAlign: 'center' }}>
          <button
            onClick={() => navigate('/')}
            style={{
              padding: '14px 32px',
              background: '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + 创建新虚拟人
          </button>
        </div>

        {/* Agents Section */}
        <div style={{ marginBottom: '48px' }}>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f', marginBottom: '24px' }}>我的虚拟人 ({agents.length})</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
            {agents.map(agent => (
              <div
                key={agent.id}
                onClick={() => navigate(`/agent/${agent.id}`)}
                style={{
                  background: 'white',
                  borderRadius: '16px',
                  padding: '24px',
                  cursor: 'pointer',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                }}
              >
                <div style={{ fontSize: '48px', marginBottom: '12px', textAlign: 'center' }}>{agent.template}</div>
                <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px', textAlign: 'center' }}>{agent.name}</h3>
                <p style={{ fontSize: '14px', color: '#86868b', lineHeight: '1.5', textAlign: 'center' }}>
                  {agent.personality.length > 60 ? agent.personality.substring(0, 60) + '...' : agent.personality}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Teams Section */}
        <div>
          <h2 style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f', marginBottom: '24px' }}>我的团队 ({teams.length})</h2>
          {teams.length === 0 ? (
            <div style={{ background: 'white', borderRadius: '16px', padding: '48px', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <p style={{ fontSize: '16px', color: '#86868b', marginBottom: '24px' }}>还没有创建团队</p>
              <button
                onClick={() => navigate('/team/create')}
                style={{
                  padding: '12px 24px',
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                创建第一个团队
              </button>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' }}>
              {teams.map(team => (
                <div
                  key={team.id}
                  onClick={() => navigate(`/team/${team.id}`)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    padding: '24px',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(0,0,0,0.06)',
                    transition: 'transform 0.2s, box-shadow 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  }}
                >
                  <div style={{ fontSize: '36px', marginBottom: '12px' }}>👥</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>{team.name}</h3>
                  <p style={{ fontSize: '14px', color: '#86868b', marginBottom: '12px' }}>
                    {team.description?.substring(0, 60) || '多Agent协作团队'}
                  </p>
                  <div style={{ fontSize: '13px', color: '#007AFF' }}>
                    {team.avatar_ids?.length || 0} 个成员
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Agent配置向导页面
function AgentSetup() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState<'voice' | 'knowledge' | 'team'>('voice');
  const [selectedVoice, setSelectedVoice] = useState('专业男声');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/avatars/`)
      .then(r => r.json())
      .then(data => {
        const found = data.find((a: any) => a.id.toString() === id);
        setAgent(found);
      });
  }, [id]);

  if (!agent) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#86868b' }}>加载中...</p>
      </div>
    );
  }

  const voices = [
    { id: '专业男声', label: '专业男声', desc: '沉稳、可靠' },
    { id: '专业女声', label: '专业女声', desc: '温和、亲切' },
    { id: '活力男声', label: '活力男声', desc: '年轻、有活力' },
    { id: '温柔女声', label: '温柔女声', desc: '柔和、舒适' }
  ];

  const handleKnowledgeUpload = async () => {
    if (!file) return;
    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      await fetch(`${API_BASE}/knowledge/${agent.id}/upload`, {
        method: 'POST',
        body: formData
      });
      setTimeout(() => setCurrentStep('team'), 1000);
    } catch (error) {
      alert('上传失败');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px' }}>
      <div style={{ maxWidth: '600px', width: '100%' }}>
        {currentStep === 'voice' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎤</div>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>选择声音类型</h2>
              <p style={{ fontSize: '15px', color: '#86868b' }}>为 {agent.name} 选择合适的声音</p>
            </div>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                {voices.map(voice => (
                  <div
                    key={voice.id}
                    onClick={() => setSelectedVoice(voice.id)}
                    style={{
                      padding: '20px',
                      border: selectedVoice === voice.id ? '2px solid #007AFF' : '1px solid #d1d1d6',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      background: selectedVoice === voice.id ? '#f0f9ff' : 'white'
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '4px', color: '#1d1d1f' }}>{voice.label}</div>
                    <div style={{ fontSize: '13px', color: '#86868b' }}>{voice.desc}</div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => navigate('/home')}
                  style={{
                    padding: '14px 24px',
                    background: 'white',
                    color: '#86868b',
                    border: '1px solid #d1d1d6',
                    borderRadius: '12px',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  跳过
                </button>
                <button
                  onClick={() => setCurrentStep('knowledge')}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: '#007AFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  下一步 →
                </button>
              </div>
            </div>
          </>
        )}

        {currentStep === 'knowledge' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>上传专业知识</h2>
              <p style={{ fontSize: '15px', color: '#86868b' }}>让 {agent.name} 学习专业知识</p>
            </div>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
              <div style={{ marginBottom: '24px' }}>
                <input
                  type="file"
                  accept=".txt,.pdf,.doc,.docx"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '2px dashed #d1d1d6',
                    borderRadius: '12px',
                    cursor: 'pointer'
                  }}
                />
                {file && (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#f0f9ff', borderRadius: '8px', fontSize: '14px', color: '#007AFF' }}>
                    ✓ 已选择: {file.name}
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', gap: '12px' }}>
                <button
                  onClick={() => setCurrentStep('team')}
                  style={{
                    padding: '14px 24px',
                    background: 'white',
                    color: '#86868b',
                    border: '1px solid #d1d1d6',
                    borderRadius: '12px',
                    fontSize: '15px',
                    cursor: 'pointer'
                  }}
                >
                  跳过
                </button>
                <button
                  onClick={handleKnowledgeUpload}
                  disabled={!file || uploading}
                  style={{
                    flex: 1,
                    padding: '14px 24px',
                    background: !file || uploading ? '#d1d1d6' : '#007AFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: !file || uploading ? 'not-allowed' : 'pointer'
                  }}
                >
                  {uploading ? '上传中...' : '上传并继续 →'}
                </button>
              </div>
            </div>
          </>
        )}

        {currentStep === 'team' && (
          <>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
              <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1d1d1f', marginBottom: '8px' }}>配置完成！</h2>
              <p style={{ fontSize: '15px', color: '#86868b' }}>你可以开始使用 {agent.name} 了</p>
            </div>
            <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)', textAlign: 'center' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{agent.template}</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', marginBottom: '24px' }}>{agent.name}</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <button
                  onClick={() => navigate(`/agent/${agent.id}`)}
                  style={{
                    padding: '14px 24px',
                    background: '#007AFF',
                    color: 'white',
                    border: 'none',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  开始对话
                </button>
                <button
                  onClick={() => navigate('/home')}
                  style={{
                    padding: '14px 24px',
                    background: 'white',
                    color: '#007AFF',
                    border: '2px solid #007AFF',
                    borderRadius: '12px',
                    fontSize: '15px',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                >
                  返回主页
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// Agent详情页 - 对话和配置
function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'chat' | 'config' | 'training'>('chat');

  // 训练相关状态
  const [trainingQuestion, setTrainingQuestion] = useState('');
  const [trainingAnswer, setTrainingAnswer] = useState('');
  const [trainingHistory, setTrainingHistory] = useState<any[]>([]);
  const [trainingLoading, setTrainingLoading] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/avatars/`)
      .then(r => r.json())
      .then(data => {
        const found = data.find((a: any) => a.id.toString() === id);
        setAgent(found);
        if (found) {
          setMessages([{
            role: 'assistant',
            content: `你好！我是${found.name}。${found.personality}\n\n有什么我可以帮助你的吗？`
          }]);
          loadTrainingHistory(found.id);
        }
      });
  }, [id]);

  const loadTrainingHistory = async (agentId: number) => {
    try {
      const response = await fetch(`${API_BASE}/training/${agentId}/history`);
      const data = await response.json();
      setTrainingHistory(data);
    } catch (error) {
      console.error('Failed to load training history');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading || !agent) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_id: agent.id, message: userMsg.content })
      });
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，出现了错误。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm(`确定要删除 ${agent.name} 吗？此操作不可恢复。`)) return;
    try {
      await fetch(`${API_BASE}/avatars/${agent.id}`, { method: 'DELETE' });
      navigate('/home');
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleAddTraining = async () => {
    if (!trainingQuestion.trim() || !trainingAnswer.trim()) {
      alert('请填写问题和答案');
      return;
    }
    setTrainingLoading(true);
    try {
      await fetch(`${API_BASE}/training/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          avatar_id: agent.id,
          examples: [{ question: trainingQuestion, answer: trainingAnswer }]
        })
      });
      setTrainingQuestion('');
      setTrainingAnswer('');
      loadTrainingHistory(agent.id);
      alert('训练样本添加成功！');
    } catch (error) {
      alert('添加失败');
    } finally {
      setTrainingLoading(false);
    }
  };

  const handleDeleteTraining = async (trainingId: number) => {
    if (!confirm('确定要删除这条训练样本吗？')) return;
    try {
      await fetch(`${API_BASE}/training/${agent.id}/history/${trainingId}`, {
        method: 'DELETE'
      });
      loadTrainingHistory(agent.id);
    } catch (error) {
      alert('删除失败');
    }
  };

  if (!agent) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#86868b' }}>加载中...</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', padding: '48px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #d1d1d6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← 返回主页
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f' }}>{agent.template} {agent.name}</div>
            <div style={{ fontSize: '14px', color: '#86868b' }}>{agent.personality.substring(0, 80)}...</div>
          </div>
          <button
            onClick={handleDelete}
            style={{
              padding: '8px 16px',
              background: '#ff3b30',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🗑️ 删除
          </button>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setTab('chat')}
            style={{
              padding: '12px 24px',
              background: tab === 'chat' ? '#007AFF' : 'white',
              color: tab === 'chat' ? 'white' : '#1d1d1f',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            💬 对话
          </button>
          <button
            onClick={() => setTab('training')}
            style={{
              padding: '12px 24px',
              background: tab === 'training' ? '#007AFF' : 'white',
              color: tab === 'training' ? 'white' : '#1d1d1f',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🎓 实时训练
          </button>
          <button
            onClick={() => setTab('config')}
            style={{
              padding: '12px 24px',
              background: tab === 'config' ? '#007AFF' : 'white',
              color: tab === 'config' ? 'white' : '#1d1d1f',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            ⚙️ 配置
          </button>
        </div>

        {/* Content */}
        {tab === 'chat' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', minHeight: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '20px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: msg.role === 'user' ? '#007AFF' : '#f5f5f7',
                    color: msg.role === 'user' ? 'white' : '#1d1d1f',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '16px 20px', borderRadius: '16px', background: '#f5f5f7' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="输入消息..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: '15px',
                  border: '2px solid #d1d1d6',
                  borderRadius: '12px',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#007AFF'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d1d6'}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: '14px 28px',
                  background: loading || !input.trim() ? '#d1d1d6' : '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                发送
              </button>
            </div>
          </div>
        )}

        {tab === 'training' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', marginBottom: '16px' }}>实时训练虚拟人</h3>
            <p style={{ fontSize: '14px', color: '#86868b', marginBottom: '24px' }}>
              添加问答样本，让虚拟人学习你的专业知识和回答风格
            </p>

            {/* 添加训练样本 */}
            <div style={{ marginBottom: '32px', padding: '20px', background: '#f5f5f7', borderRadius: '12px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f', marginBottom: '16px' }}>添加新样本</h4>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1d1d1f', fontSize: '14px' }}>问题</label>
                <input
                  type="text"
                  value={trainingQuestion}
                  onChange={(e) => setTrainingQuestion(e.target.value)}
                  placeholder="例如：如何使用这个产品？"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d1d6',
                    borderRadius: '8px',
                    fontSize: '15px'
                  }}
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1d1d1f', fontSize: '14px' }}>答案</label>
                <textarea
                  value={trainingAnswer}
                  onChange={(e) => setTrainingAnswer(e.target.value)}
                  placeholder="输入标准答案..."
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d1d6',
                    borderRadius: '8px',
                    fontSize: '15px',
                    resize: 'none'
                  }}
                />
              </div>
              <button
                onClick={handleAddTraining}
                disabled={trainingLoading || !trainingQuestion.trim() || !trainingAnswer.trim()}
                style={{
                  padding: '12px 24px',
                  background: (trainingLoading || !trainingQuestion.trim() || !trainingAnswer.trim()) ? '#d1d1d6' : '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: (trainingLoading || !trainingQuestion.trim() || !trainingAnswer.trim()) ? 'not-allowed' : 'pointer'
                }}
              >
                {trainingLoading ? '添加中...' : '+ 添加训练样本'}
              </button>
            </div>

            {/* 训练历史 */}
            <div>
              <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f', marginBottom: '16px' }}>
                训练历史 ({trainingHistory.length} 条)
              </h4>
              {trainingHistory.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#86868b' }}>
                  还没有训练样本，添加第一条吧！
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '400px', overflowY: 'auto' }}>
                  {trainingHistory.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        padding: '16px',
                        border: '1px solid #d1d1d6',
                        borderRadius: '12px',
                        background: 'white'
                      }}
                    >
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>问题：</div>
                        <div style={{ fontSize: '14px', color: '#1d1d1f', fontWeight: '500' }}>{item.question}</div>
                      </div>
                      <div style={{ marginBottom: '12px' }}>
                        <div style={{ fontSize: '12px', color: '#86868b', marginBottom: '4px' }}>答案：</div>
                        <div style={{ fontSize: '14px', color: '#1d1d1f' }}>{item.answer}</div>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div style={{ fontSize: '12px', color: '#86868b' }}>
                          {new Date(item.timestamp).toLocaleString('zh-CN')}
                        </div>
                        <button
                          onClick={() => handleDeleteTraining(item.id)}
                          style={{
                            padding: '6px 12px',
                            background: '#ff3b30',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          删除
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'config' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f', marginBottom: '24px' }}>Agent配置</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1d1d1f' }}>名称</label>
                <input
                  type="text"
                  value={agent.name}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d1d6',
                    borderRadius: '8px',
                    fontSize: '15px',
                    background: '#f5f5f7'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1d1d1f' }}>人设</label>
                <textarea
                  value={agent.personality}
                  readOnly
                  rows={4}
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d1d6',
                    borderRadius: '8px',
                    fontSize: '15px',
                    background: '#f5f5f7',
                    resize: 'none'
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1d1d1f' }}>声音</label>
                <input
                  type="text"
                  value={agent.voice}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: '1px solid #d1d1d6',
                    borderRadius: '8px',
                    fontSize: '15px',
                    background: '#f5f5f7'
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Team详情页 - 多agent协作对话
function TeamDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(null);
  const [agents, setAgents] = useState<any[]>([]);
  const [messages, setMessages] = useState<{role: string, content: string, agent?: string}[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState<'chat' | 'members'>('chat');

  useEffect(() => {
    Promise.all([
      fetch(`${API_BASE}/teams/`).then(r => r.json()),
      fetch(`${API_BASE}/avatars/`).then(r => r.json())
    ]).then(([teamsData, agentsData]) => {
      const found = teamsData.find((t: any) => t.id.toString() === id);
      setTeam(found);
      setAgents(agentsData);
      if (found) {
        setMessages([{
          role: 'assistant',
          content: `你好！我是${found.name}团队。我们有${found.avatar_ids?.length || 0}位专家，可以协作为你服务。\n\n有什么我可以帮助你的吗？`
        }]);
      }
    });
  }, [id]);

  const handleSend = async () => {
    if (!input.trim() || loading || !team) return;
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/team-chat/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: team.id, message: userMsg.content })
      });
      const data = await response.json();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.response,
        agent: data.avatar_name
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: '抱歉，出现了错误。' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTeam = async () => {
    if (!confirm(`确定要删除团队 ${team.name} 吗？此操作不可恢复。`)) return;
    try {
      await fetch(`${API_BASE}/teams/${team.id}`, { method: 'DELETE' });
      navigate('/home');
    } catch (error) {
      alert('删除失败');
    }
  };

  const handleAddMember = async (avatarId: number) => {
    try {
      const response = await fetch(`${API_BASE}/teams/${team.id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_id: avatarId })
      });
      if (response.ok) {
        const updatedTeam = await response.json();
        setTeam(updatedTeam);
        alert('成员添加成功！');
      } else {
        const error = await response.json();
        alert(error.detail || '添加失败');
      }
    } catch (error) {
      alert('添加失败');
    }
  };

  const handleRemoveMember = async (avatarId: number) => {
    if (!confirm('确定要移除这个成员吗？')) return;
    try {
      const response = await fetch(`${API_BASE}/teams/${team.id}/members/${avatarId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        const updatedTeam = await response.json();
        setTeam(updatedTeam);
        alert('成员移除成功！');
      } else {
        const error = await response.json();
        alert(error.detail || '移除失败');
      }
    } catch (error) {
      alert('移除失败');
    }
  };

  const handleChangeRouter = async (avatarId: number) => {
    if (!confirm('确定要更换路由Agent吗？')) return;
    try {
      const response = await fetch(`${API_BASE}/teams/${team.id}/router`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ avatar_id: avatarId })
      });
      if (response.ok) {
        const updatedTeam = await response.json();
        setTeam(updatedTeam);
        alert('路由Agent更换成功！');
      } else {
        const error = await response.json();
        alert(error.detail || '更换失败');
      }
    } catch (error) {
      alert('更换失败');
    }
  };

  if (!team) {
    return (
      <div style={{ padding: '80px 48px', textAlign: 'center', minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
        <p style={{ fontSize: '18px', color: '#86868b' }}>加载中...</p>
      </div>
    );
  }

  const teamMembers = agents.filter(a => team.avatar_ids?.includes(a.id));

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', padding: '48px' }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #d1d1d6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← 返回主页
          </button>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '24px', fontWeight: '600', color: '#1d1d1f' }}>👥 {team.name}</div>
            <div style={{ fontSize: '14px', color: '#86868b' }}>{team.description || '多Agent协作团队'} • {teamMembers.length} 个成员</div>
          </div>
          <button
            onClick={handleDeleteTeam}
            style={{
              padding: '8px 16px',
              background: '#ff3b30',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '600'
            }}
          >
            🗑️ 删除团队
          </button>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: '24px', display: 'flex', gap: '12px' }}>
          <button
            onClick={() => setTab('chat')}
            style={{
              padding: '12px 24px',
              background: tab === 'chat' ? '#007AFF' : 'white',
              color: tab === 'chat' ? 'white' : '#1d1d1f',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            💬 团队对话
          </button>
          <button
            onClick={() => setTab('members')}
            style={{
              padding: '12px 24px',
              background: tab === 'members' ? '#007AFF' : 'white',
              color: tab === 'members' ? 'white' : '#1d1d1f',
              border: 'none',
              borderRadius: '12px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            👥 成员管理
          </button>
        </div>

        {/* Content */}
        {tab === 'chat' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', minHeight: '500px', display: 'flex', flexDirection: 'column', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: '24px' }}>
              {messages.map((msg, i) => (
                <div key={i} style={{ marginBottom: '20px', display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                  <div style={{
                    maxWidth: '80%',
                    padding: '16px 20px',
                    borderRadius: '16px',
                    background: msg.role === 'user' ? '#007AFF' : '#f5f5f7',
                    color: msg.role === 'user' ? 'white' : '#1d1d1f',
                    fontSize: '15px',
                    lineHeight: '1.6',
                    whiteSpace: 'pre-wrap'
                  }}>
                    {msg.agent && (
                      <div style={{ fontSize: '12px', color: '#007AFF', marginBottom: '8px', fontWeight: '600' }}>
                        {msg.agent} 回复：
                      </div>
                    )}
                    {msg.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                  <div style={{ padding: '16px 20px', borderRadius: '16px', background: '#f5f5f7' }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite 0.2s' }}></div>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#86868b', animation: 'pulse 1.5s infinite 0.4s' }}></div>
                      <span style={{ marginLeft: '8px', fontSize: '13px', color: '#86868b' }}>团队分析中...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: '12px' }}>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
                placeholder="输入消息，团队会自动分配最合适的Agent回复..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '14px 18px',
                  fontSize: '15px',
                  border: '2px solid #d1d1d6',
                  borderRadius: '12px',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#007AFF'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#d1d1d6'}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                style={{
                  padding: '14px 28px',
                  background: loading || !input.trim() ? '#d1d1d6' : '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '15px',
                  fontWeight: '600',
                  cursor: loading || !input.trim() ? 'not-allowed' : 'pointer'
                }}
              >
                发送
              </button>
            </div>
          </div>
        )}

        {tab === 'members' && (
          <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#1d1d1f' }}>团队成员 ({teamMembers.length})</h3>
              <button
                onClick={() => {
                  const availableAgents = agents.filter(a => !team.avatar_ids?.includes(a.id));
                  if (availableAgents.length === 0) {
                    alert('没有可添加的成员了');
                    return;
                  }
                  const agentId = prompt(`可添加的成员：\n${availableAgents.map(a => `${a.id}: ${a.name}`).join('\n')}\n\n请输入要添加的成员ID：`);
                  if (agentId) {
                    handleAddMember(parseInt(agentId));
                  }
                }}
                style={{
                  padding: '10px 20px',
                  background: '#007AFF',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}
              >
                + 添加成员
              </button>
            </div>

            <div style={{ marginBottom: '24px', padding: '16px', background: '#f0f9ff', borderRadius: '12px' }}>
              <div style={{ fontSize: '14px', color: '#007AFF', fontWeight: '600', marginBottom: '8px' }}>
                🎯 当前路由Agent: {agents.find(a => a.id === team.router_avatar_id)?.name || '未知'}
              </div>
              <div style={{ fontSize: '13px', color: '#86868b' }}>
                路由Agent负责分析用户意图并分配给最合适的成员回答
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px' }}>
              {teamMembers.map(agent => (
                <div
                  key={agent.id}
                  style={{
                    padding: '20px',
                    border: agent.id === team.router_avatar_id ? '2px solid #007AFF' : '1px solid #d1d1d6',
                    borderRadius: '12px',
                    background: agent.id === team.router_avatar_id ? '#f0f9ff' : 'white',
                    position: 'relative'
                  }}
                >
                  {agent.id === team.router_avatar_id && (
                    <div style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      padding: '4px 8px',
                      background: '#007AFF',
                      color: 'white',
                      borderRadius: '6px',
                      fontSize: '11px',
                      fontWeight: '600'
                    }}>
                      路由
                    </div>
                  )}
                  <div
                    onClick={() => navigate(`/agent/${agent.id}`)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div style={{ fontSize: '36px', marginBottom: '8px', textAlign: 'center' }}>{agent.template}</div>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#1d1d1f', marginBottom: '4px', textAlign: 'center' }}>{agent.name}</h4>
                    <p style={{ fontSize: '13px', color: '#86868b', textAlign: 'center', marginBottom: '12px' }}>
                      {agent.personality.substring(0, 50)}...
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {agent.id !== team.router_avatar_id && (
                      <button
                        onClick={() => handleChangeRouter(agent.id)}
                        style={{
                          padding: '6px 12px',
                          background: 'white',
                          color: '#007AFF',
                          border: '1px solid #007AFF',
                          borderRadius: '6px',
                          fontSize: '12px',
                          cursor: 'pointer',
                          fontWeight: '600'
                        }}
                      >
                        设为路由
                      </button>
                    )}
                    <button
                      onClick={() => handleRemoveMember(agent.id)}
                      style={{
                        padding: '6px 12px',
                        background: '#ff3b30',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        cursor: 'pointer',
                        fontWeight: '600'
                      }}
                    >
                      移除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// 创建团队页面
function CreateTeam() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<number[]>([]);
  const [routerAgentId, setRouterAgentId] = useState<number | null>(null);

  useEffect(() => {
    fetch('http://localhost:8000/avatars/')
      .then(r => r.json())
      .then(data => setAgents(data));
  }, []);

  const handleCreate = async () => {
    if (!teamName || selectedAgents.length < 2 || !routerAgentId) {
      alert('请填写团队名称，选择至少2个成员，并指定路由Agent');
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/teams/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: teamName,
          description: description,
          avatar_ids: selectedAgents,
          router_avatar_id: routerAgentId
        })
      });
      if (response.ok) {
        const team = await response.json();
        navigate(`/team/${team.id}`);
      }
    } catch (error) {
      alert('创建失败');
    }
  };

  const toggleAgent = (id: number) => {
    if (selectedAgents.includes(id)) {
      setSelectedAgents(selectedAgents.filter(a => a !== id));
      if (routerAgentId === id) setRouterAgentId(null);
    } else {
      setSelectedAgents([...selectedAgents, id]);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #ddd6fe 100%)', padding: '48px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        <div style={{ marginBottom: '24px' }}>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '8px 16px',
              background: 'white',
              border: '1px solid #d1d1d6',
              borderRadius: '8px',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            ← 返回主页
          </button>
        </div>

        <div style={{ background: 'white', borderRadius: '24px', padding: '32px', boxShadow: '0 8px 32px rgba(0,0,0,0.08)' }}>
          <h2 style={{ fontSize: '28px', fontWeight: '600', color: '#1d1d1f', marginBottom: '24px' }}>创建Multi-Agent团队</h2>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1d1d1f' }}>团队名称</label>
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="例如：客服团队"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d1d6',
                borderRadius: '8px',
                fontSize: '15px'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500', color: '#1d1d1f' }}>团队描述</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="描述团队的功能和用途"
              rows={3}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #d1d1d6',
                borderRadius: '8px',
                fontSize: '15px',
                resize: 'none'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1d1d1f' }}>选择成员（至少2个）</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '12px' }}>
              {agents.map(agent => (
                <div
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  style={{
                    padding: '16px',
                    border: selectedAgents.includes(agent.id) ? '2px solid #007AFF' : '1px solid #d1d1d6',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    background: selectedAgents.includes(agent.id) ? '#f0f9ff' : 'white'
                  }}
                >
                  <div style={{ fontSize: '32px', textAlign: 'center', marginBottom: '8px' }}>{agent.template}</div>
                  <div style={{ fontSize: '14px', fontWeight: '600', textAlign: 'center', color: '#1d1d1f' }}>{agent.name}</div>
                </div>
              ))}
            </div>
          </div>

          {selectedAgents.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: '500', color: '#1d1d1f' }}>选择路由Agent（负责意图识别）</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                {agents.filter(a => selectedAgents.includes(a.id)).map(agent => (
                  <button
                    key={agent.id}
                    onClick={() => setRouterAgentId(agent.id)}
                    style={{
                      padding: '12px 20px',
                      background: routerAgentId === agent.id ? '#007AFF' : 'white',
                      color: routerAgentId === agent.id ? 'white' : '#1d1d1f',
                      border: routerAgentId === agent.id ? 'none' : '1px solid #d1d1d6',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    {agent.template} {agent.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleCreate}
            disabled={!teamName || selectedAgents.length < 2 || !routerAgentId}
            style={{
              width: '100%',
              padding: '14px',
              background: (!teamName || selectedAgents.length < 2 || !routerAgentId) ? '#d1d1d6' : '#007AFF',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '16px',
              fontWeight: '600',
              cursor: (!teamName || selectedAgents.length < 2 || !routerAgentId) ? 'not-allowed' : 'pointer'
            }}
          >
            创建团队
          </button>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AIWizardPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/agent/:id/setup" element={<AgentSetup />} />
        <Route path="/agent/:id" element={<AgentDetail />} />
        <Route path="/team/create" element={<CreateTeam />} />
        <Route path="/team/:id" element={<TeamDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;


