'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import styles from './Toast.module.css';

interface ToastProps {
  message: string;
  visible: boolean;
}

export default function Toast({ message, visible }: ToastProps) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={styles.toast}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 8, scale: 0.96 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
        >
          <span className={styles.dot} />
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function useToast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const [timer, setTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  const show = (message: string) => {
    if (timer) clearTimeout(timer);
    setMsg(message);
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 2800);
    setTimer(t);
  };

  useEffect(() => () => { if (timer) clearTimeout(timer); }, [timer]);

  return { msg, visible, show };
}
