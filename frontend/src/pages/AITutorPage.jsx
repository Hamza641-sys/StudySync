import React, { useState, useEffect, useRef } from 'react';
import { 
  Bot, 
  Send, 
  Paperclip, 
  Plus, 
  Sparkles, 
  MessageSquare, 
  BookOpen, 
  HelpCircle, 
  FileCheck, 
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import KnowledgeGraph from '../components/KnowledgeGraph';
import RAGPipelineVisualizer from '../components/RAGPipelineVisualizer';
import SourceCard from '../components/SourceCard';

export default function AITutorPage() {
  const { user, incrementStreak } = useAuth();
  const { showToast } = useToast();

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState([
    {
      id: 'init_user',
      sender: 'user',
      text: 'Explain photosynthesis in plants and its balanced chemical equation.',
      time: '10:30 AM'
    },
    {
      id: 'init_bot',
      sender: 'assistant',
      text: `### Photosynthesis in Plants 🌱\n\nPhotosynthesis is the fundamental biological process used by green plants to make their own food. It occurs primarily in the chloroplasts of leaves and uses **sunlight, water, and carbon dioxide** to produce glucose and oxygen.\n\n#### The Overall Balanced Equation:\n$$6CO_2 + 6H_2O \\xrightarrow{\\text{Light + Chlorophyll}} C_6H_{12}O_6 + 6O_2$$\n\nLet me break this down step-by-step for you:`,
      time: '10:31 AM',
      sources: [
        { id: 's1', documentTitle: 'Biology - Chapter 6 Photosynthesis', pageNumber: 87, excerpt: 'Photosynthesis occurs in chloroplasts containing thylakoids and stroma.' },
        { id: 's2', documentTitle: 'Class Notes Plant Nutrition.pdf', pageNumber: 12, excerpt: 'Light dependent reactions split H2O into oxygen gas.' },
        { id: 's3', documentTitle: 'NCERT Reference Biology Class 10', pageNumber: 64, excerpt: 'Section 6.1: Autotrophic nutrition mechanisms in green autotrophs.' }
      ]
    }
  ]);

  const [loading, setLoading] = useState(false);
  const [pipelineStep, setPipelineStep] = useState(4);
  const [currentTopic, setCurrentTopic] = useState('Photosynthesis');
  const [documents, setDocuments] = useState([]);
  const [selectedDocId, setSelectedDocId] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await api.getDocuments();
        if (res.success && res.documents) {
          setDocuments(res.documents);
        }
      } catch (e) {}
    }
    fetchDocs();
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: textToSend.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);
    setPipelineStep(1); // Step 1: Understand

    // Infer topic from query
    if (textToSend.toLowerCase().includes('newton')) setCurrentTopic("Newton's Laws");
    else if (textToSend.toLowerCase().includes('rna')) setCurrentTopic('Molecular RNA');
    else if (textToSend.toLowerCase().includes('e=mc^2') || textToSend.toLowerCase().includes('einstein')) setCurrentTopic('Relativity');
    else setCurrentTopic(textToSend.slice(0, 20));

    try {
      // Step 2: Retrieve Relevant Content
      setTimeout(() => setPipelineStep(2), 300);

      const ragResponse = await api.queryRAG(textToSend, selectedDocId || null);

      // Step 3: Generate Contextual Answer
      setPipelineStep(3);

      setTimeout(() => {
        // Step 4: Cite Sources
        setPipelineStep(4);

        const botMsg = {
          id: `bot_${Date.now()}`,
          sender: 'assistant',
          text: ragResponse.answer || "Answer processed.",
          sources: ragResponse.sources || [],
          grounded: ragResponse.grounded,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        setMessages(prev => [...prev, botMsg]);
        setLoading(false);
        incrementStreak('reviewStreak');
      }, 500);

    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          id: `bot_err_${Date.now()}`,
          sender: 'assistant',
          text: 'Maaf kijiye, request process karne mein issue aya: ' + err.message,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isError: true
        }
      ]);
      setLoading(false);
      setPipelineStep(4);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    showToast('New AI Tutor session initialized.', 'info');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px' }}>
      {/* Header with Title and 4 Pill Badges (Exact match to Screenshot 3) */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h2 style={{
          fontSize: '2.2rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          letterSpacing: '-0.5px',
          marginBottom: '6px'
        }}>
          AI Tutor & <span className="gradient-text">RAG</span>
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.98rem', marginBottom: '18px' }}>
          Your intelligent learning companion powered by Retrieval Augmented Generation
        </p>

        {/* 4 Pill Badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <div className="badge-pill badge-glow-blue">
            <MessageSquare size={14} />
            <span><strong>Smart & Contextual:</strong> Understand questions in context</span>
          </div>
          <div className="badge-pill badge-glow-green">
            <BookOpen size={14} />
            <span><strong>Reliable Answers:</strong> Powered by your knowledge base</span>
          </div>
          <div className="badge-pill badge-glow-purple">
            <FileCheck size={14} />
            <span><strong>Cited & Transparent:</strong> Answers with source references</span>
          </div>
          <div className="badge-pill">
            <GraduationCap size={14} color="#38bdf8" />
            <span><strong>Personalized Guidance:</strong> Tailored explanations for better learning</span>
          </div>
        </div>
      </div>

      {/* 3-Column Split Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '270px 1fr 340px',
        gap: '20px',
        alignItems: 'start'
      }}>
        {/* Left Column: AI Tutor Capabilities */}
        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            AI Tutor Capabilities
          </h4>

          {[
            { title: 'Smart Chat', desc: 'Natural conversations for concepts, doubts & explanations', icon: MessageSquare, color: '#38bdf8' },
            { title: 'Knowledge Base', desc: 'Access your curated content, chapters, notes, PDFs & resources', icon: BookOpen, color: '#34d399' },
            { title: 'Question Support', desc: 'Get help for assignments, quizzes, exam prep & complex topics', icon: HelpCircle, color: '#c084fc' },
            { title: 'Context Answers', desc: 'AI uses relevant content to deliver accurate, contextual answers with sources', icon: FileCheck, color: '#60a5fa' },
            { title: 'Learning Guidance', desc: 'Step-by-step explanations, summaries & concept clarification', icon: GraduationCap, color: '#f59e0b' },
          ].map((c, i) => {
            const Icon = c.icon;
            return (
              <div key={i} style={{
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.02)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                gap: '10px'
              }}>
                <div style={{
                  width: '30px',
                  height: '30px',
                  borderRadius: '8px',
                  background: 'rgba(255, 255, 255, 0.05)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: c.color,
                  flexShrink: 0
                }}>
                  <Icon size={16} />
                </div>
                <div>
                  <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3, marginTop: '2px' }}>
                    {c.desc}
                  </div>
                </div>
              </div>
            );
          })}

          <div style={{
            marginTop: '8px',
            padding: '12px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Sparkles size={18} color="#38bdf8" />
            <div style={{ fontSize: '0.74rem', color: '#cbd5e1' }}>
              <strong>RAG Powered:</strong> Retrieval Augmented Generation ensures answers are grounded in your content.
            </div>
          </div>
        </div>

        {/* Center Column: Live Chat Interface */}
        <div className="glass-panel" style={{
          display: 'flex',
          flexDirection: 'column',
          height: '680px',
          overflow: 'hidden'
        }}>
          {/* Chat Header */}
          <div style={{
            padding: '14px 20px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'rgba(0, 0, 0, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ position: 'relative' }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 0 15px rgba(37, 99, 235, 0.5)'
                }}>
                  <Bot size={20} color="#fff" />
                </div>
                <div className="pulse-online" style={{ position: 'absolute', bottom: '0', right: '0' }} />
              </div>
              <div>
                <div style={{ fontSize: '0.92rem', fontWeight: 700, color: '#f8fafc' }}>
                  AI Tutor
                </div>
                <div style={{ fontSize: '0.72rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Online &bull; Grounded Mode
                </div>
              </div>
            </div>

            <button
              onClick={handleNewChat}
              className="gradient-btn-secondary"
              style={{ padding: '6px 12px', fontSize: '0.8rem' }}
            >
              <Plus size={14} />
              New Chat
            </button>
          </div>

          {/* Messages Area */}
          <div style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '18px'
          }}>
            {messages.map((m) => {
              const isUser = m.sender === 'user';
              return (
                <div key={m.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flexDirection: isUser ? 'row-reverse' : 'row' }}>
                    {!isUser && (
                      <div style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #3b82f6 0%, #6366f1 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        <Bot size={16} color="#fff" />
                      </div>
                    )}

                    <div className={isUser ? 'chat-bubble-user' : 'chat-bubble-bot'}>
                      <div className="prose-dark" style={{ whiteSpace: 'pre-wrap' }}>
                        {m.text}
                      </div>

                      <div style={{
                        fontSize: '0.68rem',
                        color: isUser ? '#93c5fd' : '#64748b',
                        textAlign: isUser ? 'right' : 'left',
                        marginTop: '8px'
                      }}>
                        {m.time}
                      </div>
                    </div>
                  </div>

                  {/* Sources Row under bot answer (Exact match to Screenshot 3) */}
                  {!isUser && m.sources && m.sources.length > 0 && (
                    <div style={{ marginLeft: '42px', marginTop: '4px' }}>
                      <div style={{
                        fontSize: '0.74rem',
                        fontWeight: 700,
                        color: '#94a3b8',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        marginBottom: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <FileCheck size={14} color="#38bdf8" />
                        Sources ({m.sources.length} Grounded Excerpts):
                      </div>

                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {m.sources.map((s, idx) => (
                          <SourceCard key={idx} source={s} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: '#1d4ed8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Loader2 size={16} color="#fff" className="animate-spin" />
                </div>
                <div style={{ fontSize: '0.84rem', color: '#94a3b8', fontStyle: 'italic' }}>
                  Retrieving knowledge chunks and generating grounded citation...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Form matching Screenshot 3 */}
          <div style={{
            padding: '16px 20px',
            borderTop: '1px solid var(--border-subtle)',
            background: 'rgba(0, 0, 0, 0.3)'
          }}>
            {/* Filter by document dropdown */}
            {documents.length > 0 && (
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Filter Document:</span>
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  style={{
                    background: '#090f1d',
                    border: '1px solid var(--border-subtle)',
                    color: '#cbd5e1',
                    fontSize: '0.74rem',
                    borderRadius: '6px',
                    padding: '2px 8px'
                  }}
                >
                  <option value="">All Uploaded Documents (Global Search)</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
              </div>
            )}

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'rgba(255, 255, 255, 0.04)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '16px',
              padding: '6px 12px'
            }}>
              <button
                type="button"
                title="Filter by uploaded PDF"
                onClick={() => showToast('Document grounding filter active.', 'info')}
                style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
              >
                <Paperclip size={18} />
              </button>

              <input
                type="text"
                placeholder="Ask anything... e.g. What is photosynthesis? or Explain Newton's laws"
                value={inputQuery}
                onChange={(e) => setInputQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                disabled={loading}
                style={{
                  flex: 1,
                  background: 'transparent',
                  border: 'none',
                  color: '#ffffff',
                  fontSize: '0.92rem',
                  outline: 'none'
                }}
              />

              <button
                onClick={() => handleSend()}
                disabled={loading || !inputQuery.trim()}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '12px',
                  background: inputQuery.trim() ? 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)' : 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                  color: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: inputQuery.trim() ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s ease'
                }}
              >
                <Send size={16} />
              </button>
            </div>

            {/* Try Asking Suggestions (Exact match to Screenshot 3) */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '10px',
              fontSize: '0.74rem',
              color: '#94a3b8',
              flexWrap: 'wrap'
            }}>
              <span>Try asking:</span>
              {[
                "Explain Newton's Laws",
                "What is RNA?",
                "Derive E = mc^2"
              ].map(s => (
                <button
                  key={s}
                  onClick={() => handleSend(s)}
                  style={{
                    background: 'rgba(255, 255, 255, 0.05)',
                    border: '1px solid var(--border-subtle)',
                    color: '#cbd5e1',
                    borderRadius: '9999px',
                    padding: '2px 10px',
                    fontSize: '0.72rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = '#38bdf8';
                    e.currentTarget.style.color = '#ffffff';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = 'var(--border-subtle)';
                    e.currentTarget.style.color = '#cbd5e1';
                  }}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Knowledge Graph & How RAG Works */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Knowledge Graph Component */}
          <KnowledgeGraph currentTopic={currentTopic} />

          {/* RAG Pipeline Visualizer */}
          <RAGPipelineVisualizer currentStep={pipelineStep} isProcessing={loading} />

          {/* Partner 24/7 Footer Banner matching Screenshot 3 */}
          <div className="glass-panel" style={{
            padding: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.12) 0%, rgba(99, 102, 241, 0.08) 100%)'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Sparkles size={20} color="#fff" />
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 700, color: '#f8fafc' }}>
                Your AI learning partner, available 24/7
              </div>
              <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                Ask. Learn. Understand. Achieve.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
