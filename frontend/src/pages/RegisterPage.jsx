import React, { useState } from 'react';
import { Sparkles, Mail, Lock, User, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function RegisterPage({ onSwitchToLogin, onBackToLanding }) {
  const { register } = useAuth();
  const { showToast } = useToast();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !email || !password) { showToast('All fields are required', 'error'); return; }
    if (password.length < 6) { showToast('Password must be at least 6 characters', 'error'); return; }
    setLoading(true);
    const res = await register(name, email, password);
    if (!res.success) showToast(res.error || 'Registration failed', 'error');
    else showToast('Welcome to StudySync Pro!', 'success');
    setLoading(false);
  };

  const inputStyle = { width: '100%', padding: '11px 16px 11px 42px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' };
  const iconStyle = { position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle at 50% 30%, rgba(37,99,235,0.12) 0%, transparent 60%), var(--bg-main)', padding: '20px' }}>
      <div className="glass-panel" style={{ maxWidth: '440px', width: '100%', padding: '36px', boxShadow: '0 20px 50px rgba(0,0,0,0.6)' }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '14px', background: 'linear-gradient(135deg,#2563eb,#4f46e5)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px', boxShadow: '0 0 25px rgba(37,99,235,0.6)' }}>
            <Sparkles size={24} color="#fff" />
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>Create Account</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.86rem', marginTop: '6px' }}>Get started with AI-driven study acceleration</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Full Name</label>
            <div style={{ position: 'relative' }}>
              <User size={18} color="#64748b" style={iconStyle} />
              <input type="text" placeholder="Roshan Ahmad" value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Email</label>
            <div style={{ position: 'relative' }}>
              <Mail size={18} color="#64748b" style={iconStyle} />
              <input type="email" placeholder="student@university.edu" value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <div>
            <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '6px' }}>Password (min 6 chars)</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} color="#64748b" style={iconStyle} />
              <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
            </div>
          </div>
          <button type="submit" disabled={loading} className="gradient-btn-primary" style={{ padding: '12px', width: '100%', marginTop: '6px' }}>
            {loading ? 'Creating account...' : 'Create Account'} <ArrowRight size={16} />
          </button>
        </form>

        <div style={{ marginTop: '20px', textAlign: 'center', fontSize: '0.84rem', color: '#94a3b8' }}>
          Already have an account?{' '}
          <button onClick={onSwitchToLogin} style={{ background: 'transparent', border: 'none', color: '#38bdf8', fontWeight: 600, cursor: 'pointer' }}>Sign in</button>
        </div>
        <div style={{ marginTop: '12px', textAlign: 'center' }}>
          <button onClick={onBackToLanding} style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '0.78rem', cursor: 'pointer' }}>← Back to Landing</button>
        </div>
      </div>
    </div>
  );
}
