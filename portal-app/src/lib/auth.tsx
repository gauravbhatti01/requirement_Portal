'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  sendEmailVerification,
  User,
} from 'firebase/auth';
import { auth } from './firebase';

const googleProvider = new GoogleAuthProvider();

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  logIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInAsGuest: () => Promise<void>;
  logOut: () => Promise<void>;
  resendVerification: () => Promise<void>;
  reloadUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser]       = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u && typeof window !== 'undefined' && sessionStorage.getItem('guestMode') === 'true') {
        setUser({ uid: 'guest', displayName: 'Guest', email: 'guest@local' } as any);
      } else {
        setUser(u);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    setError(null);
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      await sendEmailVerification(cred.user);
      setUser(cred.user);
    } catch (e: any) {
      setError(friendlyError(e.code));
      throw e;
    }
  };

  const logIn = async (email: string, password: string) => {
    setError(null);
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (e: any) {
      setError(friendlyError(e.code));
      throw e;
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (e: any) {
      if (e.code !== 'auth/popup-closed-by-user') {
        setError(friendlyError(e.code));
      }
      throw e;
    }
  };

  const signInAsGuest = async () => {
    setError(null);
    try {
      await signInAnonymously(auth);
    } catch (e: any) {
      console.warn("Anonymous auth failed, falling back to local guest mode", e);
      if (typeof window !== 'undefined') sessionStorage.setItem('guestMode', 'true');
      setUser({ uid: 'guest', displayName: 'Guest', email: 'guest@local' } as any);
    }
  };

  const logOut = async () => {
    if (typeof window !== 'undefined') sessionStorage.removeItem('guestMode');
    setUser(null);
    await signOut(auth);
  };

  const resendVerification = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
    }
  };

  const reloadUser = async () => {
    if (auth.currentUser) {
      await auth.currentUser.reload();
      setUser(Object.create(auth.currentUser));
    }
  };

  const clearError = () => setError(null);


  return (
    <AuthContext.Provider value={{ user, loading, signUp, logIn, signInWithGoogle, signInAsGuest, logOut, resendVerification, reloadUser, error, clearError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be inside AuthProvider');
  return ctx;
}

function friendlyError(code: string): string {
  switch (code) {
    case 'auth/email-already-in-use':    return 'This email is already registered. Try logging in.';
    case 'auth/invalid-email':           return 'Please enter a valid email address.';
    case 'auth/weak-password':           return 'Password must be at least 6 characters.';
    case 'auth/user-not-found':          return 'No account found with this email.';
    case 'auth/wrong-password':          return 'Incorrect password. Please try again.';
    case 'auth/invalid-credential':      return 'Invalid email or password.';
    case 'auth/too-many-requests':       return 'Too many attempts. Please try again later.';
    case 'auth/network-request-failed':  return 'Network error. Check your connection.';
    default:                             return 'Something went wrong. Please try again.';
  }
}
