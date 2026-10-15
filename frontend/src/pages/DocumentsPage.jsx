import React, { useState, useEffect, useRef } from 'react';
import { UploadCloud, FileText, Trash2, Search, Bot, HelpCircle, Loader2, Clock } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDocuments, saveDocument, deleteDocument, saveChunks } from '../services/firestoreService';
import { extractTextFromPDF, chunkDocument } from '../services/pdfService';

export default function DocumentsPage({ setActivePage }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const fileInputRef = useRef(null);

  const fetchDocs = async () => {
    if (!user?.id) return;
    try {
      const docs = await getDocuments(user.id);
      setDocuments(docs);
    } catch (err) {
      showToast('Could not load documents', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDocs(); }, [user?.id]);

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.pdf')) { showToast('Only PDF files are allowed!', 'error'); return; }
    if (file.size > 15 * 1024 * 1024) { showToast('File size exceeds 15MB limit', 'error'); return; }

    setUploading(true);
    showToast('Processing PDF & generating chunks...', 'info');

    try {
      const docId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      const title = file.name.replace(/\.pdf$/i, '');

      // Extract text from PDF in browser
      const parsed = await extractTextFromPDF(file);

      // Chunk document
      const chunks = chunkDocument(docId, title, parsed.pages);

      const docRecord = {
        id: docId,
        userId: user.id,
        title,
        fileName: file.name,
        fileSize: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        pagesCount: parsed.numpages,
        chunksCount: chunks.length,
        uploadDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        createdAt: new Date().toISOString(),
        status: 'ready',
      };

      await saveDocument(user.id, docRecord);
      await saveChunks(user.id, docId, chunks);

      showToast(`"${title}" indexed for RAG! (${chunks.length} chunks)`, 'success');
      fetchDocs();
    } catch (err) {
      showToast('Upload error: ' + err.message, 'error');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleDelete = async (docId, title) => {
    if (!window.confirm(`Remove "${title}" and its RAG chunks?`)) return;
    try {
      await deleteDocument(user.id, docId);
      showToast('Document deleted', 'success');
      setDocuments(prev => prev.filter(d => d.id !== docId));
    } catch (err) {
      showToast('Delete error: ' + err.message, 'error');
    }
  };

  const filtered = documents.filter(d =>
    (d.title || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>My Library</h2>
          <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '4px' }}>Upload PDF study material — auto indexed into RAG vector store</p>
        </div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleUpload} accept=".pdf,application/pdf" style={{ display: 'none' }} />
          <button onClick={() => fileInputRef.current?.click()} disabled={uploading} className="gradient-btn-primary" style={{ padding: '10px 22px' }}>
            {uploading ? <><Loader2 size={18} className="animate-spin" /> Indexing...</> : <><UploadCloud size={18} /> Upload PDF</>}
          </button>
        </div>
      </div>

      {/* Drop Zone */}
      <div onClick={() => fileInputRef.current?.click()}
        style={{ border: '2px dashed rgba(59,130,246,0.4)', borderRadius: '16px', padding: '36px 20px', textAlign: 'center', background: 'rgba(59,130,246,0.04)', cursor: 'pointer', transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.background = 'rgba(59,130,246,0.08)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(59,130,246,0.4)'; e.currentTarget.style.background = 'rgba(59,130,246,0.04)'; }}>
        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'rgba(59,130,246,0.15)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
          <UploadCloud size={28} />
        </div>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>Click to upload PDF study material</h3>
        <p style={{ fontSize: '0.82rem', color: '#94a3b8' }}>Supports PDF up to 15MB • Auto text extraction & RAG chunking</p>
      </div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <Search size={18} color="#64748b" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)' }} />
        <input type="text" placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '12px 18px 12px 46px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '14px', color: '#f8fafc', fontSize: '0.9rem', outline: 'none' }} />
      </div>

      {/* Documents Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>
          <Loader2 size={32} style={{ margin: '0 auto 12px', display: 'block', animation: 'spin 1s linear infinite' }} />
          Loading your library...
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-panel" style={{ textAlign: 'center', padding: '50px 20px' }}>
          <FileText size={40} color="#64748b" style={{ margin: '0 auto 14px', display: 'block' }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', marginBottom: '6px' }}>No documents yet</h4>
          <p style={{ color: '#94a3b8', fontSize: '0.88rem' }}>Upload your first PDF to enable AI question answering.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
          {filtered.map(doc => (
            <div key={doc.id} className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(239,68,68,0.15)', color: '#f87171', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} />
                  </div>
                  <span style={{ fontSize: '0.72rem', padding: '3px 8px', borderRadius: '9999px', background: 'rgba(16,185,129,0.15)', color: '#34d399', fontWeight: 600 }}>
                    RAG Ready
                  </span>
                </div>
                <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '6px', lineHeight: 1.4 }}>{doc.title}</h4>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', fontSize: '0.76rem', color: '#94a3b8', marginBottom: '16px' }}>
                  <span>{doc.pagesCount || 1} pages</span>
                  <span>•</span>
                  <span>{doc.chunksCount || 0} chunks</span>
                  <span>•</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} />{doc.uploadDate || 'Recent'}</span>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '14px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setActivePage('tutor')} className="gradient-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    <Bot size={14} /> Ask AI
                  </button>
                  <button onClick={() => setActivePage('quizzes')} className="gradient-btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }}>
                    <HelpCircle size={14} /> Quiz
                  </button>
                </div>
                <button onClick={() => handleDelete(doc.id, doc.title)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: '6px', borderRadius: '8px', transition: 'color 0.2s' }}
                  onMouseEnter={e => e.currentTarget.style.color = '#ef4444'}
                  onMouseLeave={e => e.currentTarget.style.color = '#64748b'}>
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
