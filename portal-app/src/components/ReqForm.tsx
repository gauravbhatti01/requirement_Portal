'use client';

import { useState, useEffect } from 'react';
import Modal, { ModalHeader } from './Modal';
import { useApp, CATS, PRIORITIES, STATUSES, STATUS_LABEL, PRI_LABEL, Requirement } from '@/lib/store';
import { analyzeRequirementInput, generateRecommendations, AIRecommendation } from '@/lib/aiService';
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
  const [analyzing, setAnalyzing] = useState(false);
  const [recs, setRecs] = useState<AIRecommendation[]>([]);

  const [form, setForm] = useState(() => ({
    clientId: editReq?.clientId?.toString() ?? defaultClientId?.toString() ?? '',
    roleType: editReq?.roleType ?? 'freelancer',
    rawInput: editReq?.rawInput ?? '',
    title: editReq?.title ?? '',
    desc: editReq?.desc ?? '',
    extractedGoals: editReq?.extractedGoals ?? '',
    extractedScope: editReq?.extractedScope ?? '',
    missingFields: editReq?.missingFields ?? [],
    clarificationQuestions: editReq?.clarificationQuestions ?? [],
    readinessScore: editReq?.readinessScore ?? 0,
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

  const set = (k: keyof typeof form, v: any) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => {
    if (open && editReq) {
      generateRecommendations(editReq).then(setRecs);
    }
  }, [open, editReq]);

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

  const handleAnalyze = async () => {
    if (!form.rawInput.trim()) { alert('Please enter some raw requirements to analyze.'); return; }
    setAnalyzing(true);
    try {
      const result = await analyzeRequirementInput(form.rawInput, form.roleType as any);
      setForm(f => ({
        ...f,
        extractedGoals: result.extractedGoals,
        extractedScope: result.extractedScope,
        missingFields: result.missingFields,
        clarificationQuestions: result.clarificationQuestions,
        readinessScore: result.readinessScore,
        desc: f.desc || result.extractedScope, // auto-fill if empty
      }));
      onToast('Analysis complete!');
    } catch (e) {
      alert('Analysis failed.');
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSave = () => {
    const cid = parseInt(form.clientId);
    if (!cid) { alert('Please select a client.'); return; }
    if (!form.title.trim()) { alert('Title is required.'); return; }
    const qty = parseFloat(form.qty) || 0;

    const payload: Partial<Requirement> = {
      clientId: cid,
      roleType: form.roleType as any,
      rawInput: form.rawInput,
      title: form.title,
      desc: form.desc,
      extractedGoals: form.extractedGoals,
      extractedScope: form.extractedScope,
      missingFields: form.missingFields,
      clarificationQuestions: form.clarificationQuestions,
      readinessScore: form.readinessScore,
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
      dispatch({ type: 'UPDATE_REQ', payload: { ...editReq, ...payload } as Requirement });
      onToast(`Updated: ${form.title}`);
    } else {
      dispatch({ type: 'ADD_REQ', payload: payload as any });
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
    <Modal open={open} onClose={onClose} width={800}>
      <ModalHeader title={editReq ? 'Edit Requirement' : 'New Requirement'} onClose={onClose} />

      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <div className={styles.section}>AI Intake & Analysis</div>
          <div className={`${styles.grid} ${styles.g2}`}>
            <div className={styles.field}>
              <label>Role / Perspective</label>
              <select value={form.roleType} onChange={e => set('roleType', e.target.value)}>
                <option value="freelancer">Freelancer (Scope & Deliverables)</option>
                <option value="pm">Product Manager (Goals & Conflicts)</option>
              </select>
            </div>
            <div className={styles.field}>
              <label>Client *</label>
              <select value={form.clientId} onChange={e => set('clientId', e.target.value)}>
                <option value="">— Select Client —</option>
                {state.clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
          </div>
          
          <div className={styles.field} style={{ marginBottom: 12 }}>
            <label>Raw Notes / Transcript</label>
            <textarea 
              placeholder="Paste meeting notes, stakeholder emails, or client brief here..." 
              value={form.rawInput} 
              onChange={e => set('rawInput', e.target.value)} 
              style={{ minHeight: 120 }}
            />
          </div>
          <div className={styles.btnRow} style={{ marginTop: 0, padding: 0, border: 'none', marginBottom: 20 }}>
            <button className={`${styles.btn} ${styles.success}`} onClick={handleAnalyze} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : 'Analyze with AI'}
            </button>
          </div>

          <div className={styles.section}>Basic Information</div>
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
        </div>

        {/* AI Sidebar Panel */}
        <div style={{ width: 280, background: '#0a0a0a', padding: 16, borderRadius: 8, border: '1px solid rgba(255,255,255,0.05)', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#a0a0a0', textTransform: 'uppercase', marginBottom: 8 }}>Readiness Score</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ fontSize: 24, fontWeight: 'bold', color: form.readinessScore > 70 ? '#4ade80' : form.readinessScore > 40 ? '#f59e0b' : '#ef4444' }}>
                {form.readinessScore}%
              </div>
              <div style={{ fontSize: 12, color: '#585858' }}>
                {form.readinessScore > 70 ? 'Ready to execute' : 'Needs clarification'}
              </div>
            </div>
          </div>

          {form.extractedGoals && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#a0a0a0', textTransform: 'uppercase', marginBottom: 4 }}>Extracted Goals</div>
              <div style={{ fontSize: 12, color: '#f5f5f5', background: '#111', padding: 8, borderRadius: 6 }}>{form.extractedGoals}</div>
            </div>
          )}

          {form.missingFields.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#ef4444', textTransform: 'uppercase', marginBottom: 4 }}>Missing Information</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#f87171' }}>
                {form.missingFields.map(f => <li key={f}>{f}</li>)}
              </ul>
            </div>
          )}

          {form.clarificationQuestions.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', marginBottom: 4 }}>Clarification Needed</div>
              <ul style={{ margin: 0, paddingLeft: 16, fontSize: 12, color: '#fbbf24' }}>
                {form.clarificationQuestions.map((q, i) => <li key={i} style={{ marginBottom: 4 }}>{q}</li>)}
              </ul>
            </div>
          )}

          {recs.length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', marginBottom: 4 }}>AI Recommendations</div>
              {recs.map(r => (
                <div key={r.id} style={{ fontSize: 12, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: 8, borderRadius: 6, color: '#60a5fa', marginBottom: 8 }}>
                  <strong>{r.type === 'scope_creep' ? 'Scope Creep' : 'Conflict'}:</strong> {r.suggestion}
                </div>
              ))}
            </div>
          )}
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
