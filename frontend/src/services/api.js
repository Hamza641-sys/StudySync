// StudySync Pro Frontend API Service Layer

const BASE_URL = '/api';

function getAuthHeaders() {
  const token = localStorage.getItem('studysync_token') || 'demo_student_token';
  const userStr = localStorage.getItem('studysync_user');
  let user = null;
  try {
    user = userStr ? JSON.parse(userStr) : null;
  } catch (e) {}

  return {
    'Authorization': `Bearer ${token}`,
    'x-user-id': user?.id || 'usr_demo_student',
    'x-user-name': user?.name || 'Roshan Student',
    'x-user-email': user?.email || 'roshan@studysync.edu'
  };
}

export const api = {
  // Auth
  async login(email, password, userId) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, userId })
    });
    return res.json();
  },

  async register(name, email, password) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password })
    });
    return res.json();
  },

  async getProfile() {
    const res = await fetch(`${BASE_URL}/auth/profile`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async updateStreak(streakType) {
    const res = await fetch(`${BASE_URL}/auth/streaks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ streakType })
    });
    return res.json();
  },

  // Documents
  async getDocuments() {
    const res = await fetch(`${BASE_URL}/documents`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async uploadPDF(formData) {
    const headers = getAuthHeaders();
    // note: do NOT set Content-Type header when sending FormData; browser sets multipart/form-data boundary automatically!
    const res = await fetch(`${BASE_URL}/documents/upload`, {
      method: 'POST',
      headers: {
        'Authorization': headers['Authorization'],
        'x-user-id': headers['x-user-id'],
        'x-user-name': headers['x-user-name'],
        'x-user-email': headers['x-user-email']
      },
      body: formData
    });
    return res.json();
  },

  async deleteDocument(id) {
    const res = await fetch(`${BASE_URL}/documents/${id}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // RAG Query
  async queryRAG(question, documentId) {
    const res = await fetch(`${BASE_URL}/rag/query`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ question, documentId })
    });
    return res.json();
  },

  // AI Tutor Chat
  async getConversations() {
    const res = await fetch(`${BASE_URL}/chat/conversations`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async createConversation(title) {
    const res = await fetch(`${BASE_URL}/chat/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ title })
    });
    return res.json();
  },

  async getMessages(conversationId) {
    const res = await fetch(`${BASE_URL}/chat/conversations/${conversationId}/messages`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async sendMessage(conversationId, message, context) {
    const res = await fetch(`${BASE_URL}/chat/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ message, context })
    });
    return res.json();
  },

  // Summaries
  async generateSummary(payload) {
    const res = await fetch(`${BASE_URL}/summaries/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async getSummaries() {
    const res = await fetch(`${BASE_URL}/summaries`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // Quizzes
  async generateQuiz(payload) {
    const res = await fetch(`${BASE_URL}/quizzes/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify(payload)
    });
    return res.json();
  },

  async submitQuiz(quizId, answers) {
    const res = await fetch(`${BASE_URL}/quizzes/submit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      },
      body: JSON.stringify({ quizId, answers })
    });
    return res.json();
  },

  async getQuizHistory() {
    const res = await fetch(`${BASE_URL}/quizzes/history`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  // AI Evaluation Benchmark (Module 10)
  async getEvaluationQuestions() {
    const res = await fetch(`${BASE_URL}/evaluation/questions`, {
      headers: getAuthHeaders()
    });
    return res.json();
  },

  async runEvaluationBenchmark() {
    const res = await fetch(`${BASE_URL}/evaluation/benchmark`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...getAuthHeaders()
      }
    });
    return res.json();
  },

  // Health
  async getHealth() {
    const res = await fetch(`${BASE_URL}/health`);
    return res.json();
  }
};
