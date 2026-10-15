import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  BookOpen, 
  Bot, 
  HelpCircle, 
  FileText, 
  ShieldCheck, 
  Zap, 
  CheckCircle2, 
  Flame,
  Layers,
  GraduationCap
} from 'lucide-react';

export default function LandingPage({ onGetStarted, onLogin }) {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-main)', color: '#ffffff' }}>
      {/* Top Navigation */}
      <nav style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '24px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '1px solid var(--border-subtle)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(37, 99, 235, 0.6)'
          }}>
            <Sparkles size={22} color="#ffffff" />
          </div>
          <span style={{ fontSize: '1.3rem', fontWeight: 800, fontFamily: 'var(--font-heading)' }}>
            Study<span style={{ color: '#38bdf8' }}>Sync</span> Pro
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onLogin}
            className="gradient-btn-secondary"
            style={{ padding: '8px 18px', fontSize: '0.88rem' }}
          >
            Sign In
          </button>
          <button
            onClick={onGetStarted}
            className="gradient-btn-primary"
            style={{ padding: '8px 20px', fontSize: '0.88rem' }}
          >
            Get Started Free
            <ArrowRight size={16} />
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '80px 32px 60px',
        textAlign: 'center',
        position: 'relative'
      }}>
        {/* Glowing Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '6px 16px',
          borderRadius: '9999px',
          background: 'rgba(59, 130, 246, 0.12)',
          border: '1px solid rgba(59, 130, 246, 0.3)',
          color: '#60a5fa',
          fontSize: '0.86rem',
          fontWeight: 600,
          marginBottom: '24px'
        }}>
          <Sparkles size={16} />
          Full-Stack GenAI Educational Web App &bull; Grounded Document RAG
        </div>

        <h1 style={{
          fontSize: '3.6rem',
          fontWeight: 800,
          fontFamily: 'var(--font-heading)',
          letterSpacing: '-1.5px',
          lineHeight: 1.15,
          maxWidth: '900px',
          margin: '0 auto 24px'
        }}>
          Your Personal <span className="gradient-text">AI Study Assistant</span> Grounded In Your Actual Coursework
        </h1>

        <p style={{
          fontSize: '1.18rem',
          color: '#94a3b8',
          maxWidth: '720px',
          margin: '0 auto 36px',
          lineHeight: 1.6
        }}>
          Upload your PDF study material, ask academic questions with precise page citations, synthesize targeted revision notes, and generate intelligent MCQ quizzes.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <button
            onClick={onGetStarted}
            className="gradient-btn-primary"
            style={{ padding: '14px 32px', fontSize: '1.05rem', borderRadius: '14px' }}
          >
            Launch StudySync Dashboard
            <ArrowRight size={18} />
          </button>
          <button
            onClick={onLogin}
            className="gradient-btn-secondary"
            style={{ padding: '14px 28px', fontSize: '1.05rem', borderRadius: '14px' }}
          >
            Try Demo Student Login
          </button>
        </div>
      </section>

      {/* Feature Showcase Grid (All 11 Modules Represented) */}
      <section style={{ maxWidth: '1240px', margin: '0 auto', padding: '40px 32px 80px' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))',
          gap: '24px'
        }}>
          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(59, 130, 246, 0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Bot size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              RAG Document Q&A
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Upload textbooks and lecture slides. Ask any question and receive zero-hallucination answers backed by exact page and section citations.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(168, 85, 247, 0.15)', color: '#c084fc', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <Layers size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              5-Mode Notes Summarizer
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Synthesize content into Short Summaries, Detailed Guides, Key Bullet Points, Technical Definitions, or High-Yield Cram Notes.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', color: '#22d3ee', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <HelpCircle size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              Anti-Cheat MCQ Generator
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Practice with curriculum-aligned 4-option MCQs. Correct answers are verified on the backend, delivering detailed explanations and score history.
            </p>
          </div>

          <div className="glass-panel" style={{ padding: '28px' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', marginBottom: '8px' }}>
              Multi-Tenant Privacy & Auth
            </h3>
            <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.5 }}>
              Powered by Firebase Auth. User data isolation guarantees that student documents, chats, and quiz attempts remain strictly private.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border-subtle)', padding: '28px 32px', textAlign: 'center', fontSize: '0.82rem', color: '#64748b' }}>
        StudySync Pro &bull; AI-Powered Educational Web Application &bull; Complete Full-Stack GenAI Portfolio Project
      </footer>
    </div>
  );
}
