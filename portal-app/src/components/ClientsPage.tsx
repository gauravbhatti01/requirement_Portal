'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useApp, Client, TIERS } from '@/lib/store';
import Badge from './Badge';
import styles from './ClientsPage.module.css';

interface ClientsPageProps {
  onView: (id: number) => void;
  onEdit: (c: Client) => void;
  onAddReqFor: (id: number) => void;
}

export default function ClientsPage({ onView, onEdit, onAddReqFor }: ClientsPageProps) {
  const { state, initials } = useApp();
  const [q, setQ] = useState('');
  const [sort, setSort] = useState('name');
  const [tier, setTier] = useState('');

  let list = [...state.clients];
  if (q) list = list.filter(c => `${c.name} ${c.contact} ${c.email} ${c.industry}`.toLowerCase().includes(q.toLowerCase()));
  if (tier) list = list.filter(c => c.tier === tier);
  if (sort === 'name') list.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === 'reqs') list.sort((a, b) => state.requirements.filter(r => r.clientId === b.id).length - state.requirements.filter(r => r.clientId === a.id).length);
  if (sort === 'budget') list.sort((a, b) => b.budget - a.budget);
  if (sort === 'date') list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className={styles.page}>
      {/* Filter bar */}
      <div className={styles.filterBar}>
        <div className={styles.searchWrap}>
          <Search size={14} className={styles.searchIcon} />
          <input className={styles.search} placeholder="Search by name, contact, industry…" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <select className={styles.sel} value={sort} onChange={e => setSort(e.target.value)}>
          <option value="name">Name A–Z</option>
          <option value="reqs">Most Requirements</option>
          <option value="budget">Highest Budget</option>
          <option value="date">Newest First</option>
        </select>
        <select className={styles.sel} value={tier} onChange={e => setTier(e.target.value)}>
          <option value="">All Tiers</option>
          {TIERS.map(t => <option key={t}>{t}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Client</th><th>Contact</th><th>Industry</th><th>Phone / Email</th>
              <th>Requirements</th><th>Budget (₹)</th><th>Tier</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {list.length ? list.map((c, i) => {
              const reqs = state.requirements.filter(r => r.clientId === c.id);
              const done = reqs.filter(r => r.status === 'done').length;
              return (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.04 }}
                >
                  <td>
                    <div className={styles.clientCell}>
                      <div className={styles.avatar}>{initials(c.name)}</div>
                      <div>
                        <div className={styles.clientName}>{c.name}</div>
                        <div className={styles.clientSub}>{c.company || c.industry || ''}</div>
                      </div>
                    </div>
                  </td>
                  <td className={styles.muted}>{c.contact || '—'}</td>
                  <td className={styles.muted}>{c.industry || '—'}</td>
                  <td>
                    <div>{c.phone || '—'}</div>
                    <div className={styles.clientSub}>{c.email || ''}</div>
                  </td>
                  <td>
                    <div className={styles.bold}>{reqs.length}</div>
                    <div className={styles.clientSub}>{done} done</div>
                  </td>
                  <td className={`${styles.bold} ${styles.mono}`}>₹{(c.budget || 0).toLocaleString('en-IN')}</td>
                  <td><Badge variant={c.tier.toLowerCase() as 'standard'|'premium'|'enterprise'}>{c.tier}</Badge></td>
                  <td>
                    <div className={styles.actions}>
                      <button className={styles.actionBtn} onClick={() => onView(c.id)}>View</button>
                      <button className={styles.actionBtn} onClick={() => onEdit(c)}>Edit</button>
                      <button className={`${styles.actionBtn} ${styles.green}`} onClick={() => onAddReqFor(c.id)}>+ Req</button>
                    </div>
                  </td>
                </motion.tr>
              );
            }) : (
              <tr><td colSpan={8} className={styles.emptyCell}>No clients found. Add your first client to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
