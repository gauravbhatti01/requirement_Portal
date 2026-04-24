'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

// ─── Types ───────────────────────────────────────────────────────────────────
export interface Client {
  id: number;
  name: string;
  company?: string;
  contact?: string;
  email?: string;
  phone?: string;
  industry?: string;
  gstin?: string;
  address?: string;
  budget: number;
  tier: 'Standard' | 'Premium' | 'Enterprise';
  tags?: string;
  notes?: string;
  createdAt: string;
}

export interface Requirement {
  id: number;
  clientId: number;
  title: string;
  desc?: string;
  qty: number;
  unit?: string;
  category: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'progress' | 'review' | 'done' | 'hold';
  progress: number;
  budget: number;
  dueDate?: string;
  assignee?: string;
  tags?: string;
  notes?: string;
  createdAt: string;
}

export interface ActivityItem {
  msg: string;
  time: string;
  id: number;
}

export interface AppState {
  clients: Client[];
  requirements: Requirement[];
  activity: ActivityItem[];
  nextCid: number;
  nextRid: number;
  nextAid: number;
}

type Action =
  | { type: 'ADD_CLIENT'; payload: Omit<Client, 'id' | 'createdAt'> }
  | { type: 'UPDATE_CLIENT'; payload: Client }
  | { type: 'DELETE_CLIENT'; id: number }
  | { type: 'ADD_REQ'; payload: Omit<Requirement, 'id' | 'createdAt'> }
  | { type: 'UPDATE_REQ'; payload: Requirement }
  | { type: 'DELETE_REQ'; id: number }
  | { type: 'QUICK_STATUS'; id: number; status: Requirement['status'] }
  | { type: 'LOAD_STATE'; payload: AppState }
  | { type: 'LOG'; msg: string };

