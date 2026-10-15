import React, { useState, useEffect } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight, RotateCcw, Trophy, Loader2 } from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getDocuments, getChunksByUser, saveQuiz, getQuizzes } from '../services/firestoreService';
import { generateQuiz } from '../services/gemini';

export default function QuizGeneratorPage() {
  const { user, incrementStreak } = useAuth();
  const { showToast } = useToast();
  const [step, setStep] = useState('config');
  const [sourceType, setSourceType] = useState('topic');
  const [topicInput, setTopicInput] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [documents, setDocuments] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([getDocuments(user.id), getQuizzes(user.id)]).then(([docs, quizzes]) => {
      setDocuments(docs);
      setHistory(quizzes.filter(q => q.lastAttempt));
    }).catch(() => {});
  }, [user?.id]);

  const handleStart = async () => {
    if (sourceType === 'topic' && !topicInput.trim()) { showToast('Enter a topic', 'error'); return; }
    if (sourceType === 'document' && !selectedDocId) { showToast('Select a document', 'error'); return; }
    setGenerating(true);
    try {
      let content = '';
      let topic = topicInput;
      if (sourceType === 'document') {
        const doc = documents.find(d => d.id === selectedDocId);
        topic = doc?.title || 'Study Material';
        const chunks = await getChunksByUser(user.id, selectedDocId);
        content = chunks.slice(0, 6).map(c => c.content).join('\n\n');
      }

      const generated = await generateQuiz({ text: content, topic, count: questionCount });
      const quizId = `qz_${Date.now()}`;
      const quizRecord = { id: quizId, topic: generated.topic, questions: generated.questions, totalQuestions: generated.questions.length, createdAt: new Date().toISOString() };
      await saveQuiz(user.id, quizRecord);
      setActiveQuiz(quizRecord);
      setSelectedAnswers({});
      setCurrentIdx(0);
      setStep('taking');
      showToast('Quiz ready! Answer and submit.', 'success');
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      let correct = 0;
      const review = activeQuiz.questions.map((q, idx) => {
        const studentChoice = selectedAnswers[idx] !== undefined ? selectedAnswers[idx] : null;
        const isCorrect = studentChoice === q.correctIndex;
        if (isCorrect) correct++;
        return { ...q, studentChoice, isCorrect };
      });
      const score = Math.round((correct / activeQuiz.questions.length) * 100);
      const result = { quizId: activeQuiz.id, topic: activeQuiz.topic, totalQuestions: activeQuiz.questions.length, correctCount: correct, scorePercentage: score, review, submittedAt: new Date().toISOString() };
      const updatedQuiz = { ...activeQuiz, lastAttempt: result, score };
      await saveQuiz(user.id, updatedQuiz);
      setQuizResult(result);
      setStep('result');
      incrementStreak('quizStreak');
      if (score >= 70) { confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } }); showToast(`Great job! ${score}%`, 'success'); }
      else showToast(`Completed! Score: ${score}%`, 'info');
    } catch (err) {
      showToast('Submit error: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#fff', margin: 0 }}>AI Quiz Generator</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '4px' }}>Powered by Google Gemini • Server-graded MCQs with explanations</p>
      </div>

      {/* CONFIG */}
      {step === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Configure Quiz</h3>
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Generate From:</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button onClick={() => setSourceType('topic')} className={sourceType === 'topic' ? 'gradient-btn-primary' : 'gradient-btn-secondary'} style={{ flex: 1, padding: '10px' }}>Topic / Subject</button>
                <button onClick={() => setSourceType('document')} className={sourceType === 'document' ? 'gradient-btn-primary' : 'gradient-btn-secondary'} style={{ flex: 1, padding: '10px' }}>Uploaded PDF</button>
              </div>
            </div>

            {sourceType === 'topic' ? (
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Topic:</label>
                <input type="text" placeholder="e.g. Photosynthesis, Newton's Laws, Data Structures" value={topicInput} onChange={e => setTopicInput(e.target.value)}
                  style={{ width: '100%', padding: '12px 16px', background: 'rgba(0,0,0,0.25)', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }} />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Select PDF:</label>
                {documents.length === 0 ? (
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255,255,255,0.04)', fontSize: '0.82rem', color: '#94a3b8' }}>No documents. Upload a PDF first!</div>
                ) : (
                  <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)}
                    style={{ width: '100%', padding: '12px 16px', background: '#090f1d', border: '1px solid var(--border-subtle)', borderRadius: '12px', color: '#fff', fontSize: '0.9rem', outline: 'none' }}>
                    <option value="">-- Select --</option>
                    {documents.map(d => <option key={d.id} value={d.id}>{d.title}</option>)}
                  </select>
                )}
              </div>
            )}

            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>Questions: {questionCount}</label>
              <input type="range" min="3" max="10" value={questionCount} onChange={e => setQuestionCount(parseInt(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                <span>3</span><span>5</span><span>10</span>
              </div>
            </div>

            <button onClick={handleStart} disabled={generating} className="gradient-btn-primary" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              {generating ? <><Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</> : <><Sparkles size={18} /> Start Quiz</>}
            </button>
          </div>

          {/* History */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="#f59e0b" /> Recent Attempts ({history.length})
            </h4>
            {history.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>No attempts yet. Complete a quiz!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.slice(0, 6).map((h, i) => (
                  <div key={i} style={{ padding: '10px 14px', borderRadius: '10px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc' }}>{h.topic}</div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>{h.totalQuestions} questions</div>
                    </div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 700, color: h.score >= 70 ? '#34d399' : '#f87171', background: h.score >= 70 ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', padding: '3px 10px', borderRadius: '9999px' }}>
                      {h.score}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAKING */}
      {step === 'taking' && activeQuiz && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>{activeQuiz.topic}</span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#fff', margin: '4px 0 0' }}>Question {currentIdx + 1} / {activeQuiz.totalQuestions}</h3>
            </div>
            <div style={{ fontSize: '0.84rem', color: '#cbd5e1', background: 'rgba(255,255,255,0.06)', padding: '6px 14px', borderRadius: '9999px' }}>
              Answered: {Object.keys(selectedAnswers).length} / {activeQuiz.totalQuestions}
            </div>
          </div>

          {(() => {
            const q = activeQuiz.questions[currentIdx];
            return (
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600, color: '#f8fafc', lineHeight: 1.5, padding: '18px', background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border-subtle)', borderRadius: '14px', marginBottom: '22px' }}>
                  {q.question}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {q.options.map((opt, i) => {
                    const sel = selectedAnswers[currentIdx] === i;
                    return (
                      <div key={i} onClick={() => setSelectedAnswers(prev => ({ ...prev, [currentIdx]: i }))}
                        style={{ padding: '14px 18px', borderRadius: '12px', background: sel ? 'rgba(37,99,235,0.25)' : 'rgba(255,255,255,0.03)', border: `1px solid ${sel ? '#38bdf8' : 'var(--border-subtle)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}>
                        <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: sel ? '#2563eb' : 'rgba(255,255,255,0.08)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.84rem', fontWeight: 700 }}>
                          {String.fromCharCode(65 + i)}
                        </div>
                        <span style={{ fontSize: '0.92rem', color: sel ? '#fff' : '#cbd5e1' }}>{opt}</span>
                      </div>
                    );
                  })}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button onClick={() => setCurrentIdx(p => Math.max(0, p - 1))} disabled={currentIdx === 0} className="gradient-btn-secondary" style={{ padding: '8px 18px', opacity: currentIdx === 0 ? 0.4 : 1 }}>Previous</button>
                  {currentIdx < activeQuiz.totalQuestions - 1 ? (
                    <button onClick={() => setCurrentIdx(p => p + 1)} className="gradient-btn-primary" style={{ padding: '8px 20px' }}>Next <ArrowRight size={16} /></button>
                  ) : (
                    <button onClick={handleSubmit} disabled={submitting} className="gradient-btn-primary" style={{ padding: '10px 24px', background: 'linear-gradient(135deg,#10b981,#059669)' }}>
                      {submitting ? <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /> Grading...</> : 'Submit Quiz'}
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* RESULT */}
      {step === 'result' && quizResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          <div className="glass-panel" style={{ padding: '32px', textAlign: 'center', background: 'linear-gradient(135deg,rgba(37,99,235,0.15),rgba(99,102,241,0.15))' }}>
            <Trophy size={48} color={quizResult.scorePercentage >= 70 ? '#f59e0b' : '#38bdf8'} style={{ margin: '0 auto 12px', display: 'block' }} />
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '4px' }}>Score: {quizResult.scorePercentage}%</h3>
            <p style={{ color: '#cbd5e1' }}>{quizResult.correctCount} / {quizResult.totalQuestions} correct</p>
            <button onClick={() => setStep('config')} className="gradient-btn-primary" style={{ marginTop: '18px', padding: '10px 24px' }}>
              <RotateCcw size={16} /> Try Again
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>Review & Explanations:</h4>
            {quizResult.review.map((item, idx) => (
              <div key={idx} className="glass-panel" style={{ padding: '20px', borderLeft: `4px solid ${item.isCorrect ? '#10b981' : '#ef4444'}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {item.isCorrect ? <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', fontWeight: 700 }}><CheckCircle2 size={16} /> Correct</span>
                    : <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', fontWeight: 700 }}><XCircle size={16} /> Incorrect</span>}
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Q{idx + 1}</span>
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '14px' }}>{item.question}</div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {item.options.map((opt, i) => {
                    const isCorrectOpt = i === item.correctIndex;
                    const isStudentPick = i === item.studentChoice;
                    let bg = 'rgba(255,255,255,0.02)', border = 'var(--border-subtle)', color = '#94a3b8';
                    if (isCorrectOpt) { bg = 'rgba(16,185,129,0.15)'; border = 'rgba(16,185,129,0.4)'; color = '#34d399'; }
                    else if (isStudentPick && !item.isCorrect) { bg = 'rgba(239,68,68,0.15)'; border = 'rgba(239,68,68,0.4)'; color = '#f87171'; }
                    return (
                      <div key={i} style={{ padding: '10px 14px', borderRadius: '8px', background: bg, border: `1px solid ${border}`, fontSize: '0.86rem', color, display: 'flex', justifyContent: 'space-between' }}>
                        <span>{String.fromCharCode(65 + i)}. {opt}</span>
                        {isCorrectOpt && <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>✓ Correct</span>}
                        {isStudentPick && !item.isCorrect && <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>✗ Your answer</span>}
                      </div>
                    );
                  })}
                </div>
                <div style={{ padding: '12px', borderRadius: '8px', background: 'rgba(59,130,246,0.08)', border: '1px solid rgba(59,130,246,0.2)', fontSize: '0.82rem', color: '#cbd5e1' }}>
                  <strong style={{ color: '#38bdf8' }}>Explanation: </strong>{item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
