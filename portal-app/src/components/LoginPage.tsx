'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Zap, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import styles from './LoginPage.module.css';

export default function LoginPage() {
  const { signUp, logIn, error, clearError } = useAuth();
  const [mode, setMode]         = useState<'login' | 'signup'>('login');
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [loading, setLoading]   = useState(false);

  const switchMode = (m: 'login' | 'signup') => {
    clearError();
    setMode(m);
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
    } catch {
      // error shown via context
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      {/* Background glow blobs */}
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

        {/* Tab switcher */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${mode === 'login' ? styles.tabActive : ''}`}
            onClick={() => switchMode('login')}
          >
            Log In
          </button>
          <button
            className={`${styles.tab} ${mode === 'signup' ? styles.tabActive : ''}`}
            onClick={() => switchMode('signup')}
          >
            Sign Up
          </button>
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
                <input
                  type="text"
                  placeholder="Gaurav Bhatti"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            )}

            <div className={styles.field}>
              <label>Email Address</label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus={mode === 'login'}
              />
            </div>

            <div className={styles.field}>
              <label>Password</label>
              <div className={styles.pwWrap}>
                <input
                  type={showPw ? 'text' : 'password'}
                  placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button type="button" className={styles.eyeBtn} onClick={() => setShowPw(v => !v)}>
                  {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Error */}
            <AnimatePresence>
              {error && (
                <motion.div
                  className={styles.error}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <AlertCircle size={14} />
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <button type="submit" className={styles.submitBtn} disabled={loading}>
              {loading ? (
                <><Loader2 size={15} className={styles.spin} /> {mode === 'login' ? 'Logging in…' : 'Creating account…'}</>
              ) : (
                mode === 'login' ? 'Log In' : 'Create Account'
              )}
            </button>

            <p className={styles.switchText}>
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button type="button" className={styles.switchLink} onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}>
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
