import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
} from 'firebase/auth';
import { auth } from '../services/firebase';
import { getUser, saveUser } from '../services/firestoreService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setFirebaseUser(fbUser);
        // Load full profile from Firestore
        let profile = await getUser(fbUser.uid);
        if (!profile) {
          profile = {
            id: fbUser.uid,
            name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Student',
            email: fbUser.email,
            level: 1,
            xp: 0,
            xpMax: 150,
            streaks: { visitStreak: 1, quizStreak: 0, reviewStreak: 0 },
            createdAt: new Date().toISOString(),
          };
          await saveUser(profile);
        }
        setUser(profile);
      } else {
        setFirebaseUser(null);
        setUser(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const register = async (name, email, password) => {
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const profile = {
        id: cred.user.uid,
        name,
        email,
        level: 1,
        xp: 0,
        xpMax: 150,
        streaks: { visitStreak: 1, quizStreak: 0, reviewStreak: 0 },
        createdAt: new Date().toISOString(),
      };
      await saveUser(profile);
      setUser(profile);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setFirebaseUser(null);
  };

  const incrementStreak = async (streakType) => {
    if (!user) return;
    const updated = {
      ...user,
      xp: Math.min((user.xp || 0) + 15, user.xpMax || 150),
      streaks: {
        ...user.streaks,
        [streakType]: (user.streaks?.[streakType] || 0) + 1,
      },
    };
    if (updated.xp >= updated.xpMax) {
      updated.level = (updated.level || 1) + 1;
      updated.xp = updated.xp - updated.xpMax;
    }
    setUser(updated);
    await saveUser(updated);
  };

  // Demo student switcher for testing isolation
  const switchDemoStudent = (name, email, id) => {
    const demo = {
      id,
      name,
      email,
      level: 1,
      xp: 20,
      xpMax: 150,
      streaks: { visitStreak: 1, quizStreak: 0, reviewStreak: 0 },
      isDemo: true,
    };
    setUser(demo);
  };

  return (
    <AuthContext.Provider value={{
      user,
      firebaseUser,
      loading,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      incrementStreak,
      switchDemoStudent,
    }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
