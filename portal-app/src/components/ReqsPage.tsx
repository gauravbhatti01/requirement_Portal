'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useApp, STATUSES, STATUS_LABEL, PRIORITIES, PRI_LABEL, CATS, Requirement } from '@/lib/store';
import Badge from './Badge';
import styles from './ReqsPage.module.css';

interface ReqsPageProps {
  onEdit: (r: Requirement) => void;
}

export default function ReqsPage({ onEdit }: ReqsPageProps) {
  const { state, dispatch, isOverdue, fmtDate, clientById, initials } = useApp();
  const [q, setQ] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [fPriority, setFPriority] = useState('');
  const [fClient, setFClient] = useState('');
  const [fCat, setFCat] = useState('');

  let list = [...state.requirements];
  if (q) list = list.filter(r => `${r.title} ${r.desc} ${r.category} ${r.assignee} ${r.tags}`.toLowerCase().includes(q.toLowerCase()));
  if (fStatus) list = list.filter(r => r.status === fStatus);
  if (fPriority) list = list.filter(r => r.priority === fPriority);
  if (fClient) list = list.filter(r => r.clientId === parseInt(fClient));
  if (fCat) list = list.filter(r => r.category === fCat);

  return (
    <div className={styles.page}>
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.search} placeholder="Search requirements…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className={styles.sel} value={fStatus} onChange={e => setFStatus(e.target.value)}>
          <option value="">All Statuses</option>
          {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
        </select>
        <select className={styles.sel} value={fPriority} onChange={e => setFPriority(e.target.value)}>
          <option value="">All Priorities</option>
          {PRIORITIES.map(p => <option key={p} value={p}>{PRI_LABEL[p]}</option>)}
        </select>
        <select className={styles.sel} value={fClient} onChange={e => setFClient(e.target.value)}>
          <option value="">All Clients</option>
          {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className={styles.sel} value={fCat} onChange={e => setFCat(e.target.value)}>
          <option value="">All Categories</option>
          {CATS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Requirement</th><th>Client</th><th>Category</th><th>Qty</th>
              <th>Priority</th><th>Status</th><th>Progress</th><th>Due Date</th><th>Budget (₹)</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length ? list.map((r, i) => {
              const c = clientById(r.clientId);
              const od = isOverdue(r.dueDate) && r.status !== 'done';
              return (
                <motion.tr
                  key={r.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={od ? styles.overdueRow : ''}
                >
                  <td>
                    <div className={styles.reqTitle}>{r.title}</div>
                    <div className={styles.sub}>
                      {r.assignee ? `→ ${r.assignee}` : ''}
                      {r.tags ? ` · ${r.tags.split(',').slice(0,2).map(t => t.trim()).join(', ')}` : ''}
                    </div>
                  </td>
                  <td>
                    <div className={styles.clientCell}>
                      <div className={styles.avatar}>{initials(c?.name || '?')}</div>
                      <span className={styles.clientName}>{c?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className={styles.muted}>{r.category}</td>
                  <td>
                    <span className={styles.mono}>{r.qty}</span>
                    {r.unit && <span className={styles.unit}> {r.unit}</span>}
                  </td>
                  <td>{r.priority && <Badge variant={r.priority}>{PRI_LABEL[r.priority]}</Badge>}</td>
                  <td>
                    <select
                      className={styles.statusSel}
                      value={r.status}
                      onChange={e => dispatch({ type: 'QUICK_STATUS', id: r.id, status: e.target.value as Requirement['status'] })}
                    >
                      {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
                    </select>
                  </td>
                  <td>
                    <div className={styles.progWrap}>
                      <div className={styles.progBar}>
                        <motion.div
                          className={styles.progFill}
                          initial={{ width: 0 }}
                          animate={{ width: `${r.progress || 0}%` }}
                          transition={{ duration: 0.5, delay: 0.3 + i * 0.02 }}
                        />
                      </div>
                      <span className={`${styles.progPct} ${styles.mono}`}>{r.progress || 0}%</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ color: od ? '#ef4444' : '#585858', fontSize: 13 }}>{fmtDate(r.dueDate)}</div>
                    {od && <div className={styles.overdueTag}>OVERDUE</div>}
                  </td>
                  <td className={`${styles.mono} ${styles.budget}`}>₹{(r.budget || 0).toLocaleString('en-IN')}</td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => onEdit(r)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.del}`} onClick={() => {
                        if (confirm('Delete this requirement?')) dispatch({ type: 'DELETE_REQ', id: r.id });
                      }}>Del</button>
                    </div>
                  </td>
                </motion.tr>
              );
            }) : (
              <tr><td colSpan={10} className={styles.emptyCell}>No requirements match your filters.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
