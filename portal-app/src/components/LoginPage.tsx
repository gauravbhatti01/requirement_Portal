'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { signUp, logIn, signInWithGoogle, error, clearError } = useAuth();
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const switchMode = (m: 'login' | 'signup') => {
    clearError(); setMode(m);
    setName(''); setEmail(''); setPassword('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    if (mode === 'signup' && !name.trim()) return;
    setLoading(true);
    try {
      if (mode === 'signup') await signUp(email, password, name);
      else await logIn(email, password);
    } catch { /* error shown via context */ }
    finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    clearError();
    try { await signInWithGoogle(); }
    catch { /* error shown via context */ }
    finally { setGoogleLoading(false); }
  };

  return (
    <div className={styles.page}>
      <div className={styles.blob1} />
      <div className={styles.blob2} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        {/* Logo */}
        <div className={styles.logo}>
          <div className={styles.logoIcon}><Zap size={18} /></div>
          <div>
            <div className={styles.logoTitle}>ClientBase</div>
            <div className={styles.logoSub}>Requirements Portal</div>
          </div>
        </div>

        {/* Google Sign-in button */}
        <button className={styles.googleBtn} onClick={handleGoogle} disabled={googleLoading || loading}>
          {googleLoading ? (
            <Loader2 size={16} className={styles.spin} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          <span>{googleLoading ? 'Connecting…' : 'Continue with Google'}</span>
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <span>or</span>
        </div>

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`} onClick={() => switchMode('login')}>Log In</button>
          <button className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`} onClick={() => switchMode('signup')}>Sign Up</button>
          <motion.div
            className={styles.tabIndicator}
            animate={{ x: mode === 'login' ? 0 : '100%' }}
            transition={{ type: 'spring', bounce: 0.18, duration: 0.4 }}
          />
        </div>

        {/* Form */}
        <AnimatePresence mode="wait">
          <motion.form
            key={mode}
            onSubmit={handleSubmit}
            initial={{ opacity: 0, x: mode === 'login' ? -16 : 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: mode === 'login' ? 16 : -16 }}
            transition={{ duration: 0.2 }}
            className={styles.form}
          >
            {mode === 'signup' && (
              <div className={styles.field}>
                <label>Full Name</label>
                <input type="text" placeholder="Gaurav Bhatti" value={name}
                  onChange={e => setName(e.target.value)} required autoFocus />
              </div>
            )}

            <div className={styles.field}>
              <label>Email Address</label>
              <input type="email" placeholder="you@company.com" value={email}
                onChange={e => setEmail(e.target.value)} required autoFocus={mode === 'login'} />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.pwWrap}>
                <input type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div className={styles.error}
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className={styles.submitBtn} disabled={loading || googleLoading}>
              {loading
                ? <><Loader2 size={15} className={styles.spin} /> {mode === 'login' ? 'Logging in…' : 'Creating account…'}</>
                : mode === 'login' ? 'Log In' : 'Create Account'}
            </button>

            <p className={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" className={styles.switchLink}
                onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
                {mode === 'login' ? 'Sign Up' : 'Log In'}
              </button>
            </p>
          </motion.form>
        </AnimatePresence>

        <p className={styles.footer}>Your data is securely stored and private to your account.</p>
      </motion.div>
    </div>
  );
}
