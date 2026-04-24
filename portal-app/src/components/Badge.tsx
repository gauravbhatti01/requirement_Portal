'use client';

import styles from './Badge.module.css';

type BadgeVariant = 'open'|'progress'|'review'|'done'|'hold'|'critical'|'high'|'medium'|'low'|'standard'|'premium'|'enterprise';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
}

export default function Badge({ variant, children }: BadgeProps) {
  return (
    <span className={`${styles.badge} ${styles[variant]}`}>
      <span className={styles.dot} />
      {children}
    </span>
  );
}
