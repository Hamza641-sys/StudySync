import React, { useState, useEffect, useRef } from 'react';
import { 
  UploadCloud, 
  FileText, 
  Trash2, 
  Search, 
  HelpCircle, 
  Bot, 
  Sparkles, 
  CheckCircle, 
  AlertCircle,
  Loader2,
  Clock
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function DocumentsPage({ setActivePage }) {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const fetchDocuments = async () => {
    try {
      const res = await api.getDocuments();
      if (res.success && res.documents) {
        setDocuments(res.documents);
      }
    } catch (err) {
      showToast('Could not load documents: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [user?.id]);

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf') && file.type !== 'application/pdf') {
      showToast('Only PDF documents are allowed!', 'error');
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      showToast('File size exceeds the 15MB limit.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    showToast('Uploading PDF & generating RAG chunk embeddings...', 'info');

    try {
      const res = await api.uploadPDF(formData);
      if (res.success) {
        showToast(`Document "${res.document.title}" processed & indexed for RAG!`, 'success');
        fetchDocuments();
      } else {
        showToast(res.error || 'Failed to process PDF', 'error');
      }
    } catch (err) {
      showToast('Upload error: ' + err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Are you sure you want to remove "${title}" and its RAG embeddings?`)) return;

    try {
      const res = await api.deleteDocument(docId);
      if (res.success) {
        showToast('Document deleted successfully', 'success');
        setDocuments(prev => prev.filter(d => d.id !== docId));
      } else {
        showToast(res.error || 'Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Error deleting document: ' + err.message, 'error');
    }
  };

  const filteredDocs = documents.filter(d =>
    (d.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (d.fileName || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', margin: 0 }}>
            My Library & Documents
          </h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>
            Upload syllabus, textbook chapters, or lecture notes. Chunks are automatically indexed into the RAG vector store.
          </p>
        </div>

        <div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".pdf,application/pdf"
            style={{ display: 'none' }}
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            className="gradient-btn-primary"
            style={{ padding: '10px 22px' }}
          >
            {uploading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Parsing & Indexing...
              </>
            ) : (
              <>
                <UploadCloud size={18} />
                Upload PDF
              </>
            )}
          </button>
        </div>
      </div>

      {/* Drag & Drop Upload Banner */}
      <div
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: '2px dashed rgba(59, 130, 246, 0.4)',
          borderRadius: '16px',
          padding: '36px 20px',
          textAlign: 'center',
          background: 'rgba(59, 130, 246, 0.04)',
          cursor: 'pointer',
          transition: 'all 0.2s ease'
        }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = '#38bdf8';
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.08)';
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.04)';
        }}
      >
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          background: 'rgba(59, 130, 246, 0.15)',
          color: '#38bdf8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 14px'
        }}>
          <UploadCloud size={28} />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
          Click or drop PDF study material here
        </h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>
          Supports PDF documents up to 15MB &bull; Automatic text extraction & RAG vector chunking
        </p>
      </div>

      {/* Search Bar matching Screenshot 2 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px' }} />
        <input
          type="text"
          placeholder="Search PDFs by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 18px 12px 46px',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            color: '#f8fafc',
            fontSize: '0.9rem',
            outline: 'none'
          }}
        />
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <Loader2 size={32} className="animate-spin" style={{ margin: '0 auto 12px' }} />
          Loading your document library...
        </div>
      ) : filteredDocs.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FileText size={40} color="#64748b" style={{ margin: '0 auto 14px' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>
            No documents found
          </h4>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem', maxWidth: '420px', margin: '0 auto 18px' }}>
            Upload your lecture slides, textbooks, or syllabus to enable AI question answering and quiz generation.
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '20px'
        }}>
          {filteredDocs.map(doc => (
            <div key={doc.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    color: '#f87171',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <FileText size={22} />
                  </div>

                  <span style={{
                    fontSize: '0.72rem',
                    padding: '3px 8px',
                    borderRadius: '9999px',
                    background: doc.status === 'ready' || !doc.status ? 'rgba(16, 185, 129, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                    color: doc.status === 'ready' || !doc.status ? '#34d399' : '#fbbf24',
                    fontWeight: 600
                  }}>
                    {doc.status === 'ready' || !doc.status ? 'Indexed (RAG Ready)' : 'Processing'}
                  </span>
                </div>

                <h4 style={{
                  fontSize: '1rem',
                  fontWeight: 700,
                  color: '#f8fafc',
                  marginBottom: '6px',
                  lineHeight: 1.4,
                  wordBreak: 'break-word'
                }}>
                  {doc.title}
                </h4>

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '16px' }}>
                  <span>{doc.pagesCount || 1} pages</span>
                  <span>&bull;</span>
                  <span>{doc.chunksCount ? `${doc.chunksCount} chunks` : 'Indexed'}</span>
                  <span>&bull;</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Clock size={12} />
                    {doc.uploadDate || 'Recent'}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '14px',
                borderTop: '1px solid var(--border-subtle)'
              }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setActivePage('tutor')}
                    className="gradient-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    title="Ask AI Tutor from this document"
                  >
                    <Bot size={14} />
                    Ask AI
                  </button>
                  <button
                    onClick={() => setActivePage('quizzes')}
                    className="gradient-btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.78rem' }}
                    title="Generate MCQ Quiz from this PDF"
                  >
                    <HelpCircle size={14} />
                    Quiz
                  </button>
                </div>

                <button
                  onClick={() => handleDelete(doc.id, doc.title)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#64748b',
                    cursor: 'pointer',
                    padding: '6px',
                    borderRadius: '8px',
                    transition: 'color 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
