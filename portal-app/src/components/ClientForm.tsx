'use client';

import { useState } from 'react';
import Modal, { ModalHeader } from './Modal';
import { useApp, INDUSTRIES, TIERS, Client } from '@/lib/store';
import styles from './Form.module.css';

interface ClientFormProps {
  open: boolean;
  onClose: () => void;
  editClient?: Client | null;
  onToast: (msg: string) => void;
}

export default function ClientForm({ open, onClose, editClient, onToast }: ClientFormProps) {
  const { dispatch } = useApp();
  const [form, setForm] = useState(() => ({
    name: editClient?.name ?? '',
    company: editClient?.company ?? '',
    contact: editClient?.contact ?? '',
    email: editClient?.email ?? '',
    phone: editClient?.phone ?? '',
    industry: editClient?.industry ?? 'Technology',
    gstin: editClient?.gstin ?? '',
    address: editClient?.address ?? '',
    budget: editClient?.budget?.toString() ?? '',
    tier: editClient?.tier ?? 'Standard' as Client['tier'],
    tags: editClient?.tags ?? '',
    notes: editClient?.notes ?? '',
  }));

  const set = (k: keyof typeof form, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSave = () => {
    if (!form.name.trim()) { alert('Client name is required.'); return; }
    const payload = {
      ...form,
      budget: parseFloat(form.budget) || 0,
      tier: form.tier as Client['tier'],
    };
    if (editClient) {
      dispatch({ type: 'UPDATE_CLIENT', payload: { ...editClient, ...payload } });
      onToast(`Updated: ${form.name}`);
    } else {
      dispatch({ type: 'ADD_CLIENT', payload });
      onToast(`Added client: ${form.name}`);
    }
    onClose();
  };

  const handleDelete = () => {
    if (!editClient) return;
    if (!confirm('Delete this client and all their requirements?')) return;
    dispatch({ type: 'DELETE_CLIENT', id: editClient.id });
    onToast(`Deleted: ${editClient.name}`);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <ModalHeader title={editClient ? 'Edit Client' : 'New Client'} onClose={onClose} />

      <div className={styles.section}>Company Information</div>
      <div className={`${styles.grid} ${styles.g2}`}>
        <div className={styles.field}>
          <label>Company / Client Name *</label>
          <input placeholder="e.g. Acme Corporation" value={form.name} onChange={e => set('name', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Trading / Brand Name</label>
          <input placeholder="e.g. Acme" value={form.company} onChange={e => set('company', e.target.value)} />
        </div>
      </div>
      <div className={`${styles.grid} ${styles.g3}`}>
        <div className={styles.field}>
          <label>Industry</label>
          <select value={form.industry} onChange={e => set('industry', e.target.value)}>
            {INDUSTRIES.map(i => <option key={i}>{i}</option>)}
          </select>
        </div>
        <div className={styles.field}>
          <label>GSTIN</label>
          <input placeholder="22AAAAA0000A1Z5" value={form.gstin} onChange={e => set('gstin', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Client Tier</label>
          <select value={form.tier} onChange={e => set('tier', e.target.value as Client['tier'])}>
            {TIERS.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
      </div>
      <div className={styles.field}>
        <label>Address</label>
        <input placeholder="City, State, PIN" value={form.address} onChange={e => set('address', e.target.value)} />
      </div>

      <div className={styles.section}>Primary Contact</div>
      <div className={`${styles.grid} ${styles.g3}`}>
        <div className={styles.field}>
          <label>Contact Person *</label>
          <input placeholder="Full name" value={form.contact} onChange={e => set('contact', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Email</label>
          <input type="email" placeholder="email@company.com" value={form.email} onChange={e => set('email', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Phone</label>
          <input placeholder="+91 98765 43210" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>

      <div className={styles.section}>Commercial</div>
      <div className={`${styles.grid} ${styles.g2}`}>
        <div className={styles.field}>
          <label>Total Budget (₹)</label>
          <input type="number" placeholder="0" value={form.budget} onChange={e => set('budget', e.target.value)} />
        </div>
        <div className={styles.field}>
          <label>Tags (comma-separated)</label>
          <input placeholder="e.g. retainer, priority" value={form.tags} onChange={e => set('tags', e.target.value)} />
        </div>
      </div>
      <div className={styles.field}>
        <label>Internal Notes</label>
        <textarea placeholder="Notes visible only to your team..." value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>

      <div className={styles.btnRow}>
        <button className={`${styles.btn} ${styles.ghost}`} onClick={onClose}>Cancel</button>
        {editClient && (
          <button className={`${styles.btn} ${styles.danger}`} onClick={handleDelete}>Delete Client</button>
        )}
        <button className={`${styles.btn} ${styles.primary}`} onClick={handleSave}>
          {editClient ? 'Update Client' : 'Add Client'}
        </button>
      </div>
    </Modal>
  );
}
