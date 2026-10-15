import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Sparkles, 
  Copy, 
  Check, 
  Clock, 
  BookOpen, 
  Loader2, 
  Bookmark,
  Layers,
  ListOrdered
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function SummarizerPage() {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [inputMode, setInputMode] = useState('text'); // 'text' | 'document'
  const [inputText, setInputText] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [summaryType, setSummaryType] = useState('detailed');
  const [documents, setDocuments] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [currentSummary, setCurrentSummary] = useState(null);
  const [savedSummaries, setSavedSummaries] = useState([]);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [docsRes, sumsRes] = await Promise.all([
          api.getDocuments(),
          api.getSummaries()
        ]);
        if (docsRes.success && docsRes.documents) setDocuments(docsRes.documents);
        if (sumsRes.success && sumsRes.summaries) setSavedSummaries(sumsRes.summaries);
      } catch (err) {
        console.error(err);
      }
    }
    loadInitial();
  }, [user?.id]);

  const handleGenerate = async () => {
    if (inputMode === 'text' && !inputText.trim()) {
      showToast('Please enter text or notes to summarize!', 'error');
      return;
    }
    if (inputMode === 'document' && !selectedDocId) {
      showToast('Please select a document from your library!', 'error');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        summaryType,
        text: inputMode === 'text' ? inputText : '',
        documentId: inputMode === 'document' ? selectedDocId : null,
        title: inputMode === 'text' ? 'Custom Study Notes' : (documents.find(d => d.id === selectedDocId)?.title || 'Document Summary')
      };

      const res = await api.generateSummary(payload);
      if (res.success && res.summary) {
        setCurrentSummary(res.summary);
        setSavedSummaries(prev => [res.summary, ...prev]);
        showToast('Summary generated & saved successfully!', 'success');
      } else {
        showToast(res.error || 'Failed to generate summary', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = () => {
    if (!currentSummary?.content) return;
    navigator.clipboard.writeText(currentSummary.content);
    setCopied(true);
    showToast('Copied summary to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const summaryModes = [
    { id: 'short', label: 'Short Summary', icon: FileText, desc: '3-4 sentence rapid briefing' },
    { id: 'detailed', label: 'Detailed Summary', icon: Layers, desc: 'In-depth section by section breakdown' },
    { id: 'key_points', label: 'Key Points', icon: ListOrdered, desc: 'High-impact bulleted takeaways' },
    { id: 'definitions', label: 'Important Definitions', icon: BookOpen, desc: 'Glossary of essential technical terms' },
    { id: 'revision_notes', label: 'Revision Notes', icon: Bookmark, desc: 'High-yield cram notes for exam prep' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', margin: 0 }}>
          AI Notes Summarizer
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '4px' }}>
          Distill lecture transcripts, dense chapters, or custom text into 5 targeted academic formats.
        </p>
      </div>

      {/* Mode Selectors */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '12px'
      }}>
        {summaryModes.map(m => {
          const Icon = m.icon;
          const isSelected = summaryType === m.id;
          return (
            <div
              key={m.id}
              onClick={() => setSummaryType(m.id)}
              style={{
                padding: '14px',
                borderRadius: '14px',
                background: isSelected ? 'rgba(37, 99, 235, 0.2)' : 'var(--bg-card)',
                border: `1px solid ${isSelected ? 'var(--accent-primary)' : 'var(--border-subtle)'}`,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: isSelected ? '#38bdf8' : '#cbd5e1' }}>
                <Icon size={18} />
                <span style={{ fontSize: '0.88rem', fontWeight: 700 }}>{m.label}</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', lineHeight: 1.3 }}>{m.desc}</span>
            </div>
          );
        })}
      </div>

      {/* Main Two-Column Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.1fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left: Input Controller */}
        <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {/* Input Source Switcher */}
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => setInputMode('text')}
              className={inputMode === 'text' ? 'gradient-btn-primary' : 'gradient-btn-secondary'}
              style={{ flex: 1, fontSize: '0.86rem', padding: '8px 14px' }}
            >
              Paste Custom Text
            </button>
            <button
              onClick={() => setInputMode('document')}
              className={inputMode === 'document' ? 'gradient-btn-primary' : 'gradient-btn-secondary'}
              style={{ flex: 1, fontSize: '0.86rem', padding: '8px 14px' }}
            >
              Select Uploaded PDF
            </button>
          </div>

          {inputMode === 'text' ? (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Study Material / Notes Content:
              </label>
              <textarea
                rows={10}
                placeholder="Paste your study material, textbook section, or lecture transcription here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  width: '100%',
                  background: 'rgba(0, 0, 0, 0.25)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '12px',
                  padding: '14px',
                  color: '#ffffff',
                  fontSize: '0.9rem',
                  lineHeight: 1.5,
                  outline: 'none',
                  resize: 'vertical'
                }}
              />
              <div style={{ fontSize: '0.72rem', color: '#64748b', marginTop: '6px' }}>
                {inputText.length} characters entered
              </div>
            </div>
          ) : (
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Choose PDF from Library:
              </label>
              {documents.length === 0 ? (
                <div style={{ padding: '16px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', fontSize: '0.84rem', color: '#94a3b8' }}>
                  No documents found in library. Please upload a PDF first!
                </div>
              ) : (
                <select
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                  style={{
                    width: '100%',
                    background: '#090f1d',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '10px',
                    padding: '12px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                >
                  <option value="">-- Choose a document --</option>
                  {documents.map(d => (
                    <option key={d.id} value={d.id}>
                      {d.title} ({d.pagesCount || 1} pages)
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="gradient-btn-primary"
            style={{ width: '100%', padding: '12px' }}
          >
            {generating ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Synthesizing Summary...
              </>
            ) : (
              <>
                <Sparkles size={18} />
                Generate {summaryModes.find(m => m.id === summaryType)?.label}
              </>
            )}
          </button>
        </div>

        {/* Right: Summary Output */}
        <div className="glass-panel" style={{ padding: '24px', minHeight: '440px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              {currentSummary?.title || 'Synthesized Summary'}
            </h3>

            {currentSummary && (
              <button
                onClick={copyToClipboard}
                className="gradient-btn-secondary"
                style={{ padding: '6px 12px', fontSize: '0.78rem' }}
              >
                {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            )}
          </div>

          <div style={{ flex: 1 }}>
            {generating ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#94a3b8' }}>
                <Loader2 size={36} className="animate-spin" style={{ margin: '0 auto 14px', color: '#38bdf8' }} />
                Preserving core meaning and structuring academic takeaways...
              </div>
            ) : currentSummary ? (
              <div className="prose-dark" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.65, fontSize: '0.92rem' }}>
                {currentSummary.content}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '70px 20px', color: '#64748b' }}>
                <FileText size={42} style={{ margin: '0 auto 12px', opacity: 0.5 }} />
                <p style={{ fontSize: '0.9rem' }}>
                  Select your study content on the left and click Generate to view your tailored notes.
                </p>
              </div>
            )}
          </div>

          {/* Previous Summaries Drawer */}
          {savedSummaries.length > 0 && (
            <div style={{ marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '0.76rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', marginBottom: '8px' }}>
                Previously Generated ({savedSummaries.length})
              </div>
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
                {savedSummaries.slice(0, 5).map(s => (
                  <button
                    key={s.id}
                    onClick={() => setCurrentSummary(s)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.04)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '8px',
                      padding: '6px 10px',
                      color: '#cbd5e1',
                      fontSize: '0.74rem',
                      whiteSpace: 'nowrap',
                      cursor: 'pointer'
                    }}
                  >
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
