import React, { useState, useEffect } from 'react';
import { UploadCloud, Bot, HelpCircle, FileText, ArrowRight, Sparkles, Flame, Clock, ChevronRight, TrendingUp } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { getDocuments } from '../services/firestoreService';

export default function DashboardPage({ setActivePage }) {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    getDocuments(user.id).then(docs => {
      setDocuments(docs.length > 0 ? docs : [
        { id: 's1', title: 'Machine Learning Basics', pagesCount: 12, uploadDate: 'Sample', chunksCount: 24 },
        { id: 's2', title: 'Data Structures Notes', pagesCount: 8, uploadDate: 'Sample', chunksCount: 16 },
      ]);
    }).catch(() => {});
  }, [user?.id]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
      <div>
        <h2 style={{ fontSize: '1.9rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', marginBottom: '6px' }}>
          Welcome back, {user?.name?.split(' ')[0] || 'Student'}! 👋
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '1rem' }}>Your AI learning copilot is grounded in your uploaded materials.</p>
      </div>

      {/* Quick Action Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
        {[
          { icon: UploadCloud, color: '#38bdf8', bg: 'rgba(59,130,246,0.15)', border: 'rgba(59,130,246,0.3)', title: 'Upload & Learn', desc: 'Upload any PDF and get instant RAG embeddings, summaries & answers.', btn: 'Upload Document', page: 'library', gradient: 'linear-gradient(135deg,#2563eb,#4f46e5)' },
          { icon: Bot, color: '#c084fc', bg: 'rgba(168,85,247,0.15)', border: 'rgba(168,85,247,0.3)', title: 'AI Tutor & RAG', desc: 'Get accurate answers grounded in your notes with page citations.', btn: 'Ask Question', page: 'tutor', gradient: 'linear-gradient(135deg,#7c3aed,#4f46e5)' },
          { icon: HelpCircle, color: '#22d3ee', bg: 'rgba(6,182,212,0.15)', border: 'rgba(6,182,212,0.3)', title: 'Generate Quiz', desc: 'Create AI MCQs from your content with automatic scoring.', btn: 'Generate Quiz', page: 'quizzes', gradient: 'linear-gradient(135deg,#0284c7,#2563eb)' },
        ].map((card, i) => {
          const Icon = card.icon;
          return (
            <div key={i} className="glass-card-interactive" style={{ padding: '26px' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: card.bg, border: `1px solid ${card.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: card.color, marginBottom: '16px' }}>
                <Icon size={24} />
              </div>
              <h3 style={{ fontSize: '1.18rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>{card.title}</h3>
              <p style={{ fontSize: '0.86rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '20px' }}>{card.desc}</p>
              <button className="gradient-btn-primary" style={{ width: '100%', fontSize: '0.9rem', background: card.gradient }} onClick={() => setActivePage(card.page)}>
                {card.btn} <ArrowRight size={16} />
              </button>
            </div>
          );
        })}
      </div>

      {/* Bottom Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px' }}>
        {/* Recent Documents */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="#38bdf8" /> Recent Documents
            </h3>
            <button onClick={() => setActivePage('library')} style={{ background: 'transparent', border: 'none', color: '#60a5fa', fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
              View All <ChevronRight size={14} />
            </button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {documents.slice(0, 4).map(doc => (
              <div key={doc.id} onClick={() => setActivePage('tutor')} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-subtle)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(239,68,68,0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#f8fafc' }}>{doc.title}</div>
                    <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>{doc.pagesCount || 1} pages • {doc.chunksCount || 0} chunks</div>
                  </div>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Clock size={13} /> {doc.uploadDate || 'Recent'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Progress */}
        <div className="glass-panel" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <TrendingUp size={20} color="#10b981" /> Learning Progress
            </h3>
            <span style={{ fontSize: '0.76rem', color: '#34d399', fontWeight: 600, background: 'rgba(16,185,129,0.12)', padding: '2px 8px', borderRadius: '6px' }}>Level {user?.level || 1}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '20px', flexWrap: 'wrap' }}>
            {/* XP Ring */}
            <div style={{ position: 'relative', width: '130px', height: '130px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="130" height="130" viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)' }}>
                <circle cx="50" cy="50" r="40" stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
                <circle cx="50" cy="50" r="40" stroke="url(#pg)" strokeWidth="8"
                  strokeDasharray="251.2"
                  strokeDashoffset={251.2 - (251.2 * Math.min(100, ((user?.xp || 0) / (user?.xpMax || 150)) * 100) / 100)}
                  strokeLinecap="round" fill="none" />
                <defs>
                  <linearGradient id="pg" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#6366f1" />
                  </linearGradient>
                </defs>
              </svg>
              <div style={{ position: 'absolute', textAlign: 'center' }}>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f8fafc' }}>{user?.xp || 0}</div>
                <div style={{ fontSize: '0.66rem', color: '#94a3b8', textTransform: 'uppercase' }}>XP</div>
              </div>
            </div>
            {/* Streaks */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { label: 'Visit Streak', value: user?.streaks?.visitStreak || 0, color: '#f59e0b' },
                { label: 'Quiz Streak', value: user?.streaks?.quizStreak || 0, color: '#c084fc' },
                { label: 'Review Streak', value: user?.streaks?.reviewStreak || 0, color: '#34d399' },
              ].map(s => (
                <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Flame size={16} color={s.color} />
                  <div>
                    <div style={{ fontSize: '0.8rem', color: '#f8fafc', fontWeight: 600 }}>{s.value} days</div>
                    <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
