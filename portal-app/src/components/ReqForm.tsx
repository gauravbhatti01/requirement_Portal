'use client';

import { useState } from 'react';
import Modal, { ModalHeader } from './Modal';
import { useApp, CATS, PRIORITIES, STATUSES, STATUS_LABEL, PRI_LABEL, Requirement } from '@/lib/store';
import styles from './Form.module.css';

interface ReqFormProps {
  open: boolean;
  onClose: () => void;
  editReq?: Requirement | null;
  defaultClientId?: number;
  onToast: (msg: string) => void;
}

export default function ReqForm({ open, onClose, editReq, defaultClientId, onToast }: ReqFormProps) {
  const { state, dispatch } = useApp();
  const [progress, setProgress] = useState(editReq?.progress ?? 0);
  const [form, setForm] = useState(() => ({
    clientId: editReq?.clientId?.toString() ?? defaultClientId?.toString() ?? '',
    title: editReq?.title ?? '',
    desc: editReq?.desc ?? '',
    qty: editReq?.qty?.toString() ?? '',
    unit: editReq?.unit ?? '',
    category: editReq?.category ?? 'Design',
    priority: editReq?.priority ?? 'medium' as Requirement['priority'],
    status: editReq?.status ?? 'open' as Requirement['status'],
    budget: editReq?.budget?.toString() ?? '',
    dueDate: editReq?.dueDate ?? '',
    assignee: editReq?.assignee ?? '',
    tags: editReq?.tags ?? '',
    notes: editReq?.notes ?? '',
  }));

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  if (!state.clients.length) {
    return (
      <Modal open={open} onClose={onClose}>
        <ModalHeader title="Add Requirement" onClose={onClose} />
        <p style={{ color: '#585858', fontSize: 14, textAlign: 'center', padding: '24px 0' }}>
          Please add at least one client first.
        </p>
        <div className={styles.btnRow}>
          <button className={`${styles.btn} ${styles.ghost}`} onClick={onClose}>Close</button>
        </div>
      </Modal>
    );
  }

  const handleSave = () => {
    const cid = parseInt(form.clientId);
    if (!cid) { alert('Please select a client.'); return; }
    if (!form.title.trim()) { alert('Title is required.'); return; }
    const qty = parseFloat(form.qty);
    if (isNaN(qty)) { alert('Enter a valid quantity.'); return; }

    const payload = {
      clientId: cid,
      title: form.title,
      desc: form.desc,
      qty,
      unit: form.unit,
      category: form.category,
      priority: form.priority as Requirement['priority'],
      status: form.status as Requirement['status'],
      progress,
      budget: parseFloat(form.budget) || 0,
      dueDate: form.dueDate,
      assignee: form.assignee,
      tags: form.tags,
      notes: form.notes,
    };

    if (editReq) {
      dispatch({ type: 'UPDATE_REQ', payload: { ...editReq, ...payload } });
      onToast(`Updated: ${form.title}`);
    } else {
      dispatch({ type: 'ADD_REQ', payload });
      onToast(`Saved: ${form.title}`);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editReq) return;
    if (!confirm('Delete this requirement?')) return;
    dispatch({ type: 'DELETE_REQ', id: editReq.id });
    onToast('Requirement deleted');
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose} width={620}>
      <ModalHeader title={editReq ? 'Edit Requirement' : 'New Requirement'} onClose={onClose} />

      <div className={styles.section}>Basic Information</div>
      <div className={`${styles.grid} ${styles.g2}`}>
        <div className={styles.field}>
          <label>Client *</label>
          <select value={form.clientId} onChange={e => set('clientId', e.target.value)}>
            <option value="">— Select Client —</option>
            {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Category</label>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            {CATS.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.field} style={{ marginBottom: 12 }}>
        <label>Requirement Title *</label>
        <input placeholder="e.g. Design homepage wireframes" value={form.title} onChange={e => set('title', e.target.value)} />
      </div>
      <div className={styles.field} style={{ marginBottom: 12 }}>
        <label>Detailed Description</label>
        <textarea placeholder="Full description, scope, deliverables..." value={form.desc} onChange={e => set('desc', e.target.value)} />
      </div>

      <div className={styles.section}>Scope & Priority</div>
      <div className={`${styles.grid} ${styles.g4}`}>
        <div className={styles.field}>
          <label>Quantity *</label>
          <input type="number" min="0" step="0.5" placeholder="5" value={form.qty} onChange={e => set('qty', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Unit</label>
          <input placeholder="pages / hrs" value={form.unit} onChange={e => set('unit', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Priority</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value as Requirement['priority'])}>
            {PRIORITIES.map(p => <option key={p} value={p}>{PRI_LABEL[p]}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value as Requirement['status'])}>
            {STATUSES.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>

      <div className={styles.section}>Schedule & Budget</div>
      <div className={`${styles.grid} ${styles.g3}`}>
        <div className={styles.field}>
          <label>Budget (₹)</label>
          <input type="number" placeholder="0" value={form.budget} onChange={e => set('budget', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Due Date</label>
          <input type="date" value={form.dueDate} onChange={e => set('dueDate', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Assigned To</label>
          <input placeholder="Team member" value={form.assignee} onChange={e => set('assignee', e.target.value)} />
        </div>
      </div>

      <div className={styles.field} style={{ marginBottom: 12 }}>
        <label>Completion Progress — <span style={{ color: '#3b82f6', fontFamily: 'JetBrains Mono' }}>{progress}%</span></label>
        <div className={styles.rangeWrap}>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={e => setProgress(Number(e.target.value))}
          />
        </div>
      </div>

      <div className={`${styles.grid} ${styles.g2}`}>
        <div className={styles.field}>
          <label>Tags (comma-separated)</label>
          <input placeholder="urgent, phase-2, billable" value={form.tags} onChange={e => set('tags', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Internal Notes</label>
          <input placeholder="Quick notes for your team" value={form.notes} onChange={e => set('notes', e.target.value)} />
        </div>
      </div>

      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.ghost}`} onClick={onClose}>Cancel</button>
        {editReq && (
          <button className={`${styles.btn} ${styles.danger}`} onClick={handleDelete}>Delete</button>
        )}
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
          {editReq ? 'Update' : 'Save Requirement'}
        </button>
      </div>
    </Modal>
  );
}
