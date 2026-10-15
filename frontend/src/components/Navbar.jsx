import React, { useState } from 'react';
import { Search, Bell, Flame, Lightbulb, BookOpen, UserCheck, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Navbar({ onSearch }) {
  const { user, switchDemoStudent } = useAuth();
  const { showToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (onSearch) onSearch(searchQuery);
  };

  const handleStudentSwitch = (name, email, id) => {
    switchDemoStudent(name, email, id);
    showToast(`Switched account to: ${name}. All private documents and chat history are isolated!`, 'info');
  };

  return (
    <header className="top-navbar">
      {/* Search Bar matching Screenshot 1 */}
      <form onSubmit={handleSearchSubmit} style={{ position: 'relative', width: '380px' }}>
        <Search
          size={18}
          color="#64748b"
          style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }}
        />
        <input
          type="text"
          placeholder="Search your courses, notes, topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '9px 16px 9px 42px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '9999px',
            color: '#f8fafc',
            fontSize: '0.88rem',
            outline: 'none',
            transition: 'all 0.2s ease'
          }}
          onFocus={e => {
            e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)';
            e.target.style.background = 'rgba(255, 255, 255, 0.07)';
          }}
          onBlur={e => {
            e.target.style.borderColor = 'var(--border-subtle)';
            e.target.style.background = 'rgba(255, 255, 255, 0.04)';
          }}
        />
      </form>

      {/* Right Stats & Progression matching Screenshot 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        {/* Learning Streaks */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="badge-pill badge-glow-blue" title="Daily Visit Streak">
            <Flame size={15} color="#f59e0b" />
            <span>{user?.streaks?.visitStreak || 2}d Streak</span>
          </div>

          <div className="badge-pill badge-glow-purple" title="Quiz Mastery Streak">
            <Lightbulb size={15} color="#c084fc" />
            <span>{user?.streaks?.quizStreak || 1} Quiz</span>
          </div>
        </div>

        {/* Level & XP Progression */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38bdf8' }}>
              Level {user?.level || 1}
            </div>
            <div style={{ fontSize: '0.68rem', color: '#94a3b8' }}>
              {user?.xp || 45} / {user?.xpMax || 150} XP
            </div>
          </div>
          <div style={{
            width: '80px',
            height: '8px',
            background: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '9999px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min(100, ((user?.xp || 45) / (user?.xpMax || 150)) * 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%)',
              borderRadius: '9999px',
              transition: 'width 0.3s ease'
            }} />
          </div>
        </div>

        {/* Demo Student Isolation Switcher */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '4px 8px',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '10px'
        }}>
          <Shield size={14} color="#10b981" title="User Data Isolation Active" />
          <select
            value={user?.id || ''}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'usr_roshan_demo') handleStudentSwitch('Roshan', 'roshan@studysync.edu', 'usr_roshan_demo');
              if (val === 'usr_alice') handleStudentSwitch('Alice Smith', 'alice@studysync.edu', 'usr_alice');
              if (val === 'usr_bob') handleStudentSwitch('Bob Vance', 'bob@studysync.edu', 'usr_bob');
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: '#cbd5e1',
              fontSize: '0.78rem',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="usr_roshan_demo" style={{ background: '#090f1d' }}>Student: Roshan</option>
            <option value="usr_alice" style={{ background: '#090f1d' }}>Student: Alice</option>
            <option value="usr_bob" style={{ background: '#090f1d' }}>Student: Bob</option>
          </select>
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => showToast('All systems operational: RAG vector search & AI Tutor ready.', 'success')}
          style={{
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: '#cbd5e1',
            borderRadius: '50%',
            width: '38px',
            height: '38px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
        >
          <Bell size={17} />
        </button>
      </div>
    </header>
  );
}
