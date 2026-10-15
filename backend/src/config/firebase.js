const admin = require('firebase-admin');
const config = require('./env');

let firebaseApp = null;
let firestoreDb = null;
let firebaseAuth = null;

try {
  if (config.FIREBASE.projectId && config.FIREBASE.clientEmail && config.FIREBASE.privateKey) {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.FIREBASE.projectId,
        clientEmail: config.FIREBASE.clientEmail,
        privateKey: config.FIREBASE.privateKey,
      }),
    });
    firestoreDb = admin.firestore();
    firebaseAuth = admin.auth();
    console.log('[Firebase] Connected to Firebase Admin SDK successfully.');
  } else {
    console.log('[Firebase] Running in Local Persistent Mode (Firebase credentials not set in .env). Data is securely persisted with per-user isolation.');
  }
} catch (error) {
  console.warn('[Firebase] Init notice:', error.message);
}

module.exports = {
  admin,
  firebaseApp,
  firestoreDb,
  firebaseAuth,
  isFirebaseActive: () => Boolean(firestoreDb && firebaseAuth),
};
