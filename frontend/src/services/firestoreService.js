import {
  collection, doc, getDoc, getDocs, setDoc, deleteDoc,
  query, where, orderBy, addDoc, serverTimestamp, updateDoc
} from 'firebase/firestore';
import { db } from './firebase';

// ─── Users ────────────────────────────────────────────────────────────────────
export async function getUser(userId) {
  const snap = await getDoc(doc(db, 'users', userId));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
}

export async function saveUser(user) {
  await setDoc(doc(db, 'users', user.id), { ...user, updatedAt: new Date().toISOString() }, { merge: true });
  return user;
}

// ─── Documents ────────────────────────────────────────────────────────────────
export async function getDocuments(userId) {
  const q = query(collection(db, 'documents'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function getDocumentById(userId, docId) {
  const snap = await getDoc(doc(db, 'documents', docId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.userId === userId ? { id: snap.id, ...data } : null;
}

export async function saveDocument(userId, document) {
  const data = { ...document, userId, updatedAt: new Date().toISOString() };
  await setDoc(doc(db, 'documents', document.id), data, { merge: true });
  return data;
}

export async function deleteDocument(userId, docId) {
  const existing = await getDocumentById(userId, docId);
  if (!existing) return false;
  await deleteDoc(doc(db, 'documents', docId));
  // Delete associated chunks
  const chunksQ = query(collection(db, 'chunks'), where('documentId', '==', docId));
  const chunksSnap = await getDocs(chunksQ);
  await Promise.all(chunksSnap.docs.map(d => deleteDoc(d.ref)));
  return true;
}

// ─── Chunks ───────────────────────────────────────────────────────────────────
export async function saveChunks(userId, documentId, chunks) {
  await Promise.all(
    chunks.map(chunk =>
      setDoc(doc(db, 'chunks', chunk.id), { ...chunk, userId, documentId })
    )
  );
  return chunks;
}

export async function getChunksByUser(userId, documentId = null) {
  let q;
  if (documentId) {
    q = query(collection(db, 'chunks'), where('userId', '==', userId), where('documentId', '==', documentId));
  } else {
    q = query(collection(db, 'chunks'), where('userId', '==', userId));
  }
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

// ─── Conversations ────────────────────────────────────────────────────────────
export async function getConversations(userId) {
  const q = query(collection(db, 'conversations'), where('userId', '==', userId), orderBy('updatedAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveConversation(userId, conversation) {
  const data = { ...conversation, userId, updatedAt: new Date().toISOString() };
  await setDoc(doc(db, 'conversations', conversation.id), data, { merge: true });
  return data;
}

export async function getMessages(userId, conversationId) {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    where('userId', '==', userId),
    orderBy('timestamp', 'asc')
  );
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveMessage(userId, message) {
  const data = { ...message, userId, timestamp: message.timestamp || new Date().toISOString() };
  await setDoc(doc(db, 'messages', message.id), data);
  return data;
}

// ─── Summaries ────────────────────────────────────────────────────────────────
export async function getSummaries(userId) {
  const q = query(collection(db, 'summaries'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveSummary(userId, summary) {
  const data = { ...summary, userId, createdAt: summary.createdAt || new Date().toISOString() };
  await setDoc(doc(db, 'summaries', summary.id), data);
  return data;
}

// ─── Quizzes ──────────────────────────────────────────────────────────────────
export async function getQuizzes(userId) {
  const q = query(collection(db, 'quizzes'), where('userId', '==', userId), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map(d => ({ id: d.id, ...d.data() }));
}

export async function saveQuiz(userId, quiz) {
  const data = { ...quiz, userId, createdAt: quiz.createdAt || new Date().toISOString() };
  await setDoc(doc(db, 'quizzes', quiz.id), data, { merge: true });
  return data;
}

export async function getQuizById(userId, quizId) {
  const snap = await getDoc(doc(db, 'quizzes', quizId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return data.userId === userId ? { id: snap.id, ...data } : null;
}
