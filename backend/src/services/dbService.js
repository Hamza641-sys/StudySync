const fs = require('fs');
const path = require('path');
const { firestoreDb, isFirebaseActive } = require('../config/firebase');

const DATA_DIR = path.join(__dirname, '../../data');
const DATA_FILE = path.join(DATA_DIR, 'store.json');

// Ensure local data dir exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const defaultState = {
  users: {},
  documents: {},
  chunks: {},
  conversations: {},
  messages: {},
  summaries: {},
  quizzes: {},
};

function readLocalStore() {
  try {
    if (!fs.existsSync(DATA_FILE)) {
      fs.writeFileSync(DATA_FILE, JSON.stringify(defaultState, null, 2));
      return JSON.parse(JSON.stringify(defaultState));
    }
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    console.error('[DB] Error reading store.json, reinitializing default:', err.message);
    return JSON.parse(JSON.stringify(defaultState));
  }
}

function writeLocalStore(data) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8');
  } catch (err) {
    console.error('[DB] Error writing to store.json:', err.message);
  }
}

const dbService = {
  // 1. User Profiles
  async getUser(userId) {
    if (isFirebaseActive()) {
      const doc = await firestoreDb.collection('users').doc(userId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    }
    const store = readLocalStore();
    return store.users[userId] || null;
  },

  async saveUser(user) {
    if (isFirebaseActive()) {
      await firestoreDb.collection('users').doc(user.id).set(user, { merge: true });
      return user;
    }
    const store = readLocalStore();
    store.users[user.id] = { ...store.users[user.id], ...user, updatedAt: new Date().toISOString() };
    writeLocalStore(store);
    return store.users[user.id];
  },

  // 2. Documents (Per-user isolation)
  async getDocuments(userId) {
    if (isFirebaseActive()) {
      const snap = await firestoreDb.collection('documents').where('userId', '==', userId).get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const store = readLocalStore();
    return Object.values(store.documents).filter(doc => doc.userId === userId);
  },

  async getDocumentById(userId, documentId) {
    if (isFirebaseActive()) {
      const doc = await firestoreDb.collection('documents').doc(documentId).get();
      if (!doc.exists) return null;
      const data = doc.data();
      if (data.userId !== userId) return null; // strictly isolate
      return { id: doc.id, ...data };
    }
    const store = readLocalStore();
    const doc = store.documents[documentId];
    if (doc && doc.userId === userId) {
      return doc;
    }
    return null;
  },

  async saveDocument(userId, document) {
    const docData = {
      ...document,
      userId,
      updatedAt: new Date().toISOString()
    };
    if (isFirebaseActive()) {
      await firestoreDb.collection('documents').doc(document.id).set(docData, { merge: true });
      return docData;
    }
    const store = readLocalStore();
    store.documents[document.id] = docData;
    writeLocalStore(store);
    return docData;
  },

  async deleteDocument(userId, documentId) {
    if (isFirebaseActive()) {
      const doc = await this.getDocumentById(userId, documentId);
      if (!doc) return false;
      await firestoreDb.collection('documents').doc(documentId).delete();
      // Also delete chunks
      const chunkSnap = await firestoreDb.collection('chunks').where('documentId', '==', documentId).get();
      const batch = firestoreDb.batch();
      chunkSnap.forEach(d => batch.delete(d.ref));
      await batch.commit();
      return true;
    }
    const store = readLocalStore();
    const doc = store.documents[documentId];
    if (!doc || doc.userId !== userId) return false;
    delete store.documents[documentId];
    // Delete associated chunks
    for (const chunkId in store.chunks) {
      if (store.chunks[chunkId].documentId === documentId) {
        delete store.chunks[chunkId];
      }
    }
    writeLocalStore(store);
    return true;
  },

  // 3. Document Chunks & Embeddings
  async saveChunks(userId, documentId, chunks) {
    if (isFirebaseActive()) {
      const batch = firestoreDb.batch();
      chunks.forEach(chunk => {
        const ref = firestoreDb.collection('chunks').doc(chunk.id);
        batch.set(ref, { ...chunk, userId, documentId });
      });
      await batch.commit();
      return chunks;
    }
    const store = readLocalStore();
    chunks.forEach(chunk => {
      store.chunks[chunk.id] = { ...chunk, userId, documentId };
    });
    writeLocalStore(store);
    return chunks;
  },

  async getChunksByUser(userId, documentId = null) {
    if (isFirebaseActive()) {
      let query = firestoreDb.collection('chunks').where('userId', '==', userId);
      if (documentId) {
        query = query.where('documentId', '==', documentId);
      }
      const snap = await query.get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const store = readLocalStore();
    return Object.values(store.chunks).filter(chunk => {
      if (chunk.userId !== userId) return false;
      if (documentId && chunk.documentId !== documentId) return false;
      return true;
    });
  },

  // 4. Chat Conversations & Messages
  async getConversations(userId) {
    if (isFirebaseActive()) {
      const snap = await firestoreDb.collection('conversations')
        .where('userId', '==', userId)
        .orderBy('updatedAt', 'desc')
        .get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const store = readLocalStore();
    return Object.values(store.conversations)
      .filter(c => c.userId === userId)
      .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  },

  async saveConversation(userId, conversation) {
    const data = {
      ...conversation,
      userId,
      updatedAt: new Date().toISOString()
    };
    if (isFirebaseActive()) {
      await firestoreDb.collection('conversations').doc(conversation.id).set(data, { merge: true });
      return data;
    }
    const store = readLocalStore();
    store.conversations[conversation.id] = data;
    writeLocalStore(store);
    return data;
  },

  async getMessages(userId, conversationId) {
    if (isFirebaseActive()) {
      const snap = await firestoreDb.collection('messages')
        .where('conversationId', '==', conversationId)
        .where('userId', '==', userId)
        .orderBy('timestamp', 'asc')
        .get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const store = readLocalStore();
    return Object.values(store.messages)
      .filter(m => m.conversationId === conversationId && m.userId === userId)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp));
  },

  async saveMessage(userId, message) {
    const data = {
      ...message,
      userId,
      timestamp: message.timestamp || new Date().toISOString()
    };
    if (isFirebaseActive()) {
      await firestoreDb.collection('messages').doc(message.id).set(data);
      return data;
    }
    const store = readLocalStore();
    store.messages[message.id] = data;
    writeLocalStore(store);
    return data;
  },

  // 5. Saved Summaries
  async getSummaries(userId) {
    if (isFirebaseActive()) {
      const snap = await firestoreDb.collection('summaries')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const store = readLocalStore();
    return Object.values(store.summaries)
      .filter(s => s.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async saveSummary(userId, summary) {
    const data = {
      ...summary,
      userId,
      createdAt: summary.createdAt || new Date().toISOString()
    };
    if (isFirebaseActive()) {
      await firestoreDb.collection('summaries').doc(summary.id).set(data);
      return data;
    }
    const store = readLocalStore();
    store.summaries[summary.id] = data;
    writeLocalStore(store);
    return data;
  },

  // 6. Quizzes & Attempts
  async getQuizzes(userId) {
    if (isFirebaseActive()) {
      const snap = await firestoreDb.collection('quizzes')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
    const store = readLocalStore();
    return Object.values(store.quizzes)
      .filter(q => q.userId === userId)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  },

  async saveQuiz(userId, quiz) {
    const data = {
      ...quiz,
      userId,
      createdAt: quiz.createdAt || new Date().toISOString()
    };
    if (isFirebaseActive()) {
      await firestoreDb.collection('quizzes').doc(quiz.id).set(data);
      return data;
    }
    const store = readLocalStore();
    store.quizzes[quiz.id] = data;
    writeLocalStore(store);
    return data;
  },

  async getQuizById(userId, quizId) {
    if (isFirebaseActive()) {
      const doc = await firestoreDb.collection('quizzes').doc(quizId).get();
      if (!doc.exists) return null;
      const data = doc.data();
      if (data.userId !== userId) return null;
      return { id: doc.id, ...data };
    }
    const store = readLocalStore();
    const quiz = store.quizzes[quizId];
    if (quiz && quiz.userId === userId) return quiz;
    return null;
  }
};

module.exports = dbService;
