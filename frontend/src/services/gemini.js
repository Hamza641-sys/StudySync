import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

let genAI = null;
if (GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
}

function sanitize(text) {
  if (typeof text !== 'string') return '';
  return text.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '').trim();
}

// ─── AI Tutor Chat ────────────────────────────────────────────────────────────
export async function generateTutorResponse({ prompt, history = [], context = '' }) {
  const cleanPrompt = sanitize(prompt);

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const systemInstruction = `You are StudySync AI Tutor, an intelligent, empathetic academic learning assistant.
Explain concepts clearly with intuitive analogies, step-by-step breakdowns, and practical code or formula examples where applicable.
Use markdown formatting (bolding, lists, code blocks with languages, and LaTeX formulas like $E=mc^2$).
If context is provided from uploaded study materials, prioritize it and refer to it accurately.`;

      const historyFormatted = history.slice(-6).map(m => ({
        role: m.sender === 'user' ? 'user' : 'model',
        parts: [{ text: m.text || '' }]
      }));

      const chat = model.startChat({
        history: historyFormatted,
        systemInstruction,
      });

      const userMessage = context
        ? `Context from uploaded study material:\n"""\n${context}\n"""\n\nStudent Question: ${cleanPrompt}`
        : cleanPrompt;

      const result = await chat.sendMessage(userMessage);
      return {
        answer: result.response.text(),
        provider: 'gemini-1.5-flash',
      };
    } catch (err) {
      console.warn('[Gemini] Tutor call failed, using local engine:', err.message);
    }
  }

  return { answer: generateLocalTutorAnswer(cleanPrompt), provider: 'local-engine' };
}

// ─── RAG Grounded Answer ──────────────────────────────────────────────────────
export async function generateRAGAnswer({ question, relevantChunks }) {
  const cleanQuestion = sanitize(question);

  if (!relevantChunks || relevantChunks.length === 0) {
    return {
      answer: 'Maaf kijiye, aapke uploaded documents mein is sawaal ka jawab nahi mila. Pehle koi PDF upload karein.',
      sources: [],
      grounded: false,
    };
  }

  const contextText = relevantChunks
    .map((c, i) => `[Source ${i + 1} | Document: "${c.documentTitle}" | Page: ${c.pageNumber}]\n${c.content}`)
    .join('\n\n');

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `You are a strict, hallucination-free academic RAG assistant for StudySync Pro.
Answer the student's question ONLY using the provided document excerpts below.
STRICT RULES:
1. Ground your answer completely in the retrieved excerpts.
2. If the excerpts do not contain sufficient information, clearly state: "Uploaded documents mein is sawaal ka mukammal jawab nahi mila."
3. Cite the document title and page number when stating key facts.
4. Keep explanations clear and structured with markdown headings and bullet points.

Retrieved Document Excerpts:
${contextText}

Student Question: ${cleanQuestion}

Please provide a grounded answer with citations.`;

      const result = await model.generateContent(prompt);
      const sources = relevantChunks.map(c => ({
        id: c.id,
        documentTitle: c.documentTitle,
        pageNumber: c.pageNumber,
        excerpt: c.content.slice(0, 180) + '...',
        relevanceScore: c.score,
      }));

      return { answer: result.response.text(), sources, grounded: true, provider: 'gemini-1.5-flash' };
    } catch (err) {
      console.warn('[Gemini] RAG call failed, using local engine:', err.message);
    }
  }

  // Local fallback
  const topChunk = relevantChunks[0];
  const sources = relevantChunks.map(c => ({
    id: c.id,
    documentTitle: c.documentTitle,
    pageNumber: c.pageNumber,
    excerpt: c.content.slice(0, 160) + '...',
    relevanceScore: c.score,
  }));
  return {
    answer: `Based on **"${topChunk.documentTitle}"** (Page ${topChunk.pageNumber}):\n\n${topChunk.content.slice(0, 500)}...`,
    sources,
    grounded: true,
    provider: 'local-rag-engine',
  };
}

// ─── Summarizer ───────────────────────────────────────────────────────────────
export async function generateSummary({ text, summaryType = 'detailed', documentTitle = 'Document' }) {
  const cleanText = sanitize(text).slice(0, 15000);

  const typePrompts = {
    short: 'Create a concise executive summary (3-4 sentences) capturing the core essence.',
    detailed: 'Create a detailed, structured academic summary with section headings and thorough explanations.',
    key_points: 'Extract the most crucial key points as clean, high-impact bullet points.',
    definitions: 'Extract all important technical terms in a Glossary format (Term: Definition).',
    revision_notes: 'Format as high-yield quick revision exam notes with memory tips.',
  };

  const instruction = typePrompts[summaryType] || typePrompts.detailed;

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `You are an expert academic summarizer for StudySync Pro.
Instruction: ${instruction}
Document: "${documentTitle}"
Content:
${cleanText}`;

      const result = await model.generateContent(prompt);
      return { summary: result.response.text(), type: summaryType, provider: 'gemini-1.5-flash' };
    } catch (err) {
      console.warn('[Gemini] Summary call failed, using local:', err.message);
    }
  }

  return { summary: generateLocalSummary(cleanText, summaryType, documentTitle), type: summaryType, provider: 'local-engine' };
}

