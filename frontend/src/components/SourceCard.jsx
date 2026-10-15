import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';

export default function SourceCard({ source }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div
      style={{
        background: 'rgba(255, 255, 255, 0.04)',
        border: '1px solid rgba(59, 130, 246, 0.25)',
        borderRadius: '12px',
        padding: '10px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: '6px',
        minWidth: '200px',
        transition: 'all 0.2s ease',
        cursor: 'pointer'
      }}
      onClick={() => setExpanded(!expanded)}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.07)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.25)';
        e.currentTarget.style.background = 'rgba(255, 255, 255, 0.04)';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '26px',
            height: '26px',
            borderRadius: '6px',
            background: 'rgba(59, 130, 246, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#38bdf8'
          }}>
            <FileText size={15} />
          </div>
          <div>
            <div style={{
              fontSize: '0.8rem',
              fontWeight: 600,
              color: '#f8fafc',
              maxWidth: '160px',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}>
              {source.documentTitle || 'Study Document'}
            </div>
            <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
              Page {source.pageNumber || 1}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{
            fontSize: '0.66rem',
            padding: '2px 6px',
            borderRadius: '6px',
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#34d399',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '3px'
          }}>
            <ShieldCheck size={11} />
            Verified
          </span>
          {expanded ? <ChevronUp size={14} color="#94a3b8" /> : <ChevronDown size={14} color="#94a3b8" />}
        </div>
      </div>

      {expanded && source.excerpt && (
        <div style={{
          marginTop: '6px',
          paddingTop: '6px',
          borderTop: '1px solid rgba(255, 255, 255, 0.06)',
          fontSize: '0.74rem',
          color: '#cbd5e1',
          lineHeight: 1.4,
          fontStyle: 'italic',
          background: 'rgba(0, 0, 0, 0.2)',
          padding: '8px',
          borderRadius: '6px'
        }}>
          "{source.excerpt}"
        </div>
      )}
    </div>
  );
}
