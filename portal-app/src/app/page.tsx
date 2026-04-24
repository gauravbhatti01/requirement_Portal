'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { LogOut, Cloud } from 'lucide-react';
import { AppProvider, useApp, Client, Requirement } from '@/lib/store';
import { AuthProvider, useAuth } from '@/lib/auth';
import Sidebar from '@/components/Sidebar';
import Dashboard from '@/components/Dashboard';
import ClientsPage from '@/components/ClientsPage';
import ReqsPage from '@/components/ReqsPage';
import KanbanPage from '@/components/KanbanPage';
import AnalyticsPage from '@/components/AnalyticsPage';
import ClientForm from '@/components/ClientForm';
import ReqForm from '@/components/ReqForm';
import ClientView from '@/components/ClientView';
import LoginPage from '@/components/LoginPage';
import Toast, { useToast } from '@/components/Toast';
import styles from './page.module.css';

type Page = 'dashboard' | 'clients' | 'requirements' | 'kanban' | 'analytics';
const PAGE_TITLES: Record<Page, string> = {
  dashboard: 'Dashboard', clients: 'Clients', requirements: 'Requirements',
  kanban: 'Kanban Board', analytics: 'Analytics',
};

// ─── Auth Gate ────────────────────────────────────────────────────────────────
function AuthGate() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505' }}>
        <motion.div
          animate={{ opacity: [0.3, 1, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{ color: '#3a3a3a', fontSize: 13, fontFamily: 'Inter, sans-serif' }}
        >
          Loading…
        </motion.div>
      </div>
    );
  }

  if (!user) return <LoginPage />;

  return (
    <AppProvider userId={user.uid}>
      <AppShell />
    </AppProvider>
  );
}

// ─── Main App Shell ───────────────────────────────────────────────────────────
function AppShell() {
  const { state, dispatch, syncing } = useApp();
  const { user, logOut } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const { msg, visible, show: showToast } = useToast();

  const [clientFormOpen, setClientFormOpen] = useState(false);
  const [editClient, setEditClient]         = useState<Client | null>(null);
  const [reqFormOpen, setReqFormOpen]       = useState(false);
  const [editReq, setEditReq]               = useState<Requirement | null>(null);
  const [defaultClientId, setDefaultClientId] = useState<number | undefined>();
  const [viewClientId, setViewClientId]     = useState<number | null>(null);

  const openAddClient  = () => { setEditClient(null); setClientFormOpen(true); };
  const openEditClient = (c: Client) => { setEditClient(c); setClientFormOpen(true); };
  const openAddReq     = (cid?: number) => { setEditReq(null); setDefaultClientId(cid); setReqFormOpen(true); };
  const openEditReq    = (r: Requirement) => { setEditReq(r); setReqFormOpen(true); };

  const handleEditFromView = () => {
    const c = state.clients.find(x => x.id === viewClientId) ?? null;
    setViewClientId(null); setEditClient(c); setClientFormOpen(true);
  };

  const handleDeleteClientFromView = () => {
    if (!viewClientId) return;
    dispatch({ type: 'DELETE_CLIENT', id: viewClientId });
    showToast('Client deleted'); setViewClientId(null);
  };

  const initials = (name: string) =>
    name.split(' ').map(w => w[0] || '').join('').toUpperCase().slice(0, 2);

  return (
    <div className={styles.shell}>
      <Sidebar page={page} onNav={setPage} onAddClient={openAddClient} onAddReq={() => openAddReq()} />

      <div className={styles.main}>
        {/* Topbar */}
        <div className={styles.topbar}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={page} className={styles.topbarTitle}
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.18 }}>
              {PAGE_TITLES[page]}
            </motion.div>
          </AnimatePresence>

          <div className={styles.topbarRight}>
            {/* Sync indicator */}
            {syncing && (
              <div className={styles.syncPill}>
                <Cloud size={12} />
                <span>Saving…</span>
              </div>
            )}

            {/* User badge */}
            <div className={styles.userBadge}>
              <div className={styles.userAvatar}>
                {user?.displayName ? initials(user.displayName) : user?.email?.[0].toUpperCase()}
              </div>
              <span className={styles.userName}>
                {user?.displayName || user?.email?.split('@')[0]}
              </span>
            </div>

            <button className={styles.btnPrimary} onClick={openAddClient}>+ Add Client</button>
            <button className={styles.btnSecondary} onClick={() => openAddReq()}>+ Add Requirement</button>

            {/* Logout */}
            <button className={styles.logoutBtn} onClick={logOut} title="Log out">
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className={styles.content}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={page}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}>
              {page === 'dashboard'    && <Dashboard onEditReq={id => { const r = state.requirements.find(x => x.id===id)??null; setEditReq(r); setReqFormOpen(true); }} />}
              {page === 'clients'      && <ClientsPage onView={id => setViewClientId(id)} onEdit={openEditClient} onAddReqFor={cid => openAddReq(cid)} />}
              {page === 'requirements' && <ReqsPage onEdit={openEditReq} />}
              {page === 'kanban'       && <KanbanPage onEditReq={openEditReq} />}
              {page === 'analytics'    && <AnalyticsPage />}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <ClientForm open={clientFormOpen} onClose={() => setClientFormOpen(false)} editClient={editClient} onToast={showToast} />
      <ReqForm open={reqFormOpen} onClose={() => setReqFormOpen(false)} editReq={editReq} defaultClientId={defaultClientId} onToast={showToast} />
      <ClientView open={viewClientId !== null} clientId={viewClientId}
        onClose={() => setViewClientId(null)} onEdit={handleEditFromView}
        onAddReq={() => { const cid = viewClientId??undefined; setViewClientId(null); openAddReq(cid); }}
        onDelete={handleDeleteClientFromView} />
      <Toast message={msg} visible={visible} />
    </div>
  );
}

export default function Home() {
  return <AuthGate />;
}
