import React, { useState, useEffect } from 'react';
import { FileText, Sparkles, Copy, Check, BookOpen, Loader2, Bookmark, Layers, ListOrdered } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDocuments, getChunksByUser, saveSummary, getSummaries } from '../services/firestoreService';
import { generateSummary } from '../services/gemini';

export default function SummarizerPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [inputMode, setInputMode] = useState('text');
  const [inputText, setInputText] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [summaryType, setSummaryType] = useState('detailed');
  const [documents, setDocuments] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getDocuments(user.id), getSummaries(user.id)]).then(([docs, sums]) => {
      setDocuments(docs);
      setSavedSummaries(sums);
    }).catch(() => {});
  }, [user?.id]);

  const handleGenerate = async () => {
    if (inputMode === 'text' && !inputText.trim()) { showToast('Enter text to summarize', 'error'); return; }
    if (inputMode === 'document' && !selectedDocId) { showToast('Select a document', 'error'); return; }

    setGenerating(true);
    try {
      let content = inputText;
      let docTitle = 'Custom Notes';

      if (inputMode === 'document') {
        const doc = documents.find(d => d.id === selectedDocId);
        docTitle = doc?.title || 'Document';
        const chunks = await getChunksByUser(user.id, selectedDocId);
        content = chunks.map(c => c.content).join('\n\n');
      }

      const result = await generateSummary({ text: content, summaryType, documentTitle: docTitle });
      const summaryRecord = {
        id: `sum_${Date.now()}`,
        title: docTitle,
        type: summaryType,
        content: result.summary,
        provider: result.provider,
        createdAt: new Date().toISOString(),
      };

      await saveSummary(user.id, summaryRecord);
      setCurrentSummary(summaryRecord);
      setSavedSummaries(prev => [summaryRecord, ...prev]);
      showToast('Summary generated!', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const modes = [
    { id: 'short', label: 'Short Summary', icon: FileText, desc: '3-4 sentence briefing' },
    { id: 'detailed', label: 'Detailed', icon: Layers, desc: 'Full structured breakdown' },
    { id: 'key_points', label: 'Key Points', icon: ListOrdered, desc: 'High-impact bullets' },
    { id: 'definitions', label: 'Definitions', icon: BookOpen, desc: 'Glossary of terms' },
    { id: 'revision_notes', label: 'Revision Notes', icon: Bookmark, desc: 'Exam cram notes' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>AI Notes Summarizer</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '4px' }}>Powered by Google Gemini • 5 academic formats</p>
      </div>

      {/* Mode Selection */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '12px' }}>
        {modes.map(m => {
          const Icon = m.icon;
          const sel = summaryType === m.id;
          return (
            <div key={m.id} onClick={() => setSummaryType(m.id)}
              style={{ padding: '14px', borderRadius: '14px', background: sel ? 'rgba(37,99,235,0.2)' : 'var(--bg-card)', border: `1px solid ${sel ? 'var(--accent-primary)' : 'var(--border-subtle)'}`, cursor: 'pointer', transition: 'all 0.2s' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: sel ? '#38bdf8' : '#cbd5e1' }}>
                <Icon size={18} /> <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{m.label}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3 }}>{m.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Main Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Input */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={() => setInputMode('text')} className={inputMode === 'text' ? 'gradient-btn-primary' : 'gradient-btn-secondary'} style={{ flex: 1, fontSize: '0.86rem', padding: '8px 14px' }}>Paste Text</button>
            <button onClick={() => setInputMode('document')} className={inputMode === 'document' ? 'gradient-btn-primary' : 'gradient-btn-secondary'} style={{ flex: 1, fontSize: '0.86rem', padding: '8px 14px' }}>Select PDF</button>
          </div>

          {inputMode === 'text' ? (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Study Material:</label>
              <textarea rows={10} placeholder="Paste your study notes, textbook content or lecture transcript here..." value={inputText} onChange={e => setInputText(e.target.value)}
                style={{ width: '100%', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: '12px', padding: '14px', color: '#fff', fontSize: '0.9rem', lineHeight: 1.5, outline: 'none', resize: 'vertical' }} />
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>{inputText.length} characters</div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Choose PDF:</label>
              {documents.length === 0 ? (
                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', fontSize: '0.84rem', color: '#94a3b8' }}>No documents. Upload a PDF first!</div>
              ) : (
                <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)}
                  style={{ width: '100%', background: '#090f1d', border: '1px solid var(--border-subtle)', borderRadius: '10px', padding: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                  <option value="">-- Select a document --</option>
                  {documents.map(d => <option key={d.id} value={d.id}>{d.title} ({d.pagesCount} pages)</option>)}
                </select>
              )}
            </div>
          )}

          <button onClick={handleGenerate} disabled={generating} className="gradient-btn-primary" style={{ width: '100%', padding: '12px' }}>
            {generating ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles size={18} /> Generate {modes.find(m => m.id === summaryType)?.label}</>}
          </button>
        </div>

        {/* Output */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>{currentSummary?.title || 'Generated Summary'}</h3>
            {currentSummary && (
              <button onClick={() => { navigator.clipboard.writeText(currentSummary.content); setCopied(true); showToast('Copied!', 'success'); setTimeout(() => setCopied(false), 2000); }}
                className="gradient-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />} {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>
          <div style={{ flex: 1 }}>
            {generating ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <Loader2 size={36} style={{ margin: '0 auto 14px', display: 'block', color: '#38bdf8', animation: 'spin 1s linear infinite' }} />
                Gemini is synthesizing your notes...
              </div>
            ) : currentSummary ? (
              <div className="prose-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: '0.92rem' }}>{currentSummary.content}</div>
            ) : (
              <div style={{ textAlign: 'center', padding: '70px 20px', color: '#64748b' }}>
                <FileText size={42} style={{ margin: '0 auto 12px', display: 'block', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>Select content and click Generate.</p>
              </div>
            )}
          </div>
          {savedSummaries.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>Previous ({savedSummaries.length})</div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {savedSummaries.slice(0, 5).map(s => (
                  <button key={s.id} onClick={() => setCurrentSummary(s)}
                    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '6px 10px', color: '#cbd5e1', fontSize: '0.74rem', whiteSpace: 'nowrap', cursor: 'pointer' }}>
                    {s.title} ({s.type})
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
