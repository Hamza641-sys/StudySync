import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  User, 
  Shield, 
  Key, 
  Database, 
  Activity, 
  CheckCircle2, 
  AlertCircle,
  RefreshCw,
  Trash2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { showToast } = useToast();

  const [health, setHealth] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  const checkHealth = async () => {
    setLoadingHealth(true);
    try {
      const res = await api.getHealth();
      setHealth(res);
      showToast('System health status refreshed.', 'info');
    } catch (err) {
      showToast('Backend health check error: ' + err.message, 'error');
    } finally {
      setLoadingHealth(false);
    }
  };

  useEffect(() => {
    checkHealth();
  }, []);

  const handleClearCache = () => {
    localStorage.removeItem('studysync_cached_queries');
    showToast('Local application cache cleared.', 'success');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px', maxWidth: '900px', margin: '0 auto', width: '100%' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', margin: 0 }}>
          Profile & System Settings
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '4px' }}>
          Manage your student account, review server configurations, and verify security protocols.
        </p>
      </div>

      {/* User Profile Card */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <User size={20} color="#38bdf8" />
          Student Account Profile
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Full Name</label>
            <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.9rem' }}>
              {user?.name || 'Roshan'}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#f8fafc', fontSize: '0.9rem' }}>
              {user?.email || 'roshan@studysync.edu'}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Student Unique ID</label>
            <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#93c5fd', fontSize: '0.85rem', fontFamily: 'var(--font-mono)' }}>
              {user?.id || 'usr_roshan_demo'}
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.78rem', color: '#94a3b8', display: 'block', marginBottom: '4px' }}>Progression Level</label>
            <div style={{ padding: '10px 14px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid var(--border-subtle)', borderRadius: '10px', color: '#34d399', fontSize: '0.9rem', fontWeight: 600 }}>
              Level {user?.level || 1} ({user?.xp || 45} XP)
            </div>
          </div>
        </div>
      </div>

      {/* Backend & AI Integration Status */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} color="#10b981" />
            Backend Services & Health Check (/api/health)
          </h3>
          <button
            onClick={checkHealth}
            disabled={loadingHealth}
            className="gradient-btn-secondary"
            style={{ padding: '6px 12px', fontSize: '0.78rem' }}
          >
            <RefreshCw size={14} className={loadingHealth ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {health ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>Service API Server</span>
              <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Healthy (Uptime: {health.uptimeSeconds}s)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>RAG Vector Pipeline</span>
              <span style={{ fontSize: '0.78rem', color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> Active (PDF text extraction & chunk embeddings)
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>Database System (Module 8)</span>
              <span style={{ fontSize: '0.78rem', color: health.features?.firebaseActive ? '#34d399' : '#38bdf8', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> {health.features?.firebaseActive ? 'Firebase Firestore Live' : 'Isolated Persistent Local Store'}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px', background: 'rgba(255, 255, 255, 0.02)', borderRadius: '10px' }}>
              <span style={{ fontSize: '0.88rem', color: '#cbd5e1' }}>AI Engine Provider</span>
              <span style={{ fontSize: '0.78rem', color: health.features?.openaiConfigured ? '#34d399' : '#c084fc', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600 }}>
                <CheckCircle2 size={14} /> {health.features?.openaiConfigured ? 'OpenAI GPT-4o-mini' : 'StudySync Academic RAG Engine'}
              </span>
            </div>
          </div>
        ) : (
          <div style={{ color: '#94a3b8', fontSize: '0.86rem' }}>
            Checking backend server connection...
          </div>
        )}
      </div>

      {/* Security & User Isolation */}
      <div className="glass-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Shield size={20} color="#6366f1" />
          Security Controls & Responsible AI (Module 9)
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: '#cbd5e1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span><strong>Multi-Tenant Isolation:</strong> Queries are scoped strictly to the authenticated user ID.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span><strong>Prompt Injection Protection:</strong> User prompts and PDF chunks are sanitized against escape delimiters.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span><strong>Rate Limiting:</strong> Standard 100 req/15m and AI 30 req/15m window prevent API exhaustion.</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <CheckCircle2 size={16} color="#10b981" />
            <span><strong>Anti-Cheat Scoring:</strong> Quiz correct answers and explanations are hidden until server submission.</span>
          </div>
        </div>

        <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)', display: 'flex', gap: '12px' }}>
          <button
            onClick={handleClearCache}
            className="gradient-btn-secondary"
            style={{ fontSize: '0.82rem' }}
          >
            Clear Browser Cache
          </button>
          <button
            onClick={logout}
            className="gradient-btn-secondary"
            style={{ fontSize: '0.82rem', color: '#f87171', borderColor: 'rgba(239, 68, 68, 0.3)' }}
          >
            Log Out Session
          </button>
        </div>
      </div>
    </div>
  );
}
