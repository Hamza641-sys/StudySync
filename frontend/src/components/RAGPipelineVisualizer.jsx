import React from 'react';
import { HelpCircle, Search, Sparkles, CheckCircle2 } from 'lucide-react';

export default function RAGPipelineVisualizer({ currentStep = 4, isProcessing = false }) {
  const steps = [
    { id: 1, title: 'Understand', desc: 'Your Question', icon: HelpCircle },
    { id: 2, title: 'Retrieve', desc: 'Relevant Content', icon: Search },
    { id: 3, title: 'Generate', desc: 'Contextual Answer', icon: Sparkles },
    { id: 4, title: 'Cite Sources', desc: '& Provide Links', icon: CheckCircle2 },
  ];

  return (
    <div className="glass-panel" style={{ padding: '18px 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <h4 style={{ fontSize: '0.88rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
          How RAG Works
        </h4>
        <span style={{
          fontSize: '0.68rem',
          padding: '2px 8px',
          borderRadius: '9999px',
          background: isProcessing ? 'rgba(59, 130, 246, 0.2)' : 'rgba(16, 185, 129, 0.15)',
          color: isProcessing ? '#60a5fa' : '#34d399',
          fontWeight: 600
        }}>
          {isProcessing ? 'Processing Query...' : 'Pipeline Ready'}
        </span>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '8px',
        position: 'relative'
      }}>
        {steps.map((s, index) => {
          const Icon = s.icon;
          const isDone = currentStep >= s.id;
          const isActive = isProcessing && currentStep === s.id;

          return (
            <div
              key={s.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                padding: '10px 4px',
                borderRadius: '12px',
                background: isActive ? 'rgba(59, 130, 246, 0.2)' : isDone ? 'rgba(255, 255, 255, 0.03)' : 'transparent',
                border: `1px solid ${isActive ? 'var(--accent-primary)' : isDone ? 'rgba(255, 255, 255, 0.08)' : 'transparent'}`,
                transition: 'all 0.3s ease'
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: isActive ? '#2563eb' : isDone ? 'rgba(59, 130, 246, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isDone ? '#38bdf8' : '#64748b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '6px',
                boxShadow: isActive ? '0 0 15px rgba(59, 130, 246, 0.6)' : 'none'
              }}>
                <Icon size={16} />
              </div>
              <div style={{ fontSize: '0.72rem', fontWeight: 600, color: isDone ? '#f8fafc' : '#64748b' }}>
                {s.title}
              </div>
              <div style={{ fontSize: '0.62rem', color: '#94a3b8', lineHeight: 1.2, marginTop: '2px' }}>
                {s.desc}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
