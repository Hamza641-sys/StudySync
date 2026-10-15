import React, { useState, useEffect } from 'react';
import { 
  HelpCircle, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  RotateCcw, 
  Trophy, 
  BookOpen, 
  Loader2,
  Clock
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function QuizGeneratorPage() {
  const { user, incrementStreak } = useAuth();
  const { showToast } = useToast();

  const [step, setStep] = useState('config'); // 'config' | 'taking' | 'result'
  const [sourceType, setSourceType] = useState('topic'); // 'topic' | 'document'
  const [topicInput, setTopicInput] = useState('');
  const [selectedDocId, setSelectedDocId] = useState('');
  const [questionCount, setQuestionCount] = useState(5);
  const [documents, setDocuments] = useState([]);
  const [generating, setGenerating] = useState(false);

  // Active quiz state
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { [questionIndex]: optionIndex }
  const [submitting, setSubmitting] = useState(false);
  const [quizResult, setQuizResult] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    async function loadInitial() {
      try {
        const [docsRes, histRes] = await Promise.all([
          api.getDocuments(),
          api.getQuizHistory()
        ]);
        if (docsRes.success && docsRes.documents) setDocuments(docsRes.documents);
        if (histRes.success && histRes.history) setHistory(histRes.history);
      } catch (e) {}
    }
    loadInitial();
  }, [user?.id]);

  const handleStartQuiz = async () => {
    if (sourceType === 'topic' && !topicInput.trim()) {
      showToast('Please enter a quiz topic (e.g., Photosynthesis, Newton Laws, Data Structures)', 'error');
      return;
    }
    if (sourceType === 'document' && !selectedDocId) {
      showToast('Please select a PDF document from your library', 'error');
      return;
    }

    setGenerating(true);
    try {
      const payload = {
        topic: sourceType === 'topic' ? topicInput : '',
        documentId: sourceType === 'document' ? selectedDocId : null,
        count: questionCount
      };

      const res = await api.generateQuiz(payload);
      if (res.success && res.quiz) {
        setActiveQuiz(res.quiz);
        setSelectedAnswers({});
        setCurrentQuestionIndex(0);
        setStep('taking');
        showToast('Quiz generated! Answer the questions and submit for grading.', 'success');
      } else {
        showToast(res.error || 'Failed to generate quiz', 'error');
      }
    } catch (err) {
      showToast('Error: ' + err.message, 'error');
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectOption = (optionIndex) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [currentQuestionIndex]: optionIndex
    }));
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    try {
      const res = await api.submitQuiz(activeQuiz.id, selectedAnswers);
      if (res.success && res.result) {
        setQuizResult(res.result);
        setStep('result');
        incrementStreak('quizStreak');

        if (res.result.scorePercentage >= 70) {
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
          });
          showToast(`Outstanding! Score: ${res.result.scorePercentage}%`, 'success');
        } else {
          showToast(`Completed! Score: ${res.result.scorePercentage}%`, 'info');
        }

        // Refresh history
        const histRes = await api.getQuizHistory();
        if (histRes.success) setHistory(histRes.history);
      } else {
        showToast(res.error || 'Submission failed', 'error');
      }
    } catch (err) {
      showToast('Error submitting: ' + err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '26px' }}>
      {/* Header */}
      <div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, fontFamily: 'var(--font-heading)', color: '#ffffff', margin: 0 }}>
          AI Quiz & MCQ Generator
        </h2>
        <p style={{ color: '#94a3b8', fontSize: '0.92rem', marginTop: '4px' }}>
          Test your comprehension with grounded 4-option multiple-choice questions, server-side grading, and deep explanations.
        </p>
      </div>

      {/* STATE 1: CONFIGURATION */}
      {step === 'config' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '24px', alignItems: 'start' }}>
          <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Configure Quiz Parameters
            </h3>

            {/* Source Selection */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Generate Quiz From:
              </label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setSourceType('topic')}
                  className={sourceType === 'topic' ? 'gradient-btn-primary' : 'gradient-btn-secondary'}
                  style={{ flex: 1, padding: '10px' }}
                >
                  Specific Topic / Subject
                </button>
                <button
                  type="button"
                  onClick={() => setSourceType('document')}
                  className={sourceType === 'document' ? 'gradient-btn-primary' : 'gradient-btn-secondary'}
                  style={{ flex: 1, padding: '10px' }}
                >
                  Uploaded PDF Document
                </button>
              </div>
            </div>

            {sourceType === 'topic' ? (
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Topic Name or Keyword:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Photosynthesis, Cellular Respiration, Operating Systems Deadlocks"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'rgba(0, 0, 0, 0.25)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: '12px',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    outline: 'none'
                  }}
                />
              </div>
            ) : (
              <div>
                <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  Select PDF Document:
                </label>
                {documents.length === 0 ? (
                  <div style={{ padding: '14px', borderRadius: '10px', background: 'rgba(255, 255, 255, 0.04)', fontSize: '0.82rem', color: '#94a3b8' }}>
                    No documents uploaded yet. Switch to Topic or upload a PDF first!
                  </div>
                ) : (
                  <select
                    value={selectedDocId}
                    onChange={(e) => setSelectedDocId(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: '#090f1d',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: '12px',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none'
                    }}
                  >
                    <option value="">-- Choose a document --</option>
                    {documents.map(d => (
                      <option key={d.id} value={d.id}>{d.title} ({d.pagesCount || 1} pages)</option>
                    ))}
                  </select>
                )}
              </div>
            )}

            {/* Question count */}
            <div>
              <label style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                Number of MCQs: {questionCount}
              </label>
              <input
                type="range"
                min="3"
                max="10"
                value={questionCount}
                onChange={(e) => setQuestionCount(parseInt(e.target.value, 10))}
                style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#64748b' }}>
                <span>3 questions</span>
                <span>5 questions</span>
                <span>10 questions</span>
              </div>
            </div>

            <button
              onClick={handleStartQuiz}
              disabled={generating}
              className="gradient-btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '1rem' }}
            >
              {generating ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Generating Grounded Questions...
                </>
              ) : (
                <>
                  <Sparkles size={18} />
                  Start Interactive Quiz
                </>
              )}
            </button>
          </div>

          {/* Past Quiz History Panel */}
          <div className="glass-panel" style={{ padding: '24px' }}>
            <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#f8fafc', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy size={18} color="#f59e0b" />
              Recent Quiz Attempts ({history.length})
            </h4>

            {history.length === 0 ? (
              <p style={{ fontSize: '0.82rem', color: '#64748b' }}>
                No completed quiz attempts yet. Complete a quiz to track your mastery scores!
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {history.slice(0, 6).map((h, i) => (
                  <div
                    key={i}
                    style={{
                      padding: '10px 14px',
                      borderRadius: '10px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      border: '1px solid var(--border-subtle)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#f8fafc' }}>
                        {h.topic}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>
                        {h.totalQuestions} questions
                      </div>
                    </div>

                    <div style={{
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      color: h.score >= 70 ? '#34d399' : '#f87171',
                      background: h.score >= 70 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                      padding: '3px 10px',
                      borderRadius: '9999px'
                    }}>
                      {h.score !== null ? `${h.score}%` : 'In Progress'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* STATE 2: TAKING QUIZ */}
      {step === 'taking' && activeQuiz && (
        <div className="glass-panel" style={{ padding: '32px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          {/* Quiz Progress Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.78rem', color: '#38bdf8', fontWeight: 700, textTransform: 'uppercase' }}>
                Topic: {activeQuiz.topic}
              </span>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#ffffff', margin: '4px 0 0' }}>
                Question {currentQuestionIndex + 1} of {activeQuiz.totalQuestions}
              </h3>
            </div>

            <div style={{
              fontSize: '0.84rem',
              color: '#cbd5e1',
              background: 'rgba(255, 255, 255, 0.06)',
              padding: '6px 14px',
              borderRadius: '9999px'
            }}>
              Answered: {Object.keys(selectedAnswers).length} / {activeQuiz.totalQuestions}
            </div>
          </div>

          {/* Question Text */}
          {(() => {
            const currentQ = activeQuiz.questions[currentQuestionIndex];
            const currentChoice = selectedAnswers[currentQuestionIndex];

            return (
              <div>
                <div style={{
                  fontSize: '1.1rem',
                  fontWeight: 600,
                  color: '#f8fafc',
                  lineHeight: 1.5,
                  padding: '18px',
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '14px',
                  marginBottom: '22px'
                }}>
                  {currentQ.question}
                </div>

                {/* 4 Answer Options */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '28px' }}>
                  {currentQ.options.map((opt, optIdx) => {
                    const isSelected = currentChoice === optIdx;
                    return (
                      <div
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        style={{
                          padding: '14px 18px',
                          borderRadius: '12px',
                          background: isSelected ? 'rgba(37, 99, 235, 0.25)' : 'rgba(255, 255, 255, 0.03)',
                          border: `1px solid ${isSelected ? '#38bdf8' : 'var(--border-subtle)'}`,
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '14px',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '50%',
                          background: isSelected ? '#2563eb' : 'rgba(255, 255, 255, 0.08)',
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.84rem',
                          fontWeight: 700
                        }}>
                          {String.fromCharCode(65 + optIdx)}
                        </div>
                        <span style={{ fontSize: '0.92rem', color: isSelected ? '#ffffff' : '#cbd5e1' }}>
                          {opt}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Navigation & Submit */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '16px', borderTop: '1px solid var(--border-subtle)' }}>
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentQuestionIndex === 0}
                    className="gradient-btn-secondary"
                    style={{ padding: '8px 18px', opacity: currentQuestionIndex === 0 ? 0.4 : 1 }}
                  >
                    Previous
                  </button>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    {currentQuestionIndex < activeQuiz.totalQuestions - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                        className="gradient-btn-primary"
                        style={{ padding: '8px 20px' }}
                      >
                        Next Question
                        <ArrowRight size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        disabled={submitting}
                        className="gradient-btn-primary"
                        style={{ padding: '10px 24px', background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)' }}
                      >
                        {submitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            Grading Answers...
                          </>
                        ) : (
                          'Submit Quiz for Grading'
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* STATE 3: RESULTS & EXPLANATIONS */}
      {step === 'result' && quizResult && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', maxWidth: '850px', margin: '0 auto', width: '100%' }}>
          {/* Result Banner */}
          <div className="glass-panel" style={{
            padding: '32px',
            textAlign: 'center',
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.15) 0%, rgba(99, 102, 241, 0.15) 100%)'
          }}>
            <Trophy size={48} color={quizResult.scorePercentage >= 70 ? '#f59e0b' : '#38bdf8'} style={{ margin: '0 auto 12px' }} />
            <h3 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#ffffff', marginBottom: '4px' }}>
              Quiz Completed: {quizResult.scorePercentage}%
            </h3>
            <p style={{ color: '#cbd5e1', fontSize: '0.95rem' }}>
              You answered <strong>{quizResult.correctCount}</strong> out of <strong>{quizResult.totalQuestions}</strong> questions correctly.
            </p>

            <button
              onClick={() => setStep('config')}
              className="gradient-btn-primary"
              style={{ marginTop: '18px', padding: '10px 24px' }}
            >
              <RotateCcw size={16} />
              Take Another Quiz
            </button>
          </div>

          {/* Question Breakdown with Explanations */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f8fafc', margin: 0 }}>
              Question Review & Explanations:
            </h4>

            {quizResult.review.map((item, idx) => (
              <div
                key={idx}
                className="glass-panel"
                style={{
                  padding: '20px',
                  borderLeft: `4px solid ${item.isCorrect ? '#10b981' : '#ef4444'}`
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                  {item.isCorrect ? (
                    <span style={{ color: '#34d399', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', fontWeight: 700 }}>
                      <CheckCircle2 size={16} /> Correct (+1)
                    </span>
                  ) : (
                    <span style={{ color: '#f87171', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.84rem', fontWeight: 700 }}>
                      <XCircle size={16} /> Incorrect
                    </span>
                  )}
                  <span style={{ color: '#64748b', fontSize: '0.78rem' }}>Question {idx + 1}</span>
                </div>

                <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '14px' }}>
                  {item.question}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '14px' }}>
                  {item.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === item.correctIndex;
                    const isStudentPick = optIdx === item.studentChoice;

                    let bg = 'rgba(255, 255, 255, 0.02)';
                    let border = 'var(--border-subtle)';
                    let color = '#94a3b8';

                    if (isCorrect) {
                      bg = 'rgba(16, 185, 129, 0.15)';
                      border = 'rgba(16, 185, 129, 0.4)';
                      color = '#34d399';
                    } else if (isStudentPick && !item.isCorrect) {
                      bg = 'rgba(239, 68, 68, 0.15)';
                      border = 'rgba(239, 68, 68, 0.4)';
                      color = '#f87171';
                    }

                    return (
                      <div
                        key={optIdx}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: bg,
                          border: `1px solid ${border}`,
                          fontSize: '0.86rem',
                          color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between'
                        }}
                      >
                        <span>{String.fromCharCode(65 + optIdx)}. {opt}</span>
                        {isCorrect && <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Correct Answer</span>}
                        {isStudentPick && !isCorrect && <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>Your Answer</span>}
                      </div>
                    );
                  })}
                </div>

                <div style={{
                  padding: '12px',
                  borderRadius: '8px',
                  background: 'rgba(59, 130, 246, 0.08)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  fontSize: '0.82rem',
                  color: '#cbd5e1'
                }}>
                  <strong style={{ color: '#38bdf8' }}>Explanation: </strong>
                  {item.explanation}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