// ─── Quiz Generator ───────────────────────────────────────────────────────────
export async function generateQuiz({ text, topic, count = 5 }) {
  const cleanText = sanitize(text || topic || '').slice(0, 10000);
  const questionCount = Math.min(Math.max(count, 3), 10);

  if (genAI) {
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

      const prompt = `Generate an academic multiple-choice quiz with exactly ${questionCount} questions based on this study content.
Topic: "${topic || 'Academic Material'}"
Content:
${cleanText}

Respond ONLY with a valid JSON array. No markdown, no code blocks, pure JSON:
[
  {
    "id": "q1",
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctIndex": 0,
    "explanation": "Why this answer is correct."
  }
]`;

      const result = await model.generateContent(prompt);
      let raw = result.response.text().trim();
      raw = raw.replace(/^```json/i, '').replace(/^```/i, '').replace(/```$/i, '').trim();
      const parsed = JSON.parse(raw);

      return { topic: topic || 'Study Quiz', questions: parsed, provider: 'gemini-1.5-flash' };
    } catch (err) {
      console.warn('[Gemini] Quiz call failed, using local:', err.message);
    }
  }

  return generateLocalQuiz(topic, questionCount);
}

// ─── Local Fallback Engines ───────────────────────────────────────────────────
function generateLocalTutorAnswer(prompt) {
  const p = prompt.toLowerCase();

  if (p.includes('photosynthesis')) {
    return `### Photosynthesis 🌱\n\n**Photosynthesis** converts light energy into chemical energy in glucose.\n\n$$6CO_2 + 6H_2O \\xrightarrow{\\text{Light}} C_6H_{12}O_6 + 6O_2$$\n\n**Stages:**\n- Light-Dependent Reactions (Thylakoids): Produce ATP & NADPH\n- Calvin Cycle (Stroma): Converts CO₂ into glucose`;
  }
  if (p.includes('newton') || p.includes('motion')) {
    return `### Newton's Laws of Motion 🚀\n\n1. **Inertia:** Object stays at rest or motion unless acted on by force\n2. **F = ma:** Force equals mass times acceleration\n3. **Action-Reaction:** Every action has equal and opposite reaction`;
  }
  if (p.includes('algorithm') || p.includes('complexity') || p.includes('data structure')) {
    return `### Data Structures & Complexity ⚡\n\n| Structure | Search | Insert | Delete |\n|-----------|--------|--------|--------|\n| Array | O(n) | O(n) | O(n) |\n| Hash Table | O(1) avg | O(1) avg | O(1) avg |\n| BST | O(log n) | O(log n) | O(log n) |`;
  }

  return `### Academic Response for: "${prompt}"\n\n**Core Concept Analysis:**\nThis topic involves understanding foundational principles and their practical applications.\n\n**Key Points:**\n- Review the theoretical framework\n- Apply step-by-step methodology\n- Test understanding with practice problems\n\n> Add your Gemini API key for detailed AI-powered responses!`;
}

function generateLocalSummary(text, type, title) {
  const sentences = text.split(/(?<=[.?!])\s+/).filter(s => s.trim().length > 15);
  const firstFew = sentences.slice(0, 3).join(' ');

  if (type === 'short') return `### Executive Summary: ${title}\n\n${firstFew || text.slice(0, 250)}...\n\n*Add Gemini API key for detailed AI summaries.*`;
  if (type === 'key_points') return `### Key Points: ${title}\n\n${sentences.slice(0, 5).map((s, i) => `• **Point ${i + 1}:** ${s}`).join('\n\n')}`;
  if (type === 'definitions') return `### Definitions: ${title}\n\n${sentences.slice(0, 4).map((s, i) => `**Term ${i + 1}:** ${s}`).join('\n\n')}`;
  if (type === 'revision_notes') return `### Revision Notes: ${title}\n\n⚡ **Key Facts:**\n${sentences.slice(0, 4).map(s => `- ${s}`).join('\n')}`;
  return `### Summary: ${title}\n\n${firstFew}\n\n${sentences.slice(3, 7).map(s => `- ${s}`).join('\n')}`;
}

function generateLocalQuiz(topic, count) {
  const t = topic || 'Academic Subject';
  const questions = [
    { id: 'q1', question: `What is the primary principle of ${t}?`, options: ['Systematic theoretical framework', 'Random processes only', 'Elimination of variables', 'No structured method'], correctIndex: 0, explanation: `${t} is based on structured theoretical frameworks.` },
    { id: 'q2', question: `Which approach best applies to studying ${t}?`, options: ['Skip baseline testing', 'Isolate variables and cross-reference', 'Ignore error margins', 'Avoid documentation'], correctIndex: 1, explanation: 'Scientific rigor requires isolating variables and grounding findings in evidence.' },
    { id: 'q3', question: `What metric best evaluates ${t} outcomes?`, options: ['Subjective preference', 'Quantitative error rates and precision', 'Lines of unverified text', 'Single-run execution'], correctIndex: 1, explanation: 'Quantitative metrics provide objective evaluation.' },
    { id: 'q4', question: `When applying core theorems of ${t} to complex problems, the expected outcome is:`, options: ['Non-deterministic failure', 'Systematic decomposition into sub-problems', 'Loss of modularity', 'Algorithm divergence'], correctIndex: 1, explanation: 'Core theorems facilitate systematic problem decomposition.' },
    { id: 'q5', question: `What is crucial for mastering ${t}?`, options: ['Memorizing without understanding', 'Understanding concepts and practicing application', 'Skipping foundational topics', 'Avoiding examples'], correctIndex: 1, explanation: 'Deep understanding combined with practice is key to mastery.' },
  ];
  return { topic: t, questions: questions.slice(0, count), provider: 'local-quiz-engine' };
}
