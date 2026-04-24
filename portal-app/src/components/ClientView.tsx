'use client';

import Modal, { ModalHeader } from './Modal';
import { useApp } from '@/lib/store';
import Badge from './Badge';
import styles from './ClientView.module.css';
import fStyles from './Form.module.css';

interface ClientViewProps {
  open: boolean;
  clientId: number | null;
  onClose: () => void;
  onEdit: () => void;
  onAddReq: () => void;
  onDelete: () => void;
}

export default function ClientView({ open, clientId, onClose, onEdit, onAddReq, onDelete }: ClientViewProps) {
  const { state, clientById, reqsForClient, initials, fmtDate } = useApp();
  if (!clientId) return null;
  const c = clientById(clientId);
  if (!c) return null;
  const reqs = reqsForClient(clientId);
  const done = reqs.filter(r => r.status === 'done').length;
  const totBudget = reqs.reduce((s, r) => s + r.budget, 0);

  const handleDelete = () => {
    if (!confirm('Delete this client and all their requirements?')) return;
    onDelete();
  };

  return (
    <Modal open={open} onClose={onClose} width={580}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.bigAvatar}>{initials(c.name)}</div>
          <div>
            <div className={styles.clientName}>{c.name}</div>
            <div className={styles.clientMeta}>{c.contact || ''}{c.industry ? ` · ${c.industry}` : ''}</div>
          </div>
        </div>
        <button className={styles.closeBtn} onClick={onClose}>✕</button>
      </div>

      <div className={styles.grid}>
        {[
          { label: 'Email', val: c.email || '—' },
          { label: 'Phone', val: c.phone || '—' },
          { label: 'GSTIN', val: c.gstin || '—', mono: true },
          { label: 'Address', val: c.address || '—' },
          { label: 'Client Budget', val: `₹${(c.budget || 0).toLocaleString('en-IN')}` },
          { label: 'Tier', badge: c.tier },
          { label: 'Requirements', val: `${reqs.length} total · ${done} done` },
          { label: 'Req. Budget', val: `₹${totBudget.toLocaleString('en-IN')}` },
        ].map(item => (
          <div key={item.label} className={styles.gridItem}>
            <div className={styles.itemLabel}>{item.label}</div>
            {item.badge ? (
              <Badge variant={item.badge.toLowerCase() as 'standard'|'premium'|'enterprise'}>{item.badge}</Badge>
            ) : (
              <div className={`${styles.itemVal} ${item.mono ? styles.mono : ''}`}>{item.val}</div>
            )}
          </div>
        ))}
      </div>

      {c.tags && (
        <div className={styles.tags}>
          {c.tags.split(',').map(t => (
            <span key={t} className={styles.tag}>{t.trim()}</span>
          ))}
        </div>
      )}

      {c.notes && (
        <div className={styles.notes}>{c.notes}</div>
      )}

      <div className={styles.reqsSection}>
        <div className={styles.reqsSectionTitle}>Requirements</div>
        {reqs.length ? reqs.map(r => (
          <div key={r.id} className={styles.reqRow}>
            <div>
              <div className={styles.reqTitle}>{r.title}</div>
              <div className={styles.reqCat}>{r.category}</div>
            </div>
            <Badge variant={r.status as 'open'|'progress'|'review'|'done'|'hold'}>
              {r.status === 'open' ? 'Open' : r.status === 'progress' ? 'In Progress' : r.status === 'review' ? 'In Review' : r.status === 'done' ? 'Done' : 'On Hold'}
            </Badge>
          </div>
        )) : <div className={styles.empty}>No requirements yet.</div>}
      </div>

      <div className={styles.btnRow}>
        <button className={`${fStyles.btn} ${fStyles.danger}`} onClick={handleDelete}>Delete Client</button>
        <button className={`${fStyles.btn} ${fStyles.ghost}`} onClick={onEdit}>Edit Client</button>
        <button className={`${fStyles.btn} ${fStyles.primary}`} onClick={onAddReq}>+ Add Requirement</button>
      </div>
    </Modal>
  );
}
