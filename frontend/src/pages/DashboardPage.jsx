import React, { useState, useEffect } from 'react';
import { 
  UploadCloud, 
  Bot, 
  HelpCircle, 
  FileText, 
  ArrowRight, 
  Sparkles, 
  CheckCircle, 
  Flame,
  Clock,
  ChevronRight,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';

export default function DashboardPage({ setActivePage }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.getDocuments();
        if (res.success && res.documents) {
          setDocuments(res.documents);
        } else {
          // Default initial showcase documents if empty
          setDocuments([
            { id: 'sample_1', title: 'Machine Learning Basics', pagesCount: 12, uploadDate: '2 hours ago', fileName: 'Machine Learning Basics.pdf' },
            { id: 'sample_2', title: 'Data Structures Notes', pagesCount: 8, uploadDate: '1 day ago', fileName: 'Data Structures Notes.pdf' },
          ]);
        }
      } catch (err) {
        console.error('Failed to load documents:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      {/* Welcome Header */}
      <div>
        <h2 style={{
          fontSize: '1.9rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          color: '#ffffff',
          marginBottom: '6px'
        }}>
          Welcome back, {user?.name || 'Roshan'}! 👋
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>
          What do you want to learn today? Your AI learning copilot is grounded in your uploaded materials.
        </p>
      </div>

      {/* 3 Quick Action Cards (Matching Screenshot 1) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '20px'
      }}>
        {/* Card 1: Upload & Learn */}
        <div className="glass-card-interactive" style={{ padding: '26px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8',
            marginBottom: '16px'
          }}>
            <UploadCloud size={24} />
          </div>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
            Upload & Learn
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
            Upload any PDF document and get instant RAG embeddings, summaries & answers.
          </p>
          <button
            className="gradient-btn-primary"
            style={{ width: '100%', fontSize: '0.9rem' }}
            onClick={() => setActivePage('library')}
          >
            Upload Document
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 2: AI Tutor */}
        <div className="glass-card-interactive" style={{ padding: '26px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#c084fc',
            marginBottom: '16px'
          }}>
            <Bot size={24} />
          </div>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
            AI Tutor & RAG
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
            Get accurate answers grounded in your notes with page citations & knowledge graph.
          </p>
          <button
            className="gradient-btn-primary"
            style={{ width: '100%', fontSize: '0.9rem', background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)' }}
            onClick={() => setActivePage('tutor')}
          >
            Ask Question
            <ArrowRight size={16} />
          </button>
        </div>

        {/* Card 3: Generate Quiz */}
        <div className="glass-card-interactive" style={{ padding: '26px' }}>
          <div style={{
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#22d3ee',
            marginBottom: '16px'
          }}>
            <HelpCircle size={24} />
          </div>
          <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
            Generate Quiz
          </h3>
          <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>
            Create AI MCQs from your content with automatic scoring & detailed explanations.
          </p>
          <button
            className="gradient-btn-primary"
            style={{ width: '100%', fontSize: '0.9rem', background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)' }}
            onClick={() => setActivePage('quizzes')}
          >
            Generate Quiz
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Bottom Grid: Recent Documents & Learning Progress */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        {/* Recent Documents Card (Screenshot 1) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#38bdf8" />
              Recent Documents
            </h3>
            <button
              onClick={() => setActivePage('library')}
              style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {documents.slice(0, 4).map(doc => (
              <div
                key={doc.id}
                onClick={() => setActivePage('tutor')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-subtle)';
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.03)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>
                      {doc.title}
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                      {doc.pagesCount || 1} pages • PDF
                    </div>
                  </div>
                </div>

                <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} />
                  {doc.uploadDate || 'Recent'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Learning Progress Card (Screenshot 1: 75% Overall Progress ring + weekly chart) */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#10b981" />
              Learning Progress
            </h3>
            <span style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 600, background: 'rgba(16, 185, 129, 0.12)', padding: '2px 8px', borderRadius: '6px' }}>
              +12% this week
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', flexWrap: 'wrap' }}>
            {/* 75% Circular Ring */}
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="8" fill="none" />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  stroke="url(#progressGradient)"
                  strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset="62.8" /* 75% */
                  strokeLinecap="round"
                  fill="none"
                />
                <defs>
                  <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#f8fafc' }}>
                  75%
                </div>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8', textTransform: 'uppercase' }}>
                  Overall
                </div>
              </div>
            </div>

            {/* Weekly Activity Bar Chart */}
            <div style={{ flex: 1, minWidth: '180px' }}>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', height: '90px', gap: '8px', paddingBottom: '6px' }}>
                {[
                  { day: 'Mon', h: 45 },
                  { day: 'Tue', h: 65 },
                  { day: 'Wed', h: 50 },
                  { day: 'Thu', h: 90 },
                  { day: 'Fri', h: 75 },
                  { day: 'Sat', h: 30 },
                  { day: 'Sun', h: 80 },
                ].map(b => (
                  <div key={b.day} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', flex: 1 }}>
                    <div style={{
                      width: '100%',
                      maxWidth: '18px',
                      height: `${b.h}%`,
                      background: b.day === 'Thu' ? 'linear-gradient(180deg, #38bdf8 0%, #2563eb 100%)' : 'rgba(59, 130, 246, 0.35)',
                      borderRadius: '4px',
                      transition: 'height 0.3s'
                    }} />
                    <span style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{b.day}</span>
                  </div>
                ))}
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', textAlign: 'center', marginTop: '6px' }}>
                Peak study hours: Thursday & Sunday
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
