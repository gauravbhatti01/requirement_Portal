'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp, STATUSES, STATUS_LABEL, STATUS_COLOR, PRIORITIES, PRI_LABEL, PRI_COLOR, Requirement } from '@/lib/store';
import styles from './KanbanPage.module.css';

interface KanbanPageProps {
  onEditReq: (r: Requirement) => void;
}

export default function KanbanPage({ onEditReq }: KanbanPageProps) {
  const { state, isOverdue, fmtDate, clientById, daysUntil } = useApp();
  const [fClient, setFClient] = useState('');
  const [fPriority, setFPriority] = useState('');

  let list = [...state.requirements];
  if (fClient) list = list.filter(r => r.clientId === parseInt(fClient));
  if (fPriority) list = list.filter(r => r.priority === fPriority);

  return (
    <div className={styles.page}>
      <div className={styles.filterBar}>
        <select className={styles.sel} value={fClient} onChange={e => setFClient(e.target.value)}>
          <option value="">All Clients</option>
          {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className={styles.sel} value={fPriority} onChange={e => setFPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{PRI_LABEL[p]}</option>)}
        </select>
      </div>

      <div className={styles.board}>
        {STATUSES.map(status => {
          const cards = list.filter(r => r.status === status);
          return (
            <div key={status} className={styles.column}>
              <div className={styles.colHead}>
                <div className={styles.colTitle}>
                  <span className={styles.colDot} style={{ background: STATUS_COLOR[status] }} />
                  {STATUS_LABEL[status]}
                </div>
                <span className={styles.colCount}>{cards.length}</span>
              </div>
              <div className={styles.cards}>
                {cards.length ? cards.map((r, i) => {
                  const c = clientById(r.clientId);
                  const od = isOverdue(r.dueDate);
                  const d = daysUntil(r.dueDate);
                  return (
                    <motion.div
                      key={r.id}
                      className={styles.card}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ y: -2, transition: { duration: 0.15 } }}
                      onClick={() => onEditReq(r)}
                    >
                      {r.priority && (
                        <div className={styles.cardPriBar} style={{ background: PRI_COLOR[r.priority] }} />
                      )}
                      <div className={styles.cardTitle}>{r.title}</div>
                      <div className={styles.cardClient}>
                        {c?.name} · {r.qty}{r.unit ? ` ${r.unit}` : ''}
                      </div>
                      {r.priority && (
                        <div className={styles.priChip} style={{ color: PRI_COLOR[r.priority], borderColor: `${PRI_COLOR[r.priority]}30`, background: `${PRI_COLOR[r.priority]}10` }}>
                          {PRI_LABEL[r.priority]}
                        </div>
                      )}
                      {r.dueDate && (
                        <div className={styles.cardFooter}>
                          <span style={{ color: od ? '#ef4444' : '#3a3a3a', fontSize: 11 }}>{fmtDate(r.dueDate)}</span>
                          {od ? <span className={styles.overduePill}>OVERDUE</span> : d !== null && d <= 3 ? <span className={styles.soonPill}>Soon</span> : null}
                        </div>
                      )}
                      {r.progress > 0 && (
                        <div className={styles.progBar}>
                          <motion.div
                            className={styles.progFill}
                            initial={{ width: 0 }}
                            animate={{ width: `${r.progress}%` }}
                            transition={{ duration: 0.5, delay: 0.3 }}
                          />
                        </div>
                      )}
                    </motion.div>
                  );
                }) : (
                  <div className={styles.emptyCol}>empty</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
