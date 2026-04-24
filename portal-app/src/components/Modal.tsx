'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import styles from './Modal.module.css';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
}

export default function Modal({ open, onClose, children, width = 580 }: ModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className={styles.backdrop}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={e => e.target === e.currentTarget && onClose()}
        >
          <motion.div
            className={styles.modal}
            style={{ maxWidth: width }}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function ModalHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className={styles.header}>
      <h2 className={styles.title}>{title}</h2>
      <button className={styles.closeBtn} onClick={onClose} aria-label="Close">
        <X size={16} />
      </button>
    </div>
  );
}
