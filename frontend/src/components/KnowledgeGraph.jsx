import React, { useState } from 'react';
import { BookOpen, FileText, Layers, Lightbulb, Compass } from 'lucide-react';

export default function KnowledgeGraph({ currentTopic = 'Photosynthesis' }) {
  const [activeNode, setActiveNode] = useState(null);

  const nodes = [
    { id: 'definitions', label: 'Definitions', icon: FileText, color: '#a855f7', detail: 'Formal scientific terms & axioms' },
    { id: 'resources', label: 'Resources', icon: BookOpen, color: '#10b981', detail: 'Curated PDF chapters & references' },
    { id: 'topics', label: 'Topics', icon: Layers, color: '#3b82f6', detail: 'Interconnected syllabus subjects' },
    { id: 'examples', label: 'Examples', icon: Lightbulb, color: '#06b6d4', detail: 'Practice problems & code snippets' },
  ];

  return (
    <div className="glass-panel" style={{ padding: '20px', position: 'relative' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Compass size={18} color="#38bdf8" />
          Knowledge Graph
        </h4>
        <span style={{ fontSize: '0.72rem', color: '#94a3b8' }}>Dynamic Neural View</span>
      </div>

      <div style={{
        position: 'relative',
        height: '220px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        margin: '10px 0'
      }}>
        {/* SVG connecting lines */}
        <svg style={{ position: 'absolute', width: '100%', height: '100%', pointerEvents: 'none' }}>
          <line x1="50%" y1="50%" x2="22%" y2="28%" stroke="rgba(168, 85, 247, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="50%" y1="50%" x2="78%" y2="28%" stroke="rgba(16, 185, 129, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="50%" y1="50%" x2="78%" y2="72%" stroke="rgba(59, 130, 246, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
          <line x1="50%" y1="50%" x2="22%" y2="72%" stroke="rgba(6, 182, 212, 0.4)" strokeWidth="2" strokeDasharray="4 2" />
        </svg>

        {/* Central Core Concept Node */}
        <div
          className="graph-node center"
          style={{
            zIndex: 10,
            cursor: 'pointer',
            border: '2px solid rgba(255, 255, 255, 0.4)',
            transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
          onMouseEnter={() => setActiveNode('Concepts')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <div style={{ fontWeight: 800, fontSize: '0.85rem' }}>Concepts</div>
          <div style={{ fontSize: '0.65rem', color: '#bfdbfe', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {currentTopic}
          </div>
        </div>

        {/* Outer Orbiting Nodes */}
        {/* Top-Left: Definitions */}
        <div
          className="graph-node"
          style={{
            position: 'absolute',
            top: '12%',
            left: '10%',
            background: 'rgba(168, 85, 247, 0.15)',
            border: '1px solid rgba(168, 85, 247, 0.4)',
            color: '#c084fc',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setActiveNode('Definitions')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <FileText size={18} />
          <span style={{ fontSize: '0.72rem', marginTop: '2px' }}>Definitions</span>
        </div>

        {/* Top-Right: Resources */}
        <div
          className="graph-node"
          style={{
            position: 'absolute',
            top: '12%',
            right: '10%',
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.4)',
            color: '#34d399',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setActiveNode('Resources')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <BookOpen size={18} />
          <span style={{ fontSize: '0.72rem', marginTop: '2px' }}>Resources</span>
        </div>

        {/* Bottom-Right: Topics */}
        <div
          className="graph-node"
          style={{
            position: 'absolute',
            bottom: '12%',
            right: '10%',
            background: 'rgba(59, 130, 246, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.4)',
            color: '#60a5fa',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setActiveNode('Topics')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <Layers size={18} />
          <span style={{ fontSize: '0.72rem', marginTop: '2px' }}>Topics</span>
        </div>

        {/* Bottom-Left: Examples */}
        <div
          className="graph-node"
          style={{
            position: 'absolute',
            bottom: '12%',
            left: '10%',
            background: 'rgba(6, 182, 212, 0.15)',
            border: '1px solid rgba(6, 182, 212, 0.4)',
            color: '#22d3ee',
            cursor: 'pointer'
          }}
          onMouseEnter={() => setActiveNode('Examples')}
          onMouseLeave={() => setActiveNode(null)}
        >
          <Lightbulb size={18} />
          <span style={{ fontSize: '0.72rem', marginTop: '2px' }}>Examples</span>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        fontSize: '0.76rem',
        color: '#94a3b8',
        paddingTop: '6px',
        borderTop: '1px solid var(--border-subtle)'
      }}>
        {activeNode ? (
          <span style={{ color: '#38bdf8', fontWeight: 600 }}>Active Node: {activeNode}</span>
        ) : (
          "AI connects concepts to deliver deeper understanding"
        )}
      </div>
    </div>
  );
}
