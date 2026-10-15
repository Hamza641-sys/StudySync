import React, { useState } from 'react';
import { Sparkles, Mail, Lock, ArrowRight, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function LoginPage({ onSwitchToRegister, onBackToLanding }) {
  const { login, switchDemoStudent } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      showToast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    const res = await login(email, password);
    if (!res.success) {
      showToast(res.error || 'Login failed', 'error');
    } else {
      showToast('Welcome back to StudySync Pro!', 'success');
    }
    setLoading(false);
  };

  const handleQuickDemo = (name, mail, id) => {
    switchDemoStudent(name, mail, id);
    showToast(`Logged in as ${name} (Account Isolated)`, 'success');
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at 50% 30%, rgba(37, 99, 235, 0.12) 0%, transparent 60%), var(--bg-main)',
      padding: '20px'
    }}>
      <div className="glass-panel" style={{
        maxWidth: '440px',
        width: '100%',
        padding: '36px',
        boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)'
      }}>
        {/* Brand */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            background: 'linear-gradient(135deg, #2563eb 0%, #4f46e5 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 12px',
            boxShadow: '0 0 25px rgba(37, 99, 235, 0.6)'
          }}>
            <Sparkles size={24} color="#ffffff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', margin: 0 }}>
            Welcome to Study<span style={{ color: '#38bdf8' }}>Sync</span>
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '6px' }}>
            Sign in to access your personal AI Tutor & document library
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Student Email
            </label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="email"
                placeholder="student@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 42px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '11px 16px 11px 42px',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="gradient-btn-primary"
            style={{ padding: '12px', width: '100%', marginTop: '6px' }}
          >
            {loading ? 'Authenticating...' : 'Sign In to Account'}
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Demo Student Fast Login Shortcut (For quick grading & isolation test) */}
        <div style={{ marginTop: '24px', paddingTop: '18px', borderTop: '1px solid var(--border-subtle)' }}>
          <div style={{ fontSize: '0.74rem', color: '#94a3b8', textAlign: 'center', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Fast 1-Click Demo Evaluation Profiles:
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            <button
              type="button"
              onClick={() => handleQuickDemo('Roshan Student', 'roshan@studysync.edu', 'usr_roshan_demo')}
              className="gradient-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px' }}
            >
              Demo: Roshan
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Alice Scholar', 'alice@studysync.edu', 'usr_alice')}
              className="gradient-btn-secondary"
              style={{ fontSize: '0.78rem', padding: '8px' }}
            >
              Demo: Alice
            </button>
          </div>
        </div>

        {/* Footer switch to register / back */}
        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.84rem', color: '#94a3b8' }}>
          Don't have an account?{' '}
          <button
            onClick={onSwitchToRegister}
            style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}
          >
            Create one
          </button>
        </div>

        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button
            onClick={onBackToLanding}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer' }}
          >
            &larr; Back to Landing Page
          </button>
        </div>
      </div>
    </div>
  );
}