// ─── Reducer ─────────────────────────────────────────────────────────────────
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'LOAD_STATE': return action.payload;
    case 'ADD_CLIENT': {
      const client: Client = { ...action.payload, id: state.nextCid, createdAt: new Date().toISOString() };
      return { ...state, clients: [...state.clients, client], nextCid: state.nextCid + 1,
        activity: [{ msg: `Added client: ${client.name}`, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    }
    case 'UPDATE_CLIENT': return { ...state, clients: state.clients.map(c => c.id===action.payload.id ? action.payload : c),
      activity: [{ msg: `Updated client: ${action.payload.name}`, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    case 'DELETE_CLIENT': {
      const c = state.clients.find(x => x.id===action.id);
      return { ...state, clients: state.clients.filter(x => x.id!==action.id), requirements: state.requirements.filter(x => x.clientId!==action.id),
        activity: [{ msg: `Deleted client: ${c?.name}`, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    }
    case 'ADD_REQ': {
      const req: Requirement = { ...action.payload, id: state.nextRid, createdAt: new Date().toISOString() };
      return { ...state, requirements: [...state.requirements, req], nextRid: state.nextRid+1,
        activity: [{ msg: `Added requirement: ${req.title}`, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    }
    case 'UPDATE_REQ': return { ...state, requirements: state.requirements.map(r => r.id===action.payload.id ? action.payload : r),
      activity: [{ msg: `Updated: ${action.payload.title}`, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    case 'DELETE_REQ': {
      const r = state.requirements.find(x => x.id===action.id);
      return { ...state, requirements: state.requirements.filter(x => x.id!==action.id),
        activity: [{ msg: `Deleted: ${r?.title}`, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    }
    case 'QUICK_STATUS': {
      const r = state.requirements.find(x => x.id===action.id);
      return { ...state, requirements: state.requirements.map(x => x.id===action.id ? {...x, status: action.status} : x),
        activity: [{ msg: `Status → ${action.status}: ${r?.title}`, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    }
    case 'LOG': return { ...state, activity: [{ msg: action.msg, time: now(), id: state.nextAid }, ...state.activity].slice(0,40), nextAid: state.nextAid+1 };
    default: return state;
  }
}

function now() { return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }); }

const initialState: AppState = {
  clients: [], requirements: [], activity: [],
  nextCid: 1, nextRid: 1, nextAid: 1,
};

// ─── Context ─────────────────────────────────────────────────────────────────
interface AppContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
  clientById: (id: number) => Client | undefined;
  reqsForClient: (id: number) => Requirement[];
  isOverdue: (date?: string) => boolean;
  daysUntil: (date?: string) => number | null;
  fmtDate: (date?: string) => string;
  initials: (name: string) => string;
  syncing: boolean;
}

const AppContext = createContext<AppContextValue | null>(null);

interface AppProviderProps {
  children: React.ReactNode;
  userId: string; // Firebase UID — used as Firestore doc key
}

export function AppProvider({ children, userId }: AppProviderProps) {
  const [state, dispatch]   = useReducer(reducer, initialState);
  const [syncing, setSyncing] = useState(false);
  const saveTimer             = useRef<ReturnType<typeof setTimeout> | null>(null);
  const initialized           = useRef(false);

  // ── Load user data from Firestore on mount ──
  useEffect(() => {
    if (!userId) return;
    setSyncing(true);
    getDoc(doc(db, 'users', userId))
      .then(snap => {
        if (snap.exists()) {
          const data = snap.data() as AppState;
          dispatch({ type: 'LOAD_STATE', payload: data });
        }
      })
      .catch(console.error)
      .finally(() => {
        setSyncing(false);
        initialized.current = true;
      });
  }, [userId]);

  // ── Save to Firestore whenever state changes (debounced 1.5s) ──
  useEffect(() => {
    if (!initialized.current || !userId) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      setDoc(doc(db, 'users', userId), state, { merge: false }).catch(console.error);
    }, 1500);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
  }, [state, userId]);

  const clientById    = useCallback((id: number) => state.clients.find(c => c.id === id), [state.clients]);
  const reqsForClient = useCallback((id: number) => state.requirements.filter(r => r.clientId === id), [state.requirements]);
  const isOverdue     = useCallback((date?: string) => {
    if (!date) return false;
    const d = new Date(date); return d < new Date() && d.toDateString() !== new Date().toDateString();
  }, []);
  const daysUntil = useCallback((date?: string): number | null => {
    if (!date) return null;
    return Math.ceil((new Date(date).getTime() - Date.now()) / 86400000);
  }, []);
  const fmtDate = useCallback((date?: string) => {
    if (!date) return '—';
    return new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  }, []);
  const initials = useCallback((name: string) =>
    name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2), []);

  return (
    <AppContext.Provider value={{ state, dispatch, clientById, reqsForClient, isOverdue, daysUntil, fmtDate, initials, syncing }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be inside AppProvider');
  return ctx;
}

// ─── Constants ────────────────────────────────────────────────────────────────
export const STATUSES   = ['open','progress','review','done','hold'] as const;
export const STATUS_LABEL: Record<string,string> = { open:'Open', progress:'In Progress', review:'In Review', done:'Done', hold:'On Hold' };
export const PRIORITIES = ['critical','high','medium','low'] as const;
export const PRI_LABEL: Record<string,string>    = { critical:'Critical', high:'High', medium:'Medium', low:'Low' };
export const CATS       = ['Design','Development','Content','Marketing','Support','Infrastructure','Research','Legal','Finance','Other'];
export const INDUSTRIES = ['Technology','Finance','Healthcare','Retail','Education','Manufacturing','Media','Real Estate','Logistics','Other'];
export const TIERS      = ['Standard','Premium','Enterprise'] as const;
export const STATUS_COLOR: Record<string,string> = { open:'#3b82f6', progress:'#f59e0b', review:'#a855f7', done:'#22c55e', hold:'#585858' };
export const PRI_COLOR: Record<string,string>    = { critical:'#ef4444', high:'#f59e0b', medium:'#3b82f6', low:'#585858' };
