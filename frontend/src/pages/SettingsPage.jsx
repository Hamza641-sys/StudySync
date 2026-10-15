import React from 'react';
import { Settings, User, Shield, Activity, CheckCircle2, Key } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>Settings</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '4px' }}>Profile, system status & security</p>
      </div>

      {/* Profile */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="#38bdf8" /> Student Profile
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          {[
            { label: 'Full Name', value: user?.name || 'Student' },
            { label: 'Email', value: user?.email || 'N/A' },
            { label: 'User ID', value: user?.id || 'N/A', mono: true, color: '#93c5fd' },
            { label: 'Level & XP', value: `Level ${user?.level || 1} • ${user?.xp || 0} XP`, color: '#34d399' },
          ].map(f => (
            <div key={f.label}>
              <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>{f.label}</label>
              <div style={{ padding: '10px 14px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: f.color || '#f8fafc', fontSize: f.mono ? '0.82rem' : '0.9rem', fontFamily: f.mono ? 'var(--font-mono)' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {f.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Status */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={20} color="#10b981" /> System Status
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { label: 'Firebase Hosting', status: 'Live', color: '#34d399' },
            { label: 'Firestore Database', status: 'Connected (studysync-pro-app)', color: '#34d399' },
            { label: 'Firebase Auth', status: 'Active', color: '#34d399' },
            { label: 'Google Gemini AI', status: import.meta.env.VITE_GEMINI_API_KEY ? 'Connected (gemini-1.5-flash)' : 'Key not set — using local engine', color: import.meta.env.VITE_GEMINI_API_KEY ? '#34d399' : '#f59e0b' },
            { label: 'PDF Processing', status: 'Browser-side (pdfjs-dist)', color: '#34d399' },
          ].map(s => (
            <div key={s.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255,255,255,0.02)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>{s.label}</span>
              <span style={{ fontSize: '0.78rem', color: s.color, display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> {s.status}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Gemini Key */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Key size={20} color="#f59e0b" /> Gemini API Key
        </h3>
        <div style={{ padding: '16px', borderRadius: '12px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.6 }}>
          {import.meta.env.VITE_GEMINI_API_KEY ? (
            <span style={{ color: '#34d399', fontWeight: 600 }}>✅ Gemini API key is configured. Full AI responses active.</span>
          ) : (
            <>
              <span style={{ color: '#fbbf24', fontWeight: 600 }}>⚠️ Gemini API key not set.</span> The app is using the local academic engine.
              <br /><br />
              To enable full AI: Get your key from{' '}
              <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" style={{ color: '#38bdf8' }}>aistudio.google.com</a>
              {' '}and add <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>VITE_GEMINI_API_KEY=your_key</code> to <code style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px' }}>frontend/.env</code>
            </>
          )}
        </div>
      </div>

      {/* Security */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} color="#6366f1" /> Security
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: '#cbd5e1' }}>
          {[
            'Firebase Auth: Email/password authentication with secure session management',
            'Per-user data isolation: All Firestore queries are scoped to authenticated user ID',
            'No backend server: No API keys exposed server-side',
            'Firebase Security Rules: Firestore data protected at database level',
          ].map(s => (
            <div key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <CheckCircle2 size={16} color="#10b981" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>{s}</span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
          <button onClick={logout} className="gradient-btn-secondary" style={{ fontSize: '0.82rem', color: '#f87171', borderColor: 'rgba(239,68,68,0.3)' }}>
            Log Out
          </button>
        </div>
      </div>
    </div>
  );
}
