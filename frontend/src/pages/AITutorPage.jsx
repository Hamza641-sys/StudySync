import React, { useState, useEffect, useRef } from 'react';
import { Bot, Send, Paperclip, Plus, Sparkles, MessageSquare, BookOpen, HelpCircle, FileCheck, GraduationCap, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDocuments, getChunksByUser, saveConversation, saveMessage } from '../services/firestoreService';
import { generateRAGAnswer } from '../services/gemini';
import { findSimilarChunks } from '../services/pdfService';
import KnowledgeGraph from '../components/KnowledgeGraph';
import RAGPipelineVisualizer from '../components/RAGPipelineVisualizer';
import SourceCard from '../components/SourceCard';

export default function AITutorPage() {
  const { user, incrementStreak } = useAuth();
  const { showToast } = useToast();
  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    { id: 'init_bot', sender: 'assistant', text: '### Welcome to StudySync AI Tutor! 🎓\n\nI am powered by **Google Gemini** and grounded in your uploaded documents.\n\n**How to use:**\n- Upload PDFs in My Library\n- Ask any academic question\n- I will find relevant content and cite sources\n\nTry asking: *"Explain photosynthesis"* or *"What is Newton\'s second law?"*', time: 'Now' }
  ]);
  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(4);
  const [currentTopic, setCurrentTopic] = useState('Academic Topics');
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!user?.id) return;
    getDocuments(user.id).then(setDocuments).catch(() => {});
  }, [user?.id]);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleSend = async (customPrompt) => {
    const text = customPrompt || inputQuery;
    if (!text.trim() || loading) return;

    const userMsg = { id: `u_${Date.now()}`, sender: 'user', text: text.trim(), time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);
    setPipelineStep(1);

    const topicGuess = text.toLowerCase().includes('newton') ? "Newton's Laws" :
      text.toLowerCase().includes('photosynthesis') ? 'Photosynthesis' :
      text.toLowerCase().includes('rna') ? 'Molecular Biology' : text.slice(0, 25);
    setCurrentTopic(topicGuess);

    try {
      setPipelineStep(2);
      // Get chunks for this user
      const allChunks = await getChunksByUser(user.id, selectedDocId || null);
      const relevantChunks = findSimilarChunks(text, allChunks, 3);

      setPipelineStep(3);
      const result = await generateRAGAnswer({ question: text, relevantChunks });

      setPipelineStep(4);
      const botMsg = {
        id: `b_${Date.now()}`,
        sender: 'assistant',
        text: result.answer,
        sources: result.sources || [],
        grounded: result.grounded,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, botMsg]);
      incrementStreak('reviewStreak');
    } catch (err) {
      setMessages(prev => [...prev, { id: `e_${Date.now()}`, sender: 'assistant', text: 'Error: ' + err.message, time: 'Now', isError: true }]);
    } finally {
      setLoading(false);
      setPipelineStep(4);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{ fontSize: '2.2rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '6px' }}>
          AI Tutor & <span className="gradient-text">RAG</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginBottom: '18px' }}>Powered by Google Gemini • Grounded in your uploaded documents</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {[
            { icon: MessageSquare, label: 'Smart & Contextual', color: '#60a5fa', cls: 'badge-glow-blue' },
            { icon: BookOpen, label: 'Reliable Answers', color: '#34d399', cls: 'badge-glow-green' },
            { icon: FileCheck, label: 'Cited & Transparent', color: '#c084fc', cls: 'badge-glow-purple' },
            { icon: GraduationCap, label: 'Personalized Guidance', color: '#38bdf8', cls: '' },
          ].map((b, i) => {
            const Icon = b.icon;
            return (
              <div key={i} className={`badge-pill ${b.cls}`}>
                <Icon size={14} color={b.color} /> <span>{b.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '260px 1fr 320px', gap: '20px', alignItems: 'start' }}>
        {/* Left: Capabilities */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px', margin: 0 }}>AI Tutor Capabilities</h4>
          {[
            { title: 'Smart Chat', desc: 'Natural academic conversations', icon: MessageSquare, color: '#38bdf8' },
            { title: 'Knowledge Base', desc: 'Access your uploaded PDFs', icon: BookOpen, color: '#34d399' },
            { title: 'Question Support', desc: 'Assignment, quiz & exam prep', icon: HelpCircle, color: '#c084fc' },
            { title: 'Context Answers', desc: 'Accurate answers with sources', icon: FileCheck, color: '#60a5fa' },
            { title: 'Learning Guidance', desc: 'Step-by-step explanations', icon: GraduationCap, color: '#f59e0b' },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} style={{ padding: '10px', borderRadius: '10px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-subtle)', display: 'flex', gap: '10px' }}>
                <div style={{ width: '28px', height: '28px', borderRadius: '7px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.color, flexShrink: 0 }}>
                  <Icon size={15} />
                </div>
                <div>
                  <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#f8fafc' }}>{c.title}</div>
                  <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '1px' }}>{c.desc}</div>
                </div>
              </div>
            );
          })}
          <div style={{ marginTop: '4px', padding: '10px', borderRadius: '10px', background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(99,102,241,0.15))', border: '1px solid rgba(59,130,246,0.3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={16} color="#38bdf8" />
            <div style={{ fontSize: '0.72rem', color: '#cbd5e1' }}><strong>Gemini Powered:</strong> Google AI grounded in your documents.</div>
          </div>
        </div>

        {/* Center: Chat */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '680px', overflow: 'hidden' }}>
          {/* Chat Header */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0,0,0,0.2)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 15px rgba(37,99,235,0.5)' }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div className="pulse-online" style={{ position: 'absolute', bottom: 0, right: 0 }} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>StudySync AI Tutor</div>
                <div style={{ fontSize: '0.72rem', color: '#10b981' }}>Online • Gemini Powered</div>
              </div>
            </div>
            <button onClick={() => { setMessages([]); showToast('New session started', 'info'); }} className="gradient-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>
              <Plus size={14} /> New Chat
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, padding: '20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {messages.map(m => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                    {!isUser && (
                      <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#3b82f6,#6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Bot size={16} color="#fff" />
                      </div>
                    )}
                    <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                      <div className="prose-dark" style={{ whiteSpace: 'pre-wrap' }}>{m.text}</div>
                      <div style={{ fontSize: '0.68rem', color: isUser ? '#93c5fd' : '#64748b', textAlign: isUser ? 'right' : 'left', marginTop: '8px' }}>{m.time}</div>
                    </div>
                  </div>
                  {!isUser && m.sources && m.sources.length > 0 && (
                    <div style={{ marginLeft: '42px', marginTop: '4px' }}>
                      <div style={{ fontSize: '0.74rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <FileCheck size={14} color="#38bdf8" /> Sources ({m.sources.length}):
                      </div>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {m.sources.map((s, idx) => <SourceCard key={idx} source={s} />)}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#1d4ed8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loader2 size={16} color="#fff" style={{ animation: 'spin 1s linear infinite' }} />
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8', fontStyle: 'italic' }}>Retrieving from your documents with Gemini...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'rgba(0,0,0,0.3)' }}>
            {documents.length > 0 && (
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Filter:</span>
                <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)}
                  style={{ background: '#090f1d', border: '1px solid var(--border-subtle)', color: '#cbd5e1', fontSize: '0.74rem', borderRadius: '6px', padding: '2px 8px' }}>
                  <option value="">All Documents</option>
                  {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                </select>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '6px 12px' }}>
              <input type="text" placeholder="Ask anything... e.g. Explain photosynthesis" value={inputQuery}
                onChange={e => setInputQuery(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleSend(); }} disabled={loading}
                style={{ flex: 1, background: 'transparent', border: 'none', color: '#fff', fontSize: '0.92rem', outline: 'none' }} />
              <button onClick={() => handleSend()} disabled={loading || !inputQuery.trim()}
                style={{ width: '38px', height: '38px', borderRadius: '12px', background: inputQuery.trim() ? 'linear-gradient(135deg,#2563eb,#4f46e5)' : 'rgba(255,255,255,0.08)', border: 'none', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: inputQuery.trim() ? 'pointer' : 'not-allowed' }}>
                <Send size={16} />
              </button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', fontSize: '0.74rem', color: '#94a3b8', flexWrap: 'wrap' }}>
              <span>Try:</span>
              {["Explain Newton's Laws", "What is photosynthesis?", "Explain RAG pipeline"].map(s => (
                <button key={s} onClick={() => handleSend(s)}
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-subtle)', color: '#cbd5e1', borderRadius: '9999px', padding: '2px 10px', fontSize: '0.72rem', cursor: 'pointer' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.color = '#cbd5e1'; }}>
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Graph + Pipeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <KnowledgeGraph currentTopic={currentTopic} />
          <RAGPipelineVisualizer currentStep={pipelineStep} isProcessing={loading} />
          <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: 'linear-gradient(135deg,rgba(37,99,235,0.12),rgba(99,102,241,0.08))' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>Your AI partner, 24/7</div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>Ask. Learn. Understand. Achieve.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
